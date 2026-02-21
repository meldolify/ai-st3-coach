import { useState, useRef, useCallback, useEffect } from 'react'
import { CONFIG, PERSONA_CONFIG } from '../config'
import { AudioStreamer } from '../lib/AudioStreamer'
import { AudioPlayer } from '../lib/AudioPlayer'

/**
 * useSession — React hook wrapping V4Session WebSocket logic.
 *
 * Manages: WebSocket connection, audio streaming, audio playback,
 * message handling, orb state, transcript messages, and feedback flow.
 */

const PROCESSING_MESSAGES = [
  'Thinking...',
  'Considering...',
  'Formulating response...',
  'Processing...',
  'Reflecting...',
]

function getRandomProcessingMessage() {
  return PROCESSING_MESSAGES[Math.floor(Math.random() * PROCESSING_MESSAGES.length)]
}

export function useSession({ orbVisualizerRef }) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [orbState, setOrbState] = useState('idle') // idle | listening | speaking | thinking
  const [statusText, setStatusText] = useState('')
  const [inFeedbackMode, setInFeedbackMode] = useState(false)

  // Transcript messages: { id, speaker: 'user' | 'ai', text, timestamp }
  const [messages, setMessages] = useState([])
  // Streaming text shown word-by-word during AI response chunks
  const [streamingText, setStreamingText] = useState(null)

  // Refs for mutable state that doesn't trigger re-renders
  const wsRef = useRef(null)
  const audioStreamerRef = useRef(new AudioStreamer())
  const audioPlayerRef = useRef(new AudioPlayer())
  const serverStreamActiveRef = useRef(false)
  const streamedFullTextRef = useRef('')
  const speechStartAtRef = useRef(null)
  const feedbackResolveRef = useRef(null)
  const messageIdRef = useRef(0)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      audioStreamerRef.current.destroy()
      audioPlayerRef.current.interrupt()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  // Wire orb visualizer when available
  useEffect(() => {
    if (orbVisualizerRef?.current) {
      audioPlayerRef.current.setOrbVisualizer(orbVisualizerRef.current)
    }
  }, [orbVisualizerRef])

  const addMessage = useCallback((speaker, text) => {
    messageIdRef.current += 1
    setMessages((prev) => [
      ...prev,
      {
        id: messageIdRef.current,
        speaker,
        text,
        timestamp: Date.now(),
      },
    ])
  }, [])

  const handleResponseComplete = useCallback(() => {
    audioStreamerRef.current.setAISpeaking(false)

    if (wsRef.current?.readyState === WebSocket.OPEN && sessionId) {
      wsRef.current.send(
        JSON.stringify({ type: 'ai_finished', sessionId })
      )
    }

    setTimeout(() => {
      if (!inFeedbackMode && !audioPlayerRef.current.isPlaying) {
        setOrbState('listening')
        setStatusText('Listening')
      }
    }, 500)
  }, [sessionId, inFeedbackMode])

  const handleMessage = useCallback(
    (msg) => {
      switch (msg.type) {
        case 'scenario_loaded':
          setSessionId(msg.sessionId)
          audioStreamerRef.current.setSessionId(msg.sessionId)
          setStatusText('Ready')
          break

        case 'interview_ended':
          break

        case 'ai_response':
          audioStreamerRef.current.setAISpeaking(true)
          addMessage('ai', msg.text)
          audioPlayerRef.current.playBase64Audio(msg.audio)
          setOrbState('speaking')
          setStatusText('Speaking')
          break

        case 'ai_response_start':
          serverStreamActiveRef.current = true
          audioStreamerRef.current.setAISpeaking(true)
          streamedFullTextRef.current = ''
          setStreamingText('')
          setOrbState('speaking')
          setStatusText('Speaking')
          break

        case 'ai_response_chunk': {
          if (msg.chunkIndex === 0) {
            audioPlayerRef.current.onStart?.()
          }
          const updated =
            (streamedFullTextRef.current || '') + (streamedFullTextRef.current ? ' ' : '') + msg.text
          streamedFullTextRef.current = updated
          setStreamingText(updated.trim())
          audioPlayerRef.current.queueBase64Audio(msg.audio)
          break
        }

        case 'ai_response_end': {
          serverStreamActiveRef.current = false
          setStreamingText(null)
          const fullText =
            msg.fullText || (streamedFullTextRef.current || '').trim()
          if (fullText) {
            addMessage('ai', fullText)
          }
          if (!audioPlayerRef.current.isPlaying) {
            handleResponseComplete()
          }
          break
        }

        case 'user_transcript_display':
          addMessage('user', msg.text)
          setOrbState('thinking')
          setStatusText(getRandomProcessingMessage())
          break

        case 'vad_speech_start':
          speechStartAtRef.current = performance.now()
          setOrbState('listening')
          setStatusText('Recording')
          break

        case 'feedback_processing':
          setInFeedbackMode(true)
          setOrbState('thinking')
          setStatusText(getRandomProcessingMessage())
          break

        case 'feedback_response':
          setInFeedbackMode(true)
          audioStreamerRef.current.setAISpeaking(true)
          addMessage('ai', `Feedback: ${msg.text}`)
          audioPlayerRef.current.queueBase64Audio(msg.audio)
          setOrbState('speaking')
          setStatusText(`Feedback (${msg.section}/${msg.totalSections})`)
          break

        case 'feedback_summary':
          if (feedbackResolveRef.current) {
            feedbackResolveRef.current(msg.feedback)
            feedbackResolveRef.current = null
          }
          break

        case 'interrupt':
          serverStreamActiveRef.current = false
          setStreamingText(null)
          audioPlayerRef.current.interrupt()
          setOrbState('listening')
          break

        case 'error':
          serverStreamActiveRef.current = false
          setOrbState('idle')
          setStatusText('Error: ' + msg.message)
          break
      }
    },
    [addMessage, handleResponseComplete]
  )

  const connect = useCallback(
    async (promptFile, difficulty) => {
      const persona = PERSONA_CONFIG[difficulty] || PERSONA_CONFIG.medium
      const voice = persona.voice

      // Initialize orb visualizer
      if (orbVisualizerRef?.current) {
        await orbVisualizerRef.current.init(
          orbVisualizerRef.current.canvas
        )
      }

      let wsUrl = CONFIG.BACKEND_URL + '?scenario=' + promptFile
      if (difficulty) wsUrl += '&difficulty=' + difficulty
      if (voice) wsUrl += '&voice=' + voice

      return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          audioStreamerRef.current.websocket = ws
          setStatusText('Connected')
          resolve()
        }

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data)
          handleMessage(msg)
        }

        ws.onerror = (error) => {
          setIsConnected(false)
          reject(error)
        }

        ws.onclose = () => {
          setIsConnected(false)
          setStatusText('Disconnected')
        }
      })
    },
    [handleMessage, orbVisualizerRef]
  )

  const startListening = useCallback(async () => {
    const player = audioPlayerRef.current

    player.onStart = () => {
      setOrbState('speaking')
      setStatusText('Speaking')
    }

    player.onEnd = () => {
      if (serverStreamActiveRef.current) return
      handleResponseComplete()
    }

    await audioStreamerRef.current.initialize()
    audioStreamerRef.current.start()
    setOrbState('listening')
    setStatusText('Listening')
  }, [handleResponseComplete])

  const sendEndInterview = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    audioStreamerRef.current.setAISpeaking(true)
    audioPlayerRef.current.interrupt()
    wsRef.current.send(
      JSON.stringify({ type: 'end_interview', sessionId })
    )
  }, [sessionId])

  const requestFeedback = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      return Promise.resolve(null)

    return new Promise((resolve) => {
      feedbackResolveRef.current = resolve

      wsRef.current.send(
        JSON.stringify({ type: 'request_feedback', sessionId })
      )
    })
  }, [sessionId])

  const disconnect = useCallback(() => {
    audioStreamerRef.current.destroy()
    audioPlayerRef.current.interrupt()
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setSessionId(null)
    setOrbState('idle')
    setStatusText('')
    setStreamingText(null)
  }, [])

  return {
    isConnected,
    sessionId,
    orbState,
    statusText,
    messages,
    streamingText,
    inFeedbackMode,
    connect,
    startListening,
    sendEndInterview,
    requestFeedback,
    disconnect,
  }
}

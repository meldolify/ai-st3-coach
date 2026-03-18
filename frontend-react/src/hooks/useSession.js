import { useState, useRef, useCallback, useEffect } from 'react'
import { CONFIG, PERSONA_CONFIG } from '../config'
import { AudioStreamer } from '../lib/AudioStreamer'
import { AudioPlayer } from '../lib/AudioPlayer'
import { useAuthStore } from '../stores/authStore'
import { supabaseClient } from '../lib/supabase'

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
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [feedbackRequested, setFeedbackRequested] = useState(false)
  const [scenarioMeta, setScenarioMeta] = useState(null) // { domain, infoSheet, prepTime }

  // Transcript messages: { id, speaker: 'user' | 'ai', text, timestamp }
  const [messages, setMessages] = useState([])

  // Refs for mutable state that doesn't trigger re-renders
  const wsRef = useRef(null)
  const audioStreamerRef = useRef(new AudioStreamer())
  const audioPlayerRef = useRef(new AudioPlayer())
  const serverStreamActiveRef = useRef(false)
  const streamedFullTextRef = useRef('')
  const speechStartAtRef = useRef(null)
  const feedbackResolveRef = useRef(null)
  const scenarioLoadedResolveRef = useRef(null)
  const messageIdRef = useRef(0)
  const sessionIdRef = useRef(null)
  const inFeedbackModeRef = useRef(false)

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

    if (wsRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current) {
      wsRef.current.send(
        JSON.stringify({ type: 'ai_finished', sessionId: sessionIdRef.current })
      )
    }

    setTimeout(() => {
      if (!inFeedbackModeRef.current && !audioPlayerRef.current.isPlaying) {
        setOrbState('listening')
        setStatusText('Listening')
      }
    }, 500)
  }, [])

  const handleMessage = useCallback(
    (msg) => {
      switch (msg.type) {
        case 'scenario_loaded': {
          sessionIdRef.current = msg.sessionId
          setSessionId(msg.sessionId)
          audioStreamerRef.current.setSessionId(msg.sessionId)

          const meta = {
            domain: msg.domain || 'clinical',
            infoSheet: msg.infoSheet || null,
            prepTime: msg.prepTime || 0,
          }
          setScenarioMeta(meta)
          setStatusText(meta.prepTime > 0 ? 'Preparation Time' : 'Ready')

          if (scenarioLoadedResolveRef.current) {
            scenarioLoadedResolveRef.current(meta)
            scenarioLoadedResolveRef.current = null
          }
          break
        }

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
          audioPlayerRef.current.queueBase64Audio(msg.audio)
          break
        }

        case 'ai_response_end': {
          serverStreamActiveRef.current = false
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
          inFeedbackModeRef.current = true
          setInFeedbackMode(true)
          setOrbState('thinking')
          setStatusText(getRandomProcessingMessage())
          break

        case 'feedback_response':
          inFeedbackModeRef.current = true
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

      // Add userId and auth token for server-side tier validation
      const currentUser = useAuthStore.getState().currentUser
      if (currentUser?.id) {
        wsUrl += '&userId=' + encodeURIComponent(currentUser.id)
      }
      try {
        const { data } = await supabaseClient.auth.getSession()
        const token = data?.session?.access_token
        if (token) {
          wsUrl += '&token=' + encodeURIComponent(token)
        }
      } catch (err) {
        console.warn('[useSession] Could not get auth token:', err)
      }

      return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        // Resolve when scenario_loaded arrives (not on ws.onopen)
        // so the caller gets domain/infoSheet/prepTime metadata
        scenarioLoadedResolveRef.current = resolve

        ws.onopen = () => {
          setIsConnected(true)
          audioStreamerRef.current.websocket = ws
          setStatusText('Connected')
        }

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data)
          handleMessage(msg)
        }

        ws.onerror = (error) => {
          setIsConnected(false)
          scenarioLoadedResolveRef.current = null
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

  const sendInterrupt = useCallback(() => {
    if (!audioPlayerRef.current.isPlaying) return
    audioPlayerRef.current.interrupt()
    if (wsRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current) {
      wsRef.current.send(
        JSON.stringify({ type: 'user_speaking', sessionId: sessionIdRef.current })
      )
    }
    setOrbState('listening')
    setStatusText('Listening')
  }, [])

  const sendEndInterview = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    audioStreamerRef.current.setAISpeaking(true)
    audioPlayerRef.current.interrupt()
    wsRef.current.send(
      JSON.stringify({ type: 'end_interview', sessionId: sessionIdRef.current })
    )
    setInterviewEnded(true)
  }, [])

  const requestFeedback = useCallback(() => {
    if (feedbackRequested) return Promise.resolve(null)
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      return Promise.resolve(null)

    setFeedbackRequested(true)
    return new Promise((resolve) => {
      feedbackResolveRef.current = resolve

      wsRef.current.send(
        JSON.stringify({ type: 'request_feedback', sessionId: sessionIdRef.current })
      )
    })
  }, [feedbackRequested])

  const disconnect = useCallback(() => {
    audioStreamerRef.current.destroy()
    audioPlayerRef.current.interrupt()
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    sessionIdRef.current = null
    inFeedbackModeRef.current = false
    scenarioLoadedResolveRef.current = null
    setIsConnected(false)
    setSessionId(null)
    setScenarioMeta(null)
    setInFeedbackMode(false)
    setInterviewEnded(false)
    setFeedbackRequested(false)
    setOrbState('idle')
    setStatusText('')
  }, [])

  return {
    isConnected,
    sessionId,
    scenarioMeta,
    orbState,
    statusText,
    messages,
    inFeedbackMode,
    interviewEnded,
    feedbackRequested,
    connect,
    startListening,
    sendInterrupt,
    sendEndInterview,
    requestFeedback,
    disconnect,
  }
}

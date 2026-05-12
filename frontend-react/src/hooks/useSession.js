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
  const [isPaused, setIsPaused] = useState(false)
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
  const turnStartAtRef = useRef(null)

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
          turnStartAtRef.current = performance.now()
          audioStreamerRef.current.setAISpeaking(true)
          streamedFullTextRef.current = ''
          setOrbState('speaking')
          setStatusText('Speaking')
          console.log('[CLIENT TIMING] ai_response_start received')
          break

        case 'ai_response_chunk': {
          const t0 = turnStartAtRef.current
          const elapsed = t0 ? Math.round(performance.now() - t0) : 0
          console.log(`[CLIENT TIMING] ai_response_chunk #${msg.chunkIndex} received +${elapsed}ms`)
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
          const t0 = turnStartAtRef.current
          const elapsed = t0 ? Math.round(performance.now() - t0) : 0
          console.log(`[CLIENT TIMING] ai_response_end received +${elapsed}ms`)
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

        case 'feedback_response': {
          // Streaming feedback: each section arrives as N WAV chunks, one
          // feedback_response per chunk. text + status update only on the
          // first chunk of each section (chunkIndex===0); audio always
          // queued. Backwards-compat: if chunkIndex is missing (legacy
          // one-shot), treat it as chunkIndex 0.
          const isFirstChunk = msg.chunkIndex == null || msg.chunkIndex === 0
          inFeedbackModeRef.current = true
          setInFeedbackMode(true)
          audioStreamerRef.current.setAISpeaking(true)
          if (isFirstChunk && msg.text) {
            addMessage('ai', `Feedback: ${msg.text}`)
            setStatusText(`Feedback (${msg.section}/${msg.totalSections})`)
          }
          audioPlayerRef.current.queueBase64Audio(msg.audio)
          setOrbState('speaking')
          break
        }

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
          let msg
          try {
            msg = JSON.parse(event.data)
          } catch (err) {
            console.warn('[useSession] Ignoring malformed server message:', err.message)
            return
          }
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

  /**
   * pauseListening — stop emitting microphone audio_chunks to the server
   * while keeping the WebSocket open. Server-side VAD goes silent; AI does
   * not respond until resumeListening() is called.
   */
  const pauseListening = useCallback(() => {
    audioStreamerRef.current.pause()
    setIsPaused(true)
    setStatusText('Paused')
  }, [])

  const resumeListening = useCallback(() => {
    audioStreamerRef.current.resume()
    setIsPaused(false)
    setOrbState('listening')
    setStatusText('Listening')
  }, [])

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
    isPaused,
    audioPlayer: audioPlayerRef.current,
    connect,
    startListening,
    pauseListening,
    resumeListening,
    sendInterrupt,
    sendEndInterview,
    requestFeedback,
    disconnect,
  }
}

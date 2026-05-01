import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../lib/utils'
import { PERSONA_CONFIG } from '../config'
import { IMAGE_MAP } from '../data/scenarios'
import { useNavigate } from 'react-router-dom'
import { useSimulationParams } from '../hooks/useSimulationParams'
import { useSession } from '../hooks/useSession'
import { useAuthStore } from '../stores/authStore'
import { canAccessScenario } from '../lib/subscription'
import { useEscapeKey } from '../hooks/useEscapeKey'
import Header from './Header'
import Sidebar from './Sidebar'
import TranscriptPanel from './TranscriptPanel'
import ClinicalImageCard from './ClinicalImageCard'
import InformationSheet from './InformationSheet'
import AnimatedBackground from './AnimatedBackground'
import ConfirmModal from './ConfirmModal'
import { PersonaCard } from './PersonaCard'
import { StatusPanel } from './StatusPanel'
import { StatusPill } from './StatusPill'
import { ControlPinwheel } from './ControlPinwheel'
import { MobileTranscriptDrawer } from './MobileTranscriptDrawer'
import { GlowCard } from './ui/spotlight-card'
import { CpuArchitecture } from './ui/cpu-architecture'
import { VoiceOrbSimple } from './ui/voice-orb-simple'
import { AudioVisualiser } from './ui/audio-visualiser'

/**
 * SimulationRoom — Single responsive tree.
 * Desktop (≥lg): 3-column grid — orb+status (left) | clinical image (centre) | persona+transcript (right).
 * Mobile (<lg): single-column stack with sticky header and sticky bottom dock.
 */
export default function SimulationRoom() {
  const authLoading = useAuthStore((s) => s.authLoading)
  const navigate = useNavigate()
  const { params } = useSimulationParams()
  const imageCloseRef = useRef(null)
  const feedbackContinueRef = useRef(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [expandedImage, setExpandedImage] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [prepPhase, setPrepPhase] = useState(null) // { prepTime } | null
  const [mobileTranscriptOpen, setMobileTranscriptOpen] = useState(false)

  const rawScenario = params?.scenario || {
    title: 'No scenario selected',
    promptFile: null,
    imageFile: null,
    category: '',
  }
  const scenario = {
    ...rawScenario,
    imageFile: rawScenario.imageFile || IMAGE_MAP[rawScenario.promptFile] || null,
  }
  const difficulty = params?.difficulty || 'medium'
  const persona = PERSONA_CONFIG[difficulty] || PERSONA_CONFIG.medium

  const {
    isConnected,
    scenarioMeta,
    orbState,
    statusText,
    messages,
    interviewEnded,
    feedbackRequested,
    isPaused,
    audioPlayer,
    connect,
    startListening,
    pauseListening,
    resumeListening,
    sendEndInterview,
    requestFeedback,
    disconnect,
  } = useSession({})

  const domain = scenarioMeta?.domain || 'clinical'
  const isAISpeaking = orbState === 'speaking'

  // Beforeunload warning during active session
  useEffect(() => {
    if (!isConnected) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isConnected])

  // Access control check — waits for auth hydration to complete
  useEffect(() => {
    if (authLoading) return
    if (scenario.promptFile && !canAccessScenario(scenario.promptFile)) {
      navigate('/scenarios')
    }
  }, [authLoading, scenario.promptFile, navigate])

  // Lazy-init audio analyser when AI starts speaking for the first time
  useEffect(() => {
    if (isAISpeaking && audioPlayer?.ensureAnalyser) {
      audioPlayer.ensureAnalyser()
    }
  }, [isAISpeaking, audioPlayer])

  // Escape key handling for modals
  useEscapeKey(
    useCallback(() => setExpandedImage(null), []),
    !!expandedImage
  )
  useEscapeKey(
    useCallback(() => setFeedbackData(null), []),
    !!feedbackData && !expandedImage
  )

  useEffect(() => {
    if (expandedImage && imageCloseRef.current) {
      imageCloseRef.current.focus()
    }
  }, [expandedImage])

  useEffect(() => {
    if (feedbackData && feedbackContinueRef.current) {
      feedbackContinueRef.current.focus()
    }
  }, [feedbackData])

  const handleConnect = useCallback(async () => {
    if (!scenario.promptFile) return
    setIsConnecting(true)
    try {
      const meta = await connect(scenario.promptFile, difficulty)
      if (meta.prepTime > 0 && meta.infoSheet) {
        setPrepPhase({ prepTime: meta.prepTime })
      } else {
        await startListening()
      }
    } catch (error) {
      console.error('[SimulationRoom] Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [scenario.promptFile, difficulty, connect, startListening])

  const handlePrepEnd = useCallback(async () => {
    setPrepPhase(null)
    await startListening()
  }, [startListening])

  const handleStop = useCallback(() => {
    sendEndInterview()
  }, [sendEndInterview])

  const handleRequestFeedback = useCallback(async () => {
    const feedback = await requestFeedback()
    if (feedback) {
      setFeedbackData(feedback)
    }
  }, [requestFeedback])

  const handleExit = useCallback(() => {
    const doExit = () => {
      disconnect()
      setIsExiting(true)
      setTimeout(() => {
        navigate(params?.returnPage || '/scenarios')
      }, 500)
    }

    if (isConnected) {
      setConfirmModal({
        title: 'Exit Session',
        message: 'Your current session is still active. Are you sure you want to leave? Any progress will be lost.',
        confirmLabel: 'Exit',
        variant: 'danger',
        onConfirm: () => {
          setConfirmModal(null)
          doExit()
        },
      })
    } else {
      doExit()
    }
  }, [disconnect, params, isConnected, navigate])

  const handleSelectScenario = useCallback(
    (promptFile, name) => {
      const doSwitch = () => {
        if (isConnected) disconnect()
        const newParams = {
          ...params,
          scenario: {
            ...params?.scenario,
            title: name,
            promptFile,
          },
        }
        sessionStorage.setItem('simulationParams', JSON.stringify(newParams))
        navigate('/simulation?t=' + Date.now(), { replace: true })
      }

      if (isConnected) {
        setConfirmModal({
          title: 'Switch Scenario',
          message: 'End current session and switch to a different scenario?',
          confirmLabel: 'Switch',
          variant: 'danger',
          onConfirm: () => {
            setConfirmModal(null)
            doSwitch()
          },
        })
      } else {
        doSwitch()
      }
    },
    [isConnected, disconnect, params]
  )

  const prefersReduced = useReducedMotion()

  // Cinematic staggered reveal — one entrance per panel
  const ease = [0.16, 1, 0.3, 1]
  const reveal = useMemo(() => {
    if (prefersReduced) {
      const simple = (delay) => ({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.1, delay: delay * 0.05 },
      })
      return {
        header: simple(0),
        orb: simple(1),
        status: simple(2),
        image: simple(3),
        persona: simple(4),
        transcript: simple(5),
      }
    }
    return {
      header: { initial: { opacity: 0, y: -20, filter: 'blur(6px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, transition: { duration: 0.6, ease, delay: 0.15 } },
      orb: { initial: { opacity: 0, scale: 0.92, filter: 'blur(8px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, transition: { duration: 0.7, ease, delay: 0.3 } },
      status: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease, delay: 0.55 } },
      image: { initial: { opacity: 0, scale: 0.95, filter: 'blur(8px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, transition: { duration: 0.8, ease, delay: 0.45 } },
      persona: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, ease, delay: 0.4 } },
      transcript: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.7, ease, delay: 0.6 } },
    }
  }, [prefersReduced])

  const orbPanelInner = (
    <>
      <CpuArchitecture
        hideChip
        className="absolute inset-0 w-full h-full opacity-65 pointer-events-none"
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 h-full p-4">
        <AudioVisualiser audioPlayer={audioPlayer} isAISpeaking={isAISpeaking} />
        <VoiceOrbSimple
          state={prepPhase ? 'idle' : orbState}
          size={120}
          statusText={prepPhase ? '' : statusText}
        />
      </div>
    </>
  )

  const centerInner =
    prepPhase && scenarioMeta?.infoSheet ? (
      <InformationSheet
        infoSheet={scenarioMeta.infoSheet}
        domain={domain}
        onImageExpand={(src) => setExpandedImage(src)}
      />
    ) : scenario.imageFile && domain === 'clinical' ? (
      <ClinicalImageCard
        imageFile={scenario.imageFile}
        scenarioTitle={scenario.title}
        onExpand={(src) => setExpandedImage(src)}
        fillHeight
      />
    ) : (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <p className="text-organic-bark/45 italic text-sm">
          {domain === 'call_the_boss'
            ? 'Phone consultation in progress.'
            : domain === 'consent'
            ? 'Patient consultation.'
            : 'No clinical image for this scenario.'}
        </p>
      </div>
    )

  return (
    <motion.div
      data-testid="sim-room"
      className="h-screen flex bg-organic-cream relative overflow-hidden"
      animate={isExiting ? { scale: 0.94, opacity: 0, filter: 'blur(6px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatedBackground />

      {/* Sidebar — desktop: inline collapsed/hover-expand. Mobile: overlay drawer */}
      <Sidebar
        currentPromptFile={scenario.promptFile}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 lg:ml-16 p-4 lg:p-6 gap-4 lg:gap-7">
        {/* Header */}
        <motion.div initial={reveal.header.initial} animate={reveal.header.animate} transition={reveal.header.transition}>
          <Header
            scenario={scenario}
            difficulty={difficulty}
            timeLimit={params?.mockExam?.isActive ? 480 : 300}
            isConnected={isConnected}
            prepPhase={prepPhase}
            onPrepEnd={handlePrepEnd}
            onExit={handleExit}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
        </motion.div>

        {/* ════════ MOBILE LAYOUT (<lg) ════════
            Image-hero + compact strip + sticky pinwheel dock. Transcript
            opens as a bottom-sheet drawer triggered from the strip.
            Desktop layout below mirrors this data into the 3-col grid. */}
        <main className="lg:hidden flex-1 flex flex-col min-h-0 gap-3">
          {/* Hero — clinical image (or info sheet during prep) */}
          <motion.div
            initial={reveal.image.initial}
            animate={reveal.image.animate}
            transition={reveal.image.transition}
            className="organic-card relative flex-1 min-h-0 overflow-hidden"
          >
            {centerInner}
          </motion.div>

          {/* Compact strip — mini orb + audio bars + status pill + transcript trigger */}
          <motion.div
            initial={reveal.status.initial}
            animate={reveal.status.animate}
            transition={reveal.status.transition}
            className="organic-card flex items-center gap-2.5 px-3 py-2 shrink-0"
          >
            <VoiceOrbSimple
              state={prepPhase ? 'idle' : orbState}
              size={44}
              statusText=""
              className="shrink-0"
            />
            <AudioVisualiser
              audioPlayer={audioPlayer}
              isAISpeaking={isAISpeaking}
              className="flex-1 min-w-0"
            />
            <StatusPill
              orbState={orbState}
              statusText={statusText}
              prepPhase={prepPhase}
              isPaused={isPaused}
              isConnected={isConnected}
              compact
              className="shrink-0"
            />
            <button
              type="button"
              onClick={() => setMobileTranscriptOpen(true)}
              aria-label={`Open transcript${messages.length > 0 ? ` — ${messages.length} messages` : ''}`}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-organic-bark/70 hover:text-organic-bark hover:bg-organic-cream-deep transition-colors shrink-0"
            >
              <span className="text-[11px] font-semibold tabular-nums">{messages.length}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </motion.div>

          {/* Bottom dock — pinwheel sticky at viewport bottom */}
          <motion.div
            initial={reveal.dock?.initial || { opacity: 0, y: 30 }}
            animate={reveal.dock?.animate || { opacity: 1, y: 0 }}
            transition={reveal.dock?.transition || { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
            className="organic-card flex items-center justify-center pt-4 pb-[calc(12px+env(safe-area-inset-bottom))] shrink-0"
          >
            <ControlPinwheel
              isConnected={isConnected}
              isConnecting={isConnecting}
              isPaused={isPaused}
              interviewEnded={interviewEnded}
              feedbackRequested={feedbackRequested}
              onStart={handleConnect}
              onPause={pauseListening}
              onResume={resumeListening}
              onStop={handleStop}
              onFeedback={handleRequestFeedback}
            />
          </motion.div>
        </main>

        {/* ════════ DESKTOP LAYOUT (≥lg) ════════ */}
        <main
          className={cn(
            'hidden lg:grid flex-1 min-h-0',
            'gap-4 lg:gap-7',
            'lg:grid-cols-[minmax(220px,1fr)_minmax(320px,1.4fr)_minmax(220px,1fr)]',
            'lg:grid-rows-[minmax(280px,1.6fr)_minmax(220px,1fr)]'
          )}
        >
          {/* ─── Voice orb panel (left col, top row) ─── */}
          <motion.div
            initial={reveal.orb.initial}
            animate={reveal.orb.animate}
            transition={reveal.orb.transition}
            className="lg:col-start-1 lg:row-start-1 min-h-[260px]"
          >
            <GlowCard noLayout glowColor="amber" className="organic-card relative h-full overflow-hidden">
              {orbPanelInner}
            </GlowCard>
          </motion.div>

          {/* ─── Clinical image (centre col, spans both rows) ─── */}
          <motion.div
            initial={reveal.image.initial}
            animate={reveal.image.animate}
            transition={reveal.image.transition}
            className="lg:col-start-2 lg:row-start-1 lg:row-span-2 min-h-[280px] lg:min-h-0"
          >
            <GlowCard noLayout glowColor="sand" className="organic-card relative h-full overflow-hidden">
              {centerInner}
            </GlowCard>
          </motion.div>

          {/* ─── Persona (right col, top row) ─── */}
          <motion.div
            initial={reveal.persona.initial}
            animate={reveal.persona.animate}
            transition={reveal.persona.transition}
            className="lg:col-start-3 lg:row-start-1"
          >
            <GlowCard noLayout glowColor="amber" className="organic-card relative h-full overflow-hidden">
              <PersonaCard
                persona={persona}
                difficulty={difficulty}
                domain={domain}
                compact={false}
                className="h-full"
              />
            </GlowCard>
          </motion.div>

          {/* ─── Status panel (left col, bottom row) ─── */}
          <motion.div
            initial={reveal.status.initial}
            animate={reveal.status.animate}
            transition={reveal.status.transition}
            className="lg:col-start-1 lg:row-start-2"
          >
            <GlowCard noLayout glowColor="forest" className="organic-card relative h-full overflow-hidden">
              <StatusPanel
                orbState={orbState}
                statusText={statusText}
                prepPhase={prepPhase}
                isConnected={isConnected}
                isConnecting={isConnecting}
                isPaused={isPaused}
                interviewEnded={interviewEnded}
                feedbackRequested={feedbackRequested}
                onStart={handleConnect}
                onPause={pauseListening}
                onResume={resumeListening}
                onStop={handleStop}
                onFeedback={handleRequestFeedback}
              />
            </GlowCard>
          </motion.div>

          {/* ─── Transcript (right col, bottom row) ─── */}
          <motion.div
            initial={reveal.transcript.initial}
            animate={reveal.transcript.animate}
            transition={reveal.transcript.transition}
            className="lg:col-start-3 lg:row-start-2 min-h-[260px] lg:min-h-0"
          >
            <GlowCard noLayout glowColor="forest" className="organic-card relative h-full overflow-hidden flex flex-col">
              <TranscriptPanel messages={messages} personaName={persona.name} />
            </GlowCard>
          </motion.div>
        </main>
      </div>

      {/* ============= Mobile transcript drawer ============= */}
      <MobileTranscriptDrawer
        open={mobileTranscriptOpen}
        onClose={() => setMobileTranscriptOpen(false)}
        messages={messages}
        personaName={persona.name}
      />

      {/* ============= Modals ============= */}

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            key="expanded-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Clinical image expanded view"
          >
            <button
              ref={imageCloseRef}
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-organic-cream/80 hover:text-organic-cream p-2"
              aria-label="Close expanded image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <img
              src={expandedImage}
              alt="Clinical image expanded"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedbackData && (
          <motion.div
            key="feedback-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-organic-bark/50 flex items-center justify-center p-4"
            onClick={() => setFeedbackData(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Session feedback summary"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="organic-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-[20px] text-organic-bark mb-4 uppercase tracking-[0.12em]"
                style={{ fontFamily: 'var(--font-organic-display)', fontWeight: 600 }}
              >
                Session Summary
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-xl text-organic-cream shadow-md',
                    feedbackData.score == null ? 'bg-organic-stone' :
                    feedbackData.score >= 4 ? 'bg-organic-forest' :
                    feedbackData.score >= 2 ? 'bg-organic-amber' : 'bg-[#DC2626]'
                  )}
                  style={{ fontFamily: 'var(--font-organic-display)', fontWeight: 700 }}
                >
                  {feedbackData.score == null ? '—' : `${feedbackData.score}/5`}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-organic-bark">
                    {feedbackData.score == null ? 'Unavailable' :
                     feedbackData.score >= 4 ? 'Excellent' :
                     feedbackData.score >= 3 ? 'Good' :
                     feedbackData.score >= 2 ? 'Adequate' : 'Needs Improvement'}
                  </p>
                  <p className="text-[12px] text-organic-bark/60">Overall Performance</p>
                </div>
              </div>

              {feedbackData.strengths?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[10px] font-semibold text-organic-amber uppercase tracking-[0.18em] mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {feedbackData.strengths.map((s, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="text-[14px] text-organic-bark flex items-start gap-2">
                        <span className="text-organic-forest mt-0.5 font-bold">+</span>{s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {feedbackData.improvements?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-semibold text-organic-amber uppercase tracking-[0.18em] mb-2">Areas for Improvement</h3>
                  <ul className="space-y-1">
                    {feedbackData.improvements.map((s, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (feedbackData.strengths?.length || 0) * 0.08 + i * 0.08 }} className="text-[14px] text-organic-bark flex items-start gap-2">
                        <span className="text-organic-amber mt-0.5 font-bold">−</span>{s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button onClick={() => { setFeedbackData(null); handleExit() }} className="px-4 py-2 text-[13px] font-medium text-organic-bark/70 hover:text-organic-bark transition-colors">
                  Exit
                </button>
                <button
                  ref={feedbackContinueRef}
                  onClick={() => setFeedbackData(null)}
                  className="px-5 py-2 text-[13px] font-semibold bg-organic-amber text-organic-bark rounded-lg hover:bg-[#c0852f] hover:text-white transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        variant={confirmModal?.variant}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </motion.div>
  )
}

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { PERSONA_CONFIG } from '../config'
import { useSimulationParams } from '../hooks/useSimulationParams'
import { useSession } from '../hooks/useSession'
import { useEscapeKey } from '../hooks/useEscapeKey'
import Header from './Header'
import Sidebar from './Sidebar'
import TranscriptPanel from './TranscriptPanel'
import ClinicalImageCard from './ClinicalImageCard'
import PersonaCard from './PersonaCard'
import VoiceOrb from './VoiceOrb'
import ControlButtons from './ControlButtons'
import ConfirmModal from './ConfirmModal'

/**
 * SimulationRoom — Main layout component.
 * Desktop: CSS Grid with sidebar | center-stage | transcript
 * Mobile: Stacked layout — clinical image → transcript → fixed bottom dock (orb + controls)
 */
export default function SimulationRoom() {
  const { params } = useSimulationParams()
  const orbRef = useRef(null)
  const imageCloseRef = useRef(null)
  const feedbackContinueRef = useRef(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [expandedImage, setExpandedImage] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  const scenario = params?.scenario || {
    title: 'No scenario selected',
    promptFile: null,
    imageFile: null,
    category: '',
  }
  const difficulty = params?.difficulty || 'medium'
  const persona = PERSONA_CONFIG[difficulty] || PERSONA_CONFIG.medium

  const {
    isConnected,
    orbState,
    statusText,
    messages,
    streamingText,
    connect,
    startListening,
    sendEndInterview,
    requestFeedback,
    disconnect,
  } = useSession({ orbVisualizerRef: orbRef })

  // Escape key handling for modals
  useEscapeKey(
    useCallback(() => setExpandedImage(null), []),
    !!expandedImage
  )
  useEscapeKey(
    useCallback(() => setFeedbackData(null), []),
    !!feedbackData && !expandedImage
  )

  // Auto-focus close buttons when modals open
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
      await connect(scenario.promptFile, difficulty)
      await startListening()
    } catch (error) {
      console.error('[SimulationRoom] Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [scenario.promptFile, difficulty, connect, startListening])

  const handleEnd = useCallback(async () => {
    sendEndInterview()
    const feedback = await requestFeedback()
    if (feedback) {
      setFeedbackData(feedback)
    }
  }, [sendEndInterview, requestFeedback])

  const handleExit = useCallback(() => {
    const doExit = () => {
      disconnect()
      window.location.href = params?.returnPage
        ? `/index.html#${params.returnPage}`
        : '/index.html#scenarioSelection'
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
  }, [disconnect, params, isConnected])

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
        window.location.reload()
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

  // Animation variants
  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden animated-bg">
      {/* Header */}
      <Header
        scenario={scenario}
        difficulty={difficulty}
        timeLimit={params?.mockExam?.isActive ? 480 : 300}
        isConnected={isConnected}
        onExit={handleExit}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Sidebar */}
      <Sidebar
        currentPromptFile={scenario.promptFile}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Single <main> wrapper — contains both desktop and mobile layout variants */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* ======================== DESKTOP LAYOUT ======================== */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          aria-label="Simulation room desktop layout"
          className={cn(
            'flex-1 overflow-hidden',
            'hidden lg:grid lg:ml-16 lg:grid-cols-[minmax(320px,_2fr)_minmax(400px,_3fr)] lg:gap-4 lg:p-4'
          )}
        >
          {/* Center stage: Clinical image + Persona + Orb + Controls */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-4 overflow-y-auto custom-scrollbar"
          >
            <ClinicalImageCard
              imageFile={scenario.imageFile}
              scenarioTitle={scenario.title}
              onExpand={(src) => setExpandedImage(src)}
            />
            <PersonaCard persona={persona} />

            {/* Voice Orb + Controls */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center gap-4 py-4 flex-1 justify-center"
            >
              <VoiceOrb ref={orbRef} state={orbState} size={160} />
              {statusText && (
                <motion.p
                  key={statusText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[13px] text-text-secondary font-medium"
                >
                  {statusText}
                </motion.p>
              )}
              <ControlButtons
                isConnected={isConnected}
                isConnecting={isConnecting}
                onConnect={handleConnect}
                onEnd={handleEnd}
              />
            </motion.div>
          </motion.div>

          {/* Transcript panel — dominant right column */}
          <motion.div variants={fadeUp} className="min-h-0">
            <TranscriptPanel messages={messages} streamingText={streamingText} personaName={persona.name} />
          </motion.div>
        </motion.section>

        {/* ======================== MOBILE LAYOUT ======================== */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          aria-label="Simulation room mobile layout"
          className={cn(
            'flex-1 flex flex-col overflow-hidden',
            'lg:hidden',
            'pb-[var(--mobile-dock-height)]'
          )}
        >
          {/* Clinical image at top — 200px on mobile */}
          {scenario.imageFile && (
            <motion.div variants={fadeUp} className="shrink-0 px-3 pt-3">
              <ClinicalImageCard
                imageFile={scenario.imageFile}
                scenarioTitle={scenario.title}
                onExpand={(src) => setExpandedImage(src)}
                compact
              />
            </motion.div>
          )}

          {/* Transcript fills remaining space */}
          <motion.div variants={fadeUp} className="flex-1 min-h-0 px-3 pt-3">
            <TranscriptPanel messages={messages} streamingText={streamingText} personaName={persona.name} />
          </motion.div>
        </motion.section>
      </main>

      {/* Mobile bottom dock — fixed, always visible */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30',
          'bg-bg-elevated/95 backdrop-blur-sm border-t border-bg-secondary',
          'flex items-center justify-center gap-4 px-4 py-3',
          'lg:hidden'
        )}
        style={{ height: 'var(--mobile-dock-height)' }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            {/* Mobile orb — 80px, no audio ref (desktop orb drives audio viz) */}
            <VoiceOrb state={orbState} size={80} />

            <div className="flex flex-col items-center gap-1.5">
              {statusText && (
                <p className="text-[12px] text-text-secondary font-medium">
                  {statusText}
                </p>
              )}
              <ControlButtons
                isConnected={isConnected}
                isConnecting={isConnecting}
                onConnect={handleConnect}
                onEnd={handleEnd}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================== MODALS ======================== */}

      {/* Fullscreen image modal */}
      {expandedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Clinical image expanded view"
        >
          <button
            ref={imageCloseRef}
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
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

      {/* Feedback summary modal */}
      {feedbackData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setFeedbackData(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Session feedback summary"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-bg-elevated rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-text-primary mb-4">
              Session Summary
            </h2>

            {/* Score */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white',
                  feedbackData.score >= 4 ? 'bg-listening' :
                  feedbackData.score >= 2 ? 'bg-speaking' : 'bg-error'
                )}
              >
                {feedbackData.score}/5
              </div>
              <div>
                <p className="text-[15px] font-medium text-text-primary">
                  {feedbackData.score >= 4 ? 'Excellent' :
                   feedbackData.score >= 3 ? 'Good' :
                   feedbackData.score >= 2 ? 'Adequate' : 'Needs Improvement'}
                </p>
                <p className="text-[13px] text-text-secondary">Overall Performance</p>
              </div>
            </div>

            {/* Strengths */}
            {feedbackData.strengths?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider mb-2">
                  Strengths
                </h3>
                <ul className="space-y-1">
                  {feedbackData.strengths.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="text-[14px] text-text-primary flex items-start gap-2"
                    >
                      <span className="text-listening mt-0.5">+</span>
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {feedbackData.improvements?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider mb-2">
                  Areas for Improvement
                </h3>
                <ul className="space-y-1">
                  {feedbackData.improvements.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (feedbackData.strengths?.length || 0) * 0.08 + i * 0.08 }}
                      className="text-[14px] text-text-primary flex items-start gap-2"
                    >
                      <span className="text-speaking mt-0.5">-</span>
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setFeedbackData(null)
                  handleExit()
                }}
                className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Exit
              </button>
              <button
                ref={feedbackContinueRef}
                onClick={() => setFeedbackData(null)}
                className="px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confirm modal (exit / switch scenario) */}
      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        variant={confirmModal?.variant}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  )
}

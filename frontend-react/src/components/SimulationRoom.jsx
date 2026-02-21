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
    connect,
    startListening,
    sendInterrupt,
    sendEndInterview,
    requestFeedback,
    disconnect,
  } = useSession({ orbVisualizerRef: orbRef })

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

  // Access control check on mount
  useEffect(() => {
    if (scenario.promptFile && typeof window.canAccessScenario === 'function') {
      if (!window.canAccessScenario(scenario.promptFile)) {
        window.location.href = '/index.html#accessDenied'
      }
    }
  }, [scenario.promptFile])

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

  // Resolve persona image for backdrop
  const personaImageSrc = persona.imageWide || persona.image

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar — desktop: inline collapsed/hover-expand. Mobile: overlay drawer */}
      <Sidebar
        currentPromptFile={scenario.promptFile}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* ======================== DESKTOP LAYOUT ======================== */}
      <div className="hidden lg:flex flex-col flex-1 ml-16">
        {/* Slim header — desktop only */}
        <Header
          scenario={scenario}
          difficulty={difficulty}
          timeLimit={params?.mockExam?.isActive ? 480 : 300}
          isConnected={isConnected}
          onExit={handleExit}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Main content area — persona backdrop with floating elements */}
        <main className="flex-1 relative overflow-hidden">
          {/* Persona backdrop — sage gradient + centered persona image */}
          <div className="absolute inset-0 persona-backdrop">
            {personaImageSrc && (
              <img
                src={personaImageSrc}
                alt={persona.name}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[88%] max-w-[92%] object-contain z-[2] drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
              />
            )}
            {/* Vignette overlay */}
            <div className="absolute inset-0 z-[3] pointer-events-none" style={{
              background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.03) 100%)'
            }} />
          </div>

          {/* Info badge — floating top-left glass card */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute top-6 left-6 z-10 glass-panel px-5 py-4 min-w-[200px] rounded-2xl"
          >
            <p className="font-display text-[17px] text-text-primary">{persona.name}</p>
            <p className="text-[13px] text-text-secondary mt-0.5">{persona.title}</p>
            <div className="h-px my-2.5" style={{ background: 'linear-gradient(to right, rgba(74,93,76,0.3), transparent)' }} />
            <p className="text-[14px] text-text-primary font-medium truncate max-w-[240px]">{scenario.title}</p>
            {scenario.category && (
              <p className="text-[12px] text-text-muted mt-1 capitalize">
                {scenario.category.replace(/\//g, ' · ')}
                {difficulty && ` · ${difficulty}`}
              </p>
            )}
          </motion.div>

          {/* Floating panels — right side: clinical image + transcript */}
          <div className="absolute top-20 right-5 bottom-[220px] w-[340px] flex flex-col gap-5 z-20 pointer-events-none">
            {/* Clinical image panel */}
            {scenario.imageFile && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="shrink-0 pointer-events-auto"
              >
                <ClinicalImageCard
                  imageFile={scenario.imageFile}
                  scenarioTitle={scenario.title}
                  onExpand={(src) => setExpandedImage(src)}
                />
              </motion.div>
            )}

            {/* Transcript panel */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex-1 min-h-[200px] max-h-[400px] pointer-events-auto"
            >
              <TranscriptPanel messages={messages} personaName={persona.name} />
            </motion.div>
          </div>

          {/* Orb + Controls — centered bottom */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 overflow-visible"
          >
            {/* AI status bubble */}
            {statusText && (
              <motion.div
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="ai-status-bubble text-[13px] text-white/90 font-medium text-center"
              >
                {statusText}
              </motion.div>
            )}

            <VoiceOrb ref={orbRef} state={orbState} size={120} />

            <ControlButtons
              isConnected={isConnected}
              isConnecting={isConnecting}
              orbState={orbState}
              onConnect={handleConnect}
              onInterrupt={sendInterrupt}
              onEnd={handleEnd}
            />
          </motion.div>
        </main>
      </div>

      {/* ======================== MOBILE LAYOUT ======================== */}
      <div className="lg:hidden flex flex-col fixed inset-0">
        {/* Dark glass header */}
        <header className="h-14 px-3 flex items-center justify-between shrink-0 z-[200] mobile-glass-dark border-b border-white/[0.08]">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="w-11 h-11 flex items-center justify-center text-white/80 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
            </svg>
          </button>
          <div className="flex-1 min-w-0 mx-3 text-center">
            <p className="text-[14px] text-white font-medium truncate">{scenario.title}</p>
            {scenario.category && (
              <p className="text-[11px] text-white/60 capitalize truncate">{scenario.category.replace(/\//g, ' · ')}</p>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-medium" style={{ backgroundColor: persona.accentColor || '#4A5D4C' }}>
            {persona.name?.charAt(0) || '?'}
          </div>
        </header>

        {/* Scrollable content — dark glass panels */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Clinical image */}
          {scenario.imageFile && (
            <ClinicalImageCard
              imageFile={scenario.imageFile}
              scenarioTitle={scenario.title}
              onExpand={(src) => setExpandedImage(src)}
              compact
            />
          )}
          {/* Transcript */}
          <div className="flex-1 min-h-[200px]">
            <TranscriptPanel messages={messages} personaName={persona.name} />
          </div>
        </div>

        {/* Fixed bottom dock — dark glass */}
        <div className="relative z-[200] flex flex-col items-center gap-3 px-5 py-7 pb-[calc(16px+env(safe-area-inset-bottom))] mobile-glass-dark border-t border-white/[0.08] overflow-visible">
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center gap-1">
              <VoiceOrb state={orbState} size={64} />
              {statusText && (
                <p className="text-[11px] text-white/70 font-medium">{statusText}</p>
              )}
            </div>
            <ControlButtons
              isConnected={isConnected}
              isConnecting={isConnecting}
              orbState={orbState}
              onConnect={handleConnect}
              onInterrupt={sendInterrupt}
              onEnd={handleEnd}
            />
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
            className="glass-panel rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto"
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

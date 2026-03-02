import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { PERSONA_CONFIG } from '../config'
import { IMAGE_MAP } from '../data/scenarios'
import { useSimulationParams } from '../hooks/useSimulationParams'
import { useSession } from '../hooks/useSession'
import { useEscapeKey } from '../hooks/useEscapeKey'
import Header from './Header'
import Sidebar from './Sidebar'
import TranscriptPanel from './TranscriptPanel'
import ClinicalImageCard from './ClinicalImageCard'
import VoiceOrb, { VoiceOrbWithRings } from './VoiceOrb'
import AnimatedBackground from './AnimatedBackground'
import SessionToggle from './SessionToggle'
import ConfirmModal from './ConfirmModal'

/**
 * SimulationRoom — Main layout component.
 * Desktop: 3-column (persona | clinical image | transcript) + centered orb dock
 * Mobile: stacked content + fixed bottom dock
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

  const difficultyLabel = { easy: 'Friendly', medium: 'Standard', strict: 'Strict' }
  const difficultyColor = { easy: '#10B981', medium: '#F59E0B', strict: '#EF4444' }

  const panelEntry = { opacity: 0, scale: 0.95, filter: 'blur(8px)' }
  const panelVisible = { opacity: 1, scale: 1, filter: 'blur(0px)' }
  const spring = (delay) => ({ type: 'spring', stiffness: 300, damping: 25, delay })

  return (
    <div className="h-screen flex overflow-hidden bg-bg-primary">
      <AnimatedBackground />

      {/* Sidebar — desktop: inline collapsed/hover-expand. Mobile: overlay drawer */}
      <Sidebar
        currentPromptFile={scenario.promptFile}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* ======================== DESKTOP LAYOUT ======================== */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 ml-16 relative z-10 p-4 gap-5">

        {/* Header — glass card */}
        <motion.div
          initial={panelEntry}
          animate={panelVisible}
          transition={spring(0.0)}
        >
          <Header
            scenario={scenario}
            difficulty={difficulty}
            timeLimit={params?.mockExam?.isActive ? 480 : 300}
            isConnected={isConnected}
            onExit={handleExit}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
        </motion.div>

        {/* Main content — 3 glass cards in a row */}
        <main className="flex-1 flex min-h-0 gap-5">
          {/* Left: Persona panel */}
          <motion.div
            initial={panelEntry}
            animate={panelVisible}
            transition={spring(0.08)}
            className="glass-card rounded-xl w-[22%] min-w-[180px] p-5 flex flex-col items-center justify-center gap-4"
          >
            <div
              className="w-20 h-20 rounded-full bg-cover bg-center border-3 shadow-md"
              style={{
                backgroundImage: persona.image ? `url(${persona.image})` : 'none',
                backgroundColor: persona.accentColor || '#4A5D4C',
                borderColor: `${difficultyColor[difficulty] || '#4A5D4C'}50`,
              }}
            />
            <div className="text-center">
              <p className="font-display text-[17px] text-text-primary">{persona.name}</p>
              <p className="text-[13px] text-text-muted mt-0.5">{persona.title}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04]">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: difficultyColor[difficulty] }}
              />
              <span className="text-[12px] font-medium text-text-secondary">
                {difficultyLabel[difficulty] || difficulty}
              </span>
            </div>
          </motion.div>

          {/* Center: Clinical image */}
          {scenario.imageFile && (
            <motion.div
              initial={panelEntry}
              animate={panelVisible}
              transition={spring(0.16)}
              className="glass-card rounded-xl w-[48%] shrink-0"
            >
              <ClinicalImageCard
                imageFile={scenario.imageFile}
                scenarioTitle={scenario.title}
                onExpand={(src) => setExpandedImage(src)}
                fillHeight
              />
            </motion.div>
          )}

          {/* Right: Transcript */}
          <motion.div
            initial={panelEntry}
            animate={panelVisible}
            transition={spring(0.24)}
            className="glass-card rounded-xl flex-1 min-w-0 min-h-0"
          >
            <TranscriptPanel messages={messages} personaName={persona.name} />
          </motion.div>
        </main>

        {/* Bottom dock — glass card */}
        <motion.div
          initial={panelEntry}
          animate={panelVisible}
          transition={spring(0.32)}
          className="glass-card rounded-xl flex flex-col items-center gap-2 pb-5 pt-2 shrink-0"
          style={{ minHeight: 160, overflow: 'visible' }}
        >
          <div className="h-8 flex items-center justify-center">
            {statusText && (
              <motion.div
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('ai-status-bubble text-[13px] font-medium text-center', orbState !== 'idle' && orbState)}
              >
                {statusText}
              </motion.div>
            )}
          </div>

          <VoiceOrbWithRings ref={orbRef} state={orbState} size={100} />

          <SessionToggle
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={handleConnect}
            onEnd={handleEnd}
          />
        </motion.div>
      </div>

      {/* ======================== MOBILE LAYOUT ======================== */}
      <div className="lg:hidden flex flex-col fixed inset-0 bg-bg-primary">
        <AnimatedBackground mobile />

        {/* Frosted dark header */}
        <header className="h-14 px-3 flex items-center justify-between shrink-0 z-[200] mobile-glass border-b border-black/[0.06]">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="w-11 h-11 flex items-center justify-center text-black/40 hover:text-black/70"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
            </svg>
          </button>
          <div className="flex-1 min-w-0 mx-3 text-center">
            <p className="text-[14px] text-text-primary font-medium truncate">{scenario.title}</p>
            {scenario.category && (
              <p className="text-[11px] text-text-muted capitalize truncate">{scenario.category.replace(/\//g, ' · ')}</p>
            )}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-medium" style={{ backgroundColor: persona.accentColor || '#4A5D4C' }}>
            {persona.name?.charAt(0) || '?'}
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 relative z-10">
          {scenario.imageFile && (
            <div className="glass-card rounded-xl">
              <ClinicalImageCard
                imageFile={scenario.imageFile}
                scenarioTitle={scenario.title}
                onExpand={(src) => setExpandedImage(src)}
                compact
              />
            </div>
          )}
          <div className="flex-1 min-h-[200px] glass-card rounded-xl">
            <TranscriptPanel messages={messages} personaName={persona.name} />
          </div>
        </div>

        {/* Orb floats ABOVE the dock — outside backdrop-filter context so glow isn't clipped */}
        <div className="absolute bottom-[calc(16px+env(safe-area-inset-bottom)+48px)] left-1/2 -translate-x-1/2 z-[201] flex flex-col items-center gap-1" style={{ overflow: 'visible' }}>
          <VoiceOrbWithRings state={orbState} size={64} mobile ringCount={2} />
          {statusText && (
            <p className="text-[11px] text-text-muted font-medium text-center">{statusText}</p>
          )}
        </div>

        {/* Fixed bottom dock — only SessionToggle inside backdrop-filter */}
        <div className="relative z-[200] flex items-center justify-center px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] mobile-glass border-t border-black/[0.06]">
          <SessionToggle
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={handleConnect}
            onEnd={handleEnd}
          />
        </div>
      </div>

      {/* ======================== MODALS ======================== */}

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

      {feedbackData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setFeedbackData(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Session feedback summary"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-card rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto !bg-white/[0.85] !backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-text-primary mb-4">Session Summary</h2>

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

            {feedbackData.strengths?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {feedbackData.strengths.map((s, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="text-[14px] text-text-primary flex items-start gap-2">
                      <span className="text-listening mt-0.5">+</span>{s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {feedbackData.improvements?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider mb-2">Areas for Improvement</h3>
                <ul className="space-y-1">
                  {feedbackData.improvements.map((s, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (feedbackData.strengths?.length || 0) * 0.08 + i * 0.08 }} className="text-[14px] text-text-primary flex items-start gap-2">
                      <span className="text-speaking mt-0.5">-</span>{s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setFeedbackData(null); handleExit() }} className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">Exit</button>
              <button ref={feedbackContinueRef} onClick={() => setFeedbackData(null)} className="px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">Continue</button>
            </div>
          </motion.div>
        </motion.div>
      )}

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

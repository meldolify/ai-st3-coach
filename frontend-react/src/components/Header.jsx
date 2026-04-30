import { useState, useEffect, useCallback } from 'react'
import { cn } from '../lib/utils'

/**
 * Header — Frosted glass top bar with scenario info, timer, and navigation.
 * Supports dual timer: prep countdown (CTB/Consent) then interview countdown.
 */
export default function Header({ scenario, difficulty, timeLimit = 300, isConnected, prepPhase, onPrepEnd, onExit, onToggleSidebar }) {
  // Interview timer state
  const [secondsLeft, setSecondsLeft] = useState(timeLimit)
  const [isRunning, setIsRunning] = useState(false)

  // Prep timer state
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(0)

  // Start prep timer when prepPhase activates
  useEffect(() => {
    if (prepPhase) {
      setPrepSecondsLeft(prepPhase.prepTime)
    }
  }, [prepPhase])

  // Prep countdown
  useEffect(() => {
    if (!prepPhase || prepSecondsLeft <= 0) return
    const interval = setInterval(() => {
      setPrepSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onPrepEnd?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [prepPhase, prepSecondsLeft, onPrepEnd])

  // Interview timer starts when connected AND prep is done (or no prep)
  useEffect(() => {
    if (isConnected && !prepPhase && !isRunning) {
      setIsRunning(true)
      setSecondsLeft(timeLimit)
    }
    if (!isConnected) {
      setIsRunning(false)
    }
  }, [isConnected, prepPhase, timeLimit, isRunning])

  // Interview countdown
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

  const isPrepActive = !!prepPhase
  const displaySeconds = isPrepActive ? prepSecondsLeft : secondsLeft
  const isWarning = !isPrepActive && secondsLeft <= 60 && secondsLeft > 0
  const isExpired = !isPrepActive && secondsLeft === 0

  const difficultyLabel = { easy: 'Friendly', medium: 'Standard', strict: 'Strict' }

  return (
    <header
      data-testid="sim-header"
      className={cn(
        'organic-card flex items-center justify-between px-4 sm:px-5 h-[56px] lg:h-[60px]',
        'shrink-0'
      )}
    >
      {/* Left: Hamburger (mobile) + Exit + scenario info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1 text-organic-bark/60 hover:text-organic-bark transition-colors"
          aria-label="Toggle scenario navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
          </svg>
        </button>

        <button
          onClick={onExit}
          className="flex items-center gap-2 text-organic-bark/70 hover:text-organic-forest transition-colors"
          aria-label="Exit simulation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="text-[14px] font-semibold tracking-wide uppercase hidden sm:inline" style={{ fontFamily: 'var(--font-organic-display)' }}>
            Reviva
          </span>
        </button>

        <div className="h-5 w-px bg-organic-stone hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0">
          <h1
            className="text-[15px] sm:text-[17px] text-organic-bark truncate max-w-[180px] sm:max-w-[300px] lg:max-w-[500px]"
            style={{ fontFamily: 'var(--font-organic-display)', fontWeight: 600 }}
          >
            {scenario?.title || 'Select a scenario'}
          </h1>
          {scenario?.category && (
            <>
              <span className="text-organic-bark/40 text-xs hidden md:inline">·</span>
              <span className="text-organic-bark/60 text-xs capitalize hidden md:inline">
                {scenario.category.replace(/\//g, ' · ')}
              </span>
            </>
          )}
          {difficulty && (
            <>
              <span className="text-organic-bark/40 text-xs hidden lg:inline">·</span>
              <span className="text-organic-bark/60 text-xs hidden lg:inline">
                {difficultyLabel[difficulty] || difficulty}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Timer + optional skip button */}
      <div className="flex items-center gap-3">
        {isPrepActive && (
          <button
            onClick={onPrepEnd}
            className="text-[12px] font-medium text-organic-bark/60 hover:text-organic-forest transition-colors px-2 py-1 rounded-md hover:bg-organic-cream-deep"
          >
            Start Early
          </button>
        )}

        <div className="flex items-center gap-2">
          {isPrepActive && (
            <span className="text-[10px] font-medium text-organic-forest uppercase tracking-[0.18em] hidden sm:inline">
              Prep
            </span>
          )}
          <div
            data-testid="session-timer"
            role="timer"
            aria-live="assertive"
            aria-label={`${isPrepActive ? 'Preparation' : ''} Time remaining: ${formatTime(displaySeconds)}`}
            className={cn(
              'tabular-nums text-[15px] font-semibold px-3 py-1 rounded-lg',
              isPrepActive && 'text-organic-forest bg-organic-forest/10',
              !isPrepActive && isExpired && 'text-[#DC2626] bg-[#DC2626]/10',
              !isPrepActive && isWarning && !isExpired && 'text-organic-amber bg-organic-amber/15',
              !isPrepActive && !isWarning && !isExpired && 'text-organic-bark/80'
            )}
          >
            {formatTime(displaySeconds)}
          </div>
        </div>
      </div>
    </header>
  )
}

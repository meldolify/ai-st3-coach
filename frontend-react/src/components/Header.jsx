import { useState, useEffect, useCallback } from 'react'
import { cn } from '../lib/utils'

/**
 * Header — Frosted glass top bar with scenario info, timer, and navigation.
 */
export default function Header({ scenario, difficulty, timeLimit = 300, isConnected, onExit, onToggleSidebar }) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (isConnected && !isRunning) {
      setIsRunning(true)
      setSecondsLeft(timeLimit)
    }
    if (!isConnected) {
      setIsRunning(false)
    }
  }, [isConnected, timeLimit, isRunning])

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

  const isWarning = secondsLeft <= 60 && secondsLeft > 0
  const isExpired = secondsLeft === 0

  const difficultyLabel = { easy: 'Friendly', medium: 'Standard', strict: 'Strict' }

  return (
    <header
      className={cn(
        'flex items-center justify-between px-5 h-[56px]',
        'glass-panel !rounded-none !border-t-0 !border-l-0 !border-r-0',
        'shrink-0'
      )}
    >
      {/* Left: Hamburger + Logo + scenario info */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1 text-text-secondary hover:text-text-primary transition-colors"
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
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Exit simulation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="text-[15px] font-medium hidden sm:inline">Reviva</span>
        </button>

        <div className="h-5 w-px bg-black/[0.08] hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="font-display text-[17px] text-text-primary truncate max-w-[300px] lg:max-w-[500px]">
            {scenario?.title || 'Select a scenario'}
          </h1>
          {scenario?.category && (
            <>
              <span className="text-text-muted text-xs hidden md:inline">·</span>
              <span className="text-text-muted text-xs capitalize hidden md:inline">
                {scenario.category.replace(/\//g, ' · ')}
              </span>
            </>
          )}
          {difficulty && (
            <>
              <span className="text-text-muted text-xs hidden lg:inline">·</span>
              <span className="text-text-muted text-xs hidden lg:inline">
                {difficultyLabel[difficulty] || difficulty}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Timer */}
      <div className="flex items-center gap-3">
        <div
          role="timer"
          aria-live="assertive"
          aria-label={`Time remaining: ${formatTime(secondsLeft)}`}
          className={cn(
            'font-body tabular-nums text-[15px] font-medium px-3 py-1 rounded-md',
            isExpired && 'text-error bg-red-50',
            isWarning && !isExpired && 'text-speaking bg-amber-50',
            !isWarning && !isExpired && 'text-text-secondary'
          )}
        >
          {formatTime(secondsLeft)}
        </div>
      </div>
    </header>
  )
}

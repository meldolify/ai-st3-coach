import { cn } from '../lib/utils'

/**
 * ControlPinwheel — 2x2 cluster of action cards with quarter-rounded outward
 * corners. Adapted from a Uiverse pure-CSS social-card pinwheel; effects only
 * (the original's social icons are replaced with session controls).
 *
 *   ╭───┬───╮      Start   (top-left,  forest hover)
 *   │TL │TR │      Pause   (top-right, amber  hover)
 *   ├───┼───┤      Stop    (bot-left,  red    hover)
 *   │BL │BR │      Feedback(bot-right, canopy hover)
 *   ╰───┴───╯
 *
 * Props mirror the inputs the SimulationRoom dock used to provide separately
 * to SessionToggle + FeedbackButton.
 */

const ICON_SIZE = 36

function StartIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="5.5" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="7" y="6" width="3.5" height="12" rx="1" />
      <rect x="13.5" y="6" width="3.5" height="12" rx="1" />
    </svg>
  )
}

function ResumeIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
    </svg>
  )
}

function FeedbackIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="4" width="12" height="16" rx="1.5" />
      <path d="M9 3h6v3H9z" fill="currentColor" stroke="none" />
      <path d="M9 11l2 2 4-4" />
    </svg>
  )
}

export function ControlPinwheel({
  isConnected,
  isConnecting,
  isPaused,
  interviewEnded,
  feedbackRequested,
  onStart,
  onPause,
  onResume,
  onStop,
  onFeedback,
  className,
}) {
  // Session not active → can Start; cannot Pause / Stop
  // Session active, not paused → can Pause / Stop
  // Session active, paused → can Resume (Pause card swaps icon) / Stop
  // Interview ended → can Feedback (if not yet requested), nothing else
  const canStart = !isConnected && !isConnecting && !interviewEnded
  const canPauseOrResume = isConnected && !interviewEnded
  const canStop = isConnected && !interviewEnded
  const canFeedback = interviewEnded && !feedbackRequested

  return (
    <div className={cn('pinwheel', className)} data-testid="control-pinwheel">
      <div className="pinwheel__row">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="pinwheel__card pinwheel__card--tl pinwheel__card--start"
          aria-label="Start session"
          title={isConnecting ? 'Connecting…' : 'Start session'}
          data-testid="pinwheel-start"
        >
          <StartIcon />
        </button>
        <button
          type="button"
          onClick={isPaused ? onResume : onPause}
          disabled={!canPauseOrResume}
          className="pinwheel__card pinwheel__card--tr pinwheel__card--pause"
          aria-label={isPaused ? 'Resume session' : 'Pause session'}
          title={isPaused ? 'Resume session' : 'Pause session'}
          data-testid="pinwheel-pause"
        >
          {isPaused ? <ResumeIcon /> : <PauseIcon />}
        </button>
      </div>
      <div className="pinwheel__row">
        <button
          type="button"
          onClick={onStop}
          disabled={!canStop}
          className="pinwheel__card pinwheel__card--bl pinwheel__card--stop"
          aria-label="Stop session"
          title="Stop session"
          data-testid="pinwheel-stop"
        >
          <StopIcon />
        </button>
        <button
          type="button"
          onClick={onFeedback}
          disabled={!canFeedback}
          className="pinwheel__card pinwheel__card--br pinwheel__card--feedback"
          aria-label="Get feedback"
          title={feedbackRequested ? 'Feedback already requested' : 'Get feedback'}
          data-testid="pinwheel-feedback"
        >
          <FeedbackIcon />
        </button>
      </div>
    </div>
  )
}

import { cn } from '../lib/utils'
import { ControlPinwheel } from './ControlPinwheel'
import { StatusPill } from './StatusPill'

/**
 * StatusPanel — bundles the session status pill + the control pinwheel.
 * Lives in the bottom-left panel of the simulation room (desktop layout).
 */

export function StatusPanel({
  orbState,
  statusText,
  prepPhase,
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
  return (
    <div
      className={cn('flex flex-col items-center justify-between gap-4 p-5 h-full', className)}
      data-testid="status-panel"
    >
      <div className="h-7 flex items-center justify-center w-full">
        <StatusPill
          orbState={orbState}
          statusText={statusText}
          prepPhase={prepPhase}
          isPaused={isPaused}
          isConnected={isConnected}
        />
      </div>

      <ControlPinwheel
        isConnected={isConnected}
        isConnecting={isConnecting}
        isPaused={isPaused}
        interviewEnded={interviewEnded}
        feedbackRequested={feedbackRequested}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onStop={onStop}
        onFeedback={onFeedback}
      />
    </div>
  )
}

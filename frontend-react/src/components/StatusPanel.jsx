import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { ControlPinwheel } from './ControlPinwheel'

/**
 * StatusPanel — bundles the session status pill + the control pinwheel.
 * Lives in the bottom-left panel of the simulation room (desktop) or in the
 * sticky bottom dock (mobile).
 */

const STATE_DOT = {
  idle: '#B87333',
  listening: '#10B981',
  thinking: '#6366F1',
  speaking: '#D4943A',
}

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
  const isPrep = !!prepPhase
  const dot = STATE_DOT[orbState] || STATE_DOT.idle
  const displayText = isPrep
    ? 'Read the information sheet'
    : isPaused
    ? 'Paused'
    : statusText || (isConnected ? '' : 'Ready to start')

  return (
    <div
      className={cn('flex flex-col items-center justify-between gap-4 p-5 h-full', className)}
      data-testid="status-panel"
    >
      <div className="h-7 flex items-center justify-center w-full">
        <AnimatePresence mode="wait" initial={false}>
          {displayText ? (
            <motion.div
              key={displayText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-full',
                'bg-organic-cream-deep border border-organic-stone',
                'text-[12px] font-medium text-organic-bark/80'
              )}
            >
              {!isPrep && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: dot,
                    boxShadow: orbState !== 'idle' ? `0 0 6px ${dot}` : 'none',
                  }}
                />
              )}
              <span className="uppercase tracking-[0.18em] text-[10.5px]">{displayText}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
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

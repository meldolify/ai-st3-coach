import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * ControlButtons — Start/Interrupt/End session controls.
 * Interrupt button shows during AI speaking with amber pulse animation.
 */
export default function ControlButtons({
  isConnected,
  isConnecting,
  orbState,
  onConnect,
  onInterrupt,
  onEnd,
}) {
  const isAISpeaking = orbState === 'speaking'

  return (
    <div className="flex items-center justify-center gap-3">
      {!isConnected ? (
        <motion.button
          onClick={onConnect}
          disabled={isConnecting}
          className={cn(
            'relative px-6 py-2.5 rounded-md text-[14px] font-medium',
            'text-white transition-colors',
            isConnecting
              ? 'bg-accent/60 cursor-wait'
              : 'bg-accent hover:bg-accent-hover'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Pulse animation when not connected */}
          {!isConnecting && (
            <motion.span
              className="absolute inset-0 rounded-md bg-accent"
              animate={{
                opacity: [0.4, 0, 0.4],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          <span className="relative z-10">
            {isConnecting ? 'Connecting...' : 'Start Session'}
          </span>
        </motion.button>
      ) : (
        <>
          {/* Interrupt button — visible only during AI speaking */}
          {isAISpeaking && (
            <motion.button
              onClick={onInterrupt}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                'p-2.5 rounded-md text-[13px] font-medium',
                'border border-amber-400/30 text-amber-400',
                'hover:bg-amber-400/10 transition-colors',
                'animate-[interrupt-amber-pulse_1.5s_ease-in-out_infinite]'
              )}
              whileTap={{ scale: 0.95 }}
              title="Pause AI"
              aria-label="Pause AI"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            </motion.button>
          )}

          <motion.button
            onClick={onEnd}
            className={cn(
              'px-5 py-2 rounded-md text-[13px] font-medium',
              'border border-error/20 text-error',
              'hover:bg-error/5 transition-colors'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            End Session
          </motion.button>
        </>
      )}
    </div>
  )
}

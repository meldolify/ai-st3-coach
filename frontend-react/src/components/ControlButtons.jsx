import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * ControlButtons — Start/Pause/End session controls.
 * Animated with Framer Motion. Connect button has pulse animation when idle.
 */
export default function ControlButtons({
  isConnected,
  isConnecting,
  onConnect,
  onEnd,
}) {
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

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

const STATE_DOT = {
  idle: '#B87333',
  listening: '#10B981',
  thinking: '#6366F1',
  speaking: '#D4943A',
}

/**
 * StatusPill — small state indicator (coloured dot + uppercase label) used
 * by both the desktop StatusPanel and the mobile compact strip.
 */
export function StatusPill({ orbState, statusText, prepPhase, isPaused, isConnected, className, compact = false }) {
  const isPrep = !!prepPhase
  const dot = STATE_DOT[orbState] || STATE_DOT.idle
  const displayText = isPrep
    ? 'Read sheet'
    : isPaused
    ? 'Paused'
    : statusText || (isConnected ? '' : 'Ready')

  if (!displayText) return null

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={displayText}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-2 rounded-full',
          'bg-organic-cream-deep border border-organic-stone',
          'text-organic-bark/80 font-medium',
          compact ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-1.5 text-[10.5px]',
          className
        )}
      >
        {!isPrep && (
          <span
            className="rounded-full shrink-0"
            style={{
              width: compact ? 6 : 8,
              height: compact ? 6 : 8,
              backgroundColor: dot,
              boxShadow: orbState !== 'idle' ? `0 0 6px ${dot}` : 'none',
            }}
          />
        )}
        <span className="uppercase tracking-[0.18em] whitespace-nowrap">{displayText}</span>
      </motion.div>
    </AnimatePresence>
  )
}

import { memo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * AnimatedMessage — Streams text word-by-word with staggered fade-in.
 * Only animates once; after all words are revealed it renders plain text.
 */
function AnimatedMessage({ text, animate = false }) {
  if (!animate) return <span>{text}</span>

  const words = text.split(' ')
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.2, ease: 'easeOut' }}
          className="inline-block"
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  )
}

/**
 * TranscriptPanel — Conversation transcript panel.
 * Newest messages at top (reverse chronological). Relative timestamps.
 * AI messages stream in word-by-word; user messages appear instantly.
 */
export default memo(function TranscriptPanel({ messages, personaName = 'Examiner' }) {
  const [, setTick] = useState(0)
  const animatedIdsRef = useRef(new Set())

  // Re-render every 30s to update relative timestamps
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const formatRelativeTime = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 10) return 'just now'
    if (diff < 60) return `${diff}s ago`
    const mins = Math.floor(diff / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    return `${hrs}h ago`
  }

  // Group consecutive messages from same speaker
  const groupedMessages = messages.reduce((groups, msg, i) => {
    const prev = messages[i - 1]
    const sameSpkr = prev && prev.speaker === msg.speaker
    const within30s = prev && msg.timestamp - prev.timestamp < 30000

    if (sameSpkr && within30s) {
      groups[groups.length - 1].items.push(msg)
    } else {
      groups.push({
        speaker: msg.speaker,
        timestamp: msg.timestamp,
        items: [msg],
      })
    }
    return groups
  }, [])

  // Reverse so newest groups appear first
  const reversedGroups = [...groupedMessages].reverse()

  // Find the latest AI message ID for animation
  const latestAiMsgId = messages.length > 0
    ? [...messages].reverse().find(m => m.speaker !== 'user')?.id
    : null

  return (
    <div
      data-testid="transcript-panel"
      className={cn(
        'flex flex-col h-full'
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-organic-stone">
        <h2
          className="text-[12px] text-organic-forest uppercase tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-organic-display)', fontWeight: 600 }}
        >
          Transcript
        </h2>
        <span className="text-[11px] text-organic-bark/55">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Messages — newest at top */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Interview transcript"
        className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-organic-bark/45 text-sm italic text-center max-w-[240px]">
              Conversation will appear here once the session starts.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {reversedGroups.map((group, gi) => (
            <motion.div
              key={`group-${gi}-${group.timestamp}`}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn(
                'mb-4',
                group.speaker === 'user' ? 'flex flex-col items-end' : ''
              )}
            >
              {/* Speaker label + timestamp */}
              <div
                className={cn(
                  'flex items-center gap-2 mb-1.5',
                  group.speaker === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-organic-bark/55">
                  {group.speaker === 'user' ? 'You' : personaName}
                </span>
                <span className="text-[10px] text-organic-bark/40">
                  {formatRelativeTime(group.timestamp)}
                </span>
              </div>

              {/* Message bubbles */}
              {group.items.map((msg) => {
                // Animate only the latest AI message that hasn't been animated yet
                const shouldAnimate = msg.speaker !== 'user'
                  && msg.id === latestAiMsgId
                  && !animatedIdsRef.current.has(msg.id)

                if (shouldAnimate) {
                  animatedIdsRef.current.add(msg.id)
                }

                return (
                  <div
                    key={msg.id}
                    aria-label={`${msg.speaker === 'user' ? 'You' : personaName}: ${msg.text}`}
                    className={cn(
                      'max-w-[85%] rounded-lg px-4 py-2.5 mb-1 text-[14px] leading-relaxed',
                      group.speaker === 'user'
                        ? 'bg-organic-forest text-organic-cream ml-auto shadow-sm'
                        : 'bg-organic-cream-deep text-organic-bark border-l-2 border-organic-amber'
                    )}
                  >
                    <AnimatedMessage text={msg.text} animate={shouldAnimate} />
                  </div>
                )
              })}
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </div>
  )
})

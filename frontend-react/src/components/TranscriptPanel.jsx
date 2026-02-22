import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * TranscriptPanel — Conversation transcript panel.
 * Newest messages at top (reverse chronological). Relative timestamps.
 */
export default function TranscriptPanel({ messages, personaName = 'Examiner' }) {
  const [, setTick] = useState(0)

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

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-2xl glass-panel'
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
        <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
          Transcript
        </h2>
        <span className="text-[12px] text-text-muted">
          {messages.length} messages
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
            <p className="text-text-muted text-sm">
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
                <span className="text-[11px] font-medium text-text-muted">
                  {group.speaker === 'user' ? 'You' : personaName}
                </span>
                <span className="text-[11px] text-text-muted">
                  {formatRelativeTime(group.timestamp)}
                </span>
              </div>

              {/* Message bubbles */}
              {group.items.map((msg) => (
                <div
                  key={msg.id}
                  aria-label={`${msg.speaker === 'user' ? 'You' : personaName}: ${msg.text}`}
                  className={cn(
                    'max-w-[85%] rounded-lg px-4 py-2.5 mb-1 text-[15px] leading-relaxed',
                    group.speaker === 'user'
                      ? 'bg-accent text-white ml-auto'
                      : 'bg-bg-secondary text-text-primary border-l-2 border-accent-light'
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </div>
  )
}

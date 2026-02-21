import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

/**
 * TranscriptPanel — Dominant right panel showing conversation transcript.
 * Solid white background, auto-scrolling, iMessage-inspired layout.
 * Supports streaming text with typing cursor during AI response chunks.
 */
export default function TranscriptPanel({ messages, streamingText, personaName = 'Examiner' }) {
  const scrollRef = useRef(null)

  // Auto-scroll to bottom on new messages or streaming updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingText])

  const formatTimestamp = (ts) => {
    const date = new Date(ts)
    const m = date.getMinutes().toString().padStart(2, '0')
    const s = date.getSeconds().toString().padStart(2, '0')
    return `${m}:${s}`
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

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-bg-elevated rounded-lg',
        'border border-bg-secondary'
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-bg-secondary">
        <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
          Transcript
        </h2>
        <span className="text-[12px] text-text-muted">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Interview transcript"
        className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar"
      >
        {messages.length === 0 && !streamingText && (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-sm">
              Conversation will appear here once the session starts.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {groupedMessages.map((group, gi) => (
            <motion.div
              key={`group-${gi}-${group.timestamp}`}
              initial={{ opacity: 0, y: 12 }}
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
                  {formatTimestamp(group.timestamp)}
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

        {/* Streaming text — appears during AI response chunks */}
        {streamingText !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-medium text-text-muted">
                {personaName}
              </span>
              <span className="text-[11px] text-text-muted">
                typing...
              </span>
            </div>
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-4 py-2.5 text-[15px] leading-relaxed',
                'bg-bg-secondary text-text-primary border-l-2 border-accent-light'
              )}
            >
              {streamingText || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '300ms' }} />
                </span>
              )}
              {streamingText && (
                <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

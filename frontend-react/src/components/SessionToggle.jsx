import { cn } from '../lib/utils'

/**
 * SessionToggle — Three-state button:
 * 1. Disconnected: green mic icon → Start Session
 * 2. Connected: spinning red stop square → End Session
 * 3. Ended (no feedback yet): blue clipboard icon → Get Feedback (one-shot)
 * 4. Feedback requested: disabled state
 */

const btnBase = [
  'relative w-[56px] h-[56px] rounded-[16px]',
  'border border-black/[0.08] outline-none',
  'bg-white/[0.70] backdrop-blur-[12px]',
  'shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
  'transition-all duration-200 cursor-pointer',
  'hover:bg-white/[0.85] hover:border-black/[0.12]',
  'hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]',
  'hover:-translate-y-0.5',
  'active:bg-white/[0.60] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-0',
  'disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale-[50%]',
].join(' ')

export default function SessionToggle({
  isConnected, isConnecting, interviewEnded, feedbackRequested,
  onConnect, onEnd, onRequestFeedback,
}) {
  const handleClick = () => {
    if (interviewEnded && !feedbackRequested) {
      onRequestFeedback()
    } else if (isConnected) {
      onEnd()
    } else if (!isConnecting) {
      onConnect()
    }
  }

  const disabled = isConnecting || (interviewEnded && feedbackRequested)
  const showFeedback = interviewEnded && !feedbackRequested

  const title = showFeedback
    ? 'Get Feedback'
    : isConnected
      ? 'End Session'
      : isConnecting
        ? 'Connecting...'
        : 'Start Session'

  const hoverClass = showFeedback
    ? 'hover:border-[rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08),0_0_16px_rgba(59,130,246,0.2)]'
    : isConnected
      ? 'hover:border-[rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08),0_0_16px_rgba(239,68,68,0.2)]'
      : 'hover:border-[rgba(110,231,183,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08),0_0_16px_rgba(110,231,183,0.2)]'

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        btnBase,
        isConnecting && 'cursor-wait',
        hoverClass
      )}
      title={title}
      aria-label={title}
    >
      <div className="flex items-center justify-center w-full h-full">
        {showFeedback ? (
          /* Clipboard/feedback icon */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 12h6" />
            <path d="M9 16h6" />
          </svg>
        ) : isConnected ? (
          <div
            className="w-5 h-5 rounded-sm bg-[#DC2626]"
            style={{ animation: 'spin 3s linear infinite' }}
          />
        ) : isConnecting ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" className="animate-spin">
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </div>
    </button>
  )
}

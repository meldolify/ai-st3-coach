import { cn } from '../lib/utils'

/**
 * SessionToggle — Two-state button:
 * 1. Disconnected: green mic icon → Start Session
 * 2. Connected: spinning red stop square → End Session
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
  isConnected, isConnecting, interviewEnded,
  onConnect, onEnd,
}) {
  const handleClick = () => {
    if (isConnected) {
      onEnd()
    } else if (!isConnecting) {
      onConnect()
    }
  }

  const disabled = isConnecting || interviewEnded

  const title = isConnected
    ? 'End Session'
    : isConnecting
      ? 'Connecting...'
      : interviewEnded
        ? 'Session Ended'
        : 'Start Session'

  const hoverClass = isConnected
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
        {isConnected ? (
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

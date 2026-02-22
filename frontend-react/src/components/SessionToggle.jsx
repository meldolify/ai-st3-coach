import { cn } from '../lib/utils'

/**
 * SessionToggle — Single button that toggles between start/stop.
 * Inspired by 21st.dev ai-voice-input: mic icon → spinning stop square.
 */

const btnBase = [
  'relative w-[56px] h-[56px] rounded-[16px]',
  'border border-white/50 outline-none',
  'bg-white/70 backdrop-blur-[12px]',
  'shadow-[0_4px_16px_rgba(74,93,76,0.08)]',
  'transition-all duration-200 cursor-pointer',
  'hover:bg-white/85 hover:border-white/60',
  'hover:shadow-[0_6px_20px_rgba(74,93,76,0.12)]',
  'hover:-translate-y-0.5',
  'active:bg-white/60 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] active:translate-y-0',
  'disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale-[50%]',
].join(' ')

export default function SessionToggle({ isConnected, isConnecting, onConnect, onEnd }) {
  const handleClick = () => {
    if (isConnected) onEnd()
    else if (!isConnecting) onConnect()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={cn(
        btnBase,
        isConnecting && 'cursor-wait',
        isConnected
          ? 'hover:border-[rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(74,93,76,0.12),0_0_12px_rgba(239,68,68,0.15)]'
          : 'hover:border-[rgba(110,231,183,0.4)] hover:shadow-[0_6px_20px_rgba(74,93,76,0.12),0_0_12px_rgba(110,231,183,0.15)]'
      )}
      title={isConnected ? 'End Session' : isConnecting ? 'Connecting...' : 'Start Session'}
      aria-label={isConnected ? 'End Session' : isConnecting ? 'Connecting...' : 'Start Session'}
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

import { cn } from '../lib/utils'

/**
 * ControlButtons — Frosted glass pill session controls.
 * Variants: Start (green), Interrupt (amber pulse), End (red).
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
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={cn(
            btnBase,
            isConnecting && 'cursor-wait',
            'hover:border-[rgba(110,231,183,0.4)] hover:shadow-[0_6px_20px_rgba(74,93,76,0.12),0_0_12px_rgba(110,231,183,0.15)]'
          )}
          title="Start Session"
          aria-label="Start Session"
        >
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
            <div className="flex items-center justify-center text-[#059669] transition-all duration-[250ms]">
              {isConnecting ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            <p className="text-[9px] font-medium text-text-muted uppercase tracking-[0.3px] m-0">
              {isConnecting ? '...' : 'Start'}
            </p>
          </div>
        </button>
      ) : (
        <>
          {isAISpeaking && (
            <button
              onClick={onInterrupt}
              className={cn(
                btnBase,
                'border-[rgba(251,191,36,0.3)]',
                'shadow-[0_0_16px_rgba(251,191,36,0.15)]',
                'animate-[interrupt-amber-pulse_1.5s_ease-in-out_infinite]',
                'hover:border-[rgba(251,191,36,0.4)]'
              )}
              title="Pause AI"
              aria-label="Pause AI"
            >
              <div className="flex items-center justify-center w-full h-full">
                <div className="flex items-center justify-center text-[#D97706]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                </div>
              </div>
            </button>
          )}

          <button
            onClick={onEnd}
            className={cn(
              btnBase,
              'hover:border-[rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(74,93,76,0.12),0_0_12px_rgba(239,68,68,0.15)]'
            )}
            title="End Interview"
            aria-label="End Interview"
          >
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
              <div className="flex items-center justify-center text-[#DC2626]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </div>
              <p className="text-[9px] font-medium text-text-muted uppercase tracking-[0.3px] m-0">
                End
              </p>
            </div>
          </button>
        </>
      )}
    </div>
  )
}

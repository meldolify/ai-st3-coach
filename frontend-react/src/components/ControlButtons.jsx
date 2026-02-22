import { cn } from '../lib/utils'

/**
 * ControlButtons — Dark glass neumorphic 72x72px session controls.
 * Variants: Start (green), Interrupt (amber, visible during AI speaking), End (red).
 * Matches vanilla .sim-ctrl-btn design.
 */

const btnBase = [
  'relative w-[72px] h-[72px] rounded-[18px]',
  'border border-white/10 outline-none',
  'bg-[rgba(42,56,44,0.85)] backdrop-blur-[12px]',
  'shadow-[0_4px_16px_rgba(0,0,0,0.2)]',
  'transition-all duration-200 cursor-pointer',
  'hover:bg-[rgba(52,68,54,0.9)] hover:border-white/[0.18]',
  'hover:shadow-[0_4px_20px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.05)]',
  'hover:-translate-y-px',
  'active:bg-[rgba(35,48,37,0.9)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)] active:translate-y-0',
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
        /* ===== START BUTTON ===== */
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={cn(
            btnBase,
            isConnecting && 'cursor-wait',
            'hover:border-[rgba(110,231,183,0.3)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25),0_0_12px_rgba(110,231,183,0.15)]'
          )}
          title="Start Session"
          aria-label="Start Session"
        >
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
            <div className="flex items-center justify-center text-[#6EE7B7] transition-all duration-[250ms] group-hover:-translate-y-px">
              {isConnecting ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-[0.3px] m-0">
              {isConnecting ? '...' : 'Start'}
            </p>
          </div>
        </button>
      ) : (
        <>
          {/* ===== INTERRUPT BUTTON (visible during AI speaking) ===== */}
          {isAISpeaking && (
            <button
              onClick={onInterrupt}
              className={cn(
                btnBase,
                'bg-[rgba(120,80,10,0.85)] border-[rgba(251,191,36,0.4)]',
                'shadow-[0_0_16px_rgba(251,191,36,0.25)]',
                'animate-[interrupt-amber-pulse_1.5s_ease-in-out_infinite]',
                'hover:border-[rgba(251,191,36,0.3)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25),0_0_12px_rgba(251,191,36,0.15)]'
              )}
              title="Pause AI"
              aria-label="Pause AI"
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="flex items-center justify-center text-[#FDE68A]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                </div>
              </div>
            </button>
          )}

          {/* ===== END BUTTON ===== */}
          <button
            onClick={onEnd}
            className={cn(
              btnBase,
              'hover:border-[rgba(239,68,68,0.3)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25),0_0_12px_rgba(239,68,68,0.15)]'
            )}
            title="End Interview"
            aria-label="End Interview"
          >
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
              <div className="flex items-center justify-center text-[#FCA5A5]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              </div>
              <p className="text-[10px] font-medium text-white/60 uppercase tracking-[0.3px] m-0">
                End
              </p>
            </div>
          </button>
        </>
      )}
    </div>
  )
}

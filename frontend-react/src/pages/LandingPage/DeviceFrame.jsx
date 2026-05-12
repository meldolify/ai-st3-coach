import { motion, AnimatePresence } from 'framer-motion'
import { VoiceOrbSimple } from '../../components/ui/voice-orb-simple'
import { cn } from '../../lib/utils'

const MotionDiv = motion.div

const ENTER = { opacity: 0, y: 12 }
const ACTIVE = { opacity: 1, y: 0 }
const EXIT = { opacity: 0, y: -8 }
const TRANSITION = { duration: 0.3, ease: [0.22, 1, 0.36, 1] }

/**
 * DeviceFrame — sticky browser-style frame for §B AI Interviewer.
 *
 * Renders a sim-room mockup that swaps its inner screen based on
 * `currentStep` (0..3). The four screens are static illustrative
 * compositions reusing voice-orb-simple. Transitions are opacity +
 * translateY, no per-screen entrance animation logic.
 *
 * Window chrome is a stylised macOS-traffic-light bar with a
 * scenario-and-mode pill so the frame reads as "the product".
 */
export function DeviceFrame({ currentStep = 0, mode = 'practice' }) {
  return (
    <div className="device-frame relative w-full max-w-[560px] mx-auto rounded-2xl bg-organic-canopy text-organic-cream shadow-[0_24px_60px_rgba(26,58,42,0.25)] overflow-hidden">
      {/* Window chrome */}
      <div className="device-frame__chrome flex items-center gap-2 px-4 py-3 bg-organic-bark/80 border-b border-organic-stone/10">
        <div className="flex items-center gap-1.5">
          <span className="block h-[10px] w-[10px] rounded-full bg-[#ff5f57]" />
          <span className="block h-[10px] w-[10px] rounded-full bg-[#febc2e]" />
          <span className="block h-[10px] w-[10px] rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-organic-cream/70">
            {mode === 'mock' ? 'Mock Exam' : 'Practice Mode'} &middot; Necrotising Fasciitis
          </span>
        </div>
      </div>

      {/* Screen body — fixed aspect, content swaps by step */}
      <div className="device-frame__screen relative aspect-[4/3] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 0 && (
            <MotionDiv key="idle" className="absolute inset-0" initial={ENTER} animate={ACTIVE} exit={EXIT} transition={TRANSITION}>
              <ScreenIdle mode={mode} />
            </MotionDiv>
          )}
          {currentStep === 1 && (
            <MotionDiv key="listening" className="absolute inset-0" initial={ENTER} animate={ACTIVE} exit={EXIT} transition={TRANSITION}>
              <ScreenListening mode={mode} />
            </MotionDiv>
          )}
          {currentStep === 2 && (
            <MotionDiv key="pushback" className="absolute inset-0" initial={ENTER} animate={ACTIVE} exit={EXIT} transition={TRANSITION}>
              <ScreenPushback mode={mode} />
            </MotionDiv>
          )}
          {currentStep === 3 && (
            <MotionDiv key="feedback" className="absolute inset-0" initial={ENTER} animate={ACTIVE} exit={EXIT} transition={TRANSITION}>
              <ScreenFeedback mode={mode} />
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- 4 internal screens ---------- */

function ScreenIdle({ mode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
      <VoiceOrbSimple state="idle" size={84} statusText={mode === 'mock' ? 'Mock starting' : 'Ready'} />
      <p className="text-[12px] text-organic-cream/60 text-center max-w-[260px] leading-relaxed">
        {mode === 'mock' ? 'Timer about to start. Two minutes per phase.' : 'Take your time. Speak when ready.'}
      </p>
    </div>
  )
}

function ScreenListening({ mode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
      <VoiceOrbSimple state="listening" size={84} statusText="Listening" />
      <div className="w-full max-w-[300px] rounded-lg bg-organic-cream/5 border border-organic-cream/10 px-3 py-2.5">
        <p className="text-[11px] text-organic-cream/85 leading-relaxed">
          <span className="opacity-60">Sounds like</span> &ldquo;necrotising fasciitis&hellip; severe pain
          disproportionate to <FakeCursor />&rdquo;
        </p>
      </div>
      {mode === 'mock' && (
        <span className="text-[10px] uppercase tracking-[0.25em] text-organic-amber/80">01:42 remaining</span>
      )}
    </div>
  )
}

function ScreenPushback({ mode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
      <VoiceOrbSimple state="thinking" size={68} statusText="Examiner" />
      <div className="w-full max-w-[300px] rounded-lg bg-organic-amber/15 border border-organic-amber/30 px-3 py-2.5">
        <p className="text-[11px] text-organic-cream leading-relaxed font-medium">
          {mode === 'mock'
            ? '“Your LRINEC is 4. Walk me through your decision regardless.”'
            : '“What would change your management if the LRINEC was lower?”'}
        </p>
      </div>
    </div>
  )
}

function ScreenFeedback() {
  const rows = [
    { label: 'Clinical knowledge', score: 4.2, width: '84%' },
    { label: 'Communication', score: 3.8, width: '76%' },
    { label: 'Decision-making', score: 4.5, width: '90%' },
    { label: 'Professionalism', score: 4.0, width: '80%' },
  ]
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-6">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em] text-organic-cream/65">Feedback</span>
        <span className="text-[11px] text-organic-amber font-medium">4.1 / 5</span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="space-y-1">
            <div className="flex justify-between text-[10px] text-organic-cream/85">
              <span>{r.label}</span>
              <span className="opacity-60">{r.score.toFixed(1)}</span>
            </div>
            <div className="h-[3px] w-full rounded-full bg-organic-cream/10 overflow-hidden">
              <div
                className={cn('h-full rounded-full bg-organic-amber')}
                style={{ width: r.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FakeCursor() {
  return <span className="inline-block w-[6px] h-[0.9em] -mb-[0.1em] bg-organic-amber animate-pulse" aria-hidden="true" />
}

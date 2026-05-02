import { useNavigate } from 'react-router-dom'
import { HoverPair } from '../HoverPair'
import { cn } from '../../../lib/utils'

/**
 * §E — The Modes. What can I do?
 *
 * Five modes presented via the hover-paired pattern (Ref #4): list of names
 * on the left, visual panel on the right, hover swaps both sides.
 * Mobile stacks all five as cards. Final CTA per active mode routes to
 * /scenarios with fresh-start state.
 */
const MODES = [
  {
    id: 'practice',
    name: 'Practice',
    sublabel: 'For focused drilling',
    tagline: 'Take your time. Learn at your pace.',
    body: 'Choose any scenario. No timer, no pressure. Build confidence one station at a time.',
    Icon: BookIcon,
  },
  {
    id: 'mock-station',
    name: 'Mock by Station',
    sublabel: 'Single timed station',
    tagline: 'Examiner-style pressure, one station at a time.',
    body: 'Pick a station, full pressure, full scoring. Calibrate before the day.',
    Icon: TimerIcon,
  },
  {
    id: 'full-mock',
    name: 'Full Mock Exam',
    sublabel: 'End-to-end circuit',
    tagline: 'The whole circuit. As it really runs.',
    body: 'All four station types in a continuous run. Same pacing as the real day.',
    Icon: CircuitIcon,
  },
  {
    id: 'progress',
    name: 'Progress Tracking',
    sublabel: 'Watch yourself improve',
    tagline: 'Session history, score trends, category insights.',
    body: 'See where you started, where you are, and where you’re still weak.',
    Icon: ChartIcon,
  },
  {
    id: 'feedback',
    name: 'Tailored Feedback',
    sublabel: 'Marking-criteria graded',
    tagline: 'Section-by-section, line-by-line.',
    body: 'Clinical knowledge, communication, decision-making, professionalism — scored, with what to fix.',
    Icon: ChecklistIcon,
  },
]

export default function SectionE_Modes() {
  const navigate = useNavigate()
  const goExplore = () => navigate('/scenarios', { state: { fresh: true } })

  return (
    <section
      id="section-e"
      className="section-e relative bg-organic-cream text-organic-bark"
      data-testid="section-e"
    >
      <div className="section-e__inner max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-36">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-organic-forest mb-5">
            What can I do?
          </p>
          <h2 className="font-organic-display uppercase leading-[0.95] text-[clamp(2.5rem,8vw,6.5rem)] mb-6">
            Five modes.<br />One product.
          </h2>
        </div>

        <HoverPair
          items={MODES}
          defaultActiveId="practice"
          renderListItem={(mode, { isActive }) => (
            <div className="flex items-start gap-4 py-3">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-[0.45em] inline-block h-[6px] rounded-[3px] flex-shrink-0 transition-all duration-300',
                  isActive ? 'w-7 bg-organic-amber' : 'w-4 bg-organic-bark/30'
                )}
              />
              <div className="flex-1">
                <h3
                  className={cn(
                    'font-organic-display text-[clamp(1.5rem,2.5vw,2rem)] leading-tight transition-colors duration-300',
                    isActive ? 'text-organic-bark' : 'text-organic-bark/75'
                  )}
                >
                  {mode.name}
                </h3>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-organic-bark/55">
                  {mode.sublabel}
                </p>
              </div>
            </div>
          )}
          renderVisual={(mode) => (
            <div className="hover-pair__visual-card relative rounded-2xl bg-organic-canopy text-organic-cream p-10 lg:p-12 min-h-[420px] flex flex-col justify-between overflow-hidden shadow-[0_24px_60px_rgba(26,58,42,0.18)]">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-organic-amber">
                  {mode.sublabel}
                </span>
                <mode.Icon className="w-12 h-12 text-organic-amber/70" />
              </div>
              <div className="space-y-4">
                <h3 className="font-organic-display text-[clamp(1.85rem,3.2vw,2.5rem)] leading-[1.1]">
                  {mode.tagline}
                </h3>
                <p className="text-[1rem] text-organic-cream/80 leading-relaxed max-w-md">
                  {mode.body}
                </p>
                <button
                  type="button"
                  onClick={goExplore}
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full bg-organic-amber text-organic-bark text-[13px] font-medium tracking-wide uppercase hover:-translate-y-[1px] transition-transform"
                >
                  Try it <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          )}
          renderMobileCard={(mode) => (
            <div className="rounded-2xl bg-organic-sand/50 border border-organic-stone p-6">
              <div className="flex items-start gap-4 mb-3">
                <mode.Icon className="w-10 h-10 text-organic-forest/70 flex-shrink-0" />
                <div>
                  <h3 className="font-organic-display text-[1.5rem] leading-tight">
                    {mode.name}
                  </h3>
                  <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-organic-amber mt-0.5">
                    {mode.sublabel}
                  </p>
                </div>
              </div>
              <p className="text-[0.95rem] text-organic-bark/80 leading-relaxed">
                {mode.body}
              </p>
            </div>
          )}
        />
      </div>
    </section>
  )
}

/* ---------- Mode icons (inline SVG, no asset deps) ---------- */

function BookIcon({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <rect x="6" y="6" width="28" height="28" rx="3" />
      <path d="M12 14h16M12 20h16M12 26h10" strokeLinecap="round" />
    </svg>
  )
}
function TimerIcon({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <circle cx="20" cy="22" r="12" />
      <path d="M20 22V14M16 8h8" strokeLinecap="round" />
    </svg>
  )
}
function CircuitIcon({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <rect x="6" y="6" width="11" height="11" rx="2" />
      <rect x="23" y="6" width="11" height="11" rx="2" />
      <rect x="6" y="23" width="11" height="11" rx="2" />
      <rect x="23" y="23" width="11" height="11" rx="2" />
    </svg>
  )
}
function ChartIcon({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <path d="M6 32V12M6 32h28" strokeLinecap="round" />
      <path d="M10 26l6-6 6 4 8-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChecklistIcon({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <rect x="8" y="6" width="24" height="28" rx="2" />
      <path d="M13 14l2 2 4-4M13 22l2 2 4-4M13 30l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 15h6M22 23h6M22 31h4" strokeLinecap="round" />
    </svg>
  )
}

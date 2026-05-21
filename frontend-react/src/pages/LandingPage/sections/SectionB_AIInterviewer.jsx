import { useRef, useState } from 'react'
import { DeviceFrame } from '../DeviceFrame'
import { useScrollToggle } from '../useScrollToggle'
import { PERSONA_CONFIG } from '../../../config'
import { cn } from '../../../lib/utils'

/**
 * §B — The AI Interviewer.
 *
 * Layout:
 *   - Sticky <DeviceFrame /> on the left showcases the selected persona
 *     (Mr John / Miss Elliot / Mr Perry). Clicking a pill swaps the photo,
 *     orb, name, role, and description with a cross-fade.
 *   - Four scroll-toggled step descriptions on the right explain how the
 *     simulation works. The step copy is generic (not per-persona).
 *
 * useScrollToggle drives the right-side opacity highlight from the
 * walkthrough container's scroll progress.
 */
const STEPS = [
  {
    label: 'Step 01',
    title: 'Just like the real interview.',
    body: "You're given a photo and a scenario, like the day itself. Every case is written by trainees who've sat it.",
  },
  {
    label: 'Step 02',
    title: 'Speak. The interviewer listens.',
    body: 'It hears you in real time and prompts when needed. It picks up where you trailed off and follows where you led.',
  },
  {
    label: 'Step 03',
    title: 'Marked against the published criteria.',
    body: 'Every section is scored against the actual ST3 marking criteria. Not opinions. Not vibes. The thing the panel looks for.',
  },
  {
    label: 'Step 04',
    title: "Feedback that's actually useful.",
    body: "Section by section. What worked, what didn't, what to drill next. The kind of feedback you wish your seniors had time to give.",
  },
]

const PERSONA_KEYS = ['easy', 'medium', 'strict']

export default function SectionB_AIInterviewer() {
  const containerRef = useRef(null)
  const { currentStep } = useScrollToggle({ targetRef: containerRef, itemCount: STEPS.length })
  const [personaKey, setPersonaKey] = useState('medium')
  const persona = PERSONA_CONFIG[personaKey]

  return (
    <section
      id="section-b"
      className="section-b relative bg-organic-cream text-organic-bark"
      data-testid="section-b"
    >
      {/* Intro band */}
      <div className="section-b__intro max-w-7xl mx-auto px-6 sm:px-10 pt-24 md:pt-32 pb-6 md:pb-8 text-center">
        <h2 className="font-organic-display uppercase leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] tracking-[-0.025em] mb-6 font-bold">
          The AI <em className="font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]">Interviewer.</em>
        </h2>
        <p className="max-w-xl mx-auto text-[1.05rem] leading-relaxed text-organic-bark/75 mb-10">
          Simulates the real interview. 24/7. Adapts to you.
        </p>

        {/* Persona toggle pill — three buttons with coloured accent dots */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-organic-canopy/8 border border-organic-canopy/15">
          {PERSONA_KEYS.map((key) => {
            const p = PERSONA_CONFIG[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPersonaKey(key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium tracking-wide transition-colors',
                  personaKey === key
                    ? 'bg-organic-canopy text-organic-cream'
                    : 'text-organic-bark/65 hover:text-organic-bark'
                )}
                aria-pressed={personaKey === key}
                data-testid={`persona-toggle-${key}`}
              >
                <span
                  className="inline-block h-[8px] w-[8px] rounded-full"
                  style={{ backgroundColor: p.accentColor }}
                  aria-hidden="true"
                />
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Walkthrough — tall container, sticky frame on desktop, stacked on mobile. */}
      <div
        ref={containerRef}
        className="section-b__walkthrough relative px-6 sm:px-10 pb-24 md:pb-32"
      >
        {/* Solid forest panel — replaces the prior gloss gradient. Desktop only. */}
        <div className="section-b__backdrop" aria-hidden="true" />

        <div className="max-w-7xl mx-auto md:grid md:grid-cols-2 md:gap-12 lg:gap-20 relative">
          {/* Sticky frame side — z-10 keeps it above the backdrop */}
          <div className="section-b__frame-side relative z-10 md:sticky md:top-[18vh] md:self-start md:flex md:justify-center">
            <DeviceFrame persona={persona} />
          </div>

          {/* Scrolling descriptions side */}
          <div className="section-b__desc-side mt-12 md:mt-0">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={cn(
                  'section-b__desc relative min-h-[28vh] md:min-h-[34vh] flex flex-col justify-center py-6',
                  currentStep === i ? 'opacity-100' : 'opacity-45'
                )}
                style={{ transition: 'opacity 0.4s ease' }}
              >
                {/* Giant numeral watermark behind the description. Anchored at
                    the step's top-left so it doesn't bleed past the column
                    edge into the device frame area. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 left-0 select-none font-organic-display font-normal leading-none text-organic-forest/45"
                  style={{ fontSize: 'clamp(7rem, 11vw, 12rem)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="relative z-10">
                  <span className="font-display italic text-organic-amber text-[1rem] tracking-wide block mb-3">
                    ( {step.label.toLowerCase()} )
                  </span>
                  <h3 className="font-organic-display text-[clamp(1.85rem,4.2vw,3rem)] leading-[1.05] tracking-[-0.015em] mb-4 font-bold">
                    {step.title}
                  </h3>
                  <p className="text-[1.05rem] leading-relaxed text-organic-bark/75 max-w-[44ch]">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

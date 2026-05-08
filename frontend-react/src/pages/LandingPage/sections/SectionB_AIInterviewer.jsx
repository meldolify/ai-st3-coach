import { useRef, useState } from 'react'
import { DeviceFrame } from '../DeviceFrame'
import { useScrollToggle } from '../useScrollToggle'
import { cn } from '../../../lib/utils'

/**
 * §B — The AI Interviewer. What does it do?
 *
 * Visual treatment (per plan §7):
 *   - Light NarrativeScene
 *   - Sticky <DeviceFrame /> on one side, four scroll-toggled descriptions
 *     on the other
 *   - Frame contents advance through 4 steps: idle → listening + transcript
 *     → examiner pushback → feedback card
 *   - Toggle pill: "Practice Mode" / "Mock Exam" — swaps the 4-step copy
 *
 * useScrollToggle (Ref #2 mechanic) drives currentStep from the walkthrough
 * container's scroll progress. Sticky behaviour is desktop only — mobile
 * stacks frame and descriptions vertically and scrolls past normally.
 */
const STEPS = {
  practice: [
    {
      label: 'Step 01',
      title: 'Walk in. Speak naturally.',
      body: 'No timer, no pressure. The examiner waits. Start when you’re ready, take the case at your own pace.',
    },
    {
      label: 'Step 02',
      title: 'It listens like a real examiner.',
      body: 'Real-time speech-to-text. Real-time understanding. Pauses when you pause. Picks up where you left off.',
    },
    {
      label: 'Step 03',
      title: 'It pushes back when needed.',
      body: 'Vague answers get probed. Wrong calls get challenged. Right calls get a follow-up that goes one level deeper.',
    },
    {
      label: 'Step 04',
      title: 'Structured feedback, instantly.',
      body: 'Clinical knowledge, communication, decision-making, professionalism. Section-by-section scores, with what to fix.',
    },
  ],
  mock: [
    {
      label: 'Step 01',
      title: 'Timed entry. The clock starts.',
      body: 'Real interview pacing. Two minutes per phase. The examiner keeps you on the clock — like the real day.',
    },
    {
      label: 'Step 02',
      title: 'Listens, but doesn’t wait forever.',
      body: 'Pauses count against you, just like the real exam. The transcript ticks past in real time as you speak.',
    },
    {
      label: 'Step 03',
      title: 'Probing, harder.',
      body: 'Mock-mode pushback is closer to the upper end of what real examiners ask. Tests depth, not just breadth.',
    },
    {
      label: 'Step 04',
      title: 'Marked to examiner standard.',
      body: 'Same rubric. Same threshold. The score you’d get on the day, with the structured rationale that comes with it.',
    },
  ],
}

export default function SectionB_AIInterviewer() {
  const containerRef = useRef(null)
  const { currentStep } = useScrollToggle({ targetRef: containerRef, itemCount: 4 })
  const [mode, setMode] = useState('practice')
  const steps = STEPS[mode]

  return (
    <section
      id="section-b"
      className="section-b relative bg-organic-cream text-organic-bark"
      data-testid="section-b"
    >
      {/* Intro band */}
      <div className="section-b__intro max-w-7xl mx-auto px-6 sm:px-10 pt-24 md:pt-32 pb-6 md:pb-8 text-center">
        <p className="font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3">
          ( the interviewer )
        </p>
        <h2 className="font-organic-display uppercase leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] tracking-[-0.025em] mb-6 font-bold">
          The AI <em className="font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]">Interviewer.</em>
        </h2>
        <p className="max-w-xl mx-auto text-[1.05rem] leading-relaxed text-organic-bark/75 mb-10">
          Simulates the real interview. 24/7. Adapts to you.
        </p>

        {/* Mode toggle pill */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-organic-canopy/8 border border-organic-canopy/15">
          {['practice', 'mock'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'px-5 py-2 rounded-full text-[13px] font-medium tracking-wide uppercase transition-colors',
                mode === m
                  ? 'bg-organic-canopy text-organic-cream'
                  : 'text-organic-bark/65 hover:text-organic-bark'
              )}
              aria-pressed={mode === m}
            >
              {m === 'practice' ? 'Practice Mode' : 'Mock Exam'}
            </button>
          ))}
        </div>
      </div>

      {/* Walkthrough — tall container, sticky frame on desktop, stacked on mobile.
          Frame side does NOT set h-[80vh] — that constrained the sticky containing
          block to a single viewport, making the frame disappear during steps 2-4.
          With grid stretch + sticky-top, the frame stays pinned through all 4 steps. */}
      <div
        ref={containerRef}
        className="section-b__walkthrough relative px-6 sm:px-10 pb-24 md:pb-32"
      >
        {/* Topographical contour-line backdrop — inline SVG, vector so it
            scales without pixelation. Fills the left half of the walkthrough
            on desktop; mobile keeps the original stacked layout. Forest
            stroke at low opacity reads as quiet atmospheric texture behind
            the DeviceFrame on top. */}
        <svg
          className="section-b__backdrop"
          viewBox="0 0 400 1200"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g fill="none" stroke="var(--organic-forest)" strokeWidth="0.5">
            {/* Three stacked contour clusters, each a set of concentric
                ellipses suggesting topographical bands. */}
            {/* Cluster 1 — upper */}
            <ellipse cx="200" cy="220" rx="220" ry="78" opacity="0.28" />
            <ellipse cx="200" cy="220" rx="190" ry="68" opacity="0.26" />
            <ellipse cx="200" cy="220" rx="160" ry="58" opacity="0.24" />
            <ellipse cx="200" cy="220" rx="130" ry="48" opacity="0.22" />
            <ellipse cx="200" cy="220" rx="100" ry="38" opacity="0.20" />
            <ellipse cx="200" cy="220" rx="72" ry="28" opacity="0.18" />
            <ellipse cx="200" cy="220" rx="46" ry="18" opacity="0.16" />
            {/* Cluster 2 — centre */}
            <ellipse cx="200" cy="600" rx="240" ry="92" opacity="0.30" />
            <ellipse cx="200" cy="600" rx="206" ry="80" opacity="0.28" />
            <ellipse cx="200" cy="600" rx="172" ry="68" opacity="0.26" />
            <ellipse cx="200" cy="600" rx="140" ry="56" opacity="0.24" />
            <ellipse cx="200" cy="600" rx="110" ry="44" opacity="0.22" />
            <ellipse cx="200" cy="600" rx="80" ry="32" opacity="0.20" />
            <ellipse cx="200" cy="600" rx="52" ry="20" opacity="0.18" />
            {/* Cluster 3 — lower */}
            <ellipse cx="200" cy="980" rx="220" ry="78" opacity="0.28" />
            <ellipse cx="200" cy="980" rx="190" ry="68" opacity="0.26" />
            <ellipse cx="200" cy="980" rx="160" ry="58" opacity="0.24" />
            <ellipse cx="200" cy="980" rx="130" ry="48" opacity="0.22" />
            <ellipse cx="200" cy="980" rx="100" ry="38" opacity="0.20" />
            <ellipse cx="200" cy="980" rx="72" ry="28" opacity="0.18" />
            <ellipse cx="200" cy="980" rx="46" ry="18" opacity="0.16" />
          </g>
        </svg>

        <div className="max-w-7xl mx-auto md:grid md:grid-cols-2 md:gap-12 lg:gap-20 relative">
          {/* Sticky frame side — z-10 keeps it above the backdrop image */}
          <div className="section-b__frame-side relative z-10 md:sticky md:top-[18vh] md:self-start md:flex md:justify-center">
            <DeviceFrame currentStep={currentStep} mode={mode} />
          </div>

          {/* Scrolling descriptions side — each step is a relative container
              so we can layer a giant numeral watermark behind the type. */}
          <div className="section-b__desc-side mt-12 md:mt-0">
            {steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  'section-b__desc relative min-h-[55vh] md:min-h-[65vh] flex flex-col justify-center py-8',
                  currentStep === i ? 'opacity-100' : 'opacity-45'
                )}
                style={{ transition: 'opacity 0.4s ease' }}
              >
                {/* Giant numeral watermark behind the description.
                    Forest/15 reads cleanly on cream — amber/8 was
                    near-invisible on the light section bg. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 -left-4 md:-left-8 select-none font-organic-display font-normal leading-none text-organic-forest/15"
                  style={{ fontSize: 'clamp(8rem, 14vw, 14rem)' }}
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

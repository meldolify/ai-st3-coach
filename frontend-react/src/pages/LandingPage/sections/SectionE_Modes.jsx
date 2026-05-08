import { useNavigate } from 'react-router-dom'

/**
 * §E — The Modes. What can I do?
 *
 * Composition (per design package v2 — `ui_kits/landing/index.html` lines
 * 500-551):
 *   - Italic-serif eyebrow `( five modes · one product )` centred
 *   - h2 `Five modes. <em>One product.</em>` centred
 *   - 3-col grid of canopy mode cards (5 cards total — row 1 holds three,
 *     row 2 holds two, the 6th column is intentionally empty)
 *   - Each card: photo header (16/10) with gradient-to-canopy mask + a
 *     `( 0X )` italic-serif numeral in the top-right · body block with
 *     amber tracked sublabel + h3 + body + amber try-it pill
 *   - Photos parallax via the `.section-e .mode-photo img` selector wired
 *     in useLandingAnimations.js
 */
const MODES = [
  {
    id: 'practice',
    numeral: '01',
    name: 'Practice',
    sublabel: 'For focused drilling',
    body: 'Choose any scenario. No timer, no pressure. Build confidence one station at a time.',
    photo: '/images/landing/e-mode-practice.png',
  },
  {
    id: 'mock-station',
    numeral: '02',
    name: 'Mock by Station',
    sublabel: 'Single timed station',
    body: 'Pick a station, full pressure, full scoring. Calibrate before the day.',
    photo: '/images/landing/e-mode-mock-station.png',
  },
  {
    id: 'full-mock',
    numeral: '03',
    name: 'Full Mock Exam',
    sublabel: 'End-to-end circuit',
    body: 'All four station types in a continuous run. Same pacing as the real day.',
    photo: '/images/landing/e-mode-full-mock.png',
  },
  {
    id: 'progress',
    numeral: '04',
    name: 'Progress Tracking',
    sublabel: 'Watch yourself improve',
    body: 'Session history, score trends, category insights. See where you started, where you are.',
    photo: '/images/landing/e-mode-progress.png',
  },
  {
    id: 'feedback',
    numeral: '05',
    name: 'Tailored Feedback',
    sublabel: 'Marking-criteria graded',
    body: 'Section-by-section, line-by-line. Clinical knowledge, communication, decision-making, professionalism.',
    photo: '/images/landing/e-mode-feedback.png',
  },
]

export default function SectionE_Modes() {
  const navigate = useNavigate()
  const goExplore = () => navigate('/scenarios', { state: { fresh: true } })

  return (
    <section
      id="section-e"
      className="section-e relative bg-organic-cream text-organic-bark overflow-hidden"
      data-testid="section-e"
    >
      <span className="section-e__annotation">( what you can do )</span>

      <div className="section-e__inner max-w-[1500px] mx-auto px-6 sm:px-10 py-24 md:py-36">
        <div className="text-center mb-16 md:mb-20">
          <p className="font-display italic text-organic-forest text-[clamp(1rem,1.1vw,1.2rem)] mb-3">
            ( five modes · one product )
          </p>
          <h2 className="section-e__title">
            Five modes.<br />
            <em>One product.</em>
          </h2>
        </div>

        <div className="modes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODES.map((mode) => (
            <article
              key={mode.id}
              className="mode-card flex flex-col rounded-2xl overflow-hidden bg-organic-canopy text-organic-cream border border-organic-amber/30 shadow-[0_24px_60px_rgba(26,58,42,0.18)]"
            >
              <div className="mode-photo relative aspect-[16/10] overflow-hidden bg-organic-canopy">
                <img
                  src={mode.photo}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(0.25) contrast(1.05)' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                {/* gradient-to-canopy mask at the bottom so the card body composites cleanly */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, var(--organic-canopy) 100%)' }}
                />
                {/* italic-serif numeral, top-right of the photo */}
                <span className="absolute top-3 right-4 font-display italic text-organic-amber/95 text-[1rem]">
                  ( {mode.numeral} )
                </span>
              </div>
              <div className="mode-body flex-1 p-7 md:p-8 flex flex-col gap-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-organic-amber">
                  {mode.sublabel}
                </span>
                <h3 className="font-organic-display text-[1.45rem] leading-tight font-bold text-white">
                  {mode.name}
                </h3>
                <p className="text-[0.95rem] text-organic-cream/80 leading-relaxed flex-1">
                  {mode.body}
                </p>
                <button
                  type="button"
                  onClick={goExplore}
                  className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-organic-amber text-organic-bark text-[13px] font-medium tracking-wide uppercase hover:-translate-y-[1px] transition-transform"
                >
                  Try it <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

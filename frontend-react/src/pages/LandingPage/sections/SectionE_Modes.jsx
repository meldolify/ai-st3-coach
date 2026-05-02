import { useNavigate } from 'react-router-dom'
import { HoverPair } from '../HoverPair'
import { cn } from '../../../lib/utils'

/**
 * §E — The Modes. What can I do?
 *
 * Aesthetic pass (plan §12):
 *   - Mode list (left) gets bigger type — clamp(2rem, 4vw, 3.5rem) per name,
 *     active mode in Clash Display 700 + amber, inactive in 400 + bark/40.
 *   - Visual panel (right) gets a photographic header per mode — full-width
 *     image at the top of the card. Sourced from Unsplash.
 *   - Italic-serif annotation on each mode panel: "( 01 ) (02) ..."
 */
const MODES = [
  {
    id: 'practice',
    numeral: '01',
    name: 'Practice',
    sublabel: 'For focused drilling',
    tagline: 'Take your time. Learn at your pace.',
    body: 'Choose any scenario. No timer, no pressure. Build confidence one station at a time.',
    photo: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'mock-station',
    numeral: '02',
    name: 'Mock by Station',
    sublabel: 'Single timed station',
    tagline: 'Examiner-style pressure, one station at a time.',
    body: 'Pick a station, full pressure, full scoring. Calibrate before the day.',
    photo: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'full-mock',
    numeral: '03',
    name: 'Full Mock Exam',
    sublabel: 'End-to-end circuit',
    tagline: 'The whole circuit. As it really runs.',
    body: 'All four station types in a continuous run. Same pacing as the real day.',
    photo: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'progress',
    numeral: '04',
    name: 'Progress Tracking',
    sublabel: 'Watch yourself improve',
    tagline: 'Session history, score trends, category insights.',
    body: 'See where you started, where you are, and where you’re still weak.',
    photo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'feedback',
    numeral: '05',
    name: 'Tailored Feedback',
    sublabel: 'Marking-criteria graded',
    tagline: 'Section-by-section, line-by-line.',
    body: 'Clinical knowledge, communication, decision-making, professionalism — scored, with what to fix.',
    photo: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
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
        <div className="text-center mb-20 md:mb-28">
          <p className="font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3">
            ( five modes · one product )
          </p>
          <h2 className="section-e__title">
            Five modes.<br />
            <em>One product.</em>
          </h2>
        </div>

        <HoverPair
          items={MODES}
          defaultActiveId="practice"
          renderListItem={(mode, { isActive }) => (
            <div className="flex items-center gap-5 py-4">
              <span
                aria-hidden="true"
                className={cn(
                  'inline-block h-[8px] rounded-[3px] flex-shrink-0 transition-all duration-300',
                  isActive ? 'w-10 bg-organic-amber' : 'w-5 bg-organic-bark/25'
                )}
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      'font-display italic text-[1rem] transition-colors duration-300',
                      isActive ? 'text-organic-amber' : 'text-organic-bark/40'
                    )}
                  >
                    ( {mode.numeral} )
                  </span>
                  <h3
                    className={cn(
                      'font-organic-display leading-[0.95] transition-all duration-300',
                      isActive
                        ? 'text-organic-bark font-bold text-[clamp(2rem,4vw,3.25rem)]'
                        : 'text-organic-bark/35 font-normal text-[clamp(1.65rem,3.2vw,2.5rem)]'
                    )}
                  >
                    {mode.name}
                  </h3>
                </div>
                <p className="mt-1 ml-0 text-[0.8125rem] font-medium uppercase tracking-[0.25em] text-organic-bark/45">
                  {mode.sublabel}
                </p>
              </div>
            </div>
          )}
          renderVisual={(mode) => (
            <div className="section-e__visual relative rounded-2xl bg-organic-canopy text-organic-cream min-h-[560px] overflow-hidden shadow-[0_24px_60px_rgba(26,58,42,0.18)] flex flex-col">
              {/* Photo header */}
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <img
                  key={mode.photo}
                  src={mode.photo}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(0.25) contrast(1.05)' }}
                />
                {/* Gradient overlay so type-on-photo is legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-organic-canopy via-transparent to-transparent" />
                {/* Numeral overlay top-right */}
                <span className="absolute top-4 right-5 font-display italic text-organic-amber/90 text-[1.05rem]">
                  ( {mode.numeral} )
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-between gap-5">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-organic-amber">
                    {mode.sublabel}
                  </span>
                  <h3 className="mt-3 font-organic-display text-[clamp(1.65rem,2.8vw,2.25rem)] leading-[1.1] font-bold">
                    {mode.tagline}
                  </h3>
                  <p className="mt-4 text-[0.95rem] text-organic-cream/80 leading-relaxed max-w-md">
                    {mode.body}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goExplore}
                  className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-organic-amber text-organic-bark text-[13px] font-medium tracking-wide uppercase hover:-translate-y-[1px] transition-transform"
                >
                  Try it <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          )}
          renderMobileCard={(mode) => (
            <div className="rounded-2xl bg-organic-canopy text-organic-cream overflow-hidden shadow-[0_12px_40px_rgba(26,58,42,0.15)]">
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <img
                  src={mode.photo}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(0.25) contrast(1.05)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-organic-canopy/80 via-transparent to-transparent" />
                <span className="absolute top-3 right-4 font-display italic text-organic-amber/90 text-[0.95rem]">
                  ( {mode.numeral} )
                </span>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-organic-amber">
                  {mode.sublabel}
                </span>
                <h3 className="mt-2 font-organic-display text-[1.45rem] leading-tight font-bold">
                  {mode.name}
                </h3>
                <p className="mt-3 text-[0.9rem] text-organic-cream/80 leading-relaxed">
                  {mode.body}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </section>
  )
}

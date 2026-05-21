import { useNavigate } from 'react-router-dom'

/**
 * §E — Pick your path. Practise on your terms.
 *
 * Five cards in a 3-column grid. Each card has a photo header (16/10) with
 * gradient-to-canopy mask + numeral, title, body, and a "Try it" pill. No
 * sublabel row — the title sits directly beneath the photo.
 *
 * Photos parallax via `.section-e .mode-photo img` (useLandingAnimations.js).
 */
const MODES = [
  {
    id: 'practice',
    numeral: '01',
    name: 'Practice mode',
    body: "For focused drilling. Choose any scenario. No timer, no pressure. Use it to study a topic, or to practise what you've already studied.",
    photo: '/images/landing/e-mode-practice.png',
  },
  {
    id: 'mock-station',
    numeral: '02',
    name: 'Single timed station',
    body: "Struggling with Call the Boss scenarios? Drill just that type. You won't know the diagnosis, but you can hammer your weak spots. Timer optional.",
    photo: '/images/landing/e-mode-mock-station.png',
  },
  {
    id: 'full-mock',
    numeral: '03',
    name: 'Full Mock exam mode',
    body: 'End-to-end circuit. All four station types in a continuous run. Same pacing as the real day. Timer and everything.',
    photo: '/images/landing/e-mode-full-mock.png',
  },
  {
    id: 'feedback',
    numeral: '04',
    name: 'Real Feedback',
    body: "Didn't mention LRINEC? The examiner will tell you. Disorganised exam? It won't slide by. Every station is scored against standardised marking criteria, so the feedback is actually useful.",
    photo: '/images/landing/e-mode-feedback.png',
  },
  {
    id: 'progress',
    numeral: '05',
    name: 'Keep track of your progress',
    body: "Every station is scored. You'll see how you're doing and how you're improving, in real time.",
    photo: '/images/landing/e-mode-progress.png',
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
      <div className="section-e__inner max-w-[1500px] mx-auto px-6 sm:px-10 py-24 md:py-36">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="section-e__title">
            Pick your path.<br />
            <em>Practise on your terms.</em>
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

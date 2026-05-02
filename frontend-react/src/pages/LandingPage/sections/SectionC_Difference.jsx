import { NarrativeScene } from '../NarrativeScene'

/**
 * §C — What Makes It Different. Why isn't this just another AI tool?
 *
 * Visual treatment (per plan §7):
 *   - Dark NarrativeScene (organic-canopy)
 *   - Magazine-spread two-column editorial: greyed-out "Other AI tools"
 *     negatives on the left, full-colour "Reviva" positives on the right
 *   - Big-number decoration at the bottom: "166 stations", "Verified 2026"
 *
 * This is the conversion peak — the section the visitor came to be
 * convinced by. Stays type-led; image accents would dilute the comparison.
 */
const OTHER_NEGATIVES = [
  'Hallucinates clinical scenarios',
  'Generic, not specialty-specific',
  'Trained on whatever is on the internet',
  'Doesn’t push back like a real examiner',
]

const REVIVA_POSITIVES = [
  'Hand-crafted by current trainees',
  'Verified against the real interview',
  'Updated every cycle, every year',
  'Pushes back exactly like the real thing',
]

export default function SectionC_Difference() {
  return (
    <NarrativeScene
      id="section-c"
      className="section-c relative bg-organic-canopy text-organic-cream"
    >
      <div className="section-c__inner max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-36">
        <p className="section-c__overline text-[12px] font-medium uppercase tracking-[0.3em] text-organic-amber/90 mb-6 text-center">
          What makes it different
        </p>

        <h2 className="section-c__title font-organic-display uppercase text-center leading-[0.95] text-[clamp(2.5rem,8vw,6.5rem)] mb-16 md:mb-24">
          Not just<br />another AI tool.
        </h2>

        {/* Two-column editorial spread */}
        <div className="section-c__spread grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24">
          {/* Other AI tools — greyed out */}
          <div className="section-c__col section-c__col--other text-organic-cream/45">
            <h3 className="section-c__col-label font-organic-display uppercase text-[1.4rem] mb-6 tracking-wide">
              Other AI tools
            </h3>
            <ul className="space-y-4">
              {OTHER_NEGATIVES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[1.05rem] leading-snug">
                  <span aria-hidden className="mt-[0.6em] inline-block h-[1.5px] w-4 flex-shrink-0 bg-current opacity-60" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviva — full colour, amber accents */}
          <div className="section-c__col section-c__col--reviva">
            <h3 className="section-c__col-label font-organic-display uppercase text-[1.4rem] mb-6 tracking-wide text-organic-amber">
              Reviva
            </h3>
            <ul className="space-y-4">
              {REVIVA_POSITIVES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[1.05rem] leading-snug">
                  <span aria-hidden className="mt-[0.6em] inline-block h-[2px] w-5 flex-shrink-0 bg-organic-amber" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Big-number decorations */}
        <div className="section-c__numbers mt-20 md:mt-28 grid grid-cols-2 gap-8 max-w-3xl mx-auto text-center">
          <div>
            <div className="font-organic-display text-[clamp(3rem,7vw,6rem)] leading-none text-organic-cream">
              166
            </div>
            <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-organic-cream/65 mt-3">
              hand-crafted stations
            </div>
          </div>
          <div>
            <div className="font-organic-display text-[clamp(3rem,7vw,6rem)] leading-none text-organic-amber">
              2026
            </div>
            <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-organic-cream/65 mt-3">
              verified, current cycle
            </div>
          </div>
        </div>
      </div>
    </NarrativeScene>
  )
}

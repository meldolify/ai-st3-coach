import { NarrativeScene } from '../NarrativeScene'

/**
 * §C — What Makes It Different. Why isn't this just another AI tool?
 *
 * Aesthetic pass (plan §12):
 *   - Massive "166" watermark dominates the section — the conversion peak's
 *     emotional anchor.
 *   - A photographic subject (Unsplash) composites in front of part of "166"
 *     — z-layered, not adjacent.
 *   - Two-column comparison stays but with stronger weight contrast.
 *   - Pull-quote in big Instrument Serif italic between the columns and
 *     the numeric anchors.
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
      <span className="section-c__annotation">( the difference )</span>

      <div className="section-c__inner relative max-w-[1500px] mx-auto px-6 sm:px-10 py-16 md:py-24">

        {/* MASSIVE watermark — fills the section */}
        <span className="section-c__watermark" aria-hidden="true">166</span>

        {/* Photographic subject — hand-crafted artefact (notebook annotation).
            Sits in front of part of the 166 watermark, slightly rotated. */}
        <img
          src="/images/landing/c-handcraft.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="section-c__photo"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        {/* Headline — sits at top, regular bold above the watermark */}
        <h2 className="section-c__title">
          Not just <em>another</em><br />AI tool.
        </h2>

        {/* Two-column comparison */}
        <div className="section-c__spread relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-20 mt-10 md:mt-14">
          {/* Other AI tools — light weight, muted */}
          <div className="section-c__col section-c__col--other">
            <h3 className="section-c__col-label section-c__col-label--other">
              <em>Other AI tools</em>
            </h3>
            <ul className="space-y-4 mt-6">
              {OTHER_NEGATIVES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[1.05rem] leading-snug font-light text-organic-cream/45">
                  <span aria-hidden className="mt-[0.6em] inline-block h-[1.5px] w-4 flex-shrink-0 bg-organic-cream/30" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviva — heavy weight, amber accents */}
          <div className="section-c__col section-c__col--reviva">
            <h3 className="section-c__col-label section-c__col-label--reviva">
              <em>Reviva</em>
            </h3>
            <ul className="space-y-4 mt-6">
              {REVIVA_POSITIVES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[1.05rem] leading-snug font-medium text-organic-cream">
                  <span aria-hidden className="mt-[0.6em] inline-block h-[2px] w-5 flex-shrink-0 bg-organic-amber" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pull-quote — big italic serif */}
        <blockquote className="section-c__quote">
          “Built by trainees who took the same exam<br />
          <em>— last cycle.</em>”
        </blockquote>

        {/* Bottom row of numerals + annotations */}
        <div className="section-c__numbers relative z-10 mt-12 md:mt-18 grid grid-cols-2 gap-8 max-w-3xl mx-auto text-center">
          <div>
            <div className="section-c__num">166</div>
            <div className="section-c__num-caption">
              <em>( hand-crafted stations )</em>
            </div>
          </div>
          <div>
            <div className="section-c__num section-c__num--amber">2026</div>
            <div className="section-c__num-caption">
              <em>( verified · current cycle )</em>
            </div>
          </div>
        </div>
      </div>
    </NarrativeScene>
  )
}

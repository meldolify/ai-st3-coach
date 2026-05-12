/**
 * §A — Three things you couldn't do before today.
 *
 * Replaces the previous dark-canopy "Practice partners don't exist." treatment.
 * This is the cream "three things" 3-card layout from the v1 design kit
 * (`reviva-design-system/project/ui_kits/landing/v1.html` lines 359-380),
 * which the user preferred over the grim canopy version.
 *
 * Layout:
 *   - Headline: "THREE THINGS YOU COULDN'T DO before today." (no eyebrow)
 *   - 3 cream `.organic-card`s in a `repeat(3, 1fr)` grid, each with an
 *     italic-serif `( 0X )` numeral, h3 in Newsreader 700, body prose.
 *
 * Design copy is a near-verbatim port of v1.html's "what you can do" section,
 * with card 3's "166 real stations" softened to drop the count (per the
 * locked rule that we don't bake station-count numbers into marketing copy).
 */
const CARDS = [
  {
    id: 'speak',
    numeral: '01',
    title: 'Speak it out loud',
    body: 'The voice orb listens, the AI examiner pushes back. Your answer is judged on what you actually said, not what you wish you’d said.',
  },
  {
    id: 'marked',
    numeral: '02',
    title: 'Marked the way they mark',
    body: 'Section-by-section feedback aligned to the published marking criteria. Not vibes. Not platitudes. The thing the panel is looking for.',
  },
  {
    id: 'real',
    numeral: '03',
    title: 'Hand-crafted by trainees',
    body: 'Every station is hand-written by trainees who sat the interview. Reviewed by consultants. Refreshed every cycle. You practise the exam you’re about to take.',
  },
]

export default function SectionA_Frustration() {
  return (
    <section
      id="section-a"
      className="section-a relative bg-organic-cream text-organic-bark"
      data-testid="section-a"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-32">
        <h2 className="font-organic-display uppercase font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.025em] mb-12 md:mb-14 max-w-[24ch]">
          Three things you couldn&rsquo;t<br />
          do <em className="font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]">before today.</em>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {CARDS.map((card) => (
            <article
              key={card.id}
              className="organic-card-cream relative flex flex-col rounded-2xl bg-organic-sand/60 border border-organic-stone p-7 md:p-8"
            >
              <span className="font-display italic text-organic-amber text-[1rem] tracking-wide block mb-4">
                ( {card.numeral} )
              </span>
              <h3 className="font-organic-display uppercase font-bold text-[clamp(1.25rem,1.6vw,1.5rem)] leading-[1.15] mb-4">
                {card.title}
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-organic-bark/75">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

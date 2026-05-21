import { GlowCard } from '../../../components/ui/spotlight-card'

const CARDS = [
  {
    id: 'time-limited',
    numeral: '01',
    title: 'And when you find one, their time is limited.',
    body: "Real practice for the national interviews isn't easy to come by. The seniors who'd help you are busy. Mock circuits are weeks apart. You end up rehearsing in your head, which is never the same thing.",
  },
  {
    id: 'always-on',
    numeral: '02',
    title: "So we built one that's always on.",
    body: "It's not an AI hallucinating cases. Every scenario is hand-crafted from actual interview material. The AI is there to give you the experience of the interview. Whenever you want.",
  },
  {
    id: 'by-trainees',
    numeral: '03',
    title: 'Designed by top-ranking trainees who have been through it all before.',
    body: "Top-ranking trainees wrote and tested every station. It's what you actually need for the interview. A great way to start your prep before later on refining with colleagues.",
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
        {/* Two-part headline: big display hook, then a calmer setup paragraph. */}
        <h2 className="font-organic-display uppercase font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.025em] mb-6 max-w-[22ch]">
          We&rsquo;ve all been there.
        </h2>
        <p className="text-[clamp(1.05rem,1.4vw,1.35rem)] leading-relaxed text-organic-bark/80 max-w-[58ch] mb-14 md:mb-16">
          We keep getting told that we need to do a lot of practice for the training interviews.
          But finding practice partners is{' '}
          <em className="font-display italic font-normal text-organic-amber">not easy</em>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {CARDS.map((card) => (
            <GlowCard
              key={card.id}
              noLayout
              glowColor="amber"
              className="organic-card-cream relative flex flex-col rounded-2xl bg-organic-sand/60 border border-organic-stone p-7 md:p-8"
            >
              <span className="font-display italic text-organic-amber text-[2rem] tracking-wide block mb-4 leading-none">
                ( {card.numeral} )
              </span>
              <h3 className="font-organic-display uppercase font-bold text-[clamp(1.25rem,1.6vw,1.5rem)] leading-[1.15] mb-4">
                {card.title}
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-organic-bark/75">
                {card.body}
              </p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}

import { motion, useReducedMotion } from 'framer-motion'
import { NarrativeScene } from '../NarrativeScene'
import { cn } from '../../../lib/utils'

const MotionDiv = motion.div

/**
 * §A — The Frustration. Why do you need this?
 *
 * Visual treatment (per plan §7):
 *   - Dark NarrativeScene (organic-canopy)
 *   - Bottom-aligned giant headline ("PRACTICE PARTNERS / DON'T EXIST")
 *   - 3 pop-in accent cards scattered around the headline (Ref #2 mechanic:
 *     scale3d 0,0,1 → 1 on viewport entry)
 *
 * Pop-ins fire once per scroll-into-view. Reduced motion shows accents
 * statically with no scale animation. Mobile stacks accents above the
 * headline rather than absolute-positioning around it.
 */
const ACCENTS = [
  {
    id: 'consultants',
    overline: 'Reality 01',
    title: 'Consultants are too busy.',
    body: 'They have lists, on-calls, families. Begging an hour from them works once. Maybe twice.',
    desktopClass: 'md:absolute md:top-[6%] md:left-[6%] md:max-w-[280px]',
  },
  {
    id: 'friends',
    overline: 'Reality 02',
    title: 'Friends get tired.',
    body: 'They run out of questions. They start nodding through every answer. They’re not the examiner.',
    desktopClass: 'md:absolute md:top-[24%] md:right-[5%] md:max-w-[300px]',
  },
  {
    id: 'books',
    overline: 'Reality 03',
    title: 'Books can’t push back.',
    body: 'Reading the answer is not defending it under pressure. The interview is a conversation, not a recall test.',
    desktopClass: 'md:absolute md:top-[48%] md:left-[20%] md:max-w-[320px]',
  },
]

export default function SectionA_Frustration() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <NarrativeScene
      id="section-a"
      className="section-a relative bg-organic-canopy text-organic-cream"
    >
      <div className="section-a__inner relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-32 md:min-h-[140vh] flex flex-col gap-16 md:block">
        {/* Pop-in accents — absolute on md+, stacked on mobile */}
        {ACCENTS.map((accent, i) => (
          <MotionDiv
            key={accent.id}
            className={cn('section-a__accent', accent.desktopClass)}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-organic-amber">
              {accent.overline}
            </span>
            <h3 className="font-organic-display text-[1.5rem] md:text-[1.65rem] leading-[1.1] mt-2 mb-3">
              {accent.title}
            </h3>
            <p className="text-[0.95rem] leading-relaxed text-organic-cream/85">
              {accent.body}
            </p>
          </MotionDiv>
        ))}

        {/* Giant bottom-left headline */}
        <h2
          className="section-a__headline font-organic-display uppercase leading-[0.92] text-[clamp(3rem,12vw,11rem)]
                     md:absolute md:bottom-12 md:left-6 md:right-6 lg:bottom-16 lg:left-10"
        >
          Practice partners
          <br />
          don&rsquo;t exist.
        </h2>
      </div>
    </NarrativeScene>
  )
}

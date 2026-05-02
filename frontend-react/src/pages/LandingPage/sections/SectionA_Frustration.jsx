import { motion, useReducedMotion } from 'framer-motion'
import { NarrativeScene } from '../NarrativeScene'
import { cn } from '../../../lib/utils'

const MotionDiv = motion.div

/**
 * §A — The Frustration. Why do you need this?
 *
 * Aesthetic pass (plan §12):
 *   - Headline scales to fill the section: "PRACTICE PARTNERS / DON'T EXIST."
 *     clamp(5rem, 16vw, 14rem). The whole section is the type.
 *   - A photographic subject (Unsplash) sits composited into the line break,
 *     overlapping the type — z-layered, not adjacent.
 *   - Three accent cards stay, each backed by a giant numeral watermark
 *     (01 / 02 / 03) at low opacity.
 *   - Italic-serif annotation top-left: ( the daily reality ).
 */
const ACCENTS = [
  {
    id: 'consultants',
    numeral: '01',
    overline: 'Reality 01',
    title: 'Consultants are too busy.',
    body: 'They have lists, on-calls, families. Begging an hour from them works once. Maybe twice.',
    desktopClass: 'md:absolute md:top-[8%] md:left-[6%] md:max-w-[300px]',
  },
  {
    id: 'friends',
    numeral: '02',
    overline: 'Reality 02',
    title: 'Friends get tired.',
    body: 'They run out of questions. They start nodding through every answer. They’re not the examiner.',
    desktopClass: 'md:absolute md:top-[28%] md:right-[6%] md:max-w-[320px]',
  },
  {
    id: 'books',
    numeral: '03',
    overline: 'Reality 03',
    title: 'Books can’t push back.',
    body: 'Reading the answer is not defending it under pressure. The interview is a conversation, not a recall test.',
    desktopClass: 'md:absolute md:top-[52%] md:left-[18%] md:max-w-[340px]',
  },
]

export default function SectionA_Frustration() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <NarrativeScene
      id="section-a"
      className="section-a relative bg-organic-canopy text-organic-cream"
    >
      {/* Italic-serif eyebrow — top-left annotation */}
      <span className="section-a__annotation">( the daily reality )</span>

      <div className="section-a__inner relative w-full max-w-[1500px] mx-auto px-6 sm:px-10 py-24 md:py-32 md:min-h-[150vh] flex flex-col gap-16 md:block">

        {/* Photographic subject — Unsplash (medical study / isolation vibe).
            Sits behind the headline, peeking through the line break.
            Search: "studying alone night books" on Unsplash to swap. */}
        <img
          src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="section-a__photo"
        />

        {/* Pop-in accents — absolute on md+, stacked on mobile.
            Each card has a giant numeral watermark behind it. */}
        {ACCENTS.map((accent, i) => (
          <MotionDiv
            key={accent.id}
            className={cn('section-a__accent relative z-10', accent.desktopClass)}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
          >
            {/* Giant numeral watermark — sits behind the card text */}
            <span className="section-a__accent-numeral" aria-hidden="true">
              {accent.numeral}
            </span>

            <span className="section-a__accent-overline">{accent.overline}</span>
            <h3 className="font-organic-display text-[1.5rem] md:text-[1.75rem] leading-[1.05] mt-2 mb-3 font-bold">
              {accent.title}
            </h3>
            <p className="text-[0.95rem] leading-relaxed text-organic-cream/85">
              {accent.body}
            </p>
          </MotionDiv>
        ))}

        {/* Screaming-scale headline — fills the bottom of the section */}
        <h2 className="section-a__headline">
          <span className="section-a__headline-line section-a__headline-line--top">
            Practice partners
          </span>
          <span className="section-a__headline-line section-a__headline-line--bottom">
            don&rsquo;t exist.
          </span>
        </h2>
      </div>
    </NarrativeScene>
  )
}

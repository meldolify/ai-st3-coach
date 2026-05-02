import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'

const MotionDiv = motion.div

/**
 * NarrativeScene — wrapper for the redesign's narrative sections (§A and §C).
 *
 * Mechanic (Ref #3 — davincho-hero-1):
 *   - Section is `position: relative; overflow: hidden`.
 *   - `bg` slot renders inside an absolutely-positioned, slightly-oversized
 *     layer that translates with the section's own scroll progress.
 *   - Foreground children sit at z-10; opt-in `mix-blend-mode: difference`
 *     auto-inverts text against whatever's behind.
 *
 * Each instance binds to its own scroll lifecycle via `useScroll({ target })`
 * — parallax resets per scene, no page-global scroll wiring needed.
 *
 * Reduced-motion: disables the parallax translate (background sits still).
 */
export function NarrativeScene({
  bg,
  blendDifference = false,
  className,
  children,
  id,
  ...rest
}) {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['0%', '15%']
  )

  return (
    <section
      ref={ref}
      id={id}
      className={cn('narrative-scene relative overflow-hidden', className)}
      {...rest}
    >
      {bg ? (
        <MotionDiv
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-[10%] h-[120%]"
          style={{ y }}
        >
          {bg}
        </MotionDiv>
      ) : null}

      <div
        className={cn(
          'narrative-scene__content relative z-10',
          blendDifference && 'mix-blend-difference text-white'
        )}
      >
        {children}
      </div>
    </section>
  )
}

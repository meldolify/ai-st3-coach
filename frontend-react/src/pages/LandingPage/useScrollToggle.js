import { useEffect, useState } from 'react'
import { useScroll } from 'framer-motion'

/**
 * useScrollToggle — drives a stepwise "active item" index from a target
 * container's scroll progress.
 *
 * Mechanic (Ref #2 JS addendum — xshack `tr-scroll-toggle`):
 *   Given a tall container with `itemCount` virtual steps, the hook returns
 *   the current step index based on how far the user has scrolled through it.
 *
 * Used by §B AI Interviewer to advance the sticky DeviceFrame's inner screen
 * (idle → listening → pushback → feedback) as descriptions on the side scroll
 * past.
 *
 * Reduced-motion is *not* gated here — the step advancement is structural,
 * not decorative, and disabling it would hide product information. Components
 * downstream may choose to render all steps simultaneously instead.
 *
 * @param {object} args
 * @param {React.RefObject<HTMLElement>} args.targetRef Container whose scroll
 *   progress drives the step. The hook consumes `useScroll({ target })`, so
 *   the offset is the container's lifecycle through the viewport.
 * @param {number} args.itemCount Number of discrete steps (>= 1).
 * @returns {{ currentStep: number }} Current 0-indexed step (0..itemCount-1).
 */
export function useScrollToggle({ targetRef, itemCount }) {
  const [currentStep, setCurrentStep] = useState(0)

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    if (itemCount < 1) return undefined

    const update = (progress) => {
      const clamped = Math.max(0, Math.min(0.9999, progress))
      const step = Math.floor(clamped * itemCount)
      setCurrentStep((prev) => (prev === step ? prev : step))
    }

    update(scrollYProgress.get())
    return scrollYProgress.on('change', update)
  }, [itemCount, scrollYProgress])

  return { currentStep }
}

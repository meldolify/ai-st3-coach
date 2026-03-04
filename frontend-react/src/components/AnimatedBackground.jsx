import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * AnimatedBackground — Floating gradient blobs that drift behind the simulation room.
 *
 * Renders large, heavily blurred colored circles that animate infinitely with
 * Framer Motion. Desktop shows 4 blobs (sage, copper, teal, indigo); mobile
 * shows 2 (sage, copper) at reduced opacity and size for performance.
 *
 * Includes subtle mouse-parallax: the entire blob container shifts +/-5px
 * based on cursor position for a layered depth feel (desktop only).
 *
 * Container uses a radial mask-image to feather edges and is fully non-interactive
 * (pointer-events: none, aria-hidden).
 *
 * @param {{ mobile?: boolean }} props
 * @param {boolean} [props.mobile=false] — When true, renders 2 smaller blobs instead of 4.
 */

const DESKTOP_BLOBS = [
  {
    size: 500, blur: 120,
    color: 'rgba(74, 93, 76, 0.12)',
    x: '10%', y: '20%',
    driftX: [-30, 30], driftY: [-20, 20],
    rotate: 360, scale: [1, 1, 1],
    opacity: [0.6, 0.9, 0.6],
    duration: 25,
  },
  {
    size: 400, blur: 100,
    color: 'rgba(184, 155, 120, 0.10)',
    x: '60%', y: '50%',
    driftX: [-20, 20], driftY: [0, 0],
    rotate: 0, scale: [1, 1.1, 1],
    opacity: [0.5, 0.8, 0.5],
    duration: 10,
  },
  {
    size: 550, blur: 140,
    color: 'rgba(110, 190, 180, 0.08)',
    x: '30%', y: '70%',
    driftX: [20, -20], driftY: [0, 0],
    rotate: -360, scale: [1, 1, 1],
    opacity: [0.5, 0.8, 0.5],
    duration: 30,
  },
  {
    size: 350, blur: 100,
    color: 'rgba(130, 130, 200, 0.08)',
    x: '75%', y: '15%',
    driftX: [0, 0], driftY: [-25, 25],
    rotate: 0, scale: [1, 1.05, 1],
    opacity: [0.4, 0.7, 0.4],
    duration: 20,
  },
]

const MOBILE_BLOBS = [
  {
    size: 350, blur: 100,
    color: 'rgba(74, 93, 76, 0.08)',
    x: '20%', y: '30%',
    driftX: [-15, 15], driftY: [0, 0],
    rotate: 360, scale: [1, 1, 1],
    opacity: [0.5, 0.7, 0.5],
    duration: 35,
  },
  {
    size: 300, blur: 80,
    color: 'rgba(184, 155, 120, 0.06)',
    x: '60%', y: '60%',
    driftX: [0, 0], driftY: [0, 0],
    rotate: 0, scale: [1, 1.05, 1],
    opacity: [0.4, 0.6, 0.4],
    duration: 15,
  },
]

export default function AnimatedBackground({ mobile = false }) {
  const blobs = mobile ? MOBILE_BLOBS : DESKTOP_BLOBS

  // Mouse parallax — subtle shift of the entire blob container (desktop only)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 })

  useEffect(() => {
    if (mobile) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const handleMove = (e) => {
      // Map cursor position to -5..+5 range
      const x = ((e.clientX / window.innerWidth) - 0.5) * 10
      const y = ((e.clientY / window.innerHeight) - 0.5) * 10
      mouseX.set(x)
      mouseY.set(y)
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mobile, mouseX, mouseY])

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)',
        x: mobile ? 0 : springX,
        y: mobile ? 0 : springY,
      }}
      aria-hidden="true"
      data-animated-bg
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
            filter: `blur(${blob.blur}px)`,
            left: blob.x,
            top: blob.y,
          }}
          animate={{
            x: blob.driftX,
            y: blob.driftY,
            rotate: blob.rotate,
            scale: blob.scale,
            opacity: blob.opacity,
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { VoiceOrbSimple } from '../../components/ui/voice-orb-simple'

const MotionDiv = motion.div

const ENTER = { opacity: 0, y: 8 }
const ACTIVE = { opacity: 1, y: 0 }
const EXIT = { opacity: 0, y: -6 }
const TRANSITION = { duration: 0.22, ease: [0.22, 1, 0.36, 1] }

/**
 * DeviceFrame — sticky browser-style frame for §B AI Interviewer.
 *
 * Renders a persona showcase that swaps based on the `persona` prop.
 * Structure inside the frame (top to bottom):
 *   1. macOS-style chrome bar (traffic lights + persona name · scenario)
 *   2. Wide persona photo banner (16:10), full-bleed across the screen
 *   3. Voice orb floating beneath the photo
 *   4. Persona name (display font)
 *   5. Role label (small caps, amber)
 *   6. Persona description (small body)
 *
 * Swapping personas cross-fades the inner contents (~220ms).
 */
export function DeviceFrame({ persona }) {
  if (!persona) return null
  const firstName = persona.name.split(' ').slice(1).join(' ') || persona.name

  return (
    <div className="device-frame relative w-full max-w-[560px] mx-auto rounded-2xl bg-organic-canopy text-organic-cream shadow-[0_24px_60px_rgba(26,58,42,0.25)] overflow-hidden">
      {/* Window chrome */}
      <div className="device-frame__chrome flex items-center gap-2 px-4 py-3 bg-organic-bark/80 border-b border-organic-stone/10">
        <div className="flex items-center gap-1.5">
          <span className="block h-[10px] w-[10px] rounded-full bg-[#ff5f57]" />
          <span className="block h-[10px] w-[10px] rounded-full bg-[#febc2e]" />
          <span className="block h-[10px] w-[10px] rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-organic-cream/70">
            {persona.name} &middot; Necrotising Fasciitis
          </span>
        </div>
      </div>

      {/* Persona stack — cross-fades on switch */}
      <AnimatePresence mode="wait" initial={false}>
        <MotionDiv
          key={persona.name}
          initial={ENTER}
          animate={ACTIVE}
          exit={EXIT}
          transition={TRANSITION}
        >
          {/* Wide photo banner */}
          <div className="aspect-[16/10] w-full overflow-hidden bg-organic-bark/40">
            <img
              src={persona.imageWide}
              alt={persona.name}
              loading="eager"
              decoding="async"
              fetchpriority="high"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>

          {/* Orb — state varies per persona (easy=idle, medium=listening,
              strict=thinking). Key forces a clean remount so the CSS
              spin animations restart at zero on persona switch. */}
          <div className="flex justify-center pt-6 pb-2">
            <VoiceOrbSimple
              key={persona.name}
              state={persona.orbState || 'listening'}
              size={88}
              statusText={firstName}
            />
          </div>

          {/* Name + role + description */}
          <div className="px-6 pb-7 pt-3 text-center">
            <p className="font-organic-display text-[1.6rem] leading-tight text-organic-cream">
              {persona.name}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-organic-amber/85 mt-1.5 mb-3">
              {persona.roleLabel}
            </p>
            <p className="text-[12.5px] text-organic-cream/75 leading-relaxed max-w-[44ch] mx-auto">
              {persona.description}
            </p>
          </div>
        </MotionDiv>
      </AnimatePresence>
    </div>
  )
}

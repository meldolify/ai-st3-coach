import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * VoiceOrbSimple — minimal concentric-ring spinner. Adapted from 21st.dev
 * (CoreSpinLoader). The original was a one-state loader; this version is
 * state-aware:
 *
 *   idle      → copper, slow rotation
 *   listening → teal,   medium rotation
 *   thinking  → indigo, fast rotation
 *   speaking  → amber,  fastest rotation
 *
 * No audio reactivity here — that lives in the separate AudioVisualiser
 * component, which taps a Web Audio AnalyserNode on AudioPlayer's <Audio>.
 */

const STATE_STYLES = {
  idle: {
    glow: 'bg-[#B87333]/15',
    dashed: 'border-[#B87333]/45',
    arcMain: 'border-t-[#B87333] shadow-[0_0_8px_rgba(184,115,51,0.55)]',
    arcReverse: 'border-b-[#8B5A2B] shadow-[0_0_8px_rgba(139,90,43,0.5)]',
    inner: 'border-l-[#CD853F]/70',
    dot: 'bg-[#B87333] shadow-[0_0_6px_rgba(184,115,51,0.85)]',
    core: 'bg-[#8B5A2B] shadow-[0_0_8px_rgba(139,90,43,0.7)]',
    text: 'text-[#8B5A2B]',
    speeds: { dashed: '10s', arcMain: '5s', arcReverse: '4s', inner: '2s', dot: '8s' },
  },
  listening: {
    glow: 'bg-emerald-500/15',
    dashed: 'border-emerald-500/45',
    arcMain: 'border-t-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]',
    arcReverse: 'border-b-emerald-700 shadow-[0_0_8px_rgba(4,120,87,0.5)]',
    inner: 'border-l-emerald-700/70',
    dot: 'bg-emerald-600 shadow-[0_0_6px_rgba(16,185,129,0.9)]',
    core: 'bg-emerald-700 shadow-[0_0_8px_rgba(4,120,87,0.7)]',
    text: 'text-emerald-800',
    speeds: { dashed: '8s', arcMain: '3s', arcReverse: '2.5s', inner: '1.5s', dot: '5s' },
  },
  thinking: {
    glow: 'bg-indigo-500/15',
    dashed: 'border-indigo-500/45',
    arcMain: 'border-t-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.55)]',
    arcReverse: 'border-b-indigo-700 shadow-[0_0_8px_rgba(67,56,202,0.5)]',
    inner: 'border-l-indigo-700/70',
    dot: 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.9)]',
    core: 'bg-indigo-700 shadow-[0_0_8px_rgba(67,56,202,0.7)]',
    text: 'text-indigo-800',
    speeds: { dashed: '5s', arcMain: '1.5s', arcReverse: '1s', inner: '0.5s', dot: '3s' },
  },
  speaking: {
    glow: 'bg-amber-500/15',
    dashed: 'border-amber-500/45',
    arcMain: 'border-t-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.55)]',
    arcReverse: 'border-b-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.5)]',
    inner: 'border-l-amber-700/70',
    dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]',
    core: 'bg-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.7)]',
    text: 'text-amber-800',
    speeds: { dashed: '4s', arcMain: '1.2s', arcReverse: '0.8s', inner: '0.4s', dot: '2.5s' },
  },
}

export function VoiceOrbSimple({ state = 'idle', size = 100, statusText = '', className }) {
  const styles = STATE_STYLES[state] || STATE_STYLES.idle

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)} data-testid="voice-orb">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Base glow */}
        <div className={cn('absolute inset-0 rounded-full blur-xl animate-pulse', styles.glow)} />

        {/* Outer dashed ring */}
        <div
          className={cn('absolute inset-0 rounded-full border border-dashed', styles.dashed)}
          style={{ animation: `spin ${styles.speeds.dashed} linear infinite` }}
        />

        {/* Main arc */}
        <div
          className={cn('absolute inset-1 rounded-full border-2 border-transparent', styles.arcMain)}
          style={{ animation: `spin ${styles.speeds.arcMain} linear infinite` }}
        />

        {/* Reverse arc */}
        <div
          className={cn('absolute inset-3 rounded-full border-2 border-transparent', styles.arcReverse)}
          style={{ animation: `spin ${styles.speeds.arcReverse} linear infinite reverse` }}
        />

        {/* Inner fast ring */}
        <div
          className={cn('absolute inset-5 rounded-full border border-transparent', styles.inner)}
          style={{ animation: `spin ${styles.speeds.inner} ease-in-out infinite` }}
        />

        {/* Orbital dot */}
        <div className="absolute inset-0" style={{ animation: `spin ${styles.speeds.dot} linear infinite` }}>
          <div className={cn('absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full', styles.dot)} />
        </div>

        {/* Centre core */}
        <div className={cn('absolute w-2 h-2 rounded-full animate-pulse', styles.core)} />
      </div>

      {/* Status text — driven by statusText prop, animated on change */}
      <div className="flex items-center justify-center h-5">
        <AnimatePresence mode="wait" initial={false}>
          {statusText ? (
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn(
                'text-[10px] font-medium tracking-[0.3em] uppercase whitespace-nowrap',
                styles.text
              )}
            >
              {statusText}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

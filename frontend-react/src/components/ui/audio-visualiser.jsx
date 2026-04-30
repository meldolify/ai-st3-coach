import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * AudioVisualiser — 5-bar frequency-reactive bar wave.
 * Adapted from a Uiverse pure-CSS loader. The original was decorative; this
 * version reads 5 frequency bands from the AudioPlayer's AnalyserNode and
 * drives each bar's `scaleY` via inline styles in a RAF loop.
 *
 * Idle (when AI is not speaking): falls back to the CSS keyframe wave from
 * `.audio-visualiser--idle` in index.css.
 *
 * Active: RAF samples `audioPlayer.getFrequencyBands(5)` each frame and writes
 * `transform: scaleY(0.05 + amp * 0.95)` per bar. AudioPlayer lazy-creates the
 * AnalyserNode on first call to `ensureAnalyser()`.
 */
export function AudioVisualiser({ audioPlayer, isAISpeaking = false, className }) {
  const barRefs = useRef([])

  useEffect(() => {
    if (!isAISpeaking || !audioPlayer) return

    let raf = 0
    let cancelled = false

    try {
      audioPlayer.ensureAnalyser?.()
    } catch (err) {
      // Fall through — without an analyser, bars stay in idle CSS wave
      return
    }

    const tick = () => {
      if (cancelled) return
      const bands = audioPlayer.getFrequencyBands?.(5) || [0, 0, 0, 0, 0]
      for (let i = 0; i < 5; i++) {
        const bar = barRefs.current[i]
        if (!bar) continue
        const amp = Math.max(0, Math.min(1, bands[i] || 0))
        bar.style.transform = `scaleY(${(0.05 + amp * 0.95).toFixed(3)})`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      // Reset inline transforms so the CSS idle wave can take over cleanly
      for (let i = 0; i < 5; i++) {
        const bar = barRefs.current[i]
        if (bar) bar.style.transform = ''
      }
    }
  }, [isAISpeaking, audioPlayer])

  return (
    <div
      className={cn(
        'audio-visualiser',
        isAISpeaking ? 'audio-visualiser--active' : 'audio-visualiser--idle',
        className
      )}
      data-testid="audio-visualiser"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el
          }}
          className="audio-visualiser__bar"
        />
      ))}
    </div>
  )
}

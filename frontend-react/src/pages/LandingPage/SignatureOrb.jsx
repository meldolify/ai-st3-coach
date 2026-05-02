import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CpuArchitecture } from '../../components/ui/cpu-architecture'
import { VoiceOrbSimple } from '../../components/ui/voice-orb-simple'
import { AudioVisualiser } from '../../components/ui/audio-visualiser'

const MotionDiv = motion.div

const GREETING_LINE = 'Hello. Welcome to your ST3 interview. Are you ready to begin?'
const GREETING_WORDS = GREETING_LINE.split(' ')
const AUDIO_SRC = '/audio/landing-examiner-greeting.mp3'

/**
 * SignatureOrb — §D's centrepiece.
 *
 * Composes the simulation-room voice panel: CpuArchitecture circuit-line
 * backdrop (with hideChip, pure decoration) + VoiceOrbSimple + AudioVisualiser
 * bars. Click-to-play reveals the recorded examiner greeting; while playing,
 * the orb shifts state to `speaking` and the visualiser bars sync to audio
 * via a minimal Web-Audio analyser wrapper that mirrors AudioPlayer's API.
 *
 * Fallback: if the recorded MP3 hasn't been generated yet (or fails to
 * load), a visual-only animation runs — words type in over ~3s, visualiser
 * fakes amplitude. The section still works, just without sound. To produce
 * the real recording, run `node scripts/generate-landing-audio.cjs` from
 * the frontend-react directory with a Gemini API key available.
 *
 * Reduced-motion: word-reveal happens instantly (all words at once); orb
 * state still toggles; visualiser falls back to its CSS idle wave.
 */
export function SignatureOrb() {
  const audioRef = useRef(null)
  const audioPlayerRef = useRef(null)
  const fakeRafRef = useRef(0)
  const fakeBandsRef = useRef([0, 0, 0, 0, 0])
  const wordTimersRef = useRef([])
  const prefersReducedMotion = useReducedMotion()

  const [audioAvailable, setAudioAvailable] = useState(null) // null=probing, true|false
  const [isPlaying, setIsPlaying] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)

  // Probe audio availability once.
  useEffect(() => {
    let cancelled = false
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return
        setAudioAvailable(res.ok)
      })
      .catch(() => {
        if (!cancelled) setAudioAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Cleanup all timers + audio on unmount.
  useEffect(() => {
    const audioEl = audioRef.current
    return () => {
      wordTimersRef.current.forEach((t) => clearTimeout(t))
      wordTimersRef.current = []
      if (fakeRafRef.current) cancelAnimationFrame(fakeRafRef.current)
      if (audioEl) audioEl.pause()
    }
  }, [])

  // Lazy-build a minimal audioPlayer-shaped object for AudioVisualiser.
  function ensurePlayer() {
    if (audioPlayerRef.current) return audioPlayerRef.current
    const el = audioRef.current
    if (!el) return null

    let analyser = null
    let dataArray = null

    const player = {
      ensureAnalyser() {
        if (analyser) return
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext
          if (!Ctx) return
          const ctx = new Ctx()
          const source = ctx.createMediaElementSource(el)
          analyser = ctx.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)
          analyser.connect(ctx.destination)
          dataArray = new Uint8Array(analyser.frequencyBinCount)
        } catch {
          // Cross-origin or context creation issue — fall back to fake bands.
          analyser = null
        }
      },
      getFrequencyBands(n = 5) {
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray)
          const bandSize = Math.floor(dataArray.length / n)
          const bands = []
          for (let i = 0; i < n; i++) {
            let sum = 0
            for (let j = 0; j < bandSize; j++) sum += dataArray[i * bandSize + j]
            bands.push(sum / bandSize / 255)
          }
          return bands
        }
        return fakeBandsRef.current
      },
    }
    audioPlayerRef.current = player
    return player
  }

  // Drive a fake amplitude pattern when there's no audio (visual-only mode).
  function startFakeAmplitude() {
    let t = 0
    const tick = () => {
      t += 0.06
      fakeBandsRef.current = [
        0.45 + 0.35 * Math.sin(t * 1.1),
        0.55 + 0.4 * Math.sin(t * 1.4 + 0.7),
        0.5 + 0.45 * Math.sin(t * 1.0 + 1.2),
        0.4 + 0.35 * Math.sin(t * 1.6 + 0.4),
        0.5 + 0.4 * Math.sin(t * 1.2 + 1.8),
      ].map((v) => Math.max(0, Math.min(1, v)))
      fakeRafRef.current = requestAnimationFrame(tick)
    }
    fakeRafRef.current = requestAnimationFrame(tick)
  }

  function stopFakeAmplitude() {
    if (fakeRafRef.current) cancelAnimationFrame(fakeRafRef.current)
    fakeRafRef.current = 0
    fakeBandsRef.current = [0, 0, 0, 0, 0]
  }

  function revealWordsOverDuration(durationMs) {
    wordTimersRef.current.forEach((t) => clearTimeout(t))
    wordTimersRef.current = []
    setRevealedCount(0)
    if (prefersReducedMotion) {
      setRevealedCount(GREETING_WORDS.length)
      return
    }
    const step = durationMs / GREETING_WORDS.length
    for (let i = 0; i < GREETING_WORDS.length; i++) {
      const t = setTimeout(() => setRevealedCount(i + 1), step * (i + 1))
      wordTimersRef.current.push(t)
    }
  }

  function reset() {
    setIsPlaying(false)
    setRevealedCount(0)
    stopFakeAmplitude()
    wordTimersRef.current.forEach((t) => clearTimeout(t))
    wordTimersRef.current = []
  }

  async function handlePlay() {
    if (isPlaying) return
    setIsPlaying(true)

    if (audioAvailable && audioRef.current) {
      const player = ensurePlayer()
      try {
        player?.ensureAnalyser()
      } catch {
        // ignore — visualiser will fall back to its idle wave
      }
      const el = audioRef.current
      el.currentTime = 0
      try {
        await el.play()
        // Approximate word-reveal duration to match audio (~3s default).
        const duration = isFinite(el.duration) && el.duration > 0 ? el.duration * 1000 : 3000
        revealWordsOverDuration(duration)
      } catch {
        // Autoplay blocked despite click — fall back to visual-only.
        startFakeAmplitude()
        revealWordsOverDuration(3000)
        setTimeout(() => reset(), 3200)
      }
      return
    }

    // No audio file — pure visual demonstration.
    startFakeAmplitude()
    revealWordsOverDuration(3000)
    setTimeout(() => reset(), 3200)
  }

  function handleAudioEnded() {
    reset()
  }

  const orbState = isPlaying ? 'speaking' : 'idle'
  const orbStatus = 'Examiner'

  return (
    <div className="signature-orb relative w-full max-w-3xl mx-auto aspect-[16/10] flex items-center justify-center">
      {/* Circuit lines backdrop — pure decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <CpuArchitecture hideChip animateText={false} />
      </div>

      {/* Centre stack: orb + visualiser + words + button */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <VoiceOrbSimple state={orbState} size={140} statusText={orbStatus} />

        <AudioVisualiser
          audioPlayer={audioPlayerRef.current}
          isAISpeaking={isPlaying}
          className="signature-orb__visualiser"
        />

        {/* Word-by-word transcript */}
        <div className="signature-orb__words min-h-[3.5em] max-w-md text-center font-organic-display text-[clamp(1.05rem,2.4vw,1.45rem)] leading-snug text-organic-bark">
          {GREETING_WORDS.map((word, i) => (
            <MotionDiv
              key={i}
              className="inline-block mr-[0.3em]"
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: i < revealedCount ? 1 : 0,
                y: i < revealedCount ? 0 : 6,
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {word}
            </MotionDiv>
          ))}
        </div>

        {/* Play button */}
        <button
          type="button"
          onClick={handlePlay}
          disabled={isPlaying}
          className="signature-orb__cta inline-flex items-center gap-2 px-6 py-3 rounded-full bg-organic-canopy text-organic-cream text-[14px] font-medium tracking-wide uppercase transition-transform hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-default"
        >
          {isPlaying ? 'Listening…' : 'Press to hear the examiner'}
          {!isPlaying && <span aria-hidden="true">&rarr;</span>}
        </button>

        {audioAvailable === false && (
          <p className="text-[11px] text-organic-bark/55 text-center max-w-xs leading-snug">
            (Visual demo — recorded audio not yet generated.)
          </p>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="metadata"
        onEnded={handleAudioEnded}
        onError={() => setAudioAvailable(false)}
      />
    </div>
  )
}

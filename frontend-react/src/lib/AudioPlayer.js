/**
 * AudioPlayer — Queued audio playback for streamed TTS chunks.
 * Supports orb visualizer integration and fallback Audio element.
 */
export class AudioPlayer {
  constructor() {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'
    this.isPlaying = false
    this.onStart = null
    this.onEnd = null
    this.playbackTimeout = null

    // Orb visualizer integration (legacy fallback path)
    this.orbVisualizer = null

    // Web Audio analyser (lazily created on first ensureAnalyser() call)
    this._audioContext = null
    this._mediaSource = null
    this._analyser = null
    this._freqData = null

    // Audio queue for streamed sentence chunks
    this._queue = []
    this._isPlayingChunk = false
    this._currentUrl = null
  }

  setOrbVisualizer(visualizer) {
    this.orbVisualizer = visualizer
  }

  /**
   * ensureAnalyser — lazily create the Web Audio graph on first call.
   * `createMediaElementSource()` may only be called once per audio element,
   * so this is idempotent.
   *
   * Returns the AnalyserNode, or null if creation failed (e.g. AudioContext
   * blocked before user gesture). Audio still plays normally either way.
   */
  ensureAnalyser() {
    if (this._analyser) return this._analyser
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      const ctx = new Ctx()
      const source = ctx.createMediaElementSource(this.audio)
      const analyser = ctx.createAnalyser()
      // 256 bins gives ~94 Hz resolution at 24 kHz sample rate, enough to
      // distribute speech-band frequencies (60–6000 Hz) across 5 bars.
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.55
      source.connect(analyser)
      analyser.connect(ctx.destination)
      this._audioContext = ctx
      this._mediaSource = source
      this._analyser = analyser
      this._freqData = new Uint8Array(analyser.frequencyBinCount)
      // Resume the context defensively (user gesture should already have unblocked it)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      return analyser
    } catch (err) {
      // Most common failure: audio element source already attached to another
      // graph, or AudioContext blocked. Silently return null — audio still plays.
      return null
    }
  }

  /**
   * getFrequencyBands — sample N exponentially-spaced bands across the
   * speech range (60–6000 Hz). Returns array of values in [0, 1].
   *
   * Uses peak (not mean) per band so transient sibilants register, and
   * sqrt-compresses the result so loud bands don't pin to 1.0 and quiet
   * bands aren't lost in the floor.
   */
  getFrequencyBands(numBands = 5) {
    const empty = new Array(numBands).fill(0)
    if (!this._analyser || !this._freqData || !this._audioContext) return empty
    this._analyser.getByteFrequencyData(this._freqData)
    const binCount = this._freqData.length
    const nyquist = this._audioContext.sampleRate / 2
    const hzPerBin = nyquist / binCount

    const minHz = 60
    const maxHz = 6000
    const ratio = Math.pow(maxHz / minHz, 1 / numBands)

    const bands = new Array(numBands)
    for (let i = 0; i < numBands; i++) {
      const lowHz = minHz * Math.pow(ratio, i)
      const highHz = minHz * Math.pow(ratio, i + 1)
      let startBin = Math.floor(lowHz / hzPerBin)
      let endBin = Math.min(binCount, Math.ceil(highHz / hzPerBin))
      if (endBin <= startBin) endBin = startBin + 1
      let peak = 0
      for (let j = startBin; j < endBin; j++) {
        if (this._freqData[j] > peak) peak = this._freqData[j]
      }
      // Subtract a small noise floor (~12/255), then sqrt-compress to spread
      // the dynamic range so quiet syllables still produce visible motion.
      const normalized = Math.max(0, (peak - 12) / 243)
      bands[i] = Math.sqrt(normalized)
    }
    return bands
  }

  queueBase64Audio(base64Audio) {
    this._queue.push(base64Audio)
    if (!this._isPlayingChunk) {
      this._playNextInQueue()
    }
  }

  _playNextInQueue() {
    if (this._queue.length === 0) {
      this._isPlayingChunk = false
      this.isPlaying = false
      if (this.orbVisualizer) {
        this.orbVisualizer.suppressIdleOnEnd = false
      }
      if (this.onEnd) this.onEnd()
      return
    }

    this._isPlayingChunk = true
    this.isPlaying = true
    const base64Audio = this._queue.shift()

    if (this.orbVisualizer) {
      this.orbVisualizer.suppressIdleOnEnd = true
    }

    this._playSingleChunk(base64Audio, () => {
      this._playNextInQueue()
    })
  }

  _playSingleChunk(base64Audio, callback) {
    if (this.orbVisualizer) {
      this.orbVisualizer.onEnd = () => callback()
      this.orbVisualizer.playWithVisualization(base64Audio)
      return
    }

    // Fallback: standard Audio element
    const binaryString = atob(base64Audio)
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)
    this._currentUrl = url

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    this.audio.src = url
    this.audio.play()

    const estimatedDurationMs = (bytes.length / 4000) * 1000
    this.playbackTimeout = setTimeout(() => {
      URL.revokeObjectURL(url)
      this._currentUrl = null
      callback()
    }, estimatedDurationMs + 10000)

    this.audio.onended = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      URL.revokeObjectURL(url)
      this._currentUrl = null
      callback()
    }

    this.audio.onerror = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      URL.revokeObjectURL(url)
      this._currentUrl = null
      callback()
    }
  }

  playBase64Audio(base64Audio) {
    if (this.orbVisualizer) {
      this.isPlaying = true
      if (this.onStart) this.onStart()
      this.orbVisualizer.suppressIdleOnEnd = false
      this.orbVisualizer.onEnd = () => {
        this.isPlaying = false
        if (this.onEnd) this.onEnd()
      }
      this.orbVisualizer.playWithVisualization(base64Audio)
      return
    }

    const binaryString = atob(base64Audio)
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)
    this._currentUrl = url

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    this.audio.src = url
    this.audio.play()
    this.isPlaying = true
    if (this.onStart) this.onStart()

    const estimatedDurationMs = (bytes.length / 4000) * 1000
    this.playbackTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.isPlaying = false
        URL.revokeObjectURL(url)
        this._currentUrl = null
        if (this.onEnd) this.onEnd()
      }
    }, estimatedDurationMs + 10000)

    this.audio.onended = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      this.isPlaying = false
      URL.revokeObjectURL(url)
      this._currentUrl = null
      if (this.onEnd) this.onEnd()
    }

    this.audio.onerror = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      this.isPlaying = false
      URL.revokeObjectURL(url)
      this._currentUrl = null
      if (this.onEnd) this.onEnd()
    }
  }

  interrupt() {
    this._queue = []
    this._isPlayingChunk = false

    if (this.orbVisualizer) {
      this.orbVisualizer.suppressIdleOnEnd = false
      this.orbVisualizer.interrupt()
    }

    if (this.isPlaying) {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      this.audio.pause()
      this.audio.currentTime = 0
      this.isPlaying = false
    }

    // Revoke any active blob URL (onended/onerror won't fire for paused audio)
    if (this._currentUrl) {
      URL.revokeObjectURL(this._currentUrl)
      this._currentUrl = null
    }
  }
}

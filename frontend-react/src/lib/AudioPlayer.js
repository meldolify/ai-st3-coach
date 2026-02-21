/**
 * AudioPlayer — Queued audio playback for streamed TTS chunks.
 * Supports orb visualizer integration and fallback Audio element.
 */
export class AudioPlayer {
  constructor() {
    this.audio = new Audio()
    this.isPlaying = false
    this.onStart = null
    this.onEnd = null
    this.playbackTimeout = null

    // Orb visualizer integration
    this.orbVisualizer = null

    // Audio queue for streamed sentence chunks
    this._queue = []
    this._isPlayingChunk = false
  }

  setOrbVisualizer(visualizer) {
    this.orbVisualizer = visualizer
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

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    this.audio.src = url
    this.audio.play()

    const estimatedDurationMs = (bytes.length / 4000) * 1000
    this.playbackTimeout = setTimeout(() => {
      URL.revokeObjectURL(url)
      callback()
    }, estimatedDurationMs + 10000)

    this.audio.onended = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      URL.revokeObjectURL(url)
      callback()
    }

    this.audio.onerror = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      URL.revokeObjectURL(url)
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
      if (this.onEnd) this.onEnd()
    }

    this.audio.onerror = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout)
        this.playbackTimeout = null
      }
      this.isPlaying = false
      URL.revokeObjectURL(url)
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
  }
}

/**
 * OrbVisualizer — Canvas 2D audio-reactive visualization with concentric radiating rings.
 * Ported from frontend/js/orb-visualizer.js for React integration.
 * Used via useRef — the canvas element is provided externally.
 */
export class OrbVisualizer {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.rings = []
    this.audioContext = null
    this.analyser = null
    this.isActive = false
    this.isShimmering = false
    this.shimmerAnimationId = null
    this.visualizationAnimationId = null
    this.currentSource = null
    this.currentState = 'idle' // idle | listening | speaking | thinking

    this.config = {
      ringCount: 6,
      baseRadius: 25,
      maxExpansion: 35,
      spacing: 10,
      canvasSize: 280,
    }

    this.onStart = null
    this.onEnd = null
    this.playbackTimeout = null
    this.suppressIdleOnEnd = false
  }

  /**
   * Initialize with a canvas element (called from React component via ref)
   */
  async init(canvasElement) {
    this.canvas = canvasElement
    if (!this.canvas) return

    this.ctx = this.canvas.getContext('2d')

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 64
      this.analyser.smoothingTimeConstant = 0.75
      this.analyser.minDecibels = -85
      this.analyser.maxDecibels = -10

      this.initRings()
      this.startIdleShimmer()
    } catch (error) {
      console.error('[OrbVisualizer] Failed to initialize:', error)
    }
  }

  setState(state) {
    this.currentState = state
  }

  initRings() {
    const { ringCount, baseRadius, spacing } = this.config
    this.rings = []
    for (let i = 0; i < ringCount; i++) {
      this.rings.push({
        baseRadius: baseRadius + i * spacing,
        currentExpansion: 0,
        targetExpansion: 0,
        baseOpacity: 0.7 - i * 0.08,
      })
    }
  }

  getStateColor() {
    switch (this.currentState) {
      case 'speaking':
        return { r: 245, g: 158, b: 11 } // Amber
      case 'listening':
        return { r: 16, g: 185, b: 129 } // Teal
      case 'thinking':
        return { r: 99, g: 102, b: 241 } // Indigo
      default:
        return { r: 184, g: 140, b: 90 } // Copper (idle)
    }
  }

  drawRings() {
    if (!this.ctx || !this.canvas) return

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const color = this.getStateColor()

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i]
      const radius = ring.baseRadius + ring.currentExpansion
      const expansionFactor = ring.currentExpansion / this.config.maxExpansion
      const minOpacity = this.isActive ? 0.5 : 0.4
      const opacity = ring.baseOpacity * (minOpacity + expansionFactor * (1 - minOpacity))

      const innerRadius = Math.max(0, radius - 6)
      const outerRadius = radius + 6
      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, outerRadius
      )

      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
      gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`)
      gradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`)
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      this.ctx.strokeStyle = gradient
      this.ctx.lineWidth = 10
      this.ctx.stroke()
    }

    if (this.isActive) {
      const glowGradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, this.config.baseRadius
      )
      glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`)
      glowGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`)
      glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

      this.ctx.beginPath()
      this.ctx.arc(centerX, centerY, this.config.baseRadius, 0, Math.PI * 2)
      this.ctx.fillStyle = glowGradient
      this.ctx.fill()
    }
  }

  async playWithVisualization(base64Audio) {
    this.stopIdleShimmer()

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    if (this.currentSource) {
      try { this.currentSource.stop() } catch (e) { /* ignore */ }
      this.currentSource = null
    }

    try {
      if (!this.audioContext) {
        this.handlePlaybackEnd()
        return
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const arrayBuffer = bytes.buffer.slice(0)
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      this.currentSource = source

      source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)

      source.start(0)
      this.isActive = true
      if (this.onStart) this.onStart()

      this.animateVisualization()

      const durationMs = audioBuffer.duration * 1000
      this.playbackTimeout = setTimeout(() => {
        if (this.isActive) this.handlePlaybackEnd()
      }, durationMs + 5000)

      source.onended = () => {
        if (this.playbackTimeout) {
          clearTimeout(this.playbackTimeout)
          this.playbackTimeout = null
        }
        this.handlePlaybackEnd()
      }
    } catch (error) {
      console.error('[OrbVisualizer] Audio playback error:', error)
      this.handlePlaybackEnd()
    }
  }

  handlePlaybackEnd() {
    this.isActive = false
    this.currentSource = null

    if (this.visualizationAnimationId) {
      cancelAnimationFrame(this.visualizationAnimationId)
      this.visualizationAnimationId = null
    }

    this.resetRings()
    if (!this.suppressIdleOnEnd) {
      this.startIdleShimmer()
    }

    if (this.onEnd) this.onEnd()
  }

  animateVisualization() {
    if (!this.isActive) return

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(dataArray)
    this.updateRings(dataArray)
    this.drawRings()

    this.visualizationAnimationId = requestAnimationFrame(() => this.animateVisualization())
  }

  updateRings(dataArray) {
    const { maxExpansion, ringCount } = this.config
    this.rings.forEach((ring, i) => {
      const binIndex = Math.floor(i * (dataArray.length / ringCount))
      const value = dataArray[binIndex] / 255
      const easedValue = Math.pow(value, 0.6)
      ring.targetExpansion = easedValue * maxExpansion
      ring.currentExpansion += (ring.targetExpansion - ring.currentExpansion) * 0.25
    })
  }

  resetRings() {
    this.rings.forEach((ring) => {
      ring.currentExpansion = 0
      ring.targetExpansion = 0
    })
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  startIdleShimmer() {
    if (this.isShimmering || this.isActive) return
    this.isShimmering = true
    this.shimmerLoop()
  }

  stopIdleShimmer() {
    this.isShimmering = false
    if (this.shimmerAnimationId) {
      cancelAnimationFrame(this.shimmerAnimationId)
      this.shimmerAnimationId = null
    }
  }

  shimmerLoop() {
    if (!this.isShimmering || this.isActive) return

    const time = Date.now() / 1000
    this.rings.forEach((ring, i) => {
      const phase = (time * 0.5 + i * 0.4) % (Math.PI * 2)
      const wave = 0.5 + Math.sin(phase) * 0.5
      ring.currentExpansion = wave * 8
    })

    this.drawRings()
    this.shimmerAnimationId = requestAnimationFrame(() => this.shimmerLoop())
  }

  interrupt() {
    if (this.currentSource) {
      try { this.currentSource.stop() } catch (e) { /* ignore */ }
      this.currentSource = null
    }

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    if (this.visualizationAnimationId) {
      cancelAnimationFrame(this.visualizationAnimationId)
      this.visualizationAnimationId = null
    }

    this.isActive = false
    this.resetRings()
    this.startIdleShimmer()
  }

  destroy() {
    this.interrupt()
    this.stopIdleShimmer()

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    if (this.analyser) {
      try { this.analyser.disconnect() } catch (e) { /* ignore */ }
      this.analyser = null
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    this.audioContext = null
    this.ctx = null
    this.canvas = null
    this.currentSource = null
    this.rings = []
  }
}

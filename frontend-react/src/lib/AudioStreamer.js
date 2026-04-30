/**
 * AudioStreamer — Captures microphone audio, downsamples to 16kHz mono Int16 PCM,
 * and streams to server via WebSocket as base64 audio_chunk messages.
 */
export class AudioStreamer {
  constructor() {
    this.audioContext = null
    this.scriptProcessor = null
    this.mediaStream = null
    this.sourceNode = null
    this.websocket = null
    this.isStreaming = false
    this.isPaused = false       // gated by AI speaking (echo prevention)
    this._userPaused = false    // gated by explicit user Pause button
    this._initialized = false
    this._sessionId = null
  }

  setSessionId(id) {
    this._sessionId = id
  }

  async initialize() {
    if (this._initialized) return

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1)

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.isStreaming || this.isPaused || this._userPaused) return

      const input = event.inputBuffer.getChannelData(0)
      const pcm16k = this._downsample(input, this.audioContext.sampleRate, 16000)
      const int16 = this._floatToInt16(pcm16k)
      const base64 = this._toBase64(int16.buffer)

      if (this.websocket?.readyState === WebSocket.OPEN && this._sessionId) {
        this.websocket.send(
          JSON.stringify({
            type: 'audio_chunk',
            sessionId: this._sessionId,
            audio: base64,
          })
        )
      }
    }

    this.sourceNode.connect(this.scriptProcessor)
    this.scriptProcessor.connect(this.audioContext.destination)
    this._initialized = true
  }

  start() {
    this.isStreaming = true
  }

  stop() {
    this.isStreaming = false
  }

  setAISpeaking(speaking) {
    this.isPaused = speaking
  }

  /**
   * pause / resume — explicit user-initiated pause. Independent of the
   * AI-speaking pause (`isPaused`) so the two don't fight.
   */
  pause() {
    this._userPaused = true
  }

  resume() {
    this._userPaused = false
  }

  isUserPaused() {
    return this._userPaused
  }

  destroy() {
    this.isStreaming = false
    this.isPaused = false
    this._userPaused = false

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
      this.scriptProcessor.onaudioprocess = null
      this.scriptProcessor = null
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }
    this._initialized = false
  }

  _downsample(buffer, fromRate, toRate) {
    if (fromRate === toRate) return buffer
    const ratio = fromRate / toRate
    const newLength = Math.round(buffer.length / ratio)
    const result = new Float32Array(newLength)
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio
      const srcIndexFloor = Math.floor(srcIndex)
      const srcIndexCeil = Math.min(srcIndexFloor + 1, buffer.length - 1)
      const frac = srcIndex - srcIndexFloor
      result[i] = buffer[srcIndexFloor] * (1 - frac) + buffer[srcIndexCeil] * frac
    }
    return result
  }

  _floatToInt16(float32) {
    const int16 = new Int16Array(float32.length)
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]))
      int16[i] = s < 0 ? s * 32768 : s * 32767
    }
    return int16
  }

  _toBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
}

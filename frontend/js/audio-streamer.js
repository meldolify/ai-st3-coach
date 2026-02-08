// ============================================================================
// AUDIO-STREAMER.JS - Browser Audio Capture & Streaming
// ============================================================================
// Captures microphone audio, downsamples to 16kHz mono Int16 PCM,
// and streams to server via WebSocket as base64 audio_chunk messages.
// Works on ALL browsers including Safari/iOS (uses ScriptProcessorNode).
// ============================================================================

class AudioStreamer {
  constructor() {
    this.audioContext = null;
    this.scriptProcessor = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.websocket = null;
    this.sessionId = null;
    this.isStreaming = false;
    this.isPaused = false; // Paused during AI speech
    this._initialized = false;
  }

  /**
   * Initialize audio capture (requires user gesture on iOS/Safari).
   * Call this once per session after getUserMedia permission.
   */
  async initialize() {
    if (this._initialized) return;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Resume AudioContext if suspended (iOS requirement)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

    // ScriptProcessorNode: deprecated but works on ALL browsers including Safari/iOS.
    // bufferSize=4096 at 48kHz = ~85ms per callback = ~4 chunks/sec at 16kHz
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.isStreaming || this.isPaused) return;

      const input = event.inputBuffer.getChannelData(0);
      const pcm16k = this._downsample(input, this.audioContext.sampleRate, 16000);
      const int16 = this._floatToInt16(pcm16k);
      const base64 = this._toBase64(int16.buffer);

      if (this.websocket?.readyState === WebSocket.OPEN && this.sessionId) {
        this.websocket.send(JSON.stringify({
          type: 'audio_chunk',
          sessionId: this.sessionId,
          audio: base64
        }));
      }
    };

    this.sourceNode.connect(this.scriptProcessor);
    // Connect to destination to keep the processor running (required by spec)
    this.scriptProcessor.connect(this.audioContext.destination);

    this._initialized = true;
    console.log('[AudioStreamer] Initialized, sample rate:', this.audioContext.sampleRate);
  }

  /** Start streaming audio to server. */
  start() {
    this.isStreaming = true;
    this.sessionId = window.currentSessionId;
    console.log('[AudioStreamer] Streaming started');
  }

  /** Stop streaming (keeps audio pipeline alive for resume). */
  stop() {
    this.isStreaming = false;
    console.log('[AudioStreamer] Streaming stopped');
  }

  /** Pause/resume streaming during AI speech. */
  setAISpeaking(speaking) {
    this.isPaused = speaking;
  }

  /** Clean up all resources. Call on session end/disconnect. */
  destroy() {
    this.isStreaming = false;
    this.isPaused = false;

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this._initialized = false;
    console.log('[AudioStreamer] Destroyed');
  }

  /**
   * Downsample audio buffer from source rate to target rate.
   * Uses linear interpolation for quality.
   * @param {Float32Array} buffer - Source audio at original sample rate
   * @param {number} fromRate - Source sample rate (e.g. 48000)
   * @param {number} toRate - Target sample rate (16000)
   * @returns {Float32Array} Downsampled audio
   */
  _downsample(buffer, fromRate, toRate) {
    if (fromRate === toRate) return buffer;

    const ratio = fromRate / toRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, buffer.length - 1);
      const frac = srcIndex - srcIndexFloor;
      result[i] = buffer[srcIndexFloor] * (1 - frac) + buffer[srcIndexCeil] * frac;
    }

    return result;
  }

  /**
   * Convert Float32 audio [-1, 1] to Int16 PCM.
   * @param {Float32Array} float32 - Normalized audio samples
   * @returns {Int16Array} PCM samples
   */
  _floatToInt16(float32) {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 32768 : s * 32767;
    }
    return int16;
  }

  /**
   * Convert ArrayBuffer to base64 string.
   * @param {ArrayBuffer} arrayBuffer
   * @returns {string} Base64 encoded string
   */
  _toBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Make available globally
window.AudioStreamer = AudioStreamer;

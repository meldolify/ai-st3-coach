/**
 * Server-Side Voice Activity Detection using Silero VAD v4
 * Uses the same model as @ricky0123/vad-web@0.0.19 (proven working config).
 * Runs via onnxruntime-node (native C++) — no browser WASM/SIMD requirements.
 *
 * Key differences from v5: separate h/c LSTM states, 1536-sample frames,
 * state shape [2, 1, 64] instead of [2, 1, 128].
 */

const ort = require('onnxruntime-node');
const path = require('path');

// Use Silero VAD v4 model (same as @ricky0123/vad-web@0.0.19)
const MODEL_PATH = path.join(__dirname, '../../models/silero_vad_v4.onnx');

// Frame size: 1536 samples at 16kHz (~96ms) — matches vad-web default
const FRAME_SIZE = 1536;

// Shared model session — loaded once, reused across all VAD instances
let sharedSession = null;

async function loadModel() {
  if (!sharedSession) {
    sharedSession = await ort.InferenceSession.create(MODEL_PATH);
    console.log('[ServerVAD] Silero VAD v4 model loaded');
    console.log('[ServerVAD] Model inputs:', sharedSession.inputNames);
    console.log('[ServerVAD] Model outputs:', sharedSession.outputNames);
  }
  return sharedSession;
}

class ServerVAD {
  /**
   * @param {Object} options
   * @param {number} options.posThreshold - Speech start threshold (default 0.3, matches vad-web)
   * @param {number} options.negThreshold - Speech end threshold (default 0.2, matches vad-web)
   * @param {number} options.redemptionFrames - Silence frames before speech end (default 12)
   * @param {number} options.minSpeechFrames - Min speech frames to trigger start (default 2)
   */
  constructor(options = {}) {
    this.session = null;

    // Silero v4: separate LSTM h and c state tensors [2, 1, 64]
    this.h = null;
    this.c = null;

    // Detection thresholds — match @ricky0123/vad-web@0.0.19 defaults
    this.posThreshold = options.posThreshold || 0.3;
    this.negThreshold = options.negThreshold || 0.2;
    this.redemptionFrames = options.redemptionFrames || 8;
    this.minSpeechFrames = options.minSpeechFrames || 2;

    // State tracking
    this.isSpeaking = false;
    this.speechFrameCount = 0;
    this.silenceFrameCount = 0;
    this.audioBuffer = []; // Buffered speech audio (Float32 frames)

    // Pre-speech buffer: keep last N frames before speech detected
    // 10 frames × 96ms = ~960ms pre-roll (matches vad-web preSpeechPadFrames: 10)
    this.preSpeechBufferSize = 10;
    this.preSpeechBuffer = [];

    // Residual buffer for cross-chunk frame assembly
    // (chunks are ~1365 samples but frames need 1536 samples)
    this._residualBuffer = null;

    // Callbacks
    this.onSpeechStart = null;
    this.onSpeechEnd = null; // Called with Float32Array of speech audio
    this.onIncrementalAudio = null; // Called with cumulative Float32Array every ~15s of speech

    // Incremental export tracking (for background Whisper during long speech)
    this._incrementalIntervalFrames = Math.round((15 * 16000) / FRAME_SIZE); // ~156 frames = ~15s
    this._framesSinceLastExport = 0;
    this._lastExportIndex = 0; // audioBuffer index at last export

    // Timing
    this.speechStartTime = null;

    // Processing queue — ensures chunks are processed sequentially
    this._processQueue = Promise.resolve();
  }

  async initialize() {
    this.session = await loadModel();
    this._resetState();

    // Self-test: verify model produces varying output for different inputs
    const silenceFrame = new Float32Array(FRAME_SIZE);
    const silenceProb = await this._runModel(silenceFrame);

    this._resetState();
    const noiseFrame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < FRAME_SIZE; i++) {
      noiseFrame[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noiseProb = await this._runModel(noiseFrame);

    console.log(`[ServerVAD] Self-test: silence=${silenceProb.toFixed(6)}, noise=${noiseProb.toFixed(6)}`);
    if (silenceProb === noiseProb) {
      console.warn('[ServerVAD] WARNING: Model returns identical output for different inputs');
    }

    this._resetState(); // Clean state for real audio
  }

  /**
   * Process a chunk of 16kHz Int16 PCM audio from the client.
   * Buffers samples across chunks to assemble 1536-sample frames.
   * @param {Int16Array} int16Audio
   */
  async processChunk(int16Audio) {
    const task = this._processQueue.then(() => this._processChunkInternal(int16Audio));
    this._processQueue = task.catch(() => {});
    return task;
  }

  async _processChunkInternal(int16Audio) {
    const float32 = this._int16ToFloat32(int16Audio);

    // Append to residual buffer from previous chunk
    if (this._residualBuffer) {
      const combined = new Float32Array(this._residualBuffer.length + float32.length);
      combined.set(this._residualBuffer);
      combined.set(float32, this._residualBuffer.length);
      this._residualBuffer = combined;
    } else {
      this._residualBuffer = float32;
    }

    // Process complete 1536-sample frames
    let offset = 0;
    while (offset + FRAME_SIZE <= this._residualBuffer.length) {
      const frame = this._residualBuffer.slice(offset, offset + FRAME_SIZE);
      const gainedFrame = this._applyGain(frame);
      const prob = await this._runModel(gainedFrame);
      this._updateState(prob, frame); // Buffer ORIGINAL audio for Whisper
      offset += FRAME_SIZE;
    }

    // Keep leftover samples for next chunk
    if (offset < this._residualBuffer.length) {
      this._residualBuffer = this._residualBuffer.slice(offset);
    } else {
      this._residualBuffer = null;
    }
  }

  /**
   * Apply gain to quiet audio for VAD detection.
   * @param {Float32Array} frame
   * @returns {Float32Array} Gained frame (or original if already loud enough)
   */
  _applyGain(frame) {
    let peak = 0;
    for (let i = 0; i < frame.length; i++) {
      const abs = Math.abs(frame[i]);
      if (abs > peak) peak = abs;
    }

    if (peak < 0.001 || peak >= 0.1) return frame;

    const gain = Math.min(0.3 / peak, 50);
    const result = new Float32Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
      result[i] = Math.max(-1, Math.min(1, frame[i] * gain));
    }
    return result;
  }

  /**
   * Run the Silero VAD v4 model on a single 1536-sample frame.
   * v4 uses separate h/c LSTM states with shape [2, 1, 64].
   * @param {Float32Array} frame - 1536 audio samples at 16kHz
   * @returns {number} Speech probability 0-1
   */
  async _runModel(frame) {
    const feeds = {
      input: new ort.Tensor('float32', frame, [1, FRAME_SIZE]),
      h: new ort.Tensor('float32', this.h, [2, 1, 64]),
      c: new ort.Tensor('float32', this.c, [2, 1, 64]),
      sr: new ort.Tensor('int64', BigInt64Array.from([16000n]), [1])
    };

    const results = await this.session.run(feeds);

    // Update LSTM states for next frame
    this.h = Float32Array.from(results.hn.data);
    this.c = Float32Array.from(results.cn.data);

    return results.output.data[0];
  }

  /**
   * Update speech/silence state based on probability.
   */
  _updateState(prob, frame) {
    if (!this._frameCount) this._frameCount = 0;
    this._frameCount++;

    // Diagnostic: log every ~10 frames (~960ms at 96ms/frame)
    if (this._frameCount % 10 === 1) {
      let peak = 0;
      for (let j = 0; j < frame.length; j++) {
        const abs = Math.abs(frame[j]);
        if (abs > peak) peak = abs;
      }
      console.log(`[VAD] Frame ${this._frameCount}: prob=${prob.toFixed(3)}, peak=${peak.toFixed(4)}, speaking=${this.isSpeaking}`);
    }

    if (!this.isSpeaking) {
      // Maintain rolling pre-speech buffer
      this.preSpeechBuffer.push(new Float32Array(frame));
      if (this.preSpeechBuffer.length > this.preSpeechBufferSize) {
        this.preSpeechBuffer.shift();
      }

      if (prob >= this.posThreshold) {
        this.speechFrameCount++;
        if (this.speechFrameCount >= this.minSpeechFrames) {
          this.isSpeaking = true;
          this.silenceFrameCount = 0;
          this.speechStartTime = Date.now();

          // Prepend pre-speech buffer so we don't clip the start
          this.audioBuffer = [...this.preSpeechBuffer];
          this.preSpeechBuffer = [];

          if (this.onSpeechStart) this.onSpeechStart();
        }
      } else {
        this.speechFrameCount = 0;
      }
    } else {
      // Currently in speech — buffer audio
      this.audioBuffer.push(new Float32Array(frame));
      this._framesSinceLastExport++;

      // Fire incremental export every ~15s of continuous speech
      if (this.onIncrementalAudio && this._framesSinceLastExport >= this._incrementalIntervalFrames) {
        const snapshot = this._concatenateBuffers();
        this._lastExportIndex = this.audioBuffer.length;
        this._framesSinceLastExport = 0;
        this.onIncrementalAudio(snapshot, this._frameCount);
      }

      if (prob < this.negThreshold) {
        this.silenceFrameCount++;
        if (this.silenceFrameCount >= this.redemptionFrames) {
          // Speech ended — compute all data BEFORE clearing state
          const audio = this._concatenateBuffers();
          const hadIncrementalExports = this._lastExportIndex > 0;
          const audioSinceExport = hadIncrementalExports ? this.getAudioSinceLastExport() : null;

          // Now clear state
          this.isSpeaking = false;
          this.speechFrameCount = 0;
          this.silenceFrameCount = 0;
          this.audioBuffer = [];
          this._framesSinceLastExport = 0;
          this._lastExportIndex = 0;

          if (this.onSpeechEnd) this.onSpeechEnd(audio, hadIncrementalExports, audioSinceExport);
        }
      } else {
        this.silenceFrameCount = 0;
      }
    }
  }

  /**
   * Get only the audio frames accumulated since the last incremental export.
   * Used to transcribe just the final segment when incremental Whisper is active.
   * @returns {Float32Array}
   */
  getAudioSinceLastExport() {
    if (this._lastExportIndex === 0) return this._concatenateBuffers();
    const sliced = this.audioBuffer.slice(this._lastExportIndex);
    const totalLength = sliced.reduce((sum, buf) => sum + buf.length, 0);
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of sliced) {
      result.set(buf, offset);
      offset += buf.length;
    }
    return result;
  }

  /**
   * Concatenate all buffered Float32 frames into a single array.
   * @returns {Float32Array}
   */
  _concatenateBuffers() {
    const totalLength = this.audioBuffer.reduce((sum, buf) => sum + buf.length, 0);
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of this.audioBuffer) {
      result.set(buf, offset);
      offset += buf.length;
    }
    return result;
  }

  /**
   * Convert Int16 PCM to Float32 in [-1, 1] range.
   */
  _int16ToFloat32(int16) {
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    return float32;
  }

  /**
   * Reset LSTM state.
   */
  _resetState() {
    this.h = new Float32Array(2 * 1 * 64).fill(0);
    this.c = new Float32Array(2 * 1 * 64).fill(0);
    this.isSpeaking = false;
    this.speechFrameCount = 0;
    this.silenceFrameCount = 0;
    this.audioBuffer = [];
    this.preSpeechBuffer = [];
    this._residualBuffer = null;
  }

  /**
   * Reset the VAD for a new conversation turn.
   */
  reset() {
    this._resetState();
  }

  /**
   * Clean up resources.
   */
  destroy() {
    this.h = null;
    this.c = null;
    this.audioBuffer = [];
    this.preSpeechBuffer = [];
    this._residualBuffer = null;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onIncrementalAudio = null;
  }
}

/**
 * Convert Float32 PCM audio to a WAV file buffer suitable for Whisper API.
 * @param {Float32Array} float32Audio - Audio samples in [-1, 1]
 * @param {number} sampleRate - Sample rate (16000)
 * @returns {Buffer} WAV file as Node.js Buffer
 */
function float32ToWavBuffer(float32Audio, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = float32Audio.length * (bitsPerSample / 8);
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);         // chunk size
  buffer.writeUInt16LE(1, 20);          // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Convert float32 to int16 PCM
  for (let i = 0; i < float32Audio.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Audio[i]));
    const int16 = sample < 0 ? sample * 32768 : sample * 32767;
    buffer.writeInt16LE(Math.round(int16), headerSize + i * 2);
  }

  return buffer;
}

module.exports = { ServerVAD, float32ToWavBuffer, loadModel };

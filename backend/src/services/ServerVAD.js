/**
 * Server-Side Voice Activity Detection using Silero VAD
 * Runs the Silero ONNX model via onnxruntime-node (native C++).
 * No browser WASM/SIMD requirements — works for ALL clients.
 */

const ort = require('onnxruntime-node');
const path = require('path');

const MODEL_PATH = path.join(__dirname, '../../models/silero_vad.onnx');

// Shared model session — loaded once, reused across all VAD instances
let sharedSession = null;

async function loadModel() {
  if (!sharedSession) {
    sharedSession = await ort.InferenceSession.create(MODEL_PATH);
    console.log('[ServerVAD] Silero model loaded');
  }
  return sharedSession;
}

class ServerVAD {
  /**
   * @param {Object} options
   * @param {number} options.posThreshold - Speech start threshold (default 0.5)
   * @param {number} options.negThreshold - Speech end threshold (default 0.35)
   * @param {number} options.redemptionFrames - Silence frames before speech end (default 12)
   * @param {number} options.minSpeechFrames - Min speech frames to trigger start (default 6)
   */
  constructor(options = {}) {
    this.session = null;

    // Combined LSTM state tensor [2, 1, 128]
    this.state = null;

    // Detection thresholds
    this.posThreshold = options.posThreshold || 0.5;
    this.negThreshold = options.negThreshold || 0.35;
    this.redemptionFrames = options.redemptionFrames || 12;
    this.minSpeechFrames = options.minSpeechFrames || 6;

    // State tracking
    this.isSpeaking = false;
    this.speechFrameCount = 0;
    this.silenceFrameCount = 0;
    this.audioBuffer = []; // Buffered speech audio (Float32 frames)

    // Pre-speech buffer: keep last N frames before speech detected
    // so we don't clip the beginning of the utterance
    this.preSpeechBufferSize = 6; // ~192ms at 32ms/frame
    this.preSpeechBuffer = [];

    // Callbacks
    this.onSpeechStart = null;
    this.onSpeechEnd = null; // Called with Float32Array of speech audio

    // Timing
    this.speechStartTime = null; // When speech was first detected
  }

  async initialize() {
    this.session = await loadModel();
    this._resetState();
  }

  /**
   * Process a chunk of 16kHz Int16 PCM audio from the client.
   * Internally converts to Float32 and runs through 512-sample frames.
   * @param {Int16Array} int16Audio
   */
  async processChunk(int16Audio) {
    const float32 = this._int16ToFloat32(int16Audio);

    // Process in 512-sample frames (32ms at 16kHz)
    for (let i = 0; i + 512 <= float32.length; i += 512) {
      const frame = float32.slice(i, i + 512);
      const prob = await this._runModel(frame);
      this._updateState(prob, frame);
    }
  }

  /**
   * Run the Silero VAD model on a single 512-sample frame.
   * @param {Float32Array} frame - 512 audio samples
   * @returns {number} Speech probability 0-1
   */
  async _runModel(frame) {
    const feeds = {
      input: new ort.Tensor('float32', frame, [1, 512]),
      state: new ort.Tensor('float32', this.state, [2, 1, 128]),
      sr: new ort.Tensor('int64', BigInt64Array.from([16000n]), [1])
    };

    const results = await this.session.run(feeds);

    // Update state for next frame
    this.state = Float32Array.from(results.stateN.data);

    return results.output.data[0];
  }

  /**
   * Update speech/silence state based on probability.
   */
  _updateState(prob, frame) {
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

      if (prob < this.negThreshold) {
        this.silenceFrameCount++;
        if (this.silenceFrameCount >= this.redemptionFrames) {
          // Speech ended
          const audio = this._concatenateBuffers();
          this.isSpeaking = false;
          this.speechFrameCount = 0;
          this.silenceFrameCount = 0;
          this.audioBuffer = [];

          if (this.onSpeechEnd) this.onSpeechEnd(audio);
        }
      } else {
        this.silenceFrameCount = 0;
      }
    }
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
   * Reset LSTM state (call when starting a new session or after long silence).
   */
  _resetState() {
    this.state = new Float32Array(2 * 1 * 128).fill(0);
    this.isSpeaking = false;
    this.speechFrameCount = 0;
    this.silenceFrameCount = 0;
    this.audioBuffer = [];
    this.preSpeechBuffer = [];
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
    this.state = null;
    this.audioBuffer = [];
    this.preSpeechBuffer = [];
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
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

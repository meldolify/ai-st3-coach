/**
 * Deepgram Flux STT Service
 *
 * Streaming speech-to-text with model-integrated turn detection. Replaces
 * ServerVAD + Whisper one-shot. Speech-end is signalled by Flux's
 * `EndOfTurn` event with the final transcript already in hand —
 * no additional STT round-trip needed.
 *
 * Lifecycle mirrors ServerVAD so server.js wiring stays parallel:
 *   initialize() / processChunk() / reset() / destroy()
 *
 * Callbacks (assigned by caller after construction):
 *   onSpeechStart()         — fires on Flux StartOfTurn
 *   onTranscript(text)      — fires on Flux EndOfTurn with final transcript
 *   onError(error)          — fires on connection or SDK errors
 *
 * The barge-in decision (interrupt AI when user starts talking) lives in
 * server.js; this service just surfaces the StartOfTurn signal.
 */

const { DeepgramClient } = require('@deepgram/sdk');
const config = require('../config');

const FLUX_MODEL = 'flux-general-en';
const SAMPLE_RATE = 16000;
const ENCODING = 'linear16';

class FluxSTTService {
  constructor() {
    this.connection = null;
    this.onSpeechStart = null;
    this.onTranscript = null;
    this.onError = null;
    this._destroyed = false;
  }

  /**
   * Open the Deepgram Flux WebSocket connection and attach event listeners.
   */
  async initialize() {
    if (!config.DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY not set — cannot initialize Flux STT');
    }

    const client = new DeepgramClient({ apiKey: config.DEEPGRAM_API_KEY });
    this.connection = await client.listen.v2.connect({
      model: FLUX_MODEL,
      encoding: ENCODING,
      sample_rate: SAMPLE_RATE
    });

    this.connection.on('message', msg => this._handleMessage(msg));
    this.connection.on('error', err => {
      console.error('[Flux] Connection error:', err?.message || err);
      if (this.onError) {
        this.onError(err);
      }
    });

    console.log('[Flux] Connection ready');
  }

  /**
   * Forward raw 16 kHz Int16 PCM bytes to Deepgram.
   * @param {Buffer} pcmBuffer
   */
  processChunk(pcmBuffer) {
    if (this._destroyed || !this.connection) {
      return;
    }
    try {
      this.connection.sendMedia(pcmBuffer);
    } catch (err) {
      console.error('[Flux] sendMedia failed:', err.message);
    }
  }

  /**
   * Called on end_interview / request_feedback. Flux holds turn state
   * server-side and the upstream code already gates on session.interviewEnded
   * so any in-flight EndOfTurn after this point is ignored — no action needed
   * here. Method exists so server.js can call it symmetrically with vad.reset().
   */
  reset() {
    // no-op
  }

  /**
   * Close the WebSocket connection cleanly and drop callbacks.
   */
  destroy() {
    this._destroyed = true;
    if (this.connection) {
      try {
        this.connection.sendCloseStream({ type: 'CloseStream' });
      } catch (err) {
        console.warn('[Flux] sendCloseStream failed:', err.message);
      }
      this.connection = null;
    }
    this.onSpeechStart = null;
    this.onTranscript = null;
    this.onError = null;
  }

  _handleMessage(msg) {
    if (!msg || msg.type !== 'TurnInfo') {
      return;
    }

    switch (msg.event) {
      case 'StartOfTurn':
        if (this.onSpeechStart) {
          this.onSpeechStart();
        }
        break;

      case 'EndOfTurn': {
        const transcript = (msg.transcript || '').trim();
        if (transcript && this.onTranscript) {
          this.onTranscript(transcript);
        }
        break;
      }

      case 'EagerEndOfTurn':
      case 'TurnResumed':
        // Logged for now; prefetch / cancel logic deferred to phase 3.
        if (config.DEBUG_VAD) {
          console.log(`[Flux] ${msg.event} (transcript: "${(msg.transcript || '').slice(0, 50)}")`);
        }
        break;

      default:
        if (config.DEBUG_VAD) {
          console.log('[Flux] Unhandled TurnInfo event:', msg.event);
        }
    }
  }
}

module.exports = { FluxSTTService };

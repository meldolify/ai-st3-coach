/**
 * Deepgram Flux STT Service
 *
 * Streaming speech-to-text with model-integrated turn detection. Speech-end
 * is signalled by Flux's `EndOfTurn` event with the final transcript already
 * in hand — no separate STT round-trip needed. `StartOfTurn` is used by the
 * server to fire automatic barge-in (interrupt the AI when user starts speaking).
 *
 * Lifecycle: initialize() / processChunk() / reset() / destroy()
 *
 * Callbacks (assigned by caller after construction):
 *   onSpeechStart()                 — fires on Flux StartOfTurn
 *   onTranscript(text, endOfTurnAt) — fires on Flux EndOfTurn. endOfTurnAt is
 *                                     Date.now() captured the instant the event
 *                                     arrived; used as t0 for per-turn timing.
 *   onError(error)                  — fires on connection or SDK errors
 */

const { DeepgramClient } = require('@deepgram/sdk');
const config = require('../config');

const FLUX_MODEL = 'flux-general-en';
const SAMPLE_RATE = 16000;
const ENCODING = 'linear16';
const HANDSHAKE_TIMEOUT_MS = 15000;

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
      sample_rate: SAMPLE_RATE,
      debug: true
    });

    // Diagnostic: confirm the socket exists and log its url so we know
    // we're trying to reach the right endpoint.
    try {
      const sock = this.connection?.socket;
      const url = sock?._url || sock?.url;
      const rs = sock?.readyState;
      console.log(`[Flux] post-connect socket: url=${url} readyState=${rs}`);
    } catch (logErr) {
      console.warn('[Flux] post-connect logging failed:', logErr?.message);
    }

    this.connection.on('message', msg => this._handleMessage(msg));
    this.connection.on('error', err => {
      console.error('[Flux] Connection error:', err?.message || err);
      if (this.onError) {
        this.onError(err);
      }
    });
    this.connection.on('close', event => {
      const code = event?.code;
      const reason = event?.reason;
      console.warn(`[Flux] Connection closed (code=${code}, reason="${reason || ''}")`);
    });

    // The SDK's WrappedListenV2Client passes startClosed=true to the
    // underlying ReconnectingWebSocket, so the socket returned by
    // listen.v2.connect() has NOT begun handshaking yet. We must call
    // connection.connect() to flip _shouldReconnect=true and actually
    // initiate the WS handshake. Without this, no events ever fire.
    if (typeof this.connection.connect === 'function') {
      this.connection.connect();
    }

    // Race the handshake against open / close / error / timeout so init
    // either resolves cleanly or throws with a useful diagnostic — the SDK's
    // own waitForOpen() only listens for 'open' and 'error' (not 'close'),
    // so a server-side rejection during handshake would hang it forever.
    await this._waitForReady();
    console.log('[Flux] Connection ready');
  }

  _waitForReady() {
    const socket = this.connection?.socket;
    if (!socket || typeof socket.addEventListener !== 'function') {
      // Defensive: if the SDK shape changes, fall back to assuming the
      // connection is already ready.
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const settle = (fn, arg) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        clearInterval(stateLogger);
        fn(arg);
      };

      // Diagnostic: log readyState every second so we can see if the socket
      // is moving (e.g. CONNECTING → CLOSED via auto-retry) or genuinely
      // hanging in CONNECTING. Cleared as soon as the race settles.
      const stateLogger = setInterval(() => {
        try {
          console.log(
            `[Flux] handshake tick: readyState=${socket.readyState} retryCount=${socket.retryCount}`
          );
        } catch (_e) {
          // ignore
        }
      }, 1000);

      const timer = setTimeout(() => {
        const rs = socket.readyState;
        const retry = socket.retryCount;
        settle(
          reject,
          new Error(
            `Flux WS handshake timed out after ${HANDSHAKE_TIMEOUT_MS}ms (readyState=${rs}, retryCount=${retry})`
          )
        );
      }, HANDSHAKE_TIMEOUT_MS);

      socket.addEventListener('open', () => {
        console.log('[Flux] socket open event fired');
        settle(resolve, undefined);
      });
      socket.addEventListener('close', event => {
        const code = event?.code;
        const reason = event?.reason;
        console.warn(
          `[Flux] socket close event during handshake: code=${code} reason="${reason || ''}"`
        );
        if (settled) {
          return;
        }
        settle(
          reject,
          new Error(`Flux WS closed during handshake (code=${code}, reason="${reason || ''}")`)
        );
      });
      socket.addEventListener('error', err => {
        console.error('[Flux] socket error event during handshake:', err?.message || err);
        if (settled) {
          return;
        }
        settle(
          reject,
          err instanceof Error ? err : new Error(err?.message || 'Flux WS error during handshake')
        );
      });
    });
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
        const endOfTurnAt = Date.now();
        const transcript = (msg.transcript || '').trim();
        if (transcript && this.onTranscript) {
          this.onTranscript(transcript, endOfTurnAt);
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

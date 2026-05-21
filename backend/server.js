// Sentry MUST init before any other require so its auto-instrumentation
// can patch http/express/etc. via Node's diagnostics_channel. No-op when
// SENTRY_DSN is unset.
require('./src/sentry-init');
const Sentry = require('@sentry/node');

// Load configuration first (handles env vars, validation, and Google Cloud credentials)
const config = require('./src/config');

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const WebSocket = require('ws');
const path = require('path');
const url = require('url');

// Create Express app and HTTP server early so both REST and WebSocket share one port
const app = express();
const server = http.createServer(app);

// Import services
const openaiService = require('./src/services/OpenAIService');
const ttsService = require('./src/services/TTSService');
const geminiTTSService = require('./src/services/GeminiTTSService');
const { FluxSTTService } = require('./src/services/FluxSTTService');
const { isNoiseTranscript, buildNaturalSSML } = require('./src/utils/audioHelpers');
const {
  buildInterviewPrompt,
  buildFeedbackPrompt,
  extractDomain,
  loadInfoSheet
} = require('./src/utils/promptAssembler');
const { parseFeedbackResponse } = require('./src/utils/feedbackParser');
const { FeedbackSectionBuffer } = require('./src/utils/feedbackSectionBuffer');
const { RateLimitError } = require('openai');

// Import security middleware
const {
  generateSecureSessionId,
  WebSocketRateLimiter,
  validateMessage,
  sanitizeForLog
} = require('./src/middleware/websocketSecurity');

// Initialize WebSocket rate limiter
// Audio streaming: ScriptProcessorNode(4096) at 48kHz = 85ms/callback = ~12 chunks/sec = ~720/min
const wsRateLimiter = new WebSocketRateLimiter({
  windowMs: 60000, // 1 minute window
  maxMessages: 1200, // ~720 audio + control messages, with headroom
  maxAudioPerMinute: 900 // ~12 chunks/sec = 720/min, with 25% headroom
});

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => wsRateLimiter.cleanup(), 5 * 60 * 1000);

// Stripe for payments (optional - only if configured)
let stripe = null;
if (config.isStripeEnabled) {
  stripe = require('stripe')(config.STRIPE_SECRET_KEY);
}

// Supabase for database operations (optional - only if configured)
let supabaseAdmin = null;
if (config.isSupabaseEnabled) {
  const { createClient } = require('@supabase/supabase-js');
  supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
}

process.on('unhandledRejection', (reason, _promise) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
  Sentry.captureException(reason);
});
process.on('uncaughtException', error => {
  console.error('[FATAL] Uncaught Exception:', error);
  Sentry.captureException(error);
});

console.log('API clients initialized');

const sessions = new Map();

// Use secure session ID generation from middleware
// (keeping function name for backwards compatibility)

/**
 * Serialize conversation history into a readable transcript string.
 * Skips the system message. Maps roles to [Examiner] and [Candidate].
 * @param {Array} history - Conversation history array of {role, content}
 * @returns {string} - Formatted transcript
 */
function serializeTranscript(history) {
  return history
    .filter(msg => msg.role !== 'system')
    .map(msg => {
      const label = msg.role === 'assistant' ? '[Examiner]' : '[Candidate]';
      return `${label}: ${msg.content}`;
    })
    .join('\n');
}

/**
 * Per-turn latency tracker. Records named timestamps relative to a t0 (typically
 * the instant Flux declared EndOfTurn) and emits a single formatted summary
 * line at turn end. Used to pinpoint exactly which stage is slow.
 * @param {string} label - identifier for the log line (e.g. session id)
 * @param {number} t0 - reference timestamp (Date.now() ms)
 */
function createTurnTimeline(label, t0) {
  const marks = [];
  return {
    mark(name) {
      marks.push({ name, at: Date.now() - t0 });
    },
    log() {
      const segments = marks
        .map((m, i) => {
          const prev = i === 0 ? 0 : marks[i - 1].at;
          return `${m.name}=+${m.at - prev}ms`;
        })
        .join(' · ');
      const total = marks.length ? marks[marks.length - 1].at : 0;
      console.log(`[TIMING] turn=${label} total=${total}ms | ${segments}`);
    }
  };
}

async function googleTTS(text, voiceName, options = {}) {
  return ttsService.synthesize(text, voiceName, options);
}

// Gemini voice → Google Cloud voice fallback mapping
const VOICE_FALLBACK_MAP = {
  Fenrir: 'en-GB-Neural2-D', // Male
  Kore: 'en-GB-Neural2-A', // Female
  Charon: 'en-GB-Neural2-B' // Male
};

/**
 * Streaming TTS for a session — yields WAV chunks as Gemini emits them so
 * the client starts playing in ~500-1000ms instead of waiting for the full
 * turn (which is 4-9s of dead air on Gemini 3.1 Flash TTS).
 * Falls back to a single Cloud TTS chunk on Gemini error.
 * @param {string} plainText
 * @param {Object} session - needs session.voice, session.difficulty
 * @yields {Buffer} WAV chunk
 */
async function* ttsStreamForSession(plainText, session, options = {}) {
  const stylePrompt = config.TTS_STYLE_PROMPTS?.[session.difficulty];
  if (stylePrompt) {
    try {
      for await (const chunk of geminiTTSService.synthesizeStream(plainText, session.voice, {
        stylePrompt,
        onTimingMark: options.onTimingMark
      })) {
        yield chunk;
      }
      return;
    } catch (error) {
      console.warn('[TTS] Gemini stream failed, falling back to Cloud TTS:', error.message);
    }
  }
  const cloudVoice = VOICE_FALLBACK_MAP[session.voice] || session.voice;
  yield await googleTTS(buildNaturalSSML(plainText), cloudVoice);
}

/**
 * Fire ttsStreamForSession eagerly and buffer chunks as they arrive. Returns
 * an entry with `text` and a `drain()` async iterator that yields chunks in
 * order — even if the consumer is slower than the producer (chunks are
 * buffered) or faster (drain awaits the next chunk).
 *
 * Used by the feedback flow so all 6 sections' streams run in parallel
 * (saving wall-clock time) but the WS sends them in 1→6 order.
 *
 * @param {string} text - Full section text
 * @param {Object} session
 * @returns {{ text: string, drain: () => AsyncGenerator<Buffer> }}
 */
function startBufferedSectionTTS(text, session) {
  const buffer = [];
  let done = false;
  let resolveNext;
  let nextPromise = new Promise(r => {
    resolveNext = r;
  });
  const notifyNew = () => {
    const r = resolveNext;
    nextPromise = new Promise(rr => {
      resolveNext = rr;
    });
    r();
  };

  (async () => {
    try {
      for await (const wav of ttsStreamForSession(text, session)) {
        buffer.push(wav);
        notifyNew();
      }
    } catch (err) {
      console.warn('[FEEDBACK] TTS stream failed:', err?.message || err);
    } finally {
      done = true;
      notifyNew();
    }
  })().catch(() => {});

  return {
    text,
    async *drain() {
      let idx = 0;
      while (true) {
        while (idx < buffer.length) {
          yield buffer[idx++];
        }
        if (done) {
          return;
        }
        await nextPromise;
      }
    }
  };
}

/**
 * Stream LLM response, then synthesize the full turn as a single TTS call.
 * Sends ai_response_start, then one ai_response_chunk with the complete audio,
 * then ai_response_end.
 *
 * One TTS call per turn (not per sentence) — gives consistent prosody across
 * the whole response. Per-sentence chunking caused voice drift on 2.5-era
 * models and is intentionally not used here.
 *
 * @param {Object} session - Session object from sessions Map
 * @param {WebSocket} ws - WebSocket connection
 * @param {Array} history - Conversation history (user message already pushed)
 * @param {Object} options - LLM options (optional)
 */
async function streamResponseToClient(session, ws, history, options = {}) {
  let fullText = '';
  const timeline = options.timeline; // optional createTurnTimeline instance
  const mark = name => timeline && timeline.mark(name);

  session.isAISpeaking = true;
  mark('stream_invoked');
  ws.send(JSON.stringify({ type: 'ai_response_start' }));
  mark('ai_response_start_sent');

  try {
    mark('llm_open');
    let llmFirstTokenMarked = false;
    for await (const token of openaiService.generateResponseStream(history, options)) {
      if (!llmFirstTokenMarked) {
        mark('llm_first_token');
        llmFirstTokenMarked = true;
      }
      if (!session.isAISpeaking) {
        console.log('[STREAM] Aborted during LLM stream — user interrupted');
        break;
      }
      fullText += token;
    }

    const wasInterrupted = !session.isAISpeaking;
    mark('llm_stream_end');

    // Streaming TTS — ship each WAV chunk to the client as it arrives.
    if (fullText && !wasInterrupted) {
      let chunkIndex = 0;
      mark('tts_open');
      try {
        for await (const wavChunk of ttsStreamForSession(fullText, session, {
          onTimingMark: mark
        })) {
          if (!session.isAISpeaking) {
            break;
          }
          ws.send(
            JSON.stringify({
              type: 'ai_response_chunk',
              text: chunkIndex === 0 ? fullText : '',
              audio: wavChunk.toString('base64'),
              chunkIndex: chunkIndex++
            })
          );
          if (chunkIndex === 1) {
            mark('tts_first_chunk_sent');
          }
        }
      } catch (ttsError) {
        console.error('[TTS] Stream failed entirely:', ttsError.message);
      }
      mark('tts_last_chunk_sent');
      console.log(`[TTS] ${chunkIndex} chunks sent`);
    }

    console.log('[AI] ' + fullText);

    if (wasInterrupted) {
      if (fullText.length > 50) {
        history.push({ role: 'assistant', content: fullText + ' [interrupted]' });
      }
    } else {
      history.push({ role: 'assistant', content: fullText });
    }

    ws.send(JSON.stringify({ type: 'ai_response_end', fullText }));
    mark('ai_response_end_sent');
    if (timeline) {
      timeline.log();
    }
  } catch (error) {
    console.error('[STREAM] Error:', error.message);
    const isRateLimit = error instanceof RateLimitError || error.isRateLimit;
    ws.send(
      JSON.stringify({
        type: 'error',
        message: isRateLimit
          ? 'API rate limit reached. Please wait a moment and try again.'
          : 'Streaming response failed',
        ...(isRateLimit && { code: 'RATE_LIMITED' })
      })
    );
    session.isAISpeaking = false;
  }
}

// Per-IP WebSocket connection-rate limiter. Per-session limits already exist
// in WebSocketRateLimiter, but nothing throttles fresh connections from a
// single IP — without this, one source could open thousands of sessions at
// once and exhaust the SUPABASE auth.getUser() rate budget.
const WS_CONNECT_WINDOW_MS = 60 * 1000;
const WS_MAX_CONNECTS_PER_MIN = 20;
const wsConnectAttempts = new Map();

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    return fwd.toString().split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function isWsConnectRateLimited(req) {
  // Bypass in test mode — Jest suites open many concurrent WS connections from
  // the same loopback address and would trip the per-IP cap.
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  const ip = getClientIp(req);
  const now = Date.now();
  const fresh = (wsConnectAttempts.get(ip) || []).filter(t => now - t < WS_CONNECT_WINDOW_MS);
  if (fresh.length >= WS_MAX_CONNECTS_PER_MIN) {
    return true;
  }
  fresh.push(now);
  wsConnectAttempts.set(ip, fresh);
  return false;
}

setInterval(
  () => {
    const now = Date.now();
    for (const [ip, attempts] of wsConnectAttempts.entries()) {
      const fresh = attempts.filter(t => now - t < WS_CONNECT_WINDOW_MS);
      if (fresh.length === 0) {
        wsConnectAttempts.delete(ip);
      } else {
        wsConnectAttempts.set(ip, fresh);
      }
    }
  },
  5 * 60 * 1000
);

// Sub-protocol used to carry the Supabase access JWT on the upgrade. Putting
// the token in the URL query string (the old approach) leaks it into Render's
// request logs; the Sec-WebSocket-Protocol header is not part of the URL and
// is not recorded by the logging pipeline.
const AUTH_SUBPROTOCOL = 'st3.auth.bearer';

const wss = new WebSocket.Server({
  server, // Attach to shared HTTP server (same port for REST + WebSocket)
  // The client offers two protocols: [AUTH_SUBPROTOCOL, <jwt>]. We must echo
  // exactly one back, otherwise some browsers fail the upgrade. Selecting our
  // sentinel name (never the raw JWT) keeps the response header benign.
  handleProtocols: protocols => (protocols.has(AUTH_SUBPROTOCOL) ? AUTH_SUBPROTOCOL : false),
  verifyClient: info => {
    if (isWsConnectRateLimited(info.req)) {
      console.warn(`[WS] Rejected: connection rate limit for ${getClientIp(info.req)}`);
      return false;
    }
    if (config.isProduction) {
      const origin = info.origin || info.req.headers.origin;
      return origin === config.FRONTEND_URL;
    }
    return true; // Allow all origins in development
  }
});

/**
 * Extract the Supabase access JWT from the Sec-WebSocket-Protocol header.
 * Clients send `[AUTH_SUBPROTOCOL, <jwt>]`; the header arrives as a comma-
 * separated list. Returns null if the protocol isn't ours or the token is
 * missing. Defence-in-depth: ensure the returned value looks like a JWT
 * (three base64url segments) so a stray protocol entry can't be mistaken
 * for a token.
 */
function extractAuthToken(req) {
  const raw = req.headers['sec-websocket-protocol'];
  if (!raw) {
    return null;
  }
  const parts = raw.split(',').map(s => s.trim());
  if (parts[0] !== AUTH_SUBPROTOCOL || !parts[1]) {
    return null;
  }
  const candidate = parts[1];
  // A JWT is three URL-safe-base64 segments separated by dots.
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(candidate)) {
    return null;
  }
  return candidate;
}

console.log('WebSocket server attached to HTTP server');

// Ping/pong heartbeat to detect dead connections and prevent zombie sessions
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Idle session cleanup — remove sessions with no activity for 30 minutes
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const idleCleanupInterval = setInterval(
  () => {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (now - session.lastActivity > IDLE_TIMEOUT_MS) {
        console.log(
          `[CLEANUP] Removing idle session: ${id} (idle ${Math.round((now - session.lastActivity) / 60000)}min)`
        );
        session.flux?.destroy();
        session.ws?.terminate();
        sessions.delete(id);
        wsRateLimiter.removeClient(id);
      }
    }
  },
  5 * 60 * 1000
);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
  clearInterval(idleCleanupInterval);
});

wss.on('connection', (ws, req) => {
  console.log('\n[CLIENT] New client connected');

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  const queryParams = url.parse(req.url, true).query;
  // topicFolder e.g. "clinical/emergencies/necrotising_fasciitis"
  const scenarioFile = queryParams.scenario || 'clinical/emergencies/necrotising_fasciitis';
  const difficulty = queryParams.difficulty || 'easy';
  const voice = queryParams.voice || config.TTS_VOICE;
  const userId = queryParams.userId || null;
  // Supabase JWT lives in the Sec-WebSocket-Protocol header, not the URL.
  // See AUTH_SUBPROTOCOL definition above for rationale (URL-token leak via
  // Render request logs). Fall back to the legacy query-param transport ONLY
  // for the duration of one deploy where old frontend bundles may still be
  // cached in browsers; remove the fallback in the follow-up commit.
  const authToken = extractAuthToken(req) || queryParams.token || null;

  console.log(
    '[CLIENT] Requested scenario: ' +
      scenarioFile +
      (difficulty ? ' (difficulty: ' + difficulty + ')' : '') +
      (voice ? ' (voice: ' + voice + ')' : '')
  );

  // Async IIFE for access validation
  (async () => {
    // Server-side tier validation if Supabase is enabled
    if (config.DEV_BYPASS_AUTH) {
      console.log('[ACCESS] DEV_BYPASS_AUTH enabled - skipping all access checks');
    } else if (config.isSupabaseEnabled && supabaseAdmin) {
      try {
        // ALL scenarios require authentication (login required)
        if (!userId || !authToken) {
          console.warn('[ACCESS] Rejected: No auth credentials');
          ws.send(
            JSON.stringify({ type: 'error', message: 'Authentication required. Please log in.' })
          );
          ws.close(4001, 'Unauthorized');
          return;
        }

        // Verify the auth token with Supabase
        const {
          data: { user },
          error: authError
        } = await supabaseAdmin.auth.getUser(authToken);

        if (authError || !user) {
          console.warn('[ACCESS] Rejected: Invalid auth token');
          ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
          ws.close(4001, 'Unauthorized');
          return;
        }

        if (user.id !== userId) {
          console.warn('[ACCESS] Rejected: User ID mismatch');
          ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
          ws.close(4001, 'Unauthorized');
          return;
        }

        // Check if this is a free tier scenario (skip subscription check)
        const isFreeScenario = config.FREE_TIER_SCENARIOS.includes(scenarioFile);

        if (isFreeScenario) {
          console.log('[ACCESS] Allowed: Authenticated user accessing free tier scenario');
        } else {
          // Premium scenario - require active subscription with matching specialty
          const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('status, specialty')
            .eq('user_id', userId)
            .single();

          const isPremium = subscription?.status === 'active';

          if (!isPremium) {
            console.warn('[ACCESS] Rejected: No active subscription for premium scenario');
            ws.send(JSON.stringify({ type: 'error', message: 'Subscription required' }));
            ws.close(4003, 'Subscription required');
            return;
          }

          // Check specialty match
          const requiredSpecialty = config.getScenarioSpecialty(scenarioFile);
          if (
            requiredSpecialty &&
            subscription.specialty &&
            subscription.specialty !== requiredSpecialty
          ) {
            console.warn(
              `[ACCESS] Rejected: Subscription specialty '${subscription.specialty}' does not match required '${requiredSpecialty}'`
            );
            ws.send(
              JSON.stringify({
                type: 'error',
                message: `This scenario requires a ${requiredSpecialty} subscription`
              })
            );
            ws.close(4003, 'Subscription required');
            return;
          }

          console.log('[ACCESS] Verified: Premium user accessing premium scenario');
        }
      } catch (err) {
        console.error('[ACCESS] Validation error:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Access validation failed' }));
        ws.close(4002, 'Validation error');
        return;
      }
    }

    // Access validated - create session using modular prompt assembly
    const scenarioPrompt = buildInterviewPrompt(difficulty, scenarioFile);
    const sessionId = generateSecureSessionId();

    // STT: Deepgram Flux (streaming WebSocket, model-integrated turn detection
    // and barge-in via StartOfTurn). DEEPGRAM_API_KEY is validated at startup.
    const fluxInstance = new FluxSTTService();
    try {
      await fluxInstance.initialize();
    } catch (fluxError) {
      console.error('[Flux] Failed to initialize:', fluxError.message);
      ws.send(JSON.stringify({ type: 'error', message: 'STT initialization failed' }));
      ws.close(1011, 'STT initialization failed');
      return;
    }

    sessions.set(sessionId, {
      history: [{ role: 'system', content: scenarioPrompt }],
      ws: ws,
      scenario: scenarioFile, // topicFolder
      voice: voice,
      difficulty: difficulty,
      userId: userId,
      isAISpeaking: false,
      inFeedbackMode: false,
      interviewEnded: false,
      feedbackCount: 0,
      flux: fluxInstance,
      lastActivity: Date.now(),
      _processingLock: Promise.resolve()
    });

    // Transcript pipeline: noise filter → display → push to history → LLM stream.
    async function processFinalTranscript(transcript, timeline) {
      const session = sessions.get(sessionId);
      if (!session || ws.readyState !== WebSocket.OPEN) {
        return;
      }
      if (session.interviewEnded) {
        console.log('[STT] Ignoring transcript after interview ended');
        return;
      }
      if (isNoiseTranscript(transcript)) {
        console.log('[STT] Filtered as noise');
        return;
      }
      ws.send(JSON.stringify({ type: 'user_transcript_display', text: transcript }));
      session.history.push({ role: 'user', content: transcript });
      await streamResponseToClient(session, ws, session.history, {
        temperature: 0.5,
        timeline
      });
    }

    fluxInstance.onSpeechStart = () => {
      const session = sessions.get(sessionId);
      if (!session) {
        return;
      }
      console.log(`[Flux] StartOfTurn for ${sessionId}`);
      // Real barge-in: if the AI is mid-response, stop it.
      if (session.isAISpeaking) {
        session.isAISpeaking = false;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'interrupt' }));
        }
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'vad_speech_start' }));
      }
    };

    fluxInstance.onTranscript = async (transcript, endOfTurnAt) => {
      console.log(`[Flux] EndOfTurn → "${transcript}"`);
      const timeline = createTurnTimeline(sessionId, endOfTurnAt || Date.now());
      timeline.mark('flux_endofturn');
      try {
        await processFinalTranscript(transcript, timeline);
      } catch (error) {
        console.error('[Flux] Pipeline error:', error.message);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'error', message: 'Processing failed' }));
        }
      }
    };

    fluxInstance.onError = err => {
      console.error('[Flux] Surface error to client:', err?.message || err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message: 'Speech recognition error' }));
      }
    };

    const domain = extractDomain(scenarioFile);
    const infoSheet = loadInfoSheet(scenarioFile);
    const prepTime = domain === 'call_the_boss' || domain === 'consent' ? 150 : 0;

    ws.send(
      JSON.stringify({
        type: 'scenario_loaded',
        sessionId: sessionId,
        scenario: scenarioFile,
        domain,
        infoSheet,
        prepTime
      })
    );

    // Set up message handler only after validation passes
    ws.on('message', async data => {
      // Parse, validate, and rate-check outside the lock (fast, stateless)
      let msg;
      try {
        msg = JSON.parse(data);
      } catch (parseError) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        return;
      }

      const validation = validateMessage(msg);
      if (!validation.valid) {
        console.warn(`[SECURITY] Invalid message rejected: ${validation.error}`);
        ws.send(JSON.stringify({ type: 'error', message: validation.error }));
        return;
      }

      const messageType = msg.type === 'audio_chunk' ? 'audio' : 'other';
      const rateCheck = wsRateLimiter.checkLimit(msg.sessionId, messageType);
      if (!rateCheck.allowed) {
        console.warn(
          `[SECURITY] Rate limit exceeded for session ${msg.sessionId}: ${rateCheck.reason}`
        );
        ws.send(JSON.stringify({ type: 'error', message: rateCheck.reason }));
        return;
      }

      // Cross-connection hijack guard: even though sessionId is a 122-bit UUID,
      // it gets logged in plaintext on several lines, so a log-reader could in
      // principle send messages targeting another user's session over their own
      // authenticated WS. Verify the session belongs to THIS socket.
      // Same error message in both branches so we don't leak whether the id was
      // valid-but-not-owned vs. genuinely unknown.
      const session = sessions.get(msg.sessionId);
      if (!session || session.ws !== ws) {
        ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
        return;
      }

      // Track activity for idle session cleanup
      session.lastActivity = Date.now();

      // Audio chunks are high-frequency and don't mutate history — process without lock.
      // Mic stays open during AI speech so Flux can detect barge-in via StartOfTurn.
      if (msg.type === 'audio_chunk') {
        try {
          if (session.inFeedbackMode || session.interviewEnded) {
            return;
          }
          const pcmData = Buffer.from(msg.audio, 'base64');
          session.flux.processChunk(pcmData);
        } catch (error) {
          console.error('[STT] Chunk processing error:', error.message);
        }
        return;
      }

      // All other messages serialized through per-session lock to prevent
      // concurrent streamResponseToClient calls from corrupting history
      session._processingLock = session._processingLock
        .then(async () => {
          try {
            switch (msg.type) {
              case 'user_transcript':
                if (session.interviewEnded) {
                  break;
                } // Ignore after interview ended
                console.log('[USER] ' + sanitizeForLog(msg.text));
                session.history.push({ role: 'user', content: msg.text });
                await streamResponseToClient(session, ws, session.history, { temperature: 0.5 });
                break;

              case 'user_speaking':
                if (session.isAISpeaking) {
                  session.isAISpeaking = false;
                  ws.send(JSON.stringify({ type: 'interrupt' }));
                }
                break;

              case 'end_interview':
                console.log('[INTERVIEW] End interview requested for session:', sessionId);
                session.interviewEnded = true;
                session.isAISpeaking = false;
                session.flux?.reset();
                ws.send(JSON.stringify({ type: 'interview_ended', sessionId }));
                break;

              case 'ai_finished':
                session.isAISpeaking = false;
                break;

              case 'request_feedback':
                // Guard against duplicate feedback requests
                if (session.feedbackCount > 0 || session.inFeedbackMode) {
                  console.log('[FEEDBACK] Already requested, ignoring duplicate');
                  break;
                }

                // Feedback: stream LLM → fire TTS per section → concatenate audio → single response
                console.log('[FEEDBACK] Starting streaming feedback flow');
                session.inFeedbackMode = true;
                session.interviewEnded = true;
                session.flux?.reset();
                try {
                  // 1. Serialize full conversation into transcript
                  const transcript = serializeTranscript(session.history);
                  console.log('[FEEDBACK] Transcript length:', transcript.length, 'chars');

                  // 2. Build modular feedback prompt (core + personality + clinical)
                  const feedbackPrompt = buildFeedbackPrompt(session.difficulty, session.scenario);

                  // 3. Stream LLM, start TTS for each section as it's detected
                  const feedbackMessages = [
                    { role: 'system', content: feedbackPrompt },
                    {
                      role: 'user',
                      content: 'Here is the interview transcript:\n\n' + transcript
                    }
                  ];

                  const sectionBuffer = new FeedbackSectionBuffer();
                  const ttsQueue = []; // { text, ttsPromise } — fire TTS eagerly, await in order
                  let fullText = '';
                  const t1 = Date.now();

                  ws.send(JSON.stringify({ type: 'feedback_processing' }));
                  session.isAISpeaking = true;

                  for await (const token of openaiService.generateResponseStream(feedbackMessages, {
                    max_tokens: 4000
                  })) {
                    fullText += token;

                    // Detect completed sections and start streaming TTS immediately
                    // (parallel buffering — all sections' streams run concurrently;
                    // the dispatch loop later drains them in order).
                    const completedSections = sectionBuffer.addToken(token);
                    for (const sectionText of completedSections) {
                      console.log(`[FEEDBACK] Section ${ttsQueue.length + 1} detected, firing TTS`);
                      ttsQueue.push(startBufferedSectionTTS(sectionText, session));
                    }
                  }

                  // Flush any remaining content after stream ends (last section before JSON)
                  const flushed = sectionBuffer.flush();
                  if (flushed && sectionBuffer.sectionStarted) {
                    console.log(`[FEEDBACK] Flushed final section ${ttsQueue.length + 1}`);
                    ttsQueue.push(startBufferedSectionTTS(flushed, session));
                  }

                  const t2 = Date.now();
                  console.log(
                    `[TIMING] Feedback LLM stream: ${t2 - t1}ms, ${ttsQueue.length} sections`
                  );

                  // 4. Parse full response for JSON summary
                  const parsed = parseFeedbackResponse(fullText);
                  console.log(
                    `[FEEDBACK] Parsed ${parsed.sections.length} sections, JSON: ${!!parsed.json}`
                  );
                  if (!parsed.json) {
                    console.warn(
                      '[FEEDBACK] JSON parsing failed. LLM response tail:',
                      fullText.slice(-500)
                    );
                  }

                  // Use parsed sections as fallback if stream detection missed any
                  const sections =
                    ttsQueue.length > 0 ? ttsQueue.map(q => q.text) : parsed.sections;
                  if (sections.length === 0) {
                    throw new Error('No feedback sections detected from LLM response');
                  }

                  // 5. Send JSON summary immediately (card shows on client)
                  let feedback = parsed.json;
                  if (!feedback) {
                    // Try to extract score from spoken feedback text (digit or word)
                    let extractedScore = null;
                    const scoreMatch = fullText.match(/\bscore\b[^.]*?\b([0-5])\b/i);
                    if (scoreMatch) {
                      extractedScore = parseInt(scoreMatch[1], 10);
                    } else {
                      const wordMap = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5 };
                      const wordMatch = fullText.match(
                        /\bscore\b[^.]*?\b(zero|one|two|three|four|five)\b/i
                      );
                      if (wordMatch) {
                        extractedScore = wordMap[wordMatch[1].toLowerCase()];
                      }
                    }
                    if (extractedScore !== null) {
                      console.log(`[FEEDBACK] Extracted score ${extractedScore} from spoken text`);
                    }
                    feedback = {
                      score: extractedScore ?? 0,
                      overallImpression: sections[0] || 'Feedback delivered via audio.',
                      clinicalKnowledge: {
                        diagnosis: 'See spoken feedback',
                        management: 'See spoken feedback'
                      },
                      strengths: ['See spoken feedback above'],
                      improvements: ['See spoken feedback above'],
                      summary: sections[0] || 'Feedback delivered via audio.'
                    };
                  }

                  ws.send(
                    JSON.stringify({
                      type: 'feedback_summary',
                      feedback: feedback
                    })
                  );
                  console.log('[FEEDBACK] Summary sent');

                  // 6. If stream detection missed sections, fire streaming TTS now as fallback
                  if (ttsQueue.length === 0 && parsed.sections.length > 0) {
                    for (const text of parsed.sections) {
                      ttsQueue.push(startBufferedSectionTTS(text, session));
                    }
                  }

                  // 7. Dispatch in order — for each section, drain its buffered chunks
                  // and send one feedback_response per WAV chunk. text only on the first
                  // chunk (frontend gates addMessage on chunkIndex===0). Parallel buffering
                  // means later sections are mostly ready by the time their turn comes.
                  for (let i = 0; i < ttsQueue.length; i++) {
                    if (ws.readyState !== WebSocket.OPEN) {
                      break;
                    }
                    const sectionEntry = ttsQueue[i];
                    let chunkIndex = 0;
                    for await (const wavChunk of sectionEntry.drain()) {
                      if (ws.readyState !== WebSocket.OPEN) {
                        break;
                      }
                      ws.send(
                        JSON.stringify({
                          type: 'feedback_response',
                          text: chunkIndex === 0 ? sectionEntry.text : '',
                          audio: wavChunk.toString('base64'),
                          section: i + 1,
                          totalSections: ttsQueue.length,
                          chunkIndex: chunkIndex++
                        })
                      );
                    }
                    session.feedbackCount = i + 1;
                  }

                  const t3 = Date.now();
                  console.log(`[TIMING] Feedback total (stream + TTS + delivery): ${t3 - t1}ms`);
                  session.inFeedbackMode = false;
                } catch (error) {
                  console.error('[FEEDBACK ERROR]', error.message);
                  const isRateLimit = error instanceof RateLimitError || error.isRateLimit;
                  if (isRateLimit) {
                    ws.send(
                      JSON.stringify({
                        type: 'error',
                        message: 'API rate limit reached. Please wait a moment and try again.',
                        code: 'RATE_LIMITED'
                      })
                    );
                  } else {
                    ws.send(
                      JSON.stringify({
                        type: 'feedback_summary',
                        feedback: {
                          score: null,
                          unavailable: true,
                          overallImpression: 'Feedback unavailable',
                          clinicalKnowledge: {
                            diagnosis: 'Feedback generation error',
                            management: 'Feedback generation error'
                          },
                          strengths: [],
                          improvements: [],
                          summary: 'Unable to generate detailed feedback. Please try again.'
                        }
                      })
                    );
                  }
                  session.inFeedbackMode = false;
                }
                break;
            }
          } catch (error) {
            console.error('[ERROR]', error.message);
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'An error occurred processing your request'
              })
            );
          }
        })
        .catch(err => {
          console.error('[LOCK] Handler error:', err.message);
        });
    });

    ws.on('close', () => {
      const session = sessions.get(sessionId);
      session?.flux?.destroy();
      sessions.delete(sessionId);
      wsRateLimiter.removeClient(sessionId);
      console.log(`[CLIENT] Disconnected: ${sessionId}`);
    });
  })();
});

// ============================================================================
// EXPRESS HTTP SERVER (for Stripe webhooks and REST endpoints)
// Express app created at top of file and shared with WebSocket via http.createServer
// ============================================================================

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Enable CORS for frontend
app.use(
  cors({
    origin: config.FRONTEND_URL || (config.isProduction ? false : '*'),
    methods: ['POST', 'GET', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'stripe-signature']
  })
);

// Security headers (helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://js.stripe.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'wss://*.onrender.com',
          'https://api.stripe.com'
        ],
        frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

// HTTPS enforcement in production
app.set('trust proxy', 1);
app.use((req, res, next) => {
  if (config.isProduction && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});

// Global rate limiter — applies to every HTTP request except /health (Render's
// uptime probe must never get 429'd). Specific routes layer additional limits
// on top of this (payments, prompt-lab) for tighter caps.
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 120 req/min/IP — generous default; specific limiters layer on top
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.path === '/health'
});
app.use(globalLimiter);

// Payment endpoints — single human checkout flow, so tight cap matches the
// "auth route" guidance: 5 attempts per 15 min per IP is plenty for a real user.
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many payment requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stripe webhook — Stripe may burst-retry events; keep this generous.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please slow down.' }
});

// Prompt Lab — tighter than the global default so a leaked bearer or brute
// force is throttled, but generous enough for a real admin editing session
// (load topics, edit, save, run tests = many small requests). Combined with
// promptLabAuth (Supabase Bearer + email allowlist) this is defense in depth.
const promptLabLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many Prompt Lab requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use('/create-checkout-session', paymentLimiter);
app.use('/create-portal-session', paymentLimiter);
app.use('/stripe-webhook', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Prompt Lab routes (text-only prompt testing environment).
// Gated by PROMPT_LAB_ENABLED in production; protected by promptLabAuth on
// every request (Supabase Bearer token + PROMPT_LAB_ADMIN_EMAILS allowlist).
// Json parser is bumped to 256kb because prompt sections can legitimately be
// 30-50KB; everything else stays at the default (100KB via express).
if (process.env.PROMPT_LAB_ENABLED === 'true' || !config.isProduction) {
  const promptLabRoutes = require('./src/routes/promptLab');
  const { promptLabAuth } = require('./src/middleware/promptLabAuth');
  app.use(
    '/prompt-lab/api',
    promptLabLimiter,
    promptLabAuth,
    express.json({ limit: '256kb' }),
    promptLabRoutes
  );
  console.log('[PROMPT LAB] Routes enabled at /prompt-lab/api (auth required)');
}

// Stripe webhook endpoint (must use raw body)
app.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json', limit: '64kb' }),
  async (req, res) => {
    if (!stripe || !supabaseAdmin) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
      return res.status(400).send('Webhook processing failed');
    }

    console.log('[STRIPE WEBHOOK] Event received:', event.type);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const customerId = session.customer;
          const subscriptionId = session.subscription;
          const priceType = session.metadata?.priceType || 'monthly';
          const specialty = session.metadata?.specialty || 'plastic-surgery';

          if (userId) {
            // Use upsert to create or update the subscription record
            await supabaseAdmin.from('subscriptions').upsert(
              {
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                price_type: priceType,
                specialty: specialty,
                created_at: new Date().toISOString()
              },
              {
                onConflict: 'user_id'
              }
            );

            console.log('[STRIPE] Subscription activated for user:', userId);
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const status = subscription.status === 'active' ? 'active' : 'past_due';

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log('[STRIPE] Subscription updated:', subscription.id, status);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;

          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id);

          console.log('[STRIPE] Subscription cancelled:', subscription.id);
          break;
        }
      }
    } catch (error) {
      console.error('[STRIPE WEBHOOK] Error processing event:', error);
    }

    res.json({ received: true });
  }
);

// Create Stripe checkout session with input validation
app.post(
  '/create-checkout-session',
  express.json(),
  [
    body('userId').isString().isLength({ min: 1, max: 100 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('priceType').optional().isIn(['monthly', 'annual']),
    body('specialty').optional().isString().isLength({ max: 50 }).trim().escape()
  ],
  async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[STRIPE] Validation errors:', errors.array());
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    try {
      const { userId, email, priceType = 'monthly', specialty = 'plastic-surgery' } = req.body;

      // Select price ID based on plan type
      const priceId =
        priceType === 'annual' ? config.STRIPE_PRICE_ID_ANNUAL : config.STRIPE_PRICE_ID_MONTHLY;

      // Verify price ID is configured
      if (!priceId) {
        console.error('[STRIPE] Price ID not configured for:', priceType);
        return res.status(500).json({ error: 'Payment configuration error' });
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${config.FRONTEND_URL}?payment=success`,
        cancel_url: `${config.FRONTEND_URL}?payment=cancelled`,
        metadata: { userId, priceType, specialty }
      });

      console.log(
        '[STRIPE] Checkout session created for:',
        email,
        'plan:',
        priceType,
        'specialty:',
        specialty
      );
      res.json({ url: session.url });
    } catch (error) {
      console.error('[STRIPE] Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Create Stripe customer portal session with input validation
app.post(
  '/create-portal-session',
  express.json(),
  [body('customerId').isString().isLength({ min: 1, max: 100 }).trim().escape()],
  async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[STRIPE] Portal validation errors:', errors.array());
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    try {
      const { customerId } = req.body;

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${config.FRONTEND_URL}?page=profile`
      });

      console.log('[STRIPE] Portal session created for customer:', customerId);
      res.json({ url: session.url });
    } catch (error) {
      console.error('[STRIPE] Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }
);

// Start shared HTTP + WebSocket server on single port
if (config.NODE_ENV !== 'test') {
  server.listen(config.PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${config.PORT} (HTTP + WebSocket)`);
  });
}

console.log('\nServer ready\n');

/**
 * Sentry initialisation — must run BEFORE any other require() so the SDK
 * can instrument http/express/etc. via Node's diagnostics_channel.
 *
 * server.js loads this file as its very first require:
 *
 *   require('./src/sentry-init');
 *   const config = require('./src/config');
 *   ...
 *
 * No-op when SENTRY_DSN is unset (i.e. local dev) so the rest of the
 * codebase stays Sentry-agnostic.
 */

require('dotenv').config();
const Sentry = require('@sentry/node');

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',

    // Error tracking only for now. Performance tracing + profiling are
    // available but cost-of-quota and signal-vs-noise aren't worth it at
    // this stage. Re-enable by raising tracesSampleRate to 0.1 or similar.
    tracesSampleRate: 0,

    // Don't auto-send IP, cookies, request bodies, or query strings — we
    // process audio transcripts that may quote patient details and any of
    // those default contexts could leak them.
    sendDefaultPii: false,

    beforeSend(event) {
      // Belt-and-braces PII strip. If any handler accidentally puts
      // transcript content in extra/contexts, redact it before send.
      const sensitiveKeys = [
        'transcript',
        'transcripts',
        'audio',
        'audioChunk',
        'audio_chunk',
        'user_transcript',
        'userTranscript',
        'feedbackText'
      ];
      for (const key of sensitiveKeys) {
        if (event.extra && event.extra[key]) {
          event.extra[key] = '[REDACTED]';
        }
        if (event.contexts && event.contexts[key]) {
          event.contexts[key] = '[REDACTED]';
        }
      }
      // Drop request body entirely — bodies on this server include base64
      // audio and transcripts, never anything we want in error events.
      if (event.request && event.request.data) {
        event.request.data = '[REDACTED]';
      }
      return event;
    }
  });

  console.log(`[CONFIG] Sentry enabled (env: ${process.env.NODE_ENV || 'development'})`);
}

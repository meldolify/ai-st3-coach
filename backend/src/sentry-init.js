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

/**
 * Strip sensitive query parameters from a URL string before it lands in
 * Sentry. Catches the WS legacy ?token= path (defence in depth — that
 * fallback is removed at server.js level in PR-2, but third-party SDKs
 * or middleware could still produce a URL with auth material in the
 * query) plus any access_token/refresh_token sometimes carried in
 * Supabase magic-link callbacks. Audit 2026-05-21 §LOW-07.
 */
const REDACTED_QUERY_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'apikey',
  'api_key'
]);
function scrubTokenFromUrl(rawUrl) {
  if (typeof rawUrl !== 'string') {
    return rawUrl;
  }
  // Match parsing must succeed even for relative URLs. Use a base when
  // the input is path-only so we don't throw inside the SDK's hot path.
  try {
    const u = new URL(rawUrl, 'http://placeholder.invalid');
    let mutated = false;
    for (const key of REDACTED_QUERY_KEYS) {
      if (u.searchParams.has(key)) {
        u.searchParams.set(key, 'REDACTED');
        mutated = true;
      }
    }
    if (!mutated) {
      return rawUrl;
    }
    // Rebuild without the placeholder host if the input was relative.
    if (rawUrl.startsWith('/') || !rawUrl.includes('://')) {
      return u.pathname + (u.search || '') + (u.hash || '');
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Keys whose values are redacted from Sentry events. Pulled out to module
 * scope so tests can assert the list is comprehensive and pin the contract.
 * Audit 2026-05-21 §LOW-07 extended this beyond just transcript content
 * to also cover Stripe/Supabase identifiers and authorization headers.
 */
const SENTRY_SENSITIVE_KEYS = [
  // Transcript / audio content (pre-existing PII concerns)
  'transcript',
  'transcripts',
  'audio',
  'audioChunk',
  'audio_chunk',
  'user_transcript',
  'userTranscript',
  'feedbackText',
  // Identifiers — pseudonymous but high-value if exfiltrated together
  'userId',
  'user_id',
  'email',
  'customerId',
  'stripe_customer_id',
  'stripe_subscription_id',
  // Auth-bearing values — should never be in an error event
  'authToken',
  'auth_token',
  'token',
  'access_token',
  'refresh_token',
  'Authorization',
  'authorization'
];

/**
 * beforeSend hook for Sentry.init. Mutates and returns the event with
 * sensitive fields redacted. Exported for unit tests.
 */
function beforeSend(event) {
  for (const key of SENTRY_SENSITIVE_KEYS) {
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
  // Scrub request URL query strings that carry tokens.
  if (event.request && typeof event.request.url === 'string') {
    event.request.url = scrubTokenFromUrl(event.request.url);
  }
  return event;
}

/**
 * beforeBreadcrumb hook — scrubs URL query tokens from in-flight breadcrumb
 * URLs (fetch, navigation). Exported for unit tests.
 */
function beforeBreadcrumb(breadcrumb) {
  if (breadcrumb.data && typeof breadcrumb.data.url === 'string') {
    breadcrumb.data.url = scrubTokenFromUrl(breadcrumb.data.url);
  }
  return breadcrumb;
}

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

    beforeSend,
    beforeBreadcrumb
  });

  console.log(`[CONFIG] Sentry enabled (env: ${process.env.NODE_ENV || 'development'})`);
}

module.exports = {
  beforeSend,
  beforeBreadcrumb,
  scrubTokenFromUrl,
  SENTRY_SENSITIVE_KEYS,
  REDACTED_QUERY_KEYS
};

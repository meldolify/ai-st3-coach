/**
 * Centralized configuration module
 * Loads environment variables with validation and defaults
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Handle Google Cloud credentials for production deployment
// In production, credentials are passed as a JSON string via environment variable
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const os = require('os');
  const crypto = require('crypto');
  const credsPath = path.join(
    os.tmpdir(),
    `gcloud-creds-${crypto.randomBytes(8).toString('hex')}.json`
  );
  fs.writeFileSync(credsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, { mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
  console.log('[CONFIG] Using Google Cloud credentials from environment variable');

  // Cleanup on exit
  const cleanup = () => {
    try {
      fs.unlinkSync(credsPath);
    } catch {
      /* ignore cleanup errors */
    }
  };
  process.on('exit', cleanup);
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
}

const config = {
  // Required — Gemini for LLM
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,

  // Deepgram Flux: streaming STT with model-integrated turn detection.
  // Required — this is the only STT path.
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,

  // LLM Configuration
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-2.5-flash',

  // Server ports with defaults
  PORT: parseInt(process.env.PORT, 10) || 8080,
  HTTP_PORT: parseInt(process.env.HTTP_PORT, 10) || 3000,

  // TTS Configuration
  TTS_VOICE: process.env.TTS_VOICE || 'Fenrir',
  TTS_MODEL_NAME: process.env.TTS_MODEL_NAME || 'gemini-3.1-flash-tts-preview',
  // Locale passed to speechConfig.languageCode. Without this, voices default
  // to en-US regardless of style tags. en-GB locks British English delivery.
  TTS_LANGUAGE_CODE: process.env.TTS_LANGUAGE_CODE || 'en-GB',

  // Gemini TTS style tags — keyed by difficulty level.
  // Per Gemini 3.1 Flash TTS guidance: voices default to American English, so
  // the British accent has to be specified explicitly via the tag. Tone is
  // calibrated for an OSCE-style examiner (calm/neutral/firm — never friendly).
  TTS_STYLE_PROMPTS: {
    easy: '[British accent, calm, supportive examiner tone]',
    medium: '[British accent, professional, neutral examiner tone, measured pace]',
    strict: '[British accent, firm, formal examiner tone, no warmth, brisk pace]'
  },

  // Paths
  PROMPTS_DIR: path.join(__dirname, '../../prompts'),

  // Optional - Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

  // Optional - Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  STRIPE_PRICE_ID_MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRICE_ID,
  STRIPE_PRICE_ID_ANNUAL: process.env.STRIPE_PRICE_ID_ANNUAL,

  // Frontend URL for redirects (default 5500 matches frontend serve config)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5500',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Development - bypass auth/subscription checks for local testing
  DEV_BYPASS_AUTH: process.env.DEV_BYPASS_AUTH === 'true',

  // Debug flags
  DEBUG_VAD: process.env.DEBUG_VAD === 'true',

  // Sentry error tracking. When set, server.js initialises @sentry/node
  // BEFORE any other require so auto-instrumentation can patch http/express.
  // When unset, Sentry calls no-op and nothing is reported.
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Daily per-user audio caps (minutes). Defense-in-depth against runaway
  // Deepgram/Gemini cost from a single user holding a session open. Free
  // and premium tiers have separate caps; premium is intentionally generous
  // so honest users never hit it. Set 0 to disable.
  DAILY_AUDIO_MINUTES_FREE: parseInt(process.env.DAILY_AUDIO_MINUTES_FREE, 10) || 30,
  DAILY_AUDIO_MINUTES_PREMIUM: parseInt(process.env.DAILY_AUDIO_MINUTES_PREMIUM, 10) || 240,

  // Global daily LLM-call kill-switch. If aggregate LLM calls across ALL
  // users exceeds this in a single UTC day, every further request returns
  // a soft "service unavailable" error. Insurance against runaway abuse
  // or a bug pinning the LLM. Set 0 to disable.
  MAX_DAILY_LLM_CALLS: parseInt(process.env.MAX_DAILY_LLM_CALLS, 10) || 0,

  // Free tier scenarios - topicFolder paths accessible without subscription
  // Keep in sync with frontend-react/src/config.js FREE_TIER_SCENARIOS
  // All 3 difficulties are implicitly included per topic
  FREE_TIER_SCENARIOS: [
    'clinical/emergencies/necrotising_fasciitis',
    'call_the_boss/scenarios/major_burn',
    'consent/hand_surgery/carpal_tunnel_release_consent',
    'structured_interview/audit'
  ],

  // Specialty mapping — maps top-level scenario folder prefix to subscription specialty
  // Keep in sync with frontend-react/src/config.js
  SPECIALTY_MAP: {
    clinical: 'plastic-surgery',
    call_the_boss: 'plastic-surgery',
    consent: 'plastic-surgery',
    structured_interview: 'plastic-surgery'
  },

  // Get the required specialty for a scenario topicFolder
  getScenarioSpecialty(topicFolder) {
    const prefix = topicFolder.split('/')[0];
    return this.SPECIALTY_MAP[prefix] || null;
  },

  // Computed flags
  get isStripeEnabled() {
    return !!this.STRIPE_SECRET_KEY;
  },
  get isSupabaseEnabled() {
    return !!(this.SUPABASE_URL && this.SUPABASE_SERVICE_KEY);
  },
  get isProduction() {
    return this.NODE_ENV === 'production';
  }
};

// Validation - exit if required variables are missing
function validateConfig() {
  if (!config.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }
  if (!config.DEEPGRAM_API_KEY) {
    console.error('ERROR: DEEPGRAM_API_KEY not found in .env file (required for STT)');
    process.exit(1);
  }

  console.log(`[CONFIG] LLM model: ${config.LLM_MODEL}`);
  console.log(`[CONFIG] TTS model: ${config.TTS_MODEL_NAME}`);
  console.log('[CONFIG] STT: Deepgram Flux');

  // Log optional service status
  if (config.isStripeEnabled) {
    console.log('[CONFIG] Stripe payment processing enabled');
  }
  if (config.isSupabaseEnabled) {
    console.log('[CONFIG] Supabase database connection enabled');
  }

  // Production-only guardrails. These don't crash dev workflows; they catch
  // common misconfigurations that have caused real outages (CORS broken when
  // FRONTEND_URL is missing, Prompt Lab returning 503 when admin allowlist
  // isn't set, DEV_BYPASS_AUTH accidentally left on in prod, etc.).
  if (config.isProduction) {
    if (!process.env.FRONTEND_URL) {
      console.error(
        'ERROR: FRONTEND_URL must be set in production (CORS allow-list depends on it)'
      );
      process.exit(1);
    }
    if (config.DEV_BYPASS_AUTH) {
      console.error('FATAL: DEV_BYPASS_AUTH=true in production — refusing to start');
      process.exit(1);
    }
    if (
      process.env.PROMPT_LAB_ENABLED === 'true' &&
      !(process.env.PROMPT_LAB_ADMIN_EMAILS || '').trim()
    ) {
      console.warn(
        '[CONFIG] WARNING: PROMPT_LAB_ENABLED=true but PROMPT_LAB_ADMIN_EMAILS is unset — Prompt Lab will return 503 for every request'
      );
    }
    // Partial Stripe config means checkout silently breaks. Warn loudly.
    const stripeVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_ID_MONTHLY'];
    const stripeSet = stripeVars.filter(k => process.env[k]).length;
    if (stripeSet > 0 && stripeSet < stripeVars.length) {
      console.warn(
        `[CONFIG] WARNING: Stripe is partially configured (${stripeSet}/${stripeVars.length} keys set) — payments will fail`
      );
    }
    // Stripe in test mode while NODE_ENV=production silently no-ops live billing.
    // Audit 2026-05-21 §MED-04: caught this during the audit when live probing
    // returned `cs_test_*` checkout URLs from production. Fail-loud on next deploy.
    if ((process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_')) {
      console.warn(
        '[CONFIG] WARNING: Stripe is in TEST mode (sk_test_*) but NODE_ENV=production — checkout will not bill real cards. Flip to a sk_live_ key before launch.'
      );
    }
    // Same for Supabase
    const supabaseVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
    const supabaseSet = supabaseVars.filter(k => process.env[k]).length;
    if (supabaseSet > 0 && supabaseSet < supabaseVars.length) {
      console.warn(
        '[CONFIG] WARNING: Supabase is partially configured — auth/subscription checks will silently fail'
      );
    }
  }
}

// Run validation on load (unless in test environment)
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config;

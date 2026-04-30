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
  // Required — Gemini for LLM, OpenAI for Whisper STT
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,

  // Deepgram Flux (streaming STT with model-integrated turn detection).
  // Set USE_FLUX_STT=true to route a session through Flux instead of ServerVAD + Whisper.
  // Default false so production keeps current ServerVAD + Whisper path.
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
  USE_FLUX_STT: process.env.USE_FLUX_STT === 'true',

  // LLM Configuration
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-2.5-flash',

  // Server ports with defaults
  PORT: parseInt(process.env.PORT, 10) || 8080,
  HTTP_PORT: parseInt(process.env.HTTP_PORT, 10) || 3000,

  // TTS Configuration
  TTS_VOICE: process.env.TTS_VOICE || 'Fenrir',
  TTS_MODEL_NAME: process.env.TTS_MODEL_NAME || 'gemini-3.1-flash-tts-preview',

  // Gemini TTS style tags — keyed by difficulty level
  // Inline audio tags per Gemini 3.1 Flash TTS guidance. Voice choice does the
  // heavy lifting; tags nudge tone without competing with the spoken content.
  TTS_STYLE_PROMPTS: {
    easy: '[warm, conversational]',
    medium: '[professional, measured]',
    strict: '[firm, brisk, formal]'
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
  if (!config.OPENAI_API_KEY) {
    console.warn('WARNING: OPENAI_API_KEY not found — Whisper STT will not work');
  }
  if (config.USE_FLUX_STT && !config.DEEPGRAM_API_KEY) {
    console.warn(
      'WARNING: USE_FLUX_STT=true but DEEPGRAM_API_KEY not set — sessions will fall back to ServerVAD + Whisper'
    );
  }

  console.log(`[CONFIG] LLM model: ${config.LLM_MODEL}`);
  console.log(
    `[CONFIG] STT path: ${config.USE_FLUX_STT ? 'Deepgram Flux' : 'ServerVAD + Whisper'}`
  );

  // Log optional service status
  if (config.isStripeEnabled) {
    console.log('[CONFIG] Stripe payment processing enabled');
  }
  if (config.isSupabaseEnabled) {
    console.log('[CONFIG] Supabase database connection enabled');
  }
}

// Run validation on load (unless in test environment)
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config;

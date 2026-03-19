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

  // LLM Configuration
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-2.5-flash',

  // Server ports with defaults
  PORT: parseInt(process.env.PORT, 10) || 8080,
  HTTP_PORT: parseInt(process.env.HTTP_PORT, 10) || 3000,

  // TTS Configuration
  TTS_VOICE: process.env.TTS_VOICE || 'Fenrir',
  TTS_MODEL_NAME: process.env.TTS_MODEL_NAME || 'gemini-2.5-flash-preview-tts',

  // Gemini TTS style prompts — keyed by difficulty level
  // Controls vocal delivery: tone, emotion, pacing, prosody (NOT conversational behaviour)
  TTS_STYLE_PROMPTS: {
    easy: `Audio profile: Warm, reassuring male British voice with gentle resonance and a slight smile in the tone.
Scene: A calm, supportive clinical teaching environment. The atmosphere is relaxed and encouraging.
Director's notes: Speak with genuine warmth and patience. Natural conversational pace — not rushed, but not drawn out. Brief natural pauses after questions. Soft emphasis on key words rather than sharp stress. Light upward inflection on questions to sound inviting. Let encouragement come through in vocal colour — a slight lift in pitch when acknowledging good points. Breathe naturally between phrases.`,
    medium: `Audio profile: Professional, composed female British voice with clear articulation and neutral warmth.
Scene: A formal but fair examination room. The tone is businesslike and measured.
Director's notes: Even, steady pacing throughout — neither rushed nor lingering. Crisp consonants, clean vowel sounds. Keep emotional colouring minimal and neutral. Brief natural pauses between topic transitions. Questions delivered with level intonation — clinical precision without coldness. Maintain consistent vocal energy from start to finish. Slight downward inflection at the end of statements, slight rise on questions.`,
    strict: `Audio profile: Authoritative, crisp male British voice with commanding low-register presence and gravitas.
Scene: A high-stakes examination room. The atmosphere is intense and focused.
Director's notes: Brisk, purposeful delivery with tight pacing and minimal pauses between phrases. Clipped consonants, firm emphasis on key terminology. Downward inflection conveys weight and seriousness. No vocal warmth — keep tone dry and matter-of-fact. Slightly faster tempo than conversational speech. When asking questions, deliver them with a direct, expectant tone. Let silences after questions feel deliberate and pressuring.`
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
  // Keep in sync with frontend/config.js FREE_TIER_SCENARIOS
  // All 3 difficulties are implicitly included per topic
  FREE_TIER_SCENARIOS: [
    'clinical/emergencies/necrotising_fasciitis',
    'call_the_boss/scenarios/major_burn',
    'consent/hand_surgery/carpal_tunnel_release_consent',
    'structured_interview/audit'
  ],

  // Specialty mapping — maps top-level scenario folder prefix to subscription specialty
  // Keep in sync with frontend/config.js and frontend-react/src/config.js
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

  console.log(`[CONFIG] LLM model: ${config.LLM_MODEL}`);

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

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
  const credsPath = '/tmp/credentials.json';
  fs.writeFileSync(credsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, { mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
  console.log('[CONFIG] Using Google Cloud credentials from environment variable');
}

const config = {
  // Required
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,

  // Server ports with defaults
  PORT: parseInt(process.env.PORT, 10) || 8080,
  HTTP_PORT: parseInt(process.env.HTTP_PORT, 10) || 3000,

  // TTS Configuration
  TTS_VOICE: process.env.TTS_VOICE || 'en-GB-Neural2-D',

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

  // Free tier scenarios - scenarios accessible without subscription
  // Keep in sync with frontend/config.js FREE_TIER_SCENARIOS
  FREE_TIER_SCENARIOS: [
    // Clinical > Emergencies > Necrotising Fasciitis
    'prompts/clinical/emergencies/necrotising_fasciitis/easy_clinical_necrotising_fasciitis_1.txt',
    'prompts/clinical/emergencies/necrotising_fasciitis/medium_clinical_necrotising_fasciitis_1.txt',
    'prompts/clinical/emergencies/necrotising_fasciitis/strict_clinical_necrotising_fasciitis_1.txt',

    // Call-The-Boss > Scenarios > Major Burn
    'prompts/call_the_boss/scenarios/major_burn/easy_call_the_boss_major_burn_1.txt',
    'prompts/call_the_boss/scenarios/major_burn/medium_call_the_boss_major_burn_1.txt',
    'prompts/call_the_boss/scenarios/major_burn/strict_call_the_boss_major_burn_1.txt',

    // Consent > Hand Surgery > Carpal Tunnel Release
    'prompts/consent/hand_surgery/carpal_tunnel_release_consent/easy_consent_carpal_tunnel_release_consent_1.txt',
    'prompts/consent/hand_surgery/carpal_tunnel_release_consent/medium_consent_carpal_tunnel_release_consent_1.txt',
    'prompts/consent/hand_surgery/carpal_tunnel_release_consent/strict_consent_carpal_tunnel_release_consent_1.txt',

    // Structured Interview > Audit > Focused Interview
    'prompts/structured_interview/audit/focused_interview/easy_structured_interview_focused_interview_1.txt',
    'prompts/structured_interview/audit/focused_interview/medium_structured_interview_focused_interview_1.txt',
    'prompts/structured_interview/audit/focused_interview/strict_structured_interview_focused_interview_1.txt'
  ],

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
  if (!config.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

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

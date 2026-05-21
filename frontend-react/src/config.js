// Frontend configuration. Kept in sync with backend/src/config/index.js.

const hostname = window.location.hostname
const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname) || import.meta.env.DEV

export const CONFIG = {
  BACKEND_URL: isLocal
    ? 'ws://localhost:8080'
    : 'wss://api.reviva.live',

  HTTP_BACKEND_URL: isLocal
    ? 'http://localhost:8080'
    : 'https://api.reviva.live',

  SUPABASE_URL: 'https://vsdiovgjnbziwwukpvqo.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZGlvdmdqbmJ6aXd3dWtwdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjkxOTUsImV4cCI6MjA4MzkwNTE5NX0.iTanR6urX6H7-818YEWAN6jn0rXQBny8VANRJ-6qdBk',

  // Sentry DSN — set via VITE_SENTRY_DSN in Vercel env vars (one for preview,
  // one for production). Leave blank in local dev — the SDK no-ops when
  // unset so nothing leaks from your laptop into the prod Sentry quota.
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',

  FREE_TIER_SCENARIOS: [
    'clinical/emergencies/necrotising_fasciitis',
    'call_the_boss/scenarios/major_burn',
    'consent/hand_surgery/carpal_tunnel_release_consent',
    'structured_interview/audit',
  ],

  // Specialty mapping — maps top-level scenario folder prefix to subscription specialty
  // Keep in sync with backend/src/config/index.js
  SPECIALTY_MAP: {
    'clinical': 'plastic-surgery',
    'call_the_boss': 'plastic-surgery',
    'consent': 'plastic-surgery',
    'structured_interview': 'plastic-surgery',
  },

  getScenarioSpecialty(topicFolder) {
    const prefix = topicFolder.split('/')[0]
    return this.SPECIALTY_MAP[prefix] || null
  },
}

// Single source of truth for displayed pricing strings.
// Stripe price IDs are configured server-side via env vars; this object is
// only the user-facing copy. To change displayed prices, edit here only.
// To change the actual Stripe charge amounts, update the Stripe Price
// objects + STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_ANNUAL env vars.
export const PRICING = {
  monthly: {
    amount: '£19.99',
    period: '/month',
  },
  annual: {
    amount: '£119.99',
    period: '/year',
    monthlyEquivalent: '£9.99/mo',
    savings: '£120',
  },
}

// Persona configuration for each difficulty level
export const PERSONA_CONFIG = {
  easy: {
    name: 'Mr John',
    title: 'Consultant Plastic Surgeon',
    roleLabel: 'Easy Examiner',
    description:
      'Your friendly neighborhood consultant who remembers being a trainee. Warm encouragement, generous hints, and celebrates your wins.',
    image: '/images/interviewer_persona_john.png',
    imageWide: '/images/interviewer_persona_john_wide.png',
    voice: 'Fenrir',
    accentColor: '#10B981',
  },
  medium: {
    name: 'Miss Elliot',
    title: 'Senior Examiner',
    roleLabel: 'Balanced Examiner',
    description:
      'Fair and balanced. The real ST3 interview experience. Straight-shooting feedback with occasional nudges.',
    image: '/images/interviewer_persona_elliot.png',
    imageWide: '/images/interviewer_persona_elliot_wide.png',
    voice: 'Kore',
    accentColor: '#F59E0B',
  },
  strict: {
    name: 'Mr Perry',
    title: 'Chief Examiner',
    roleLabel: 'Strict Examiner',
    description:
      "No nonsense. High standards. Expects excellence or you'll hear about it. Brutally honest with sky-high expectations.",
    image: '/images/interviewer_persona_perry.png',
    imageWide: '/images/interviewer_persona_perry_wide.png',
    voice: 'Charon',
    accentColor: '#EF4444',
  },
}

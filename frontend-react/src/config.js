// Frontend configuration — mirrors frontend/config.js for React app

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

  FREE_TIER_SCENARIOS: [
    'clinical/emergencies/necrotising_fasciitis',
    'call_the_boss/scenarios/major_burn',
    'consent/hand_surgery/carpal_tunnel_release_consent',
    'structured_interview/audit',
  ],

  // Specialty mapping — maps top-level scenario folder prefix to subscription specialty
  // Keep in sync with backend/src/config/index.js and frontend/config.js
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

// Persona configuration for each difficulty level
export const PERSONA_CONFIG = {
  easy: {
    name: 'Mr John',
    title: 'Consultant Plastic Surgeon',
    image: '/images/interviewer_persona_john.png',
    imageWide: '/images/interviewer_persona_john_wide.png',
    voice: 'Fenrir',
    accentColor: '#10B981',
  },
  medium: {
    name: 'Miss Elliot',
    title: 'Senior Examiner',
    image: '/images/interviewer_persona_elliot.png',
    imageWide: '/images/interviewer_persona_elliot_wide.png',
    voice: 'Kore',
    accentColor: '#F59E0B',
  },
  strict: {
    name: 'Mr Perry',
    title: 'Chief Examiner',
    image: '/images/interviewer_persona_perry.png',
    imageWide: '/images/interviewer_persona_perry_wide.png',
    voice: 'Charon',
    accentColor: '#EF4444',
  },
}

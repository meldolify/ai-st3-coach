// Configuration for different environments
const CONFIG = {
  // Automatically detect environment and use appropriate backend URL
  BACKEND_URL: (() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:8080';
    }

    // Production - use secure WebSocket (wss://)
    // Update this with your Railway/Render backend URL after deployment
    const productionBackendUrl = 'ai-st3-coach-backend.onrender.com'; // Render backend URL

    if (productionBackendUrl === 'YOUR_BACKEND_URL_HERE') {
      console.warn('⚠️ Production backend URL not configured. Update config.js with your deployment URL.');
      return 'ws://localhost:8080'; // Fallback to local
    }

    return `wss://${productionBackendUrl}`;
  })(),

  // HTTP Backend URL for REST endpoints (Stripe, etc.)
  HTTP_BACKEND_URL: (() => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    return 'https://ai-st3-coach-backend.onrender.com';
  })(),

  // Supabase Configuration
  SUPABASE_URL: 'https://vsdiovgjnbziwwukpvqo.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZGlvdmdqbmJ6aXd3dWtwdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjkxOTUsImV4cCI6MjA4MzkwNTE5NX0.iTanR6urX6H7-818YEWAN6jn0rXQBny8VANRJ-6qdBk',

  // Free tier scenarios (paths that free users can access)
  // Format must match: prompts/{heading}/{subheading}/{topic}/{difficulty}_{heading}_{topic}_1.txt
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

  // Speech Recognition Configuration
  // V4.4: Push-to-Talk (PTT) - user clicks to record, no VAD needed
  SPEECH_RECOGNITION: {
    USE_PUSH_TO_TALK: true,        // true = PTT mode (click to record)
    WHISPER_PRIMARY: true          // true = Whisper transcription
  }
};

// Log current configuration
console.log('[CONFIG] Backend URL:', CONFIG.BACKEND_URL);

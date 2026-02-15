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
    const productionBackendUrl = 'api.reviva.live'; // Custom domain for Render backend

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
      return 'http://localhost:8080';
    }

    return 'https://api.reviva.live';
  })(),

  // Supabase Configuration
  SUPABASE_URL: 'https://vsdiovgjnbziwwukpvqo.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZGlvdmdqbmJ6aXd3dWtwdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjkxOTUsImV4cCI6MjA4MzkwNTE5NX0.iTanR6urX6H7-818YEWAN6jn0rXQBny8VANRJ-6qdBk',

  // Free tier scenarios (topicFolder paths that free users can access)
  // All 3 difficulties are implicitly included per topic
  FREE_TIER_SCENARIOS: [
    'clinical/emergencies/necrotising_fasciitis',
    'call_the_boss/scenarios/major_burn',
    'consent/hand_surgery/carpal_tunnel_release_consent',
    'structured_interview/audit/focused_interview'
  ],

  // Speech Recognition Configuration
  // V4.5: VAD mode (continuous voice detection) or PTT fallback
  SPEECH_RECOGNITION: {
    USE_PUSH_TO_TALK: false,       // false = VAD mode (continuous)
    USE_VAD: true,                 // Enable Silero VAD via @ricky0123/vad-web
    WHISPER_PRIMARY: true,         // true = Whisper transcription

    // VAD Configuration (used by VADManager.js)
    VAD: {
      POSITIVE_THRESHOLD: 0.3,     // Speech detection start threshold (sensitive)
      NEGATIVE_THRESHOLD: 0.2,     // Speech detection end threshold (sensitive)
      PRE_SPEECH_FRAMES: 10,       // ~300ms pre-roll buffer
      REDEMPTION_FRAMES: 12,       // ~360ms hangover delay (allow natural pauses)
      MIN_SPEECH_FRAMES: 2,        // ~60ms minimum speech duration
      INTERRUPT_MIN_MS: 200,       // Minimum duration for interrupt during TTS
      POST_TTS_COOLDOWN_MS: 250    // Cooldown after TTS ends (prevent echo with speakers)
    }
  }
};

// Log current configuration
console.log('[CONFIG] Backend URL:', CONFIG.BACKEND_URL);

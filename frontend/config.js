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
  // Format must match: prompts/{topicFolder}/{difficulty}_{folderName}_1.txt
  FREE_TIER_SCENARIOS: [
    // Clinical > Emergencies > Necrotising Fasciitis
    'prompts/clinical_stations/emergencies/necrotising_fasciitis/easy_necrotising_fasciitis_1.txt',
    'prompts/clinical_stations/emergencies/necrotising_fasciitis/medium_necrotising_fasciitis_1.txt',
    'prompts/clinical_stations/emergencies/necrotising_fasciitis/hard_necrotising_fasciitis_1.txt',

    // Communication > Call-The-Boss > Resus Burn
    'prompts/communication/call_boss/call_boss_resus_burn/easy_call_boss_resus_burn_1.txt',
    'prompts/communication/call_boss/call_boss_resus_burn/medium_call_boss_resus_burn_1.txt',
    'prompts/communication/call_boss/call_boss_resus_burn/hard_call_boss_resus_burn_1.txt',

    // Structured Interview > Research
    'prompts/structured_interview/structured_research/easy_structured_research_1.txt',
    'prompts/structured_interview/structured_research/medium_structured_research_1.txt',
    'prompts/structured_interview/structured_research/hard_structured_research_1.txt'
  ],

  // Speech Recognition Configuration
  // Whisper is more accurate for medical terminology but requires backend call
  // Web Speech API is free and instant but less accurate
  SPEECH_RECOGNITION: {
    WHISPER_PRIMARY: true,  // true = Whisper primary, Web Speech fallback
                            // false = Web Speech primary, Whisper fallback (legacy)
    SILENCE_THRESHOLD: 0.025,      // RMS threshold for voice activity detection
    SILENCE_DURATION_MS: 1500,     // Stop recording after this much silence
    MIN_RECORDING_MS: 500          // Minimum recording duration to send
  }
};

// Log current configuration
console.log('[CONFIG] Backend URL:', CONFIG.BACKEND_URL);

I# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ST3 Plastic Surgery Interview Trainer V4 - A cost-optimized voice-based AI interview trainer using Web Speech API + GPT-4o-mini + Google Cloud TTS. Achieved 94% cost reduction vs V3 (Realtime API).

**Architecture:** Browser → Web Speech API (STT) → WebSocket → GPT-4o-mini → Google Cloud TTS → Audio playback

## Production Deployment

- **Frontend:** https://www.reviva.live/ (Vercel)
- **Backend API:** https://api.reviva.live/ (Render)
- **WebSocket:** wss://api.reviva.live/

### Stripe Webhook URL
```
https://api.reviva.live/stripe-webhook
```

### Environment Variables on Render
The backend on Render requires these environment variables:
- `OPENAI_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON string, not file path)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_ANNUAL`
- `FRONTEND_URL=https://www.reviva.live`

## Commands

### Development

```bash
# Backend development (with auto-restart)
cd backend
npm run dev

# Frontend development server
cd frontend
npx serve -s . -l 5500

# Alternative frontend server
node serve.js
```

### Testing

```bash
cd backend

# Run all tests with coverage
npm test

# Watch mode (auto-run on changes)
npm run test:watch

# Run specific test file
npx jest __tests__/scenario-loader.test.js
```

**Test Suite:** 51 unit tests covering scenario loading, WebSocket, VAD logic, GPT integration, and TTS integration. Coverage thresholds: 70% (branches, functions, lines, statements).

### Code Quality

```bash
cd backend

# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Production

```bash
# Backend production server
cd backend
npm start

# Frontend static server
cd frontend
node serve.js
```

### Debugging

Open in VS Code and press `F5`:
- **Backend: Debug WebSocket Server** - Debug main server
- **Backend: Debug with Nodemon** - Debug with auto-restart
- **Backend: Debug Jest Tests** - Debug tests
- **Frontend: Launch Chrome with Debugger** - Debug frontend
- **Full Stack: Backend + Frontend** - Debug both simultaneously

## Architecture

### Message Flow

1. **Speech Input:** Web Speech API (browser-native, FREE) → continuous transcription
2. **WebSocket Communication:** Client sends `user_transcript` → Server processes
3. **AI Processing:** GPT-4o-mini generates text response (maintains full conversation history)
4. **Voice Output:** Google Cloud TTS synthesizes speech → Base64 MP3 sent to client
5. **Audio Playback:** Browser plays audio → Microphone pauses during AI speech

### WebSocket Message Types

**Client → Server:**
- `user_transcript` - User speech transcript from Web Speech API
- `whisper_audio` - Audio blob for Whisper transcription (fallback for browsers without Web Speech API)
- `user_speaking` - User started speaking (triggers AI interrupt)
- `ai_finished` - AI audio playback completed

**Server → Client:**
- `scenario_loaded` - Session initialized with scenario prompt
- `ai_response` - AI text + base64 MP3 audio
- `whisper_transcript` - Transcribed text from Whisper API
- `interrupt` - Signal to stop AI audio playback
- `error` - Error message

### Session Management

Sessions stored in `Map<sessionId, SessionData>` where SessionData contains:
- `history` - GPT conversation history (array of {role, content})
- `ws` - WebSocket connection
- `scenario` - Scenario file path
- `voice` - TTS voice name
- `isAISpeaking` - Boolean flag for interrupt handling
- `inFeedbackMode` - Boolean flag for feedback detection
- `feedbackCount` - Counter for feedback turns

### Scenario Loading

Scenarios stored in hierarchical structure: `backend/prompts/{category}/{subcategory}/{difficulty}_{name}_{variant}.txt`

Examples:
- `prompts/clinical_stations/emergencies/easy_nec_fasc_1.txt`
- `prompts/communication/call_boss/medium_call_boss_compromised_flap_1.txt`
- `prompts/structured_interview/structured_ethics/easy_structured_ethics_1.txt`

**Total:** 231 scenario files organized by:
- Clinical Stations (Breast/Aesthetic, Burns, Elective Hand, Emergencies, Hand Trauma, Miscellaneous, Skin Cancer)
- Communication (Call Boss, Consent)
- Structured Interview (Audit, Consent, Ethics, Research, Risk Management, Teaching)

File loading uses `loadScenarioPrompt(scenarioFile)` with path traversal protection.

### Authentication & Subscription (Optional)

If Supabase configured (`SUPABASE_URL` + `SUPABASE_SERVICE_KEY`):
- User authentication via Supabase Auth
- Three-tier access: Unlogged (no access) → Free (limited) → Premium (full)
- Subscription management via Stripe integration
- Session history tracking in database

**Subscription Model:** Per-specialty pricing (currently Plastic Surgery ST3 only)
- Monthly: £14.99/month
- Annual: £99.99/year (save £80)

If not configured, runs in demo mode without authentication.

### Noise Filtering

`isNoiseTranscript(text)` filters Whisper transcriptions for:
- Empty/very short text (< 2 chars)
- Repeated characters (e.g., "sssss", "uhhhh")
- Common noise patterns (um, uh, er, ah, oh, hm)
- Single word responses (yes, no, okay)
- Echo pickups from AI ("thank you", "that's fine")

Prevents false positives from triggering unnecessary AI responses.

### TTS Voice Configuration

Change voice in `backend/server.js:46`:

```javascript
const TTS_VOICE = 'en-GB-Neural2-D';  // Change this line
```

**Available British Voices:**
- `en-GB-Neural2-B` - Male, Professional
- `en-GB-Neural2-D` - Male, Fast (current default)
- `en-GB-Wavenet-D` - Male, Natural
- `en-GB-Studio-D` - Male, Premium quality
- `en-GB-Neural2-A` - Female, Professional
- `en-GB-Neural2-C` - Female, Warmer

Voice can also be specified per-session via WebSocket query parameter: `?voice=en-GB-Neural2-B`

### SSML Processing

`buildNaturalSSML(text)` adds natural pauses:
- Period (`.`) → `<break strength="medium"/>`
- Question mark (`?`) → `<break strength="medium"/>`
- Comma (`,`) → `<break strength="weak"/>`

## Critical File Structure

```
backend/
├── server.js                      # Main WebSocket server (637 lines)
│   ├── Lines 1-55: Initialization (OpenAI, Google TTS, env vars)
│   ├── Lines 58-62: Session ID generation
│   ├── Lines 64-95: Scenario loading with security checks
│   ├── Lines 97-147: Noise filtering logic
│   ├── Lines 149-160: SSML builder
│   ├── Lines 162-175: GPT-4o-mini wrapper
│   ├── Lines 177-208: Google TTS wrapper
│   ├── Lines 210-340: WebSocket message handlers
│   └── Lines 340+: HTTP endpoints (Stripe, Supabase integration)
├── prompts/                       # 231 scenario files (hierarchical)
├── __tests__/                     # 51 unit tests
│   ├── scenario-loader.test.js
│   ├── server.test.js
│   ├── vad-logic.test.js
│   ├── gpt-integration.test.js
│   └── tts-integration.test.js
└── package.json                   # Dependencies + scripts

frontend/
├── index.html                     # UI (~1,800 lines)
├── js/                            # Modular JavaScript (refactored from monolithic index.js)
│   ├── app.js                     # Main application logic (~620 lines)
│   ├── auth.js                    # Supabase authentication (~830 lines)
│   ├── scenarios.js               # Scenario selection & navigation (~950 lines)
│   ├── session.js                 # V4Session WebSocket management (~560 lines)
│   ├── speech.js                  # Web Speech API / Whisper integration (~385 lines)
│   ├── sidebar.js                 # Simulation room sidebar navigation (~385 lines)
│   ├── mock-exam.js               # Mock exam mode logic (~800 lines)
│   ├── orb-visualizer.js          # Voice orb WebGL animation (~500 lines)
│   ├── ui-helpers.js              # UI utility functions (~450 lines)
│   ├── state.js                   # Global state variables (~85 lines)
│   ├── browser-detect.js          # Browser compatibility checks (~325 lines)
│   ├── subscription.js            # Stripe subscription handling (~105 lines)
│   ├── tracking.js                # Analytics tracking (~50 lines)
│   ├── glow-effect.js             # Visual effects (~310 lines)
│   ├── features-*.js              # Landing page animations (~360 lines total)
│   ├── vad/                       # Voice Activity Detection
│   │   ├── VADManager.js          # SileroVAD wrapper (~270 lines)
│   │   └── SimpleVAD.js           # Volume-based VAD fallback (~470 lines)
│   └── utils/
│       └── audio-utils.js         # Shared audio utilities (~100 lines)
├── config.js                      # Environment config (Supabase, Stripe)
└── serve.js                       # Static file server
```

## Environment Variables

Required in `backend/.env`:

```bash
# Required for core functionality
OPENAI_API_KEY=sk-...              # GPT-4o-mini API key
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-key.json

# Optional - Server ports
PORT=8080                          # WebSocket port
HTTP_PORT=3000                     # HTTP server port

# Optional - Authentication & Payments
SUPABASE_URL=https://...           # Supabase project URL
SUPABASE_SERVICE_KEY=eyJ...        # Service role key
STRIPE_SECRET_KEY=sk_...           # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...    # Stripe webhook secret
STRIPE_PRICE_ID_MONTHLY=price_...  # Monthly subscription (£14.99)
STRIPE_PRICE_ID_ANNUAL=price_...   # Annual subscription (£99.99)
FRONTEND_URL=https://www.reviva.live  # Frontend URL for redirects
```

For production deployment, `GOOGLE_APPLICATION_CREDENTIALS_JSON` can be used instead of file path.

## Browser Compatibility

**Supported:** Chrome, Edge (Web Speech API required)
**Not Supported:** Safari, Firefox (no Web Speech API - use Whisper API fallback)

## Cost Structure

Per 5-minute session:
- Web Speech API: £0.00 (free)
- GPT-4o-mini: £0.0002 (8 turns × 200 tokens)
- Google TTS: £0.0001 (800 chars × 8 turns)
- **Total: £0.0003** (vs £0.25 for V3)

## Development Practices

### Before Committing
1. Run tests: `npm test`
2. Fix linting: `npm run lint:fix`
3. Update `DEVELOPMENT_LOG.md` with significant changes

### Debugging Strategy
- Use VS Code debugger (F5) instead of console.log
- Set breakpoints in `server.js` for WebSocket issues
- Use Chrome DevTools for frontend debugging
- Check `DEVELOPMENT_LOG.md` for known issues

### Test Coverage
Maintain 70% coverage threshold. Add tests for:
- New message types
- Scenario loading logic
- GPT integration changes
- TTS parameter modifications

## Common Tasks

### Adding New Scenarios

1. Create prompt file: `backend/prompts/{category}/{subcategory}/{difficulty}_{name}_{variant}.txt`
2. Follow existing prompt structure (system instructions for GPT)
3. Add to frontend scenario menu in `frontend/index.html`
4. Optional: Add clinical image to `frontend/images/`

### Changing AI Behavior

Modify GPT parameters in `server.js:162-175`:
- `model` - Default: gpt-4o-mini
- `temperature` - Default: 0.7 (conversational)
- `max_tokens` - Default: 150 (concise responses)

### Changing Voice Quality

Modify TTS parameters in `server.js:177-208`:
- `speakingRate` - Default: 1.0 (normal speed)
- `volumeGainDb` - Default: 0.0 (no gain)
- `audioEncoding` - Default: MP3

### Modifying Noise Filter

Edit `isNoiseTranscript()` in `server.js:97-147`:
- Add patterns to `noisePatterns` array
- Adjust uniqueChars threshold for repeated characters
- Test with `npm run test:watch`

## Key Technical Decisions

1. **Web Speech API over Whisper:** 100% cost reduction on STT, but Chrome/Edge only
2. **GPT-4o-mini over GPT-4:** 99% cost reduction, sufficient for conversational AI
3. **Google TTS over OpenAI TTS:** Better British voices, lower latency
4. **WebSocket over HTTP:** Real-time bidirectional communication for interrupts
5. **Session-based conversation history:** Full context maintained per session
6. **SSML for natural speech:** Adds pauses without artificial emphasis
7. **Noise filtering:** Prevents false positives from ambient audio

## Known Issues & Gotchas

- **Web Speech API continuous mode:** Requires manual restart after each recognition (handled in `frontend/index.js`)
- **Microphone pausing:** Must pause during AI speech to prevent echo/feedback
- **Path traversal security:** `loadScenarioPrompt()` validates file paths to prevent directory traversal attacks
- **Google Cloud credentials:** Production deployment requires JSON credentials passed as environment variable
- **Stripe webhooks:** Must be configured for subscription management
- **Session cleanup:** No automatic cleanup - sessions persist until WebSocket disconnect

## Git Workflow

- **Main branch:** `main` (stable, production-ready)
- **Backup tag:** `pre-dev-environment-setup` (rollback point before dev environment changes)
- **Development log:** Track all changes in `DEVELOPMENT_LOG.md`
- Recent commits focused on: VAD tuning, development environment setup, testing framework

## Development Tools

### UI Annotator (`frontend/tools/ui-annotator.html`)

Interactive playground for visually annotating UI elements and generating design change requests.

**Usage:**
1. Start frontend server: `cd frontend && npx serve . -l 5500` (note: no `-s` flag)
2. Open: `http://localhost:5500/tools/ui-annotator.html`
3. Navigate pages via tabs, click to add markers, fill in change requests
4. Copy generated prompt and paste to Claude for implementation

**Features:** 10 page tabs, priority-colored markers, persistent localStorage, markdown output

See `frontend/tools/README.md` for full documentation.

## External Documentation

- Google TTS: https://cloud.google.com/text-to-speech
- OpenAI API: https://platform.openai.com/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Jest: https://jestjs.io/
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs/api

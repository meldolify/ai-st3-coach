# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MANDATORY: Superpowers Workflow

**ALWAYS invoke `superpowers:using-superpowers` at the start of EVERY conversation.** This is non-negotiable and must happen before any other action, exploration, or response.

**After every commit**, invoke `superpowers:using-superpowers` again to re-establish the skill-checking workflow before continuing with the next task.

These rules ensure consistent use of the superpowers skill system for all work in this repository.

## Overview

ST3 Plastic Surgery Interview Trainer V4 — A cost-optimized voice-based AI interview trainer using Web Speech API + GPT-4o-mini + Google Cloud TTS. 94% cost reduction vs V3.

**Architecture:** Browser → Web Speech API (STT) → WebSocket → GPT-4o-mini → Google Cloud TTS → Audio playback

Two-page app: `index.html` (landing/auth/selection) + `simulation.html` (standalone sim room). State transfer via `sessionStorage` (simulationParams).

**Critical gotchas:**
- Do NOT use `npx serve -s` for frontend — SPA mode redirects simulation.html to index.html. Use `python -m http.server` or `npx serve` without `-s`
- `FREE_TIER_SCENARIOS` list in `frontend/config.js` and `backend/src/config/index.js` MUST stay in sync

## Architecture

### Message Flow

1. Web Speech API (free, browser-native) → continuous transcription
2. Client sends `user_transcript` via WebSocket
3. GPT-4o-mini generates response (full conversation history)
4. Google Cloud TTS synthesizes speech → Base64 MP3
5. Browser plays audio, mic pauses during AI speech

### WebSocket Message Types

**Client → Server:** `user_transcript` (speech text), `whisper_audio` (audio blob fallback), `audio_chunk` (raw PCM for server VAD), `user_speaking` (triggers interrupt), `ai_finished` (playback done)

**Server → Client:** `scenario_loaded` (session init), `ai_response` (text + base64 MP3), `whisper_transcript` (Whisper result), `vad_speech_start` / `user_transcript_display` (server VAD), `interrupt` (stop playback), `error`

### Session Management

Sessions: `Map<sessionId, SessionData>` with fields: `history` (GPT messages), `ws` (WebSocket), `scenario` (file path), `voice` (TTS name), `userId`, `isAISpeaking`, `inFeedbackMode`, `feedbackCount`

### Simulation Page

Separate HTML (`simulation.html`) for state isolation. Navigation: index.html → save params to sessionStorage → redirect to simulation.html → on exit redirect to index.html#scenarioSelection

State transfer: `simulationParams = { scenario: {title, promptFile, imageFile, category}, difficulty, mode, mockExamType, returnPage }`

Key files: `frontend/simulation.html`, `frontend/js/simulation-app.js` (entry point), `frontend/js/state.js` (save/load params), `frontend/js/sidebar.js` (performScenarioSwitch)

### Access Control

- **Layer 1:** Client-side `canAccessScenario(promptFile)` in simulation-app.js:548-558 → denied redirects to index.html#accessDenied
- **Layer 2:** Hash handler in app.js:751-762 detects #accessDenied → shows upgrade modal
- **Layer 3:** Server-side in server.js:119-177 — WebSocket URL includes `userId` and `token` query params, validates auth token via Supabase, checks subscription in database. Error codes: 4001 (Unauthorized), 4002 (Validation), 4003 (Subscription required). Free tier scenarios bypass auth check.

Tier logic (`subscription.js:canAccessScenario`): Unlogged → ALL denied. Free → FREE_TIER_SCENARIOS only. Premium → all allowed. Defined in `frontend/config.js` + `backend/src/config/index.js`

### Scenario Loading

`backend/prompts/{category}/{subcategory}/{difficulty}_{name}_{variant}.txt` — 231 files.

Examples:
- `prompts/clinical_stations/emergencies/easy_nec_fasc_1.txt`
- `prompts/communication/call_boss/medium_call_boss_compromised_flap_1.txt`
- `prompts/structured_interview/structured_ethics/easy_structured_ethics_1.txt`

Categories: Clinical Stations (Breast/Aesthetic, Burns, Elective Hand, Emergencies, Hand Trauma, Miscellaneous, Skin Cancer), Communication (Call Boss, Consent), Structured Interview (Audit, Consent, Ethics, Research, Risk Management, Teaching). Loading via `loadScenarioPrompt()` with path traversal protection.

### Authentication & Subscription

Optional: Supabase Auth + Stripe subscriptions. Three-tier: Unlogged → Free → Premium. Monthly £14.99/month, Annual £99.99/year (save £80). Session history tracking in database. Demo mode if Supabase not configured.

### Server-Side VAD

AudioStreamer (ScriptProcessorNode, 4096 buffer) → 16kHz mono Int16 PCM → base64 → WS `audio_chunk` → ServerVAD (Silero VAD v4 ONNX) → speech detection → Whisper → GPT → TTS

### Feedback System

On End → NEW GPT session with dedicated feedback prompt + transcript → 6 spoken sections with TTS → JSON summary (max_tokens: 500). Score 0-5. Prompts in `backend/prompts/feedback/`. `feedbackHistory[]` separate from interview history.

### Prompt Lab (Text-Only Prompt Testing)

Text-in/text-out environment for rapid prompt iteration without STT/TTS overhead. REST API (no WebSocket). Accessible at `/prompt-lab` (Vercel clean URLs).

**Architecture:** Browser → REST `/prompt-lab/api/*` → GPT-4o-mini (no TTS) → JSON responses. Sessions use in-memory Map with `pl_` prefixed IDs, separate from production sessions.

**Features:**
- 4-tab inline prompt editor (Core Behaviours, Difficulty/Personality, Clinical Scenario, Feedback Prompt)
- Manual chat interface with feedback trigger (returns all 6 sections + JSON summary at once)
- 7 automated test scripts with assertion system (good/poor/excellent/derailing/questioning/feedback_interrupt/disruptive candidates)
- Transcript saving and viewer

**Test prompts isolated** in `backend/prompts/test/` (copied from production). Currently nec fasc only, all 3 difficulties. 3 difficulty-specific feedback prompts with different examiner personalities (easy=John/supportive, medium=Elliot/balanced, strict=Perry/rigorous).

**Gating:** `PROMPT_LAB_ENABLED=true` env var in production (Render). Auto-enabled in dev (`!config.isProduction`). No auth — hidden URL only.

**Key files:** `backend/src/routes/promptLab.js` (12 REST endpoints), `backend/src/services/PromptLabService.js` (session/chat/feedback/tests/transcripts), `backend/src/utils/promptParser.js` (3-section parse/combine), `frontend/prompt-lab.html` (single-page UI with embedded JS), `frontend/css/prompt-lab.css`

### Critical File Structure

```
backend/
├── server.js                      # Main WebSocket server (~637 lines)
│   ├── Lines 1-55: Initialization (OpenAI, Google TTS, env vars)
│   ├── Lines 58-62: Session ID generation
│   ├── Lines 64-95: Scenario loading with security checks
│   ├── Lines 97-147: Noise filtering logic
│   ├── Lines 149-160: SSML builder
│   ├── Lines 162-175: GPT-4o-mini wrapper
│   ├── Lines 177-208: Google TTS wrapper
│   ├── Lines 210-340: WebSocket message handlers
│   └── Lines 340+: HTTP endpoints (Stripe, Supabase integration)
├── src/services/ServerVAD.js      # Silero VAD + float32ToWavBuffer
├── src/services/PromptLabService.js # Prompt Lab: sessions, chat, feedback, tests, transcripts
├── src/routes/promptLab.js        # Prompt Lab REST API (12 endpoints at /prompt-lab/api)
├── src/utils/promptParser.js      # Parse/combine 3-section prompt format
├── prompts/                       # 231 scenario files (hierarchical)
├── prompts/test/                  # Isolated test prompts for Prompt Lab (nec fasc)
├── prompts/test/feedback/         # Difficulty-specific feedback prompts (easy/medium/strict)
├── test-scripts/                  # Automated test definitions (7 JSON files)
├── test-results/                  # Saved transcripts (git-ignored)
├── __tests__/                     # 51 unit tests
│   ├── scenario-loader.test.js
│   ├── server.test.js
│   ├── vad-logic.test.js
│   ├── gpt-integration.test.js
│   └── tts-integration.test.js
└── package.json                   # Dependencies + scripts

frontend/
├── index.html                     # Main app: landing, auth, scenario selection (~1,800 lines)
├── simulation.html                # Standalone simulation room page (~1,080 lines)
├── js/
│   ├── app.js                     # Main app logic, hash navigation (~770 lines)
│   ├── auth.js                    # Supabase authentication (~830 lines)
│   ├── scenarios.js               # Scenario selection & navigation (~950 lines)
│   ├── session.js                 # V4Session WebSocket + auth params (~590 lines)
│   ├── simulation-app.js          # simulation.html entry point, access check (~630 lines)
│   ├── speech.js                  # Web Speech API / Whisper integration (~385 lines)
│   ├── sidebar.js                 # Sidebar navigation, scenario switching (~715 lines)
│   ├── mock-exam.js               # Mock exam mode logic (~800 lines)
│   ├── orb-visualizer.js          # Voice orb WebGL animation (~500 lines)
│   ├── ui-helpers.js              # UI utility functions (~450 lines)
│   ├── state.js                   # Global state + sessionStorage helpers (~145 lines)
│   ├── browser-detect.js          # Browser compatibility checks (~325 lines)
│   ├── subscription.js            # Stripe + tier access control (~245 lines)
│   ├── tracking.js                # Analytics tracking (~75 lines)
│   ├── glow-effect.js             # Visual effects (~310 lines)
│   ├── features-*.js              # Landing page animations (~360 lines total)
│   ├── audio-streamer.js          # Browser audio capture & streaming
│   ├── vad/                       # Voice Activity Detection (legacy, not loaded)
│   │   ├── VADManager.js          # SileroVAD wrapper (~270 lines)
│   │   └── SimpleVAD.js           # Volume-based VAD fallback (~470 lines)
│   └── utils/
│       └── audio-utils.js         # Shared audio utilities (~100 lines)
├── prompt-lab.html                # Prompt Lab: text-only prompt testing UI (single-page, embedded JS)
├── css/prompt-lab.css             # Prompt Lab styles (dark theme)
├── config.js                      # Environment config (Supabase, Stripe, FREE_TIER_SCENARIOS)
└── serve.js                       # Static file server (port 3001, CWD-relative paths)

e2e-tests/                           # Playwright E2E tests (22 specs)
├── tests/
│   ├── landing.spec.ts              # Landing page (5 tests)
│   ├── navigation.spec.ts          # Multi-page navigation (5 tests)
│   ├── access-control.spec.ts      # Tier access control (5 tests)
│   └── simulation-room.spec.ts     # Simulation room UI (7 tests)
├── fixtures/
│   ├── test-user.ts                 # freeUser/premiumUser page fixtures
│   └── mock-data.ts                 # Test scenarios from FREE_TIER_SCENARIOS
├── helpers/
│   ├── tier-control.ts              # setTestTier() + setTierViaRoute()
│   ├── navigation.ts               # navigateToSimulation(), clearSimulationParams()
│   └── selectors.ts                 # Centralized DOM selectors
```

## Testing

### Unit Tests

```bash
cd backend && npm test              # All with coverage
npm run test:watch                  # Auto-run on changes
npx jest __tests__/scenario-loader.test.js  # Specific file
```

51 tests covering scenario loading, WebSocket, VAD, GPT, TTS. Coverage thresholds: 70% (branches, functions, lines, statements). Maintain threshold — add tests for new message types, scenario loading logic, GPT integration changes, TTS parameter modifications.

Known: 5 pre-existing failures in config.test.js (env isolation), server.js has 0% coverage, ServerVAD.js has 0% coverage.

### E2E Tests (Playwright)

```bash
npm run test:e2e           # Headless
npm run test:e2e:headed    # Visible browser
npm run test:e2e:ui        # Interactive debug
npm run test:e2e:debug     # Step-through
npm run test:e2e:report    # HTML report
npx playwright test e2e-tests/tests/landing.spec.ts  # Specific file
```

22 specs across 4 files:
- `landing.spec.ts` (5) — Page load, hero section, navigation links, CTA, Explore flow
- `navigation.spec.ts` (5) — Guest browse, sessionStorage transfer, simulation room load, missing params redirect, exit navigation
- `access-control.spec.ts` (5) — Free/premium tier access via `canAccessScenario()`, denied access redirect, upgrade modal
- `simulation-room.spec.ts` (7) — Room layout, voice orb, control buttons, sidebar categories, AI status, transcript, scenario switching

Architecture: Chromium only (Web Speech API). `playwright.config.ts` auto-starts frontend (serve.js on 3001) and backend (server.js on 8080). Screenshots/videos/traces on failure in `e2e-tests/test-results/`.

Tier testing uses `page.route()` to intercept `state.js` and modify `testTierOverride` at source level (`e2e-tests/helpers/tier-control.ts:setTierViaRoute`). NOT `addInitScript` — `testTierOverride` is let-scoped, not window property.

Fixtures: `freeUser`/`premiumUser` in `e2e-tests/fixtures/test-user.ts`. Helpers: `navigateToSimulation()`, `clearSimulationParams()`. Selectors in `e2e-tests/helpers/selectors.ts`.

### Code Quality

```bash
cd backend
npm run lint          # Check
npm run lint:fix      # Auto-fix
npm run format        # Prettier
```

## Deployment

- **Frontend:** https://www.reviva.live/ (Vercel)
- **Backend API:** https://api.reviva.live/ (Render)
- **WebSocket:** wss://api.reviva.live/
- **Stripe webhook:** https://api.reviva.live/stripe-webhook

### Render Environment Variables

`OPENAI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON string not file path), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_ANNUAL`, `FRONTEND_URL=https://www.reviva.live`, `PROMPT_LAB_ENABLED=true`

### Local Environment (`backend/.env`)

```bash
# Required
OPENAI_API_KEY=sk-...
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-key.json

# Optional
PORT=8080
HTTP_PORT=3000
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...   # £14.99
STRIPE_PRICE_ID_ANNUAL=price_...    # £99.99
FRONTEND_URL=https://www.reviva.live
```

Google Cloud credentials: local uses file path (`GOOGLE_APPLICATION_CREDENTIALS`), production uses JSON string (`GOOGLE_APPLICATION_CREDENTIALS_JSON`).

Production server: `cd backend && npm start`. Frontend static: `cd frontend && node serve.js`.

## Audio

### TTS Voice Configuration

Set in `backend/server.js:46`: `const TTS_VOICE = 'en-GB-Neural2-D'`. Also settable per-session via WS query param `?voice=en-GB-Neural2-B`.

**Available British voices:** en-GB-Neural2-B (Male Professional), en-GB-Neural2-D (Male Fast, default), en-GB-Wavenet-D (Male Natural), en-GB-Studio-D (Male Premium), en-GB-Neural2-A (Female Professional), en-GB-Neural2-C (Female Warmer)

TTS params in server.js:177-208: `speakingRate=1.0`, `volumeGainDb=0.0`, `audioEncoding=MP3`

### SSML Processing

`buildNaturalSSML(text)` adds pauses: period → `<break strength="medium"/>`, question mark → `<break strength="medium"/>`, comma → `<break strength="weak"/>`

### Noise Filtering

`isNoiseTranscript(text)` in server.js:97-147 filters empty/short (<2 chars), repeated chars, noise patterns (um/uh/er/ah), single words (yes/no/okay), echo pickups.

### Server-Side VAD Details

Silero VAD v4 ONNX (`backend/models/silero_vad_v4.onnx` ~1.72MB). Frame=1536 samples@16kHz (~96ms). Thresholds: pos=0.3, neg=0.2. Pre-speech buffer=10 frames (~960ms). v5 model did NOT work.

Audio pipeline: AudioStreamer (ScriptProcessorNode, bufferSize=4096) → 16kHz mono Int16 PCM (~1365 samples/chunk) → base64 → WS `audio_chunk`. Gain normalization: quiet audio boosted up to 50x for VAD, original sent to Whisper.

Key files: `backend/src/services/ServerVAD.js`, `frontend/js/audio-streamer.js`, `frontend/js/session.js`

### Browser Compatibility

Chrome + Edge supported (Web Speech API required). Safari + Firefox not supported (uses Whisper API fallback).

### Cost Structure

Per 5-min session: Web Speech API £0.00, GPT-4o-mini £0.0002, Google TTS £0.0001. **Total: £0.0003** (vs £0.25 for V3 — 94% reduction).

## Development Workflow

### Dev Servers

```bash
cd backend && npm run dev                    # Nodemon auto-restart
cd frontend && python -m http.server 5500    # OR: npx serve . -l 5500 (NO -s flag!)
node serve.js                                # Alternative frontend server
```

### Debugging

VS Code (F5): Backend Debug WebSocket Server, Backend Debug with Nodemon, Backend Debug Jest Tests, Frontend Launch Chrome with Debugger, Full Stack Backend + Frontend

Strategy: Use VS Code debugger instead of console.log. Breakpoints in server.js for WebSocket issues. Chrome DevTools for frontend. `npm run test:e2e:ui` for Playwright trace viewer. Check `DEVELOPMENT_LOG.md`.

### Before Committing

1. `cd backend && npm test`
2. `npm run test:e2e`
3. `npm run lint:fix`
4. Update `DEVELOPMENT_LOG.md`

### Common Tasks

- **Adding scenarios:** Create `backend/prompts/{category}/{subcategory}/{difficulty}_{name}_{variant}.txt`, follow existing structure, add to frontend menu in `index.html`, optional image in `frontend/images/`
- **Changing AI behavior:** server.js:162-175 — `model` (gpt-4o-mini), `temperature` (0.7), `max_tokens` (150)
- **Changing voice quality:** server.js:177-208 — `speakingRate` (1.0), `volumeGainDb` (0.0), `audioEncoding` (MP3)
- **Modifying noise filter:** `isNoiseTranscript()` in server.js:97-147 — add to `noisePatterns` array, adjust `uniqueChars` threshold

### Key Technical Decisions

1. **Web Speech API over Whisper:** 100% cost reduction on STT, but Chrome/Edge only
2. **GPT-4o-mini over GPT-4:** 99% cost reduction, sufficient for conversational AI
3. **Google TTS over OpenAI TTS:** Better British voices, lower latency
4. **WebSocket over HTTP:** Real-time bidirectional communication for interrupts
5. **Session-based conversation history:** Full context maintained per session
6. **SSML for natural speech:** Adds pauses without artificial emphasis
7. **Noise filtering:** Prevents false positives from ambient audio

### Git Workflow

Main branch: `main` (stable, production-ready). Backup tag: `pre-dev-environment-setup`. Track changes in `DEVELOPMENT_LOG.md`.

### Known Issues & Gotchas

- Web Speech API needs manual restart after each recognition (handled in `frontend/index.js`)
- Mic must pause during AI speech (echo/feedback prevention)
- Session cleanup only on WS disconnect — no automatic cleanup
- Path traversal security in `loadScenarioPrompt()`
- Google Cloud credentials: production requires JSON credentials as environment variable
- Stripe webhooks must be configured for subscription management
- Mock exam still runs in index.html (unification deferred)
- Most prompts are placeholders (only nec fasc fully developed)
- `frontend/js/vad/` files still exist but not loaded

### Dev Tools

**Prompt Lab** at `frontend/prompt-lab.html`:
- Local: `http://localhost:3000/prompt-lab.html` (backend serves frontend static files)
- Production: `https://www.reviva.live/prompt-lab` (Vercel clean URLs strip `.html`)
- REST API: 12 endpoints at `/prompt-lab/api/` (session, chat, feedback, prompts CRUD, tests, transcripts)
- Test scripts in `backend/test-scripts/necrotising_fasciitis/` (7 JSON files)
- Transcripts saved to `backend/test-results/` (git-ignored)

UI Annotator at `frontend/tools/ui-annotator.html`:
1. Start frontend server: `cd frontend && npx serve . -l 5500` (no `-s` flag)
2. Open: `http://localhost:5500/tools/ui-annotator.html`
3. Navigate pages via tabs, click to add markers, fill in change requests
4. Copy generated prompt and paste to Claude for implementation

Features: 10 page tabs, priority-colored markers, persistent localStorage, markdown output. See `frontend/tools/README.md`.

## External Documentation

- Google TTS: https://cloud.google.com/text-to-speech
- OpenAI API: https://platform.openai.com/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Jest: https://jestjs.io/
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs/api

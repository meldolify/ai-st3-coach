# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MANDATORY: Superpowers Workflow

**ALWAYS invoke `superpowers:using-superpowers` at the start of EVERY conversation.** This is non-negotiable and must happen before any other action, exploration, or response.

**After every commit**, invoke `superpowers:using-superpowers` again to re-establish the skill-checking workflow before continuing with the next task.

These rules ensure consistent use of the superpowers skill system for all work in this repository.

## Overview

ST3 Plastic Surgery Interview Trainer V4 — A voice-based AI interview trainer using Server-Side VAD + Whisper + Gemini 2.5 Flash + Gemini TTS.

**Architecture:** Browser AudioStreamer → WebSocket PCM → Server VAD (Silero v4) → Whisper STT → Gemini 2.5 Flash → Gemini TTS (WAV) → Audio playback

**React SPA** in `frontend-react/` builds to `frontend/` for Vercel. React Router v7 handles all pages. Backend is a Node.js WebSocket + Express server.

**Critical gotchas:**
- `FREE_TIER_SCENARIOS` list must stay in sync across THREE files: `frontend/config.js`, `frontend-react/src/config.js`, and `backend/src/config/index.js`
- `SPECIALTY_MAP` must also stay in sync across the same three files
- Do NOT use `npx serve -s` for static frontend — SPA mode breaks direct file access
- Vanilla files in `frontend/js/` and `frontend/css/` are **orphaned** — not loaded by the React SPA. Only `frontend-react/` source is active.

## Frontend (React SPA)

Source in `frontend-react/`, Vite builds to `frontend/` (sibling directory) for Vercel deployment. Dev server on port 3001.

### Routes & Pages

All routes use lazy loading with `<Suspense fallback={<LoadingFallback />}>`:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPage | Hero, Three.js bg, GSAP scroll animations |
| `/login` | AuthPage | Email/password + Google OAuth, split-panel modal |
| `/scenarios/*` | ScenarioFlow | State machine: specialty → difficulty → mode → [mock type] → scenarios |
| `/simulation` | SimulationRoom | Interview room: voice orb, sidebar, transcript |
| `/profile` | ProfilePage | Account info, subscription management |
| `/prompt-lab` | PromptLab | Text-only prompt testing (3-panel dark theme) |
| `*` | Navigate('/') | Fallback redirect |

### State Management (Zustand)

- **authStore** (`src/stores/authStore.js`) — `currentUser`, `userProfile`, `userSubscription`, `authLoading`. Only `authMode` persisted to localStorage. Sensitive fields restored by `useAuth` hook on each page load.
- **selectionStore** (`src/stores/selectionStore.js`) — Scenario selection state (specialty, difficulty, mode, scenario nav). Persisted to sessionStorage.
- **sessionStore** (`src/stores/sessionStore.js`) — WebSocket session, connection state, AI speaking flag. No persistence (memory only).

### Authentication Flow

`useAuth` hook called at App root (runs on every route navigation):
1. `supabaseClient.auth.getSession()` → restore session from localStorage
2. If session found: set `authStore.currentUser`, fetch profile + subscription from DB, set `window.currentUser` (legacy compat)
3. `onAuthStateChange` listener for token refresh / logout in other tabs
4. `setAuthLoading(false)` when complete

Supabase client created in `src/lib/supabase.js` (also sets `window.supabaseClient`).

### Access Control (Client-Side)

`canAccessScenario(scenarioPath)` in `src/lib/subscription.js`:
- **Unlogged** → ALL denied (login required beyond landing page)
- **Free tier** → `FREE_TIER_SCENARIOS` only
- **Premium (active/trialing)** → All allowed, specialty-scoped via `getScenarioSpecialty()`

### Key Files

```
frontend-react/
├── src/
│   ├── App.jsx                    # Router + ErrorBoundary + useAuth at root
│   ├── config.js                  # URLs, Supabase keys, FREE_TIER_SCENARIOS, SPECIALTY_MAP, PERSONA_CONFIG
│   ├── stores/                    # Zustand: authStore, selectionStore, sessionStore
│   ├── hooks/
│   │   ├── useAuth.js             # Session restore + store hydration
│   │   ├── useSession.js          # WebSocket + audio orchestrator (main interview hook)
│   │   ├── useSimulationParams.js # Read sessionStorage params
│   │   └── useEscapeKey.js        # Modal escape handler
│   ├── lib/
│   │   ├── supabase.js            # Supabase client + window global
│   │   ├── subscription.js        # canAccessScenario, isPremiumUser, startCheckout, openCustomerPortal
│   │   ├── AudioPlayer.js         # Base64 MP3/WAV queue player
│   │   ├── AudioStreamer.js       # PCM mic capture + WS streaming
│   │   └── OrbVisualizer.js       # Canvas 5-layer audio-reactive orb
│   ├── components/                # SimulationRoom, VoiceOrb, Sidebar, TranscriptPanel, Header, etc.
│   ├── pages/                     # LandingPage/, Auth/, Scenarios/, Profile/, PromptLab/
│   └── data/
│       └── scenarios.js           # CATEGORIES, SUBCATEGORIES, TOPICS for scenario selection
├── vite.config.js                 # Build to ../frontend/, proxy WS + API in dev
└── package.json                   # React 19, Vite 7.3, Tailwind v4, Framer Motion 12, Zustand 5
```

## Backend

Node.js server combining WebSocket (interview sessions) + Express HTTP (Stripe, Prompt Lab API, health check). Single file `server.js` (~1,219 lines) plus modular services/utils/routes.

### Message Flow

1. Browser `AudioStreamer` (ScriptProcessorNode, 4096 buffer) → 16kHz mono Int16 PCM → base64
2. Client sends `audio_chunk` via WebSocket (mic stays open during AI speech for barge-in)
3. **STT — Deepgram Flux**: streaming WebSocket. `StartOfTurn` triggers automatic barge-in (interrupt the AI mid-response). `EndOfTurn` delivers the final transcript via model-integrated turn detection.
4. **LLM — Gemini 2.5 Flash**: streams tokens, `streamResponseToClient` accumulates the full turn before TTS.
5. **TTS — Gemini 3.1 Flash TTS** via `generateContentStream`: yields WAV chunks as the model decodes them. Each chunk is shipped to the client as a separate `ai_response_chunk` so first audio plays ~500–1000 ms after LLM stream end (vs ~5 s for non-streaming).
6. Client receives `ai_response_start`, then N × `ai_response_chunk`, then `ai_response_end`. `AudioPlayer` queues and plays chunks in order.

### WebSocket Message Types

**Client → Server:** `audio_chunk` (raw 16kHz PCM, forwarded to Flux), `user_transcript` (speech text), `user_speaking` (manual interrupt), `ai_finished` (playback done), `request_feedback`, `end_interview`

**Server → Client:** `scenario_loaded` (session init), `ai_response` / `ai_response_start` / `ai_response_chunk` / `ai_response_end` (streaming responses), `user_transcript_display` (VAD detected speech), `vad_speech_start`, `feedback_processing` / `feedback_response` / `feedback_summary`, `interrupt` (stop playback), `error`

### Session Management

`sessions = new Map<sessionId, SessionData>` with fields: `history` (GPT messages), `ws` (WebSocket), `scenario` (file path), `voice` (TTS name), `userId`, `isAISpeaking`, `inFeedbackMode`, `feedbackCount`

Heartbeat every 30s. Idle session cleanup every 30 min.

### Access Control (Server-Side)

WebSocket upgrade carries auth in two channels: `userId` in the URL query string and the Supabase access JWT in the `Sec-WebSocket-Protocol` header (sub-protocol `st3.auth.bearer`, followed by the JWT itself). The JWT is NOT in the URL — putting it there leaked it into request logs (originally Render's; the same risk applies to any provider, hence the policy; fixed in `fix/ws-auth-hardening`). On connection:
1. **All scenarios** require valid Supabase auth token (userId + token validated server-side; token extracted by `extractAuthToken(req)` in server.js)
2. **Free scenarios** (`FREE_TIER_SCENARIOS`): skip subscription check after auth
3. **Premium scenarios**: require `subscription.status === 'active'` AND `subscription.specialty` matches scenario specialty via `config.getScenarioSpecialty()`

Per-message handler also enforces session ownership: `sessions.get(msg.sessionId)` must return a session whose `ws === ws` (the connecting socket), otherwise the message is rejected with `Session not found` — same generic error as a genuinely unknown id, so the response doesn't leak whether the id was valid-but-not-owned (CWE-639; fixed in same branch).

Error codes: 4001 (Unauthorized), 4002 (Validation), 4003 (Subscription required)

### LLM Configuration

- **Model:** `config.LLM_MODEL` = `'gemini-2.5-flash'` (via OpenAI-compatible wrapper to Google Generative AI)
- **Temperature:** 0.7
- **Max tokens:** 300 (interview), 500 (feedback JSON summary)
- **Retry:** 3 retries with exponential backoff (1s → 15s max)
- **Service:** `src/services/OpenAIService.js`

### TTS Configuration

**Primary: Gemini TTS** (`src/services/GeminiTTSService.js`)
- Model: `gemini-3.1-flash-tts-preview`
- Voices per difficulty: `Fenrir` (easy), `Kore` (medium), `Charon` (strict)
- Style tags in `config.TTS_STYLE_PROMPTS` prepended to spoken text. Default voices are American — British accent must be specified explicitly in the tag (e.g. `[British accent, professional, neutral examiner tone]`).
- Two paths:
  - `synthesizeStream()` — async generator yielding WAV chunks as Gemini emits them. Used by the live interview path so first audio plays ~500–1000 ms after the call (vs ~5 s for non-streaming). Each chunk is one `ai_response_chunk` to the client.
  - `synthesize()` — one-shot, used by the feedback flow (discrete sections).
- Output: 24 kHz mono 16-bit WAV with 44-byte header per chunk.

**Fallback: Google Cloud TTS** (`src/services/TTSService.js`)
- Used when Gemini TTS fails (one fallback chunk for streaming, two retries for one-shot).
- SSML processing: `buildNaturalSSML(text)` adds pauses at punctuation.
- Output: MP3.

### STT — Deepgram Flux

`src/services/FluxSTTService.js` — only STT path, required at startup.
- Streaming WebSocket via `@deepgram/sdk` v5 → `client.listen.v2.connect({ model: 'flux-general-en', encoding: 'linear16', sample_rate: 16000 })`.
- `audio_chunk` PCM forwarded via `connection.sendMedia(buffer)`.
- Mic stays open during AI speech so Flux can detect `StartOfTurn` for barge-in.
- `TurnInfo` events: `StartOfTurn` (fires automatic interrupt if `session.isAISpeaking`), `EndOfTurn` (final transcript ready). `EagerEndOfTurn` and `TurnResumed` are logged-only (prefetch deferred).
- Audio: AudioStreamer (ScriptProcessorNode, bufferSize=4096) → 16kHz mono Int16 PCM → base64 → WS `audio_chunk`.

### Noise Filtering

`isNoiseTranscript(text)` in `src/utils/audioHelpers.js` filters empty/short (<2 chars), repeated chars, noise patterns (um/uh/er/ah), single words (yes/no/okay), echo pickups.

### Feedback System

On End Interview → NEW GPT session with dedicated feedback prompt + transcript → 6 spoken sections with TTS → JSON summary (max_tokens: 500). Score 0-5 (Unsafe→Outstanding). Prompts in `backend/prompts/shared/feedback/`. `feedbackHistory[]` separate from interview history.

### Scenario Loading (Modular Prompt Architecture)

**Production** uses modular 3-file assembly via `src/utils/promptAssembler.js`:
1. `prompts/shared/interview/core_{domain}_interview.txt` — domain-specific core behaviours
2. `prompts/shared/interview/{difficulty}_interview_personality.txt` — difficulty-specific personality
3. `prompts/scenarios/{topicFolder}/{topicName}_1.txt` — clinical scenario content

Assembled by `buildInterviewPrompt(difficulty, topicFolder)`. Falls back to legacy monolithic files in `prompts/_legacy/` if modular files missing.

**Topic path format** (topicFolder): `clinical/emergencies/necrotising_fasciitis` — used consistently across frontend, sessionStorage, WebSocket, and backend.

**Domains:** clinical, call_the_boss, consent, structured_interview. **Difficulties:** easy, medium, strict.

### Prompt Lab (Text-Only Prompt Testing)

Text-in/text-out environment for rapid prompt iteration without STT/TTS overhead. REST API (no WebSocket). Accessible at `/prompt-lab`.

**Architecture:** Browser → REST `/prompt-lab/api/*` → Gemini 2.5 Flash (no TTS) → JSON responses. Sessions use in-memory Map with `pl_` prefixed IDs, separate from production sessions.

**Features:**
- 5-tab inline prompt editor with inline difficulty selector:
  - **Core** → `prompts/shared/interview/core_{domain}_interview.txt` (shared across difficulties)
  - **Personality** → `prompts/shared/interview/{difficulty}_interview_personality.txt` (per-difficulty)
  - **Clinical** → `prompts/scenarios/{topic}/{name}_1.txt` (shared across difficulties)
  - **Feedback** → `prompts/shared/feedback/core_{domain}_feedback.txt` (shared across difficulties)
  - **Fb.Personality** → `prompts/shared/feedback/{difficulty}_feedback_personality.txt` (per-difficulty)
- Changing difficulty reloads Personality + Fb.Personality tabs; Core, Clinical, Feedback stay the same
- Manual chat interface with feedback trigger (returns all 6 sections + JSON summary at once)
- 7 automated test scripts with assertion system
- Transcript saving and viewer
- Dirty tracking: only modified tabs are saved/committed
- Auto-commit to GitHub on save (production). GitHub env vars: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`

**Gating:** `PROMPT_LAB_ENABLED=true` env var in production (Fly). Auto-enabled in dev (`!config.isProduction`). Per-request auth: Supabase Bearer + `PROMPT_LAB_ADMIN_EMAILS` allowlist (`backend/src/middleware/promptLabAuth.js`).

**Key files:** `src/routes/promptLab.js` (12 REST endpoints), `src/services/PromptLabService.js`, `src/utils/promptParser.js`

### Key Files

```
backend/
├── server.js                          # Main WebSocket + Express server (~1,219 lines)
├── src/
│   ├── config/index.js                # Centralized config with validation
│   ├── services/
│   │   ├── OpenAIService.js           # Gemini 2.5 Flash chat (OpenAI-compatible wrapper)
│   │   ├── GeminiTTSService.js        # Gemini 3.1 TTS, streaming + one-shot
│   │   ├── TTSService.js              # Google Cloud TTS (fallback)
│   │   ├── FluxSTTService.js          # Deepgram Flux streaming STT (only STT path)
│   │   ├── PromptLabService.js        # Prompt Lab sessions/chat/feedback/tests
│   │   ├── GitHubService.js           # Auto-commit Prompt Lab edits
│   │   └── TestScriptGenerator.js     # Generate test scripts via Gemini
│   ├── routes/
│   │   └── promptLab.js               # 12 REST endpoints at /prompt-lab/api
│   └── utils/
│       ├── promptAssembler.js          # Modular prompt assembly (3-file)
│       ├── promptParser.js             # Parse/combine 3-section prompt format
│       ├── audioHelpers.js             # Noise filtering, SSML builder
│       ├── feedbackParser.js           # Parse structured feedback
│       └── feedbackSectionBuffer.js    # Buffer feedback into 6 sections
├── prompts/
│   ├── shared/interview/              # Core + personality files (7 files)
│   ├── shared/feedback/               # Feedback core + personality files (7 files)
│   ├── scenarios/                     # ~166 modular scenario files (topicFolder structure)
│   └── _legacy/                       # Legacy monolithic prompts (Prompt Lab fallback)
├── test-scripts/                      # Automated test definitions (7 JSON files)
├── __tests__/                         # 23 test files, 653 tests
└── package.json
```

## Authentication & Subscription

**Required:** Supabase Auth + Stripe subscriptions. Login required for all access beyond the landing page.

**Three-tier access:** Unlogged → Free (logged in) → Premium (active subscription)

**Specialty-scoped subscriptions:** Each subscription has a `specialty` column (default: `'plastic-surgery'`). Premium access only grants scenarios matching the subscription's specialty. `SPECIALTY_MAP` in config maps folder prefixes to specialties. Currently all 4 domains map to `'plastic-surgery'` — when new specialties are added, update the map.

**Pricing:** Monthly £19.99/month, Annual £119.99/year (save £120). Displayed prices live in `frontend-react/src/config.js` (`PRICING` constant) — single source of truth, consumed by `SectionF_Pricing`, `UpgradeModal`, `TermsOfService`. Stripe Price IDs are separate (env vars `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_ANNUAL` on Render).

**Database tables:** `profiles` (extends auth.users), `subscriptions` (user_id PK, status, specialty, price_type, stripe IDs), `session_history` (analytics). RLS enabled on all tables.

## Testing

### Unit Tests

```bash
cd backend && npm test              # All with coverage
npm run test:watch                  # Auto-run on changes
npx jest __tests__/scenario-loader.test.js  # Specific file
```

281 tests across 16 suites. Coverage thresholds: 55% branches, 60% functions, 65% lines/statements. Tests focus on behavioral verification ("does this feature work?"), not mock wiring.

Key test files:
- `behavioral.test.js` (31) — Prompt assembly, noise filtering, feedback parsing, subscription enforcement, session management, error handling
- `prompt-lab-service.test.js` (40) — Path validation, file loading, feedback, chat, transcripts
- `promptAssembler.test.js` (26) — Core prompt assembly logic
- `prompt-parser.test.js` (26) — Prompt parsing
- `test-script-generator.test.js` (37) — Content detection
- `websocket-integration.test.js` (24) — Real WebSocket connections (Flux mocked)
- `gemini-tts-service.test.js` (11) — One-shot + streaming TTS, tag injection, WAV header
- `flux-stt-service.test.js` (12) — Deepgram Flux event mapping, lifecycle, error path
- `prompt-lab-routes.test.js` (13) — One smoke test per endpoint + security

### E2E Tests (Playwright)

```bash
npm run test:e2e           # Headless
npm run test:e2e:headed    # Visible browser
npm run test:e2e:ui        # Interactive debug
npm run test:e2e:debug     # Step-through
npm run test:e2e:report    # HTML report
npx playwright test e2e-tests/tests/landing.spec.ts  # Specific file
```

45 tests across 6 spec files (3 projects: chromium, mobile, tablet):
- `landing.spec.ts` (8) — Title, hero, CTAs, nav links, pricing scroll, footer sections
- `auth-flow.spec.ts` (5) — Auth page, form fields, OAuth button, close nav, mode toggle
- `scenario-flow.spec.ts` (8) — Specialty→difficulty→mode→scenarios, back nav, fresh start
- `simulation-room.spec.ts` (8) — Room render, header, toggle, sidebar, exit, timer, transcript, empty state
- `responsive.spec.ts` (6) — Mobile/tablet layouts, nav, sim room at narrow viewports
- `access-control.spec.ts` (4) — Free/premium/unlogged tier access via `window.__TEST_TIER__`

Playwright projects: `chromium` (desktop, 33 tests), `mobile` (Pixel 5, 6 tests), `tablet` (Galaxy Tab S4, 6 tests).

`playwright.config.ts` builds React SPA before serving, auto-starts frontend (serve.js on 3001) and backend (server.js on 8080). Screenshots/videos/traces on failure.

**E2E conventions:**
- All selectors use `data-testid` attributes (centralized in `e2e-tests/helpers/selectors.ts`)
- Tier control via `window.__TEST_TIER__` set with `page.addInitScript()` (persists across navigations)
- Sim room has desktop + mobile layouts in DOM — use `.first()` (desktop) or `.last()` (mobile) for duplicate testids
- `navigateToSimulation()` helper accepts optional tier parameter

### Code Quality

```bash
cd backend
npm run lint          # Check
npm run lint:fix      # Auto-fix
npm run format        # Prettier
```

`eslint-plugin-jest` with `plugin:jest/recommended`. Husky pre-commit runs `lint-staged`.

## Deployment

- **Frontend:** https://www.reviva.live/ (Vercel, serves `frontend/` directory)
- **Backend API:** https://api.reviva.live/ (Fly.io, app `reviva-backend`, region `ams` Amsterdam)
- **WebSocket:** wss://api.reviva.live/
- **Stripe webhook:** https://api.reviva.live/stripe-webhook

Backend hosted on Fly.io as of 2026-05-30 (migrated from Render). Single `shared-cpu-1x` machine with 1024 MB RAM, `auto_stop_machines = off`, `min_machines_running = 1` — long-lived voice WebSockets require always-on. See [`docs/render-to-fly-migration.md`](docs/render-to-fly-migration.md) for the full migration record. The Render service is suspended (not yet deleted; safe-keeping for 7 days).

**Deploy:** Pushes to `main` do NOT auto-deploy to Fly. Run manually from `backend/`:
```powershell
cd backend
fly deploy -a reviva-backend
```

**Logs:** `fly logs -a reviva-backend`. **Status:** `fly status -a reviva-backend`. **SSH:** `fly ssh console -a reviva-backend`.

### Fly.io Environment Variables (Secrets)

Set via `fly secrets set KEY=value -a reviva-backend`. Listed by name in `docs/render-to-fly-migration.md` §5. Canonical inventory:

`GEMINI_API_KEY` (required), `DEEPGRAM_API_KEY` (required), `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON string, not file path — single-line minified), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_ANNUAL`, `FRONTEND_URL=https://www.reviva.live`, `PROMPT_LAB_ENABLED=true`, `PROMPT_LAB_ADMIN_EMAILS` (Supabase auth email for Prompt Lab access).

`SENTRY_DSN`, `GITHUB_TOKEN`/`GITHUB_OWNER`/`GITHUB_REPO`, `MAX_DAILY_LLM_CALLS` not currently set — add when configured. `DEV_BYPASS_AUTH` must never be set in production.

As of 2026-05-30, Stripe secrets are in **test mode** (`sk_test_*`) — backend logs a startup WARNING. Switch to `sk_live_*` keys before public launch.

### Local Environment (`backend/.env`)

```bash
# Required
GEMINI_API_KEY=...
DEEPGRAM_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=./google-tts-key.json

# Optional (Auth & Payments)
PORT=8080
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...   # £14.99
STRIPE_PRICE_ID_ANNUAL=price_...    # £99.99
FRONTEND_URL=https://www.reviva.live
```

Google Cloud credentials: local uses file path (`GOOGLE_APPLICATION_CREDENTIALS`), production uses JSON string (`GOOGLE_APPLICATION_CREDENTIALS_JSON`).

### Vercel Configuration

Root `vercel.json` configures the Vercel project: `buildCommand` runs Vite in `frontend-react/`, `outputDirectory` is `frontend/`, SPA catch-all rewrite routes all paths to `index.html`, and `/prompt-lab/api/*` proxies to `api.reviva.live`. Vercel Root Directory is empty (repo root) in the dashboard.

## Development Workflow

### Dev Servers

```bash
cd frontend-react && npm run dev     # React dev server (port 3001, HMR)
cd backend && npm run dev            # Nodemon auto-restart (port 8080)
```

Production: `cd backend && npm start`. Frontend is pre-built by Vite to `frontend/`.

### Debugging

VS Code (F5): Backend Debug WebSocket Server, Backend Debug with Nodemon, Backend Debug Jest Tests, Frontend Launch Chrome with Debugger, Full Stack Backend + Frontend

Strategy: Use VS Code debugger instead of console.log. Breakpoints in server.js for WebSocket issues. Chrome DevTools for frontend. `npm run test:e2e:ui` for Playwright trace viewer. Check `DEVELOPMENT_LOG.md`.

### Before Committing

1. `cd backend && npm test`
2. `npm run test:e2e`
3. `npm run lint:fix`
4. Update `DEVELOPMENT_LOG.md`

### Common Tasks

- **Adding scenarios:** Create `backend/prompts/scenarios/{domain}/{subcategory}/{topicName}/{topicName}_1.txt`, add topic entry to `frontend-react/src/data/scenarios.js` TOPICS object, optional image in `frontend/images/`
- **Changing AI behavior:** `backend/src/config/index.js` — `LLM_MODEL`, temperature/max_tokens in `server.js` `streamResponseToClient()`
- **Changing TTS voice or style:** `backend/src/config/index.js` — `TTS_VOICE`, `TTS_STYLE_PROMPTS`
- **Modifying noise filter:** `src/utils/audioHelpers.js` `isNoiseTranscript()` — add to noise patterns, adjust thresholds

### Key Technical Decisions

1. **Server-Side VAD over Web Speech API:** Consistent cross-browser, but requires WebSocket audio streaming
2. **Gemini 2.5 Flash over GPT-4o-mini:** Better performance, OpenAI-compatible API wrapper
3. **Gemini TTS over Google Cloud TTS:** Style-prompted vocal delivery per difficulty
4. **WebSocket over HTTP:** Real-time bidirectional communication for interrupts
5. **React SPA over vanilla multi-page:** Code splitting, state management, component reuse
6. **Zustand over Redux:** Minimal boilerplate, fine-grained selectors

### Git Workflow

`main` is production. Active work happens on **feature branches** — currently `Pipework-voice` for the voice-loop work.

**At the start of every session, ASK which branch to push to before any commit reaches a remote.** Never auto-push to `main`. The user will name the branch (e.g. `Pipework-voice`); only that one is the target until they say otherwise. If unsure, ask again rather than guess.

Rollback tags: `pre-full-react-migration`, `pre-react-migration`, `pre-dev-environment-setup`.

Husky hooks: pre-commit runs `lint-staged`, pre-push runs `git pull --rebase` (syncs Prompt Lab remote edits).

### Known Issues & Gotchas

- Mic must pause during AI speech (echo/feedback prevention)
- Session cleanup only on WS disconnect + 30-min idle sweep
- Path traversal security in scenario loading
- Google Cloud credentials: production requires JSON string env var
- Stripe webhooks must be configured for subscription management
- Most prompts are placeholders (only nec fasc + replantation fully developed)
- Vanilla `frontend/js/` files still exist but are NOT loaded — orphaned from pre-React era
- Gemini TTS JSON repair for test script generation has known edge cases (deferred)

### Dev Tools

**Prompt Lab** at `/prompt-lab`:
- Local: `http://localhost:3001/prompt-lab` (React dev) or `http://localhost:8080/prompt-lab` (backend static)
- Production: `https://www.reviva.live/prompt-lab`
- REST API: 12 endpoints at `/prompt-lab/api/`
- Test scripts in `backend/test-scripts/necrotising_fasciitis/` (7 JSON files)
- Transcripts saved to `backend/test-results/` (git-ignored)

## Claude Code Plugins & Skills

### Workflow Automation
- **Dippy** — Auto-approves safe bash commands via AST analysis, blocks destructive ones. Hook in `~/.claude/settings.json` PreToolUse. Custom deny rules in `.dippy` project file.

### Vercel Plugin (Auto-Skill Injection) — NOISE REDUCTION
- The Vercel plugin auto-injects skill suggestions on every message via lexical keyword matching
- Most suggestions are **FALSE POSITIVES** for this project (Node.js + Vite, not Next.js)
- **Do NOT announce or acknowledge irrelevant Vercel skill suggestions** — silently ignore them, do not say "Skipping X"
- Only invoke Vercel skills when explicitly asked or when genuinely working on Vercel deployment config
- Relevant Vercel skills for this project: `vercel:deploy`, `vercel:env`, `vercel:status` only
- Env vars configured in `~/.claude/settings.json` to reduce noise: `VERCEL_PLUGIN_LEXICAL_RESULT_MIN_SCORE=50`, `VERCEL_PLUGIN_REVIEW_THRESHOLD=999`

### Security Auditing (Trail of Bits)
Use these skills for security reviews, dependency audits, and vulnerability scanning:
- `/diff-review` — Security-focused code change review against git history
- `/insecure-defaults` — Detect unsafe configs, embedded credentials, fail-open patterns
- `/supply-chain-risk-auditor` — Evaluate dependency threats and supply chain risks
- `/sharp-edges` — Flag error-prone APIs and risky configurations
- `/static-analysis:semgrep` or `/static-analysis:codeql` — Static analysis scanning
- `/variant-analysis` — Find similar vulnerabilities via pattern matching
- `/fp-check` — Validate whether a security finding is a false positive

### Development Lifecycle (levnikolaevich — 109 skills)
Full Agile pipeline from planning through quality gates:
- **Audits** (33 skills): `/ln-620-codebase-auditor` (coordinates 9 sub-auditors), `/ln-621-security-auditor`, `/ln-630-test-auditor`, `/ln-640-pattern-evolution-auditor`, `/ln-650-persistence-performance-auditor`
- **Planning**: `/ln-200-scope-decomposer` (Epics → Stories), `/ln-230-story-prioritizer` (RICE scoring)
- **Execution**: `/ln-400-story-executor` (automated implement → review → rework loops), `/ln-500-story-quality-gate` (PASS/CONCERNS/REWORK/FAIL verdicts)
- **Bootstrap**: `/ln-700-project-bootstrap` (Clean Architecture migration), `/ln-710-dependency-upgrader`, `/ln-730-devops-setup`
- **Docs**: `/ln-100-documents-pipeline` (auto-generate architecture, API specs, testing strategies)

### Structured Planning
- **ContextKit** — 4-phase planning system. `/ctxk:proj:init` to set up, then `/ctxk:plan:1-spec` → `/ctxk:plan:2-research-tech` → `/ctxk:plan:3-steps` → `/ctxk:impl:start-working`. Quick mode: `/ctxk:plan:quick`
- **Context Engineering Kit** — `/sdd:brainstorm` (ideation), `/sdd:plan` (spec-driven with Arc42), `/sdd:implement` (automated LLM implementation), `/reflexion:critique` (multi-perspective review), `/reflexion:reflect` (self-refinement)

### Multi-Session Masterplanning (Deep Plan Trilogy)
For large features requiring cross-session planning:
1. `/deep-project` — Decompose vague requirements into focused spec files
2. `/deep-plan @path/to/spec.md` — Research → interview (5-10 Qs) → planning → external LLM review → TDD stubs + parallelizable sections
3. `/deep-implement` — TDD execution from deep-plan sections

Output persists in planning directory: `claude-plan.md`, `claude-interview.md`, `claude-research.md`, `sections/section-01-*.md` etc. Auto-resumes if interrupted. Optional: `GEMINI_API_KEY`/`OPENAI_API_KEY` for external review (falls back to Opus subagent).

## External Documentation

- Gemini API: https://ai.google.dev/docs
- Google TTS: https://cloud.google.com/text-to-speech
- OpenAI API (Whisper): https://platform.openai.com/docs
- React: https://react.dev
- React Router: https://reactrouter.com
- Zustand: https://zustand.docs.pmnd.rs
- Vite: https://vite.dev
- Tailwind CSS v4: https://tailwindcss.com/docs
- Jest: https://jestjs.io/
- Playwright: https://playwright.dev
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs/api

## Maintaining This File

This file is loaded into every Claude Code conversation. Keep it accurate.

### When to Update
- **After changing LLM/TTS provider or model** → Update "LLM Configuration" and "TTS Configuration" in Backend section
- **After adding/removing routes or pages** → Update "Routes & Pages" in Frontend section
- **After modifying auth or access control** → Update relevant Access Control section (client or server)
- **After adding new services, routes, or utils** → Update "Key Files" in Backend section
- **After adding/modifying tests** → Update "Testing" section counts
- **After changing env vars or deployment config** → Update "Deployment" section
- **After adding new WebSocket message types** → Update "WebSocket Message Types" in Backend section
- **After installing new Claude Code plugins** → Update "Plugins & Skills" section

### How to Update
1. Edit only the relevant section — don't rewrite the whole file
2. Use concrete values (model names, file paths, counts) not vague descriptions
3. Don't include specific line numbers in server.js — they shift constantly
4. Keep file trees up to date but don't list every file — focus on key files
5. If a section grows beyond ~30 lines, consider whether details belong in memory files instead
6. Run `cd backend && npm test` to get current test count before updating Testing section

### What NOT to Put Here
- Conversation-specific context (use memory files)
- Implementation plans (use plan files)
- Debug logs or temporary notes
- Information derivable from `git log` or reading the code

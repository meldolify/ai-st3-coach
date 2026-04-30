# Handover — ST3 Plastic Surgery Interview Trainer (Reviva)

> **Read this first.** It supersedes any older `README.md`, `DEPLOYMENT.md`,
> `INTEGRATION_GUIDE.md`, `ARCHITECTURE_AND_DATABASE.md`, etc. Those have all
> been removed because they referenced a pre-React, pre-Gemini codebase and
> were misleading.
>
> The two living docs are this file and [`CLAUDE.md`](./CLAUDE.md). CLAUDE.md
> is dense reference material; this file is the orientation.

---

## 1. What this product is

A voice-based AI interview trainer for UK plastic surgery trainees preparing
for their ST3 (specialty registrar) interviews. The user picks a scenario
(clinical case, "call the boss" telephone consult, consent station, or
structured viva), an AI examiner conducts a 5-8 minute interview by voice,
and at the end gives spoken feedback plus a 0-5 score.

Live at **<https://www.reviva.live>** (Vercel) with the realtime voice
backend at **wss://api.reviva.live** (Render). Subscriptions via Stripe
(£14.99/month, £99.99/year). Auth + subscription state in Supabase.

Pre-launch. Mostly working.

### Context for whoever's reading this

The product owner is non-technical. The codebase was built with
AI-assisted coding (Claude Code) over the course of several months and
now needs a real engineer to take over polish, optimisation, ongoing
maintenance, and launch-day bugs. You'll have more coding context than
the owner does — assume technical decisions are yours to make and that
"check with the owner" applies to product/UX/scope, not to architecture
or implementation choices.

Two consequences worth flagging up front:

- **The codebase has the fingerprints of AI-assisted development.** Some
  conventions are unusually detailed (see `CLAUDE.md`), some patterns
  are over-engineered, others under-engineered. Treat existing code as
  a starting point, not gospel.
- **`CLAUDE.md` is dense reference material**, written for AI agents
  picking up tasks without prior context. It's accurate as of the last
  edit but it's not a tutorial — read it for "where does X live" rather
  than "how does this work".

§7 is the practical backlog. §8 is deeper perf work to think about
later. Everything else is reference.

---

## 2. What's live right now

| Surface | URL / Provider | Notes |
|---|---|---|
| Frontend | <https://www.reviva.live> (Vercel) | React SPA built by Vite |
| Backend HTTP + WebSocket | <https://api.reviva.live> / `wss://api.reviva.live` (Render) | Single Node process, both protocols same port |
| Auth + DB | Supabase project `vsdiovgjnbziwwukpvqo` (eu-west-1) | `profiles`, `subscriptions`, `session_history`, `keep_alive` |
| Payments | Stripe | Webhook → `https://api.reviva.live/stripe-webhook` |
| LLM | Google Gemini 2.5 Flash | OpenAI-compatible endpoint |
| STT | OpenAI Whisper (`whisper-1`) | Optional but currently configured |
| TTS | Google Gemini 2.5 Flash TTS | Falls back to Google Cloud TTS Neural2 |
| VAD | Silero v4 ONNX (server-side) | `backend/models/silero_vad_v4.onnx` |
| Domain DNS | (verify with the owner) | `reviva.live` apex + `www` + `api` subdomain |

Expected launch traffic is **modest** — single-digit concurrent sessions on
day one, ramping. Render's hobby plan + Vercel's free tier are sized for
this; no horizontal scaling story exists yet (see §7 P2).

---

## 3. Architecture in one page

```
┌──────────────────────── Browser (React SPA on Vercel) ────────────────────────┐
│                                                                                │
│  AudioStreamer ─── 16 kHz Int16 PCM (base64) ───┐                              │
│  (mic capture)                                  │                              │
│                                                 ▼                              │
│  AudioPlayer  ◄──── ai_response_chunk (WAV) ─── │                              │
│  (TTS playback)                                 │                              │
│                                                 │  WebSocket ?token=…&userId=… │
└─────────────────────────────────────────────────┼──────────────────────────────┘
                                                  │
                                                  ▼
┌──────────────── Render: Node.js (server.js + services + routes) ──────────────┐
│                                                                                │
│  WS auth  ──► verify Supabase token ─► check subscription/specialty            │
│                                                                                │
│  ServerVAD (Silero v4 ONNX) ─► onSpeechEnd ─► OpenAI Whisper STT               │
│                                                                                │
│  Streaming chat ─► Gemini 2.5 Flash ─► buffer full turn                        │
│                                                                                │
│  Whole turn ─► Gemini 3.1 Flash TTS (inline audio tags, e.g. [firm, brisk])    │
│             ─► (fallback) Google Cloud TTS Neural2 SSML                        │
│                                                                                │
│  end_interview / request_feedback ─► dedicated feedback prompt                 │
│                                    ─► 6 spoken sections + JSON summary         │
│                                                                                │
│  Stripe webhook ─► Supabase upsert subscriptions                               │
│  Prompt Lab REST ─► read/write modular prompts + auto-commit to GitHub         │
└────────────────────────────────────────────────────────────────────────────────┘
```

**One turn end-to-end** (the thing to optimise; see §8):

1. User speaks → `AudioStreamer` ships PCM via `audio_chunk`.
2. `ServerVAD` detects speech end after silence.
3. `OpenAIService.transcribeAudio()` → Whisper round trip (~600-1500 ms).
4. `streamResponseToClient()` opens a Gemini stream, accumulates tokens into
   the full turn text.
5. When the LLM stream ends, fire ONE Gemini TTS call for the whole turn;
   ship the resulting WAV via a single `ai_response_chunk`.
6. Browser plays the chunk through `AudioPlayer`.
7. After the chunk plays out: `ai_response_end`, mic re-opens.

Note: per-sentence TTS chunking was removed because Gemini 2.5-era TTS
models drift in voice characteristics across calls (documented Google AI
forum issue). One call per turn keeps prosody consistent across the
response.

`backend/server.js` is one big file (~1,200 lines) that contains the
WebSocket connection handler, the per-session message router, and all
the Express routes (Stripe, health check, etc.) in one place. It's the
biggest file in the codebase and it works — don't feel pressure to
split it up unless the owner asks.

**Three files must stay in sync** for `FREE_TIER_SCENARIOS` and
`SPECIALTY_MAP`:

- [`backend/src/config/index.js`](./backend/src/config/index.js)
- [`frontend-react/src/config.js`](./frontend-react/src/config.js)
- [`frontend/config.js`](./frontend/config.js) — vestigial; only kept because
  `backend/__tests__/config-sync.test.js` enforces the three-way match. If
  you delete it, also delete that test.

---

## 4. Dev environment from scratch (~30 min)

Prereqs: Node ≥ 18, git, a Chromium browser, the API keys below.

```bash
git clone <repo>
cd "AI ST3 Coach V4"

# Backend deps
cd backend && npm install

# Frontend deps
cd ../frontend-react && npm install

# E2E deps (optional)
cd .. && npm install
npx playwright install chromium
```

**`backend/.env`** — copy from `.env.example` and fill in:

| Var | Where to get it | Required? |
|---|---|---|
| `GEMINI_API_KEY` | <https://aistudio.google.com/apikey> | **Yes** — server exits without it |
| `OPENAI_API_KEY` | <https://platform.openai.com/api-keys> | Recommended (Whisper STT) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to a Google Cloud service-account JSON with the **Cloud Text-to-Speech API User** role. Local dev only. | Recommended (TTS fallback) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Supabase dashboard → Project Settings → API. Use the **service_role** key, NOT the anon key. | For auth + subscriptions |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID_*` | Stripe dashboard (test mode for dev) | For payments |
| `FRONTEND_URL` | `http://localhost:3001` for dev | For CORS + redirects |
| `DEV_BYPASS_AUTH=true` | Skips Supabase auth + subscription checks. Useful for poking the WS without logging in. | Local only. **Never in production.** |
| `PROMPT_LAB_ENABLED=true` | Already auto-on in dev. | Optional |

**Frontend Supabase keys are NOT in `.env`** — they're hardcoded in
[`frontend-react/src/config.js`](./frontend-react/src/config.js) (the
`SUPABASE_ANON_KEY` is a publishable key by design; safe to embed). Same
file holds `BACKEND_URL` (`localhost:8080` in dev, `api.reviva.live` in
prod, switched by hostname detection).

Run two terminals:

```bash
# Terminal 1 — backend (nodemon)
cd backend && npm run dev

# Terminal 2 — frontend (Vite, port 3001)
cd frontend-react && npm run dev
```

Open <http://localhost:3001>. Create a Supabase test user, log in,
pick the free scenario `clinical / emergencies / necrotising_fasciitis`,
and run an interview through to feedback to confirm everything works
end-to-end.

---

## 5. Deploy and rollback

**Frontend (Vercel)** — auto-deploys from `main`. The build runs
`cd frontend-react && npm install && npm run build`; output is `frontend/`.
Routing config is the project-root [`vercel.json`](./vercel.json) (SPA
catch-all + a `/prompt-lab/api/*` proxy to the Render backend). Roll back
in the Vercel dashboard → Deployments → ⋯ → "Promote to production" on a
prior build.

**Backend (Render)** — currently set up to **auto-deploy off** so Prompt
Lab edits don't trigger redeploys. Manual deploy via dashboard. Roll back
by clicking a previous deploy in the Render UI.

**Rollback git tags** in case you need to revert local-side experiments:

- `pre-full-react-migration` — last vanilla-JS state
- `pre-react-migration` — before any React
- `pre-dev-environment-setup` — before the VS Code/Husky setup

**Conventions to preserve:**

- Husky pre-commit runs `lint-staged`; pre-push runs `git pull --rebase`
  to merge in any Prompt Lab auto-commits the production server may have
  made. **Don't bypass `--no-verify`** — you'll lose Prompt Lab edits.
- Commit and push directly to `main`. No feature branches, no PRs (small
  team).
- Image paths must be lowercase (`/images/landing/foo.png`). Vercel runs on
  Linux which is case-sensitive; we got bitten by this on launch-prep.
- All E2E selectors live in
  [`e2e-tests/helpers/selectors.ts`](./e2e-tests/helpers/selectors.ts) —
  use `data-testid`, never CSS selectors.

---

## 6. Database

Supabase Postgres, project `vsdiovgjnbziwwukpvqo`, region `eu-west-1`. Tables
documented from code references — confirm against the live schema before
writing migrations:

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users`, holds non-auth user fields (display name etc.) |
| `subscriptions` | One row per user. Columns: `user_id` (PK FK), `status` (`active` / `trialing` / `past_due` / `cancelled`), `specialty` (default `'plastic-surgery'`), `price_type` (`monthly`/`annual`), `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, `created_at`. |
| `session_history` | Analytics (per-interview record). |
| `keep_alive` | Single-row table written daily by the GitHub Action `keep-alive.yml` to prevent Supabase free-tier auto-pause. |

RLS is enabled on all tables; the contractor will need to read each table's
policy in the Supabase dashboard before writing migrations. Stripe writes
on the backend use the **service_role** key, which bypasses RLS — be
careful when changing webhook code.

**There is no checked-in schema dump.** The first thing the contractor
should do (P1 in §7) is `pg_dump --schema-only --no-owner > db/schema.sql`
and commit it, so future schema changes are reviewable in PRs.

**Backups:** Supabase free tier provides daily backups for 7 days. Higher
tiers provide longer retention. There is no manual backup automation.

---

## 7. Backlog

### Launch blockers

1. **Privacy policy, terms of service, contact, help, FAQ pages.**
   Footer links to all five are dead. UK consumer launch with paid subs
   and audio recording needs GDPR-compliant T&Cs and a privacy notice.
   [Termly](https://termly.io/) or [Iubenda](https://www.iubenda.com/)
   for the legal text; React routes pattern off
   `Profile/ProfilePage.jsx`.

2. **Sentry — frontend and backend.** No remote error tracking; prod
   issues only surface via user email.
   - Frontend: hook into the existing `componentDidCatch` in
     [`ErrorBoundary.jsx`](./frontend-react/src/components/ErrorBoundary.jsx).
   - Backend: hook into the existing `unhandledRejection` /
     `uncaughtException` handlers at the top of
     [`server.js`](./backend/server.js).

3. **Uptime ping** on `https://api.reviva.live/health` —
   UptimeRobot / Better Stack, free tier.

4. **WebSocket reconnect UX.** `ws.onclose` in
   [`useSession.js`](./frontend-react/src/hooks/useSession.js) just
   sets `isConnected=false` — user has to navigate away and back. Server
   discards session state on disconnect, so a "Reconnect?" banner that
   starts a fresh session is probably the right shape; full session
   resume would be a bigger change.

### Soon after launch

5. **Commit the Supabase schema** (`pg_dump --schema-only --no-owner`)
   so future schema diffs are reviewable.
6. **Jest open-handle warning** (`Force exiting Jest`) — likely an
   unclosed WS in
   [`websocket-integration.test.js`](./backend/__tests__/websocket-integration.test.js).
7. **`LandingPage` chunk is 656 KB** (Three.js + GSAP). Lazy-load the
   scene; `loading="lazy"` on images.
8. **`LICENSE` file.**

### Larger items

9. **Stripe webhook idempotency** —
   `customer.subscription.updated`/`deleted` aren't deduped on
   `event.id`. Low real risk at current scale.
10. **Structured logging** — 145 `console.*` calls; swap for pino or
    similar.
11. **Split `backend/server.js`** (1,231 lines, mixed concerns). The
    per-session promise lock is the subtle bit.
12. **Realtime pipeline tuning.** See §8.

### Known incomplete

13. **Full mock-exam flow.** TODOs in
    [`ScenarioFlow.jsx`](./frontend-react/src/pages/Scenarios/ScenarioFlow.jsx)
    near lines 94 / 170 — entry exists but the flow falls through.
14. **Most scenario prompts are placeholder.** Only
    `clinical/emergencies/necrotising_fasciitis` and
    `clinical/microsurgery/replantation` are authored; the other ~163
    use a `[AUTHOR NOTE — DELETE THIS ENTIRE SECTION]` template. Owner
    authors content — "the AI doesn't know about X" reports on
    placeholder scenarios aren't code bugs.

### Already done in the handover commit

- Two committed credentials removed from tracking; `.gitignore` updated
  (keys are rotated).
- 13 stale top-level docs deleted; orphaned vanilla-JS dirs removed.
- `backend/.env.example` corrected.
- `JSON.parse` in `useSession.js` wrapped in try/catch.
- Feedback failure now returns `score: null` and renders as "Unavailable"
  instead of a falsely-positive "3".

---

## 8. Realtime pipeline tuning

The metric that matters is "user finishes speaking → first word of AI
reply audible". Current architecture trades latency for voice consistency:
one TTS call per full turn (not per sentence), so the user waits for the
whole LLM response + one TTS round trip before any audio plays.

`server.js` already emits `[PERF]` lines per turn — capture a baseline
from a few sample interviews on the Render log stream before changing
anything:

```
[VAD] Speech ended for <id>, <ms>ms audio, VAD held <ms>ms
[TIMING] Whisper STT: <ms>ms
[PERF] LLM first token: <ms>ms
[PERF] LLM stream complete: <ms>ms
[PERF] TTS complete: <ms>ms
[PERF] Pipeline total: <ms>ms
```

Levers, roughly in order of expected impact:

1. **Whisper STT is sequential** — one round trip after speech end
   (~600-1500 ms). The biggest unaddressed latency. Migrating to a
   streaming STT (e.g. Deepgram Flux) emits transcripts as the user
   talks; combined with native end-of-turn detection it removes both
   Whisper and ServerVAD. See `~/.claude/plans/hi-we-re-going-to-sparkling-moler.md`
   Workstream 2 for a sketch.
2. **Per-turn TTS round trip** — `streamResponseToClient` waits for the
   full LLM response, then ONE Gemini TTS call. Streaming TTS providers
   (Cartesia Sonic-3, ElevenLabs Flash) emit audio bytes as they
   generate, dropping time-to-first-audio from ~600 ms to ~100 ms.
3. **Gemini TTS retry policy** —
   [`server.js:121-128`](./backend/server.js#L121-L128) waits 500 ms
   before failing over to Cloud TTS. Fail over immediately on the first
   failure; only retry on specific transient codes.
5. **TTS style prompts** —
   [`config/index.js:62-71`](./backend/src/config/index.js#L62-L71)
   prepends ~120-180 tokens of "director's notes" to every TTS call.
   Trim or cache.
6. **`ScriptProcessorNode` → AudioWorklet**
   ([`AudioStreamer.js:40`](./frontend-react/src/lib/AudioStreamer.js#L40)).
   Stability win on backgrounded tabs more than a latency win.
7. **AudioPlayer** uses HTML5 `Audio` + Blob URL with a 10-second
   magic-number timeout
   ([`AudioPlayer.js:79-84`](./frontend-react/src/lib/AudioPlayer.js#L79-L84)).
   Web Audio API decode is more accurate.

Change one thing at a time and measure against the baseline.

---

## 9. Production debugging map

Until Sentry is wired up:

| Symptom | First place to look |
|---|---|
| Site slow / down | Render → Logs (live tail). `/health` returns `{"status":"ok"}` if the backend's up. |
| Frontend won't load | Vercel → Deployments → recent build logs. |
| Auth failing | Supabase → Logs → Auth, filter by email. |
| Payment / subscription issue | Stripe → Events (by customer email), cross-reference Render logs for `[STRIPE WEBHOOK]` / `[STRIPE]`. |
| "AI never speaks" | Render logs filtered to the user's `userId` (in the `[CLIENT]` connection line). Trace `[VAD] Speech ended` → `[TIMING] Whisper STT` → `[PERF] LLM first token` → `[PERF] First chunk sent`. The missing line is the broken stage. |
| API rate-limited | `[<model>] Rate limited` lines; 3 retries before the client gets `RATE_LIMITED`. Usually free-tier quota. |
| Supabase keep-alive failing | GitHub Actions → "Supabase Keep-Alive". >7 days of failure auto-pauses the free-tier project. |
| Prompt Lab edit didn't deploy | Backend auto-deploy is intentionally off. Manual deploy via Render after a Prompt Lab save. |

---

## 10. Test infrastructure

```bash
cd backend && npm test               # 329 unit tests, ~6s
cd backend && npm run test:watch     # tdd
cd backend && npm run lint           # ESLint, 0 errors / 4 known warnings
npm run test:e2e                     # Playwright, 45 tests across 3 projects
```

The unit suite is **behavioural** ("does the feature work?"), not
mock-wiring — earlier mock-only tests were deleted in the March 2026
overhaul. New tests should follow that style.

E2E uses `data-testid` selectors centralised in
[`e2e-tests/helpers/selectors.ts`](./e2e-tests/helpers/selectors.ts). Tier
control (free/premium/unlogged) is via `window.__TEST_TIER__` set with
`page.addInitScript()` so it persists across navigations. The sim room has
both desktop and mobile layouts in the DOM — use `.first()` (desktop) or
`.last()` (mobile) when selecting duplicate testids.

The "Force exiting Jest" warning is a known issue (see §7 P1 #9).

---

## 11. External accounts

The owner invites you to each:

| Account | Purpose |
|---|---|
| GitHub repo | Code |
| Vercel | Frontend deploys + logs |
| Render | Backend deploys + logs |
| Supabase | Database + auth logs |
| Stripe | Payment debugging |
| Google Cloud (`st3-coach-v4`) | Service account for Cloud TTS fallback |
| OpenAI | Whisper API key (configured via Render env) |
| Google AI Studio | Gemini API key (configured via Render env) |
| Sentry | After setup, §7 #2 |

Two credentials were previously committed to git history; both rotated,
the leaked values are inert.

---

## 12. Repo conventions

Quirks worth knowing:

- **Commit straight to `main`.** No PRs in current workflow; introduce
  one if you'd prefer.
- **Husky pre-push runs `git pull --rebase`.** The production server
  occasionally commits via the Prompt Lab tool, so a rebase-before-push
  is required. Don't bypass with `--no-verify`.
- **Render backend auto-deploy is off** (otherwise every Prompt Lab
  save would trigger a redeploy). Manual deploy via Render. Vercel
  frontend auto-deploys from `main`.
- **Lowercase image paths** — Linux/Vercel case sensitivity bit us once.
- **Three-file config sync.** `FREE_TIER_SCENARIOS` and `SPECIALTY_MAP`
  live in `backend/src/config/index.js`,
  `frontend-react/src/config.js`, and `frontend/config.js`.
  `config-sync.test.js` enforces parity. The third copy
  (`frontend/config.js`) is vestigial post-React-migration but the test
  still references it — delete the test if you delete the file.
- **Prompt Lab** at `/prompt-lab` is the owner's prompt-editing tool;
  auto-commits to GitHub on save.

---

## 13. Code map

Top-of-mind files when you hit a related task:

**Frontend** (`frontend-react/src/`):
- `App.jsx` — routes
- `pages/` — page components
- `components/` — shared UI
- `hooks/useSession.js` — the interview WebSocket orchestrator
- `hooks/useAuth.js` — Supabase session hydration
- `stores/` — Zustand stores
- `lib/AudioStreamer.js`, `lib/AudioPlayer.js`, `lib/OrbVisualizer.js` —
  realtime audio plumbing

**Backend** (`backend/`):
- `server.js` — WebSocket + Express, all in one
- `src/config/index.js` — env, `FREE_TIER_SCENARIOS`, `SPECIALTY_MAP`
- `src/services/` — `OpenAIService`, `GeminiTTSService`, `TTSService`,
  `ServerVAD`, `PromptLabService`
- `src/utils/` — prompt assembly, audio helpers, sentence/feedback
  buffers
- `src/routes/promptLab.js` — Prompt Lab REST endpoints
- `prompts/` — AI prompt content (owner-authored)
- `__tests__/` — Jest suite

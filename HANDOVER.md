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

Pre-launch. Mostly working. The contractor scope is **maintenance,
launch-day bug fixes, observability/reliability hardening, and tuning the
voice-pipeline latency**.

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
│  Streaming chat ─► Gemini 2.5 Flash ─► SentenceBuffer                          │
│                                                                                │
│  Per sentence ─► Gemini TTS (style-prompted)                                   │
│                ─► (fallback) Google Cloud TTS Neural2 SSML                     │
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
4. `streamResponseToClient()` opens a Gemini stream, buffers tokens into
   sentences (`SentenceBuffer`).
5. As each sentence emerges, fire Gemini TTS in parallel; ship audio chunks
   in order via `ai_response_chunk`.
6. Browser plays each chunk through `AudioPlayer` (queued).
7. After the final chunk: `ai_response_end`, mic re-opens.

`backend/server.js` contains the WS connection handler, the per-session
`processingLock` promise chain, and all REST routes. It's 1,231 lines
across five concerns and is the single biggest refactor candidate
(see §7 P3).

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

## 7. Where the bodies are buried (and the prioritised backlog)

Honest list of what's wrong, fragile, or unfinished. Ordered roughly P0
(must-fix before / at launch) → P3 (cleanup, eventually).

### P0 — launch blockers

1. **Privacy policy and terms of service pages don't exist.** Footer links
   to `/privacy` and `/terms` are dead. UK consumer launch with paid
   subscriptions and audio recording requires a GDPR-compliant privacy
   notice and T&Cs. **Do not launch without these.**
2. **No remote error tracking.** 145 unstructured `console.*` calls in the
   backend; the frontend `ErrorBoundary` only logs to the browser console.
   At launch you'll have zero visibility into prod errors. **Add Sentry**
   (free tier covers >5k events/month) on both Node and React. Wire it
   into `process.on('unhandledRejection'...)` in `server.js` and the
   `componentDidCatch` of `frontend-react/src/components/ErrorBoundary.jsx`.
3. **WebSocket has no client-side reconnection.** If the connection drops
   mid-interview (mobile signal blip, Render cold-start, server restart),
   the user has to navigate away and back. Add exponential-backoff
   reconnect in `frontend-react/src/hooks/useSession.js` (the `ws.onclose`
   handler currently just flips `setIsConnected(false)`). Add a UI banner
   showing reconnect status. Server-side: the session is destroyed on
   close (`sessions.delete`), so reconnection requires re-establishing the
   session — the easiest path is "show user a 'Reconnect?' button that
   restarts from scratch".

### P1 — reliability and observability

4. **Stripe webhook isn't idempotent.** Stripe retries the same `event.id`
   on transient failure. `checkout.session.completed` is safe (uses
   `upsert` keyed on `user_id`), but `customer.subscription.updated` and
   `customer.subscription.deleted` can race if delivered out of order.
   Dedupe by `event.id` (small Postgres table or in-memory LRU).
   See [`backend/server.js:1058-1117`](./backend/server.js).
5. **Structured logging.** Replace `console.*` with `pino` (Render parses
   JSON logs). Add log levels, scrub PII (transcripts contain patient
   demographics in scenario text — keep them out of logs).
6. **Database schema not checked in.** See §6 — first task: dump and
   commit.
7. **Frontend `JSON.parse` was unguarded** — fixed in this handover commit.
8. **Feedback failure fallback used `score: 3`** which silently presented
   an error as a "Good" review — fixed in this handover commit; modal now
   shows "Unavailable / —".
9. **Jest reports `Force exiting Jest: --detectOpenHandles?`.** A test is
   leaving an unclosed handle (likely
   [`websocket-integration.test.js`](./backend/__tests__/websocket-integration.test.js)).
   Find and clean up.

### P2 — performance and architecture

10. **`backend/server.js` is 1,231 lines** mixing five concerns (WS auth,
    session lifecycle, message router, Express middleware, Stripe routes).
    Split into `src/websocket/`, `src/routes/stripe.js`,
    `src/middleware/`. The per-session `_processingLock` promise chain is
    the subtlest bit — read it carefully before refactoring.
11. **`GeminiTTSService._queue` serialises all TTS calls globally**
    ([line 13](./backend/src/services/GeminiTTSService.js#L13)). Under any
    multi-user concurrency this turns parallel TTS into serial. The voice
    is set per call so the comment's "voice consistency" rationale is
    suspect. Either move serialisation per-session or remove it entirely.
12. **Deprecated `ScriptProcessorNode` for mic capture**
    ([`AudioStreamer.js:40`](./frontend-react/src/lib/AudioStreamer.js#L40)).
    Functionally fine today but Chrome has been threatening removal for
    years and on backgrounded tabs it stutters. Migrate to `AudioWorklet`.
13. **`AudioPlayer` uses HTML5 `Audio` + Blob URL with a 10-second
    magic-number safety timeout**
    ([`AudioPlayer.js:79-84`](./frontend-react/src/lib/AudioPlayer.js#L79-L84)).
    The estimated-duration math `bytes / 4000` is wrong for both Gemini
    WAV (48 KB/s) and Cloud MP3 (variable). Web Audio API decoding gives
    exact duration and lower start-of-playback latency.
14. **Bundle: `LandingPage` chunk is 656 KB** (Three.js + GSAP). Lazy-load
    the 3D scene only after the LCP hero is painted, or dynamic-import
    the Three.js bits. Largest single perf win on landing.
15. **Test coverage on production paths is uneven**:
    [`promptLab.js`](./backend/src/routes/promptLab.js) 35.6%,
    [`GeminiTTSService.js`](./backend/src/services/GeminiTTSService.js) 39%.
    Add behavioural tests (not mock-wiring).

### P3 — feature completion and polish

16. **Full-mock-exam flow is half-built.** TODOs at
    [`ScenarioFlow.jsx:94, :170`](./frontend-react/src/pages/Scenarios/ScenarioFlow.jsx).
    The button is reachable but the flow falls through to the regular
    interview path. Either finish the flow (results page,
    multi-station timer, summary) or hide the entry point.
17. **~163 of 165 scenario prompt files use the placeholder template.**
    Only `clinical/emergencies/necrotising_fasciitis` and
    `clinical/microsurgery/replantation` have fully-authored content. The
    template uses `[AUTHOR NOTE — DELETE THIS ENTIRE SECTION]` blocks with
    nec-fasc examples. Author content lives in
    `backend/prompts/scenarios/{domain}/{subcategory}/{topic}/{topic}_1.txt`.
    `TestScriptGenerator.hasRealContent()` correctly refuses to generate
    test scripts for placeholder content.
18. **Dead links** in the footer: `/contact`, `/help`, `/faq`, `/terms`,
    `/privacy`. Build the routes.
19. **No license file.**
20. **TTS style prompts are long** (~120-180 tokens prepended to every TTS
    call). See [`config/index.js:62-71`](./backend/src/config/index.js).
    Trim or cache.
21. **Idle session cleanup is on a 5-min sweep**
    ([`server.js:283-299`](./backend/server.js#L283-L299)). Fine for
    current scale, will need eviction policy under load.

### Already addressed in this handover commit

- Two committed credentials (`google-tts-key.json`, `client_secret_*.json`)
  removed from tracking; `.gitignore` updated. **You must still rotate
  both** — see §11.
- 13 stale top-level docs deleted (`README.md`, `DEPLOYMENT.md`,
  `INTEGRATION_GUIDE.md`, `ARCHITECTURE_AND_DATABASE.md` etc.).
- `backend/server.js.backup` and orphaned vanilla-JS dirs (`frontend/js/`,
  `frontend/css/`, `frontend/styles/`, `frontend/tools/`) removed.
- 4 tracked dev-screenshot PNGs removed from repo root.
- `backend/.env.example` rewritten — was wrong about which keys are
  required.
- `JSON.parse` guard in `useSession.js`.
- Feedback-failure fallback no longer returns a falsely-positive `score: 3`.

---

## 8. The LLM-latency tuning playbook

The user-perceived latency you're trying to reduce is **utterance end →
first word audible** (call it `T_first`). The architecture is good; the
constants and serialisation are what to tune.

**You already have instrumentation.** `server.js` emits these per turn:

```
[VAD] Speech ended for <id>, <ms>ms audio, VAD held <ms>ms
[TIMING] Whisper STT: <ms>ms
[PERF] LLM first token: <ms>ms
[PERF] First sentence ready: <ms>ms
[PERF] First chunk sent: <ms>ms
[PERF] Pipeline total: <ms>ms, <N> chunks
```

Capture these from a couple of sample sessions on Render's log stream
before touching anything. Then attack the levers in this order:

1. **VAD `redemptionFrames`** — currently 6 frames (≈576 ms) of trailing
   silence before declaring speech-end
   ([`ServerVAD.js:50`](./backend/src/services/ServerVAD.js#L50)). Lower
   = faster turn-around but more false speech-ends mid-sentence. The
   adaptive `_getRedemptionFrames` already widens for longer utterances;
   consider tightening the short-utterance branch to 4-5 frames.
2. **Whisper STT round trip** — sequential, one round trip after speech
   end. Two options: (a) start Whisper on the partial audio at the
   speech-still-going boundary (already exists for >15 s utterances via
   `onIncrementalAudio`; extend to all utterances by exporting at
   ~1.5 s intervals), or (b) trial Gemini's native audio input to skip
   Whisper entirely.
3. **`SentenceBuffer` minSentenceLength = 20 chars**
   ([`server.js:149`](./backend/server.js#L149)). The first TTS chunk
   can't fire until the LLM emits ≥20 chars terminated by a sentence
   boundary. Lowering to 10-12 starts speech sooner with marginal prosody
   cost. Worth A/B-ing.
4. **Gemini TTS retry policy**: today, on the first failure we wait
   500 ms and retry, then fall through to Cloud TTS
   ([`server.js:121-128`](./backend/server.js#L121-L128)). On a flaky day
   that's a guaranteed extra 500 ms. Switch to "fail over immediately on
   first failure, only retry on specific transient codes (5xx)".
5. **`GeminiTTSService._queue` global serialisation** (P2 #11). Under
   concurrency this is a hard bottleneck.
6. **TTS style prompt length** (P3 #20). Each TTS call prepends ~120-180
   tokens of director's notes — billed time.
7. **`AudioPlayer`** — switch to Web Audio API decoding (P2 #13). Removes
   the 10-second safety timeout and gets a few hundred ms back at
   playback start.

The biggest wins, in order of expected impact: **(2) parallel/streaming
Whisper**, **(11) drop the global TTS queue**, **(3) lower sentence
threshold**.

---

## 9. Debugging a production incident today

You don't have Sentry, log aggregation, or uptime monitoring (yet — see
§7 P0/P1). Here's what you do have:

| Symptom | Where to look |
|---|---|
| Backend down / slow | Render dashboard → Logs (live tail). `/health` returns 200 if up. |
| Frontend down | Vercel dashboard → Deployments → most recent → "View build logs" |
| Auth broken | Supabase dashboard → Logs → Auth |
| Subscription / payment issue | Stripe dashboard → Events (search by customer email or subscription ID); cross-reference Render logs for `[STRIPE WEBHOOK]` and `[STRIPE]` lines |
| User reports "AI never speaks" | Render logs around the user's session — search for their `userId` (in the connection's `[CLIENT]` line). Look for `[VAD] Speech ended` (did VAD fire?) → `[TIMING] Whisper STT` (did Whisper return?) → `[PERF] LLM first token` (did Gemini stream?) → `[PERF] First chunk sent`. Whichever line is missing tells you which stage broke. |
| Rate limits | OpenAI / Gemini error 429 surfaces as `[<model>] Rate limited` with retry attempts. After 3 retries the client receives `code: 'RATE_LIMITED'`. |
| Supabase keep-alive failed | GitHub Actions → "Supabase Keep-Alive" workflow. If broken for >7 days, free-tier Supabase auto-pauses the project. |
| Prompt Lab edits not deploying | Production Render auto-deploy is **off**. Manual deploy via Render dashboard after a Prompt Lab save. Or check that the pre-push `git pull --rebase` hook ran (it merges in production-side commits). |

A short, recommended P0 incident-response improvement: install
[**Better Stack**](https://betterstack.com/) or
[**UptimeRobot**](https://uptimerobot.com/) (both free) to ping
`https://api.reviva.live/health` every minute. Free Sentry covers the rest.

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

## 11. Account and credential transfer

**You (the owner) must rotate these immediately**, regardless of whether
the contractor starts today. The two credentials below were committed to
the repo's git history and must be assumed compromised:

1. **Google Cloud service-account key** for project `st3-coach-v4` —
   GCP Console → IAM & Admin → Service Accounts → (the TTS service
   account) → Keys → "Add key" (new), then delete the old key. Update
   `GOOGLE_APPLICATION_CREDENTIALS_JSON` env var on Render with the new
   JSON.
2. **Google OAuth web-client secret** (`GOCSPX-…`, used for Supabase
   Google sign-in) — GCP Console → APIs & Services → Credentials →
   (the OAuth 2.0 client) → "Reset Secret". Then in Supabase Dashboard
   → Authentication → Providers → Google, paste the new secret.

The repository's working tree no longer has the files (they're in
`.gitignore` now), but **they remain accessible via `git log`/`git show`**
until you purge history with `git filter-repo` and force-push. Once you
rotate the keys, the leaked values are inert, so leaving them in history
is acceptable risk if force-pushing isn't desirable.

**Accounts the contractor will need access to** (decide read-only vs admin
per account):

| Account | Owner action |
|---|---|
| Vercel | Add contractor as Member (free tier supports this) |
| Render | Add to team in dashboard |
| Supabase | Add as project member (Developer role for read-only-ish) |
| Stripe | Add as user; **Read** role is enough for debugging |
| Google Cloud (project `st3-coach-v4`) | IAM → Add: Viewer + Cloud TTS API User (avoid Owner) |
| OpenAI | Org → Add member (Reader) |
| Google AI Studio (Gemini) | Personal API key — share key, not account |
| GitHub repo | Add as collaborator |
| Domain registrar (`reviva.live`) | Decide whether to transfer or grant DNS-only access |
| Cloudflare/DNS provider (if separate) | Add as member with DNS edit |

There is no formal long-term ownership-transfer plan documented; create
one when the contractor relationship moves beyond "maintenance".

---

## 12. Conventions worth preserving

- **Three-file `FREE_TIER_SCENARIOS` and `SPECIALTY_MAP` sync** — see §3.
  Adding a new free-tier scenario or specialty means editing all three
  files. The `config-sync.test.js` test will fail if you forget.
- **Modular prompt assembly.** The production prompt for any session is
  built from three files (`core_<domain>_interview.txt`,
  `<difficulty>_interview_personality.txt`,
  `scenarios/<topicFolder>/<topic>_1.txt`) by
  [`promptAssembler.buildInterviewPrompt`](./backend/src/utils/promptAssembler.js).
  Don't reintroduce monolithic per-difficulty prompt files — the legacy
  ones in `backend/prompts/_legacy/` are kept only for the Prompt Lab's
  fallback path.
- **Scenario topic-folder format** is consistent everywhere:
  `clinical/emergencies/necrotising_fasciitis` — used in WS query string,
  `sessionStorage`, frontend scenarios data, and prompt directory layout.
- **Husky pre-push runs `git pull --rebase`** to merge in any commits the
  production server made via Prompt Lab auto-commit. **Don't disable
  this.** If a push fails because of this, resolve and try again — don't
  use `--no-verify`.
- **Image paths must be lowercase** for Linux/Vercel case sensitivity.
- **Render auto-deploy is OFF** intentionally so that Prompt Lab commits
  don't trigger redeploys. Backend deploys are manual; frontend deploys
  are automatic on push to `main`.
- **Commit + push directly to `main`** — single-developer workflow, no
  PRs. The contractor may want to introduce a PR-based workflow once
  there's more than one engineer; that's fine.

---

## 13. Pointers into the code

The shortest path to understanding the codebase:

| Where to start | Why |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | Dense reference — read after this file |
| [`backend/server.js`](./backend/server.js) | One file, one process, all five concerns. Start with the WS `connection` handler at line 306. |
| [`backend/src/services/OpenAIService.js`](./backend/src/services/OpenAIService.js) | Gemini LLM streaming + Whisper STT. ~190 lines. |
| [`backend/src/services/GeminiTTSService.js`](./backend/src/services/GeminiTTSService.js) | Primary TTS. The `_queue` here is the global-serialisation footgun. |
| [`backend/src/services/ServerVAD.js`](./backend/src/services/ServerVAD.js) | Silero v4. The `_getRedemptionFrames` adaptive logic is the main latency knob on the input side. |
| [`backend/src/utils/promptAssembler.js`](./backend/src/utils/promptAssembler.js) | Modular prompt assembly. |
| [`frontend-react/src/hooks/useSession.js`](./frontend-react/src/hooks/useSession.js) | The interview orchestrator. WS lifecycle, message routing, audio control. |
| [`frontend-react/src/lib/AudioStreamer.js`](./frontend-react/src/lib/AudioStreamer.js) | Mic capture (`ScriptProcessorNode`). |
| [`frontend-react/src/lib/AudioPlayer.js`](./frontend-react/src/lib/AudioPlayer.js) | TTS playback queue. |
| [`frontend-react/src/components/SimulationRoom.jsx`](./frontend-react/src/components/SimulationRoom.jsx) | The interview UI. 607 lines, two layouts (desktop + mobile) in one component. |

Welcome. Open issues against any of the §7 items as you pick them up.

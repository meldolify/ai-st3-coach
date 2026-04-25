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

### Who this doc is for and what's expected

You're picking this up as a freelance developer, likely your first or
second professional codebase. **That's fine.** The product owner is not
expecting you to refactor everything or rewrite the voice pipeline. The
realistic scope is:

- **Fix bugs as users report them at launch.** This is the main job.
- **Build the missing public pages** — privacy policy, terms of service,
  contact, help, FAQ. These are mostly content + simple React components.
- **Add basic monitoring** so you can actually see what's breaking in
  production (Sentry — install instructions in §7).
- **Small polish**: copy tweaks, layout fixes, mobile bugs.

There are deeper improvements possible (see §8) but **don't attempt them
before talking to the owner**. They involve subtle parts of the realtime
audio pipeline and are easy to break in ways that aren't obvious until a
user complains. When in doubt, ask.

The codebase is bigger than it needs to be in places (one 1,200-line file,
in particular). Don't feel pressure to clean it up. Make the change you
need, leave the rest alone. The product owner can decide together with
you what's worth refactoring later.

**Read order for your first week:** this file → `CLAUDE.md` (denser
reference) → poke around `frontend-react/src/` for the page you're working
on. You don't need to understand the whole backend to be productive.

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

## 7. The backlog — what to pick up, and in what order

Honest list of what's wrong, fragile, or unfinished. Each item is tagged
with a difficulty so you can pick what fits.

**Tags:**
- 🟢 **easy** — straightforward, doable on day 1-2.
- 🟡 **moderate** — needs some thought; ask the owner if you get stuck.
- 🔴 **deep** — touches a subtle part of the codebase. **Don't start
  these without talking to the owner first.** They're listed here so you
  know they exist, not so you tackle them solo.

### Launch blockers (do these first)

1. 🟢 **Build the privacy policy, terms of service, contact, help, and FAQ
   pages.** Footer links to `/privacy`, `/terms`, `/contact`, `/help`,
   `/faq` are dead. UK consumer launch with paid subscriptions and audio
   recording legally requires a GDPR-compliant privacy notice and T&Cs.
   Don't write these from scratch — use a generator like
   [Termly](https://termly.io/) or [Iubenda](https://www.iubenda.com/),
   or copy a template from a similar UK SaaS, then have the product owner
   review. The pages themselves are simple React components — copy the
   shape of an existing page like `Profile/ProfilePage.jsx` and add the
   route in `App.jsx`. **Don't launch without these.**

2. 🟢 **Add Sentry for error tracking.** Right now if something breaks in
   production, nobody finds out until a user emails. Sentry's free tier
   covers >5,000 events/month — plenty for this scale. Two installs:
   - Frontend: follow Sentry's React quickstart, then call
     `Sentry.captureException` from
     [`ErrorBoundary.jsx`](./frontend-react/src/components/ErrorBoundary.jsx)
     in the existing `componentDidCatch`.
   - Backend: follow Sentry's Node quickstart, then call
     `Sentry.captureException` from the existing `unhandledRejection` and
     `uncaughtException` handlers near the top of
     [`server.js`](./backend/server.js).

3. 🟡 **Set up uptime monitoring.** Free tools:
   [UptimeRobot](https://uptimerobot.com/) or
   [Better Stack](https://betterstack.com/). Have it ping
   `https://api.reviva.live/health` every minute and email you if it
   fails. Takes ~10 minutes to set up.

4. 🟡 **WebSocket reconnection.** If a user's connection drops
   mid-interview (mobile signal blip, server restart), they currently
   have to leave the page and come back. The simplest fix is **not**
   automatic reconnection — it's showing a clear UI banner that says
   "Connection lost — click to reconnect" and starting a fresh session
   when they click. The relevant file is
   [`frontend-react/src/hooks/useSession.js`](./frontend-react/src/hooks/useSession.js)
   — the `ws.onclose` handler. **If you've never worked with WebSockets,
   ask the owner before starting** — there are some subtleties around
   not double-counting an interview session.

### Soon after launch (when you have breathing room)

5. 🟢 **Save the Supabase database schema to git.** In Supabase Dashboard
   → Database → look for an export option, or use
   `pg_dump --schema-only --no-owner > db/schema.sql` if you have psql
   access. Commit the file. This makes future schema changes reviewable.
6. 🟢 **The Jest test suite emits a warning** about an unclosed test
   handle (`Force exiting Jest`). It's harmless but should be cleaned up
   — likely a missing `await` or `afterAll` in
   [`websocket-integration.test.js`](./backend/__tests__/websocket-integration.test.js).
7. 🟢 **The landing page bundle is large** (`LandingPage` chunk is
   656 KB, mostly Three.js + GSAP). First-paint on slow mobile is slow.
   Add `loading="lazy"` to images, and ask the owner if it's OK to
   dynamic-import (lazy-load) the Three.js scene only after the page
   is interactive. Mid-difficulty change.
8. 🟢 **Add a `LICENSE` file.** Pick whatever the owner prefers (likely
   "All Rights Reserved" since this is commercial).

### Things to know exist but don't tackle solo

These are real issues, but they touch the realtime audio pipeline or
payment flow and are easy to break subtly. **Discuss with the owner
before attempting any of these:**

9. 🔴 **Stripe webhook isn't strictly idempotent.** If Stripe retries an
   event, `customer.subscription.updated` / `deleted` can race. Real
   risk is low at current scale but worth fixing eventually. Path:
   dedupe by `event.id`. Code:
   [`backend/server.js` Stripe webhook handler](./backend/server.js).
10. 🔴 **Replace `console.*` logs with structured logging** (e.g. `pino`).
    The backend has 145 ad-hoc `console.log` calls. Big cleanup;
    coordinate timing with the owner.
11. 🔴 **`backend/server.js` is 1,231 lines** mixing WebSocket handlers,
    Express routes, and middleware. A split into `src/websocket/`,
    `src/routes/`, `src/middleware/` would help maintainability —
    **but the per-session promise lock inside is subtle and easy to
    break**. Don't refactor without the owner's go-ahead and a
    careful test pass.
12. 🔴 **TTS pipeline tuning** — see §8 for details. Skip this section
    until you've been working on the codebase for at least a few weeks
    and the basic launch issues are stable.

### Half-finished / known incomplete

13. 🟡 **Full mock-exam flow is half-built.** There are TODOs in
    [`ScenarioFlow.jsx`](./frontend-react/src/pages/Scenarios/ScenarioFlow.jsx)
    around line 94 and 170. Right now the button is clickable but goes
    nowhere useful. The product owner can decide whether you finish the
    flow or hide the button. **Ask before doing either.**
14. ℹ️ **Most scenario prompt content is placeholder.** Only
    `clinical/emergencies/necrotising_fasciitis` and
    `clinical/microsurgery/replantation` have full content; the other
    ~163 use a template marked with `[AUTHOR NOTE — DELETE THIS ENTIRE
    SECTION]`. **This is the product owner's job, not yours.** They're
    written by a clinical expert. If a user reports an interview "feels
    weird" or "the AI doesn't know about X", that's why — it's the
    template, not a bug.

### Already done in the handover commit (don't worry about these)

- Two committed credentials removed from tracking; `.gitignore` updated.
  (Owner is rotating the keys themselves.)
- 13 stale top-level docs deleted.
- Orphaned vanilla-JS source dirs removed.
- Backend `.env.example` corrected.
- `JSON.parse` in `useSession.js` is now wrapped in try/catch.
- Feedback failure no longer shows a falsely-positive "score 3" — modal
  now shows "Unavailable / —".

---

## 8. (Advanced) LLM-latency tuning — read later, not now

Skip this section on day 1. Come back to it after you've been in the
codebase for a few weeks and feel comfortable. Then, only with the
owner's agreement, you can start experimenting.

**The thing to optimise** is "user finishes speaking → first word of AI
reply audible". The architecture is already good (parallel TTS,
sentence-level streaming); the issue is constants and serialisation.

**Diagnostic logs already exist.** Watch the Render log stream during a
test interview and you'll see:

```
[VAD] Speech ended for <id>, <ms>ms audio, VAD held <ms>ms
[TIMING] Whisper STT: <ms>ms
[PERF] LLM first token: <ms>ms
[PERF] First sentence ready: <ms>ms
[PERF] First chunk sent: <ms>ms
[PERF] Pipeline total: <ms>ms
```

Before changing anything, capture these numbers from 5-10 sample
interviews so you can prove a tuning change actually helped.

**Levers, in rough order of expected impact:**

1. **Whisper STT is sequential** — one round trip after each user turn
   (~600-1500 ms). Could be parallelised by transcribing in the
   background while the user is still speaking. Hardest one.
2. **Global TTS queue** — `GeminiTTSService._queue` serialises all TTS
   across all sessions. Under any concurrency this becomes a bottleneck.
3. **Sentence buffer threshold** — first TTS chunk waits for ≥20 chars
   ending in a sentence boundary. Lowering this lets the AI start
   speaking sooner.
4. **Gemini TTS retry policy** — currently waits 500 ms before falling
   back to Cloud TTS on first error. Skip the wait; fall over faster.
5. **Long TTS style prompts** — each call prepends ~120-180 tokens of
   "director's notes" (in `backend/src/config/index.js`). Trimming saves
   bill time.
6. **`ScriptProcessorNode`** is deprecated; AudioWorklet is the modern
   replacement. Doesn't change latency much, but improves stability on
   backgrounded tabs.
7. **AudioPlayer** uses HTML5 `Audio` + Blob URLs with a 10-second
   magic-number timeout. Web Audio API would be more accurate. Minor.

Each of these is a 1-3 day investigation + tuning task on its own. Don't
batch them — change one thing, measure, decide.

---

## 9. When something breaks in production — where to look

Until Sentry is set up (§7 #2), you find out about problems when users
email. Here's where to look in each case:

| Problem | Where to look |
|---|---|
| Site down / slow | Render dashboard → Logs (tail in real-time). Visit `https://api.reviva.live/health` — should return `{"status":"ok"}`. |
| Frontend won't load | Vercel dashboard → Deployments → most recent build's logs. |
| User can't log in | Supabase dashboard → Logs → Auth. Filter by user email. |
| Subscription / payment problem | Stripe dashboard → Events (search by customer email). Then cross-reference Render logs for lines starting with `[STRIPE WEBHOOK]` or `[STRIPE]`. |
| User says "the AI never speaks" | Open Render logs and search for the user's `userId` (it appears in the `[CLIENT]` connection line). Look for these lines in order: `[VAD] Speech ended` (mic detection worked?) → `[TIMING] Whisper STT` (transcription worked?) → `[PERF] LLM first token` (AI started responding?) → `[PERF] First chunk sent` (audio left the server?). Whichever line is missing tells you which stage broke. |
| API rate limit | Look for `[<model>] Rate limited` lines in logs. After 3 retries the user gets a `RATE_LIMITED` error. Usually means we're hitting Gemini's free-tier quota — talk to the owner about upgrading. |
| Supabase keep-alive workflow failing | GitHub Actions → "Supabase Keep-Alive". If it fails for >7 days, Supabase auto-pauses the database on the free tier. |
| Prompt Lab change didn't deploy | Backend auto-deploy is **off** intentionally. After saving a Prompt Lab edit, manually trigger a deploy in the Render dashboard. |

**If you can't tell what's wrong**, take a screenshot of the user's
report, copy the relevant Render log lines, and message the owner. Don't
guess at fixes for the realtime audio pipeline — you'll likely make it
worse.

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

## 11. Accounts you'll need access to

The product owner will invite you to each of these. Most are obvious; a
few notes:

| Account | What you'll do there | Access level |
|---|---|---|
| GitHub repo | Read code, push fixes | Collaborator |
| Vercel | Frontend deploys + logs | Member |
| Render | Backend deploys + logs | Member of the team |
| Supabase | Database, auth logs | Developer role is enough |
| Stripe | Debug payment issues | Read role is enough |
| Sentry (once set up, §7 #2) | See production errors | Member |
| Google Cloud (`st3-coach-v4`) | Only if needed; ask first | Viewer |
| OpenAI / Google AI Studio | API keys are shared via env vars on Render — you generally don't need direct console access | — |

**You don't need owner-level access on anything.** If a tool's UI says
you don't have permission to do something, ask — don't escalate
yourself.

### About the credentials in git history

Two credentials were previously committed to this repo and are in
`git log` history. The owner has rotated both, which makes the leaked
values useless. You don't need to do anything about this.

---

## 12. House rules — small things that matter

A few quirks of this codebase. Skim once, refer back when you hit them.

- **Commit straight to `main` and push.** No feature branches, no PRs.
  Once you're settled in, you and the owner can decide if you'd prefer
  a PR-based workflow. Either is fine.
- **`git pull --rebase` runs automatically before every push.** This is
  set up in a Husky hook. The reason: the production server can make its
  own commits via the Prompt Lab tool, and we need to pull those before
  pushing yours. If a push fails because of this, just rebase and retry
  — **don't use `--no-verify` to skip hooks**.
- **Image paths must be lowercase.** `/images/foo/bar.png`, never
  `/Images/Foo/Bar.PNG`. Vercel runs on Linux which is case-sensitive
  and we got bitten by this once.
- **Render's auto-deploy is intentionally off** for the backend (because
  Prompt Lab edits would otherwise trigger a redeploy on every save).
  Backend deploys are manual via the Render dashboard. The frontend
  *does* auto-deploy from `main` on Vercel.
- **Three files share two configs.** `FREE_TIER_SCENARIOS` (which
  scenarios are free vs paid) and `SPECIALTY_MAP` (which specialty each
  scenario belongs to) live in three places that must agree:
  `backend/src/config/index.js`, `frontend-react/src/config.js`, and
  `frontend/config.js`. There's a test (`config-sync.test.js`) that
  fails if they drift. If you ever add a free scenario, edit all three.
- **Most "scenarios" are placeholder content.** See §7 #14 — not
  your problem.
- **The Prompt Lab** at `/prompt-lab` is a tool for the product owner to
  edit AI prompts without redeploying. Don't worry about it unless they
  ask. It auto-commits its changes to GitHub.

---

## 13. If you get stuck

**Asking is faster than guessing.** This codebase has a few subtle parts
(the WebSocket session lock, the audio pipeline timing, the Stripe
webhook). Spending 30 minutes confused is normal; spending half a day
silently confused is not.

When you ask the owner, include:
- What you were trying to do
- What you tried
- What happened (error message, screenshot, log lines)
- Your current best guess at the cause (it's fine to be wrong)

Things you don't need to know on day 1:
- The Server VAD internals (Silero ONNX, frame buffering, redemption
  frames)
- The per-session promise lock in `backend/server.js`
- Why Gemini TTS is queued globally vs per-session
- Modular prompt assembly internals

Things worth understanding in your first week:
- How auth flows from browser → backend (read `useAuth.js` then the
  WebSocket auth check at the top of `backend/server.js`)
- How a single user turn flows through the system (read §3, then run an
  interview locally with the dev tools open)
- The deploy process for both frontend (auto) and backend (manual)
- How to read Render logs

### Files worth knowing about

You don't need to read all of these. Open them when a task points you
there.

**Frontend (mostly where you'll work):**
- [`frontend-react/src/App.jsx`](./frontend-react/src/App.jsx) — routes
- [`frontend-react/src/components/`](./frontend-react/src/components/) — UI components
- [`frontend-react/src/pages/`](./frontend-react/src/pages/) — top-level pages
- [`frontend-react/src/hooks/useSession.js`](./frontend-react/src/hooks/useSession.js) — the interview WebSocket orchestrator (touch carefully)
- [`frontend-react/src/hooks/useAuth.js`](./frontend-react/src/hooks/useAuth.js) — session restore
- [`frontend-react/src/stores/`](./frontend-react/src/stores/) — Zustand stores

**Backend (touch with more care):**
- [`backend/server.js`](./backend/server.js) — the big file. WebSocket + Express in one place.
- [`backend/src/config/index.js`](./backend/src/config/index.js) — env vars, `FREE_TIER_SCENARIOS`, `SPECIALTY_MAP`
- [`backend/src/services/`](./backend/src/services/) — LLM, TTS, VAD wrappers
- [`backend/prompts/`](./backend/prompts/) — the AI prompts (owner's territory)

Welcome aboard.

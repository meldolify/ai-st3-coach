# Render -> Fly.io migration plan

**Status:** Approved, ready to execute
**Owner:** Mohamed (user) — assisted by Claude Code
**Target date:** Pre-launch (before public marketing push)
**Estimated total wall time:** 4–6 hours of focused work, spread over 2 calendar days (DNS propagation + cert verification dominate the clock).

---

## 1. Context

### Why we're moving
- Render's free/starter tiers spin down idle services; even on paid tiers, cold starts during ST3 interview season (Feb–Mar peak) will cut sessions mid-handshake.
- Render's pricing scales poorly for the sustained low-traffic + bursty-WS workload we have. Fly's per-machine pricing + `min_machines_running = 1` gives us a predictable always-on cost.
- Render does not give us a region picker in the EU at our tier; Fly does (Amsterdam `ams` and Frankfurt `fra` are both UK-adjacent low-latency).
- We can keep `api.reviva.live` and avoid touching Stripe / Supabase / Google OAuth — only DNS changes externally.

### Destination shape
- **One Fly app** (`reviva-backend`) running a single Docker container.
- **Single Node.js process** that owns BOTH the WebSocket server (interview sessions, `audio_chunk` PCM, Deepgram Flux fan-out) and the Express HTTP server (`/health`, `/stripe-webhook`, `/prompt-lab/api/*`). They share port 8080 via the existing native `ws` upgrade-on-the-HTTP-server pattern in `backend/server.js`.
- **Region:** `ams` (Amsterdam) — see `fly.toml` comment for justification.
- **Machine size:** `shared-cpu-1x` / 1024 MB. ONNX Silero VAD model is only ~1.72 MB; Gemini/Deepgram/TTS calls are I/O-bound. 1 GB is comfortable headroom.
- **Always-on:** `auto_stop_machines = false`, `min_machines_running = 1`. Stopping the machine while a WS is connected would kill in-flight interviews.

### Constraint envelope
- **No frontend code changes.** `frontend-react/src/config.js` hardcodes `wss://api.reviva.live` and `https://api.reviva.live` — DNS handles the swap.
- **No Stripe dashboard changes.** Webhook URL stays `https://api.reviva.live/stripe-webhook`.
- **No Supabase dashboard changes** unless redirect URLs hardcode `api.reviva.live` (verify; very unlikely — OAuth uses `window.location.origin` per `frontend-react/src/pages/Auth/AuthPage.jsx`).
- **Zero-downtime cutover.** We run Render and Fly in parallel during DNS propagation.

---

## 2. Pre-migration prerequisites (Phase 0)

**Time: 30 min**

- [ ] Create a Fly.io account at https://fly.io/app/sign-up (use `mezzeldolify@gmail.com`).
- [ ] Add a payment card. Fly bills monthly in arrears; no upfront cost.
- [ ] Install flyctl locally (PowerShell on Windows):
  ```powershell
  iwr https://fly.io/install.ps1 -useb | iex
  ```
  Then close & reopen PowerShell, then:
  ```powershell
  fly version
  fly auth login
  ```
- [ ] Confirm git working tree is clean on `main`:
  ```powershell
  git status
  ```
- [ ] Create a migration branch off `main`:
  ```powershell
  git checkout -b chore/fly-migration
  ```
- [ ] Confirm you can read the current Render env var values (Render dashboard -> reviva-backend -> Environment). You'll need every value listed in §5.
- [ ] Confirm where DNS for `reviva.live` lives (Cloudflare? GoDaddy? Vercel DNS?). You'll edit a CNAME there in Phase 7.
- [ ] Confirm Docker Desktop is running locally (needed to test the container before pushing). If you don't have Docker installed, install it from https://www.docker.com/products/docker-desktop.
- [ ] **Branch protection:** ensure `main` requires PR review before merge so the migration branch can be reviewed before going live (already enforced via standard repo settings — verify).

---

## 3. Phase 1 — Containerize locally (60 min)

The Dockerfile, `.dockerignore`, and `fly.toml` files are already in the repo at:

- `backend/Dockerfile`
- `backend/.dockerignore`
- `backend/fly.toml`

### 3.1 Build locally

From `backend/`:

```powershell
cd backend
docker build -t reviva-backend:local .
```

Expected: ~3–5 min first build (npm ci installs `onnxruntime-node` native bindings); subsequent builds use layer cache and finish in <30 s when only source changes.

### 3.2 Smoke-test locally

Create a throwaway `.env.docker` next to the Dockerfile (NOT committed — `.dockerignore` already excludes `.env*`) with the minimum vars:

```env
GEMINI_API_KEY=...           # from backend/.env
DEEPGRAM_API_KEY=...         # from backend/.env
GOOGLE_APPLICATION_CREDENTIALS_JSON=...  # paste content of backend/google-tts-key.json as one line
NODE_ENV=production
PORT=8080
FRONTEND_URL=http://localhost:3001
```

Run:

```powershell
docker run --rm -p 8080:8080 --env-file .env.docker reviva-backend:local
```

- [ ] In another terminal, hit `/health`:
  ```powershell
  curl http://localhost:8080/health
  ```
  Expected: `{"status":"ok"}` (or whatever current shape — confirm matches Render behaviour).
- [ ] Open the React dev server (`cd frontend-react && npm run dev`) pointing `BACKEND_URL` overrides (temporarily) at `localhost:8080` if needed, and run one full interview to confirm WS + Deepgram + Gemini + TTS all work inside the container.
- [ ] **Delete `.env.docker`** when done. Do not commit it.

If anything fails here, fix it BEFORE moving to Phase 2 — debugging is 10x faster locally than against Fly.

---

## 4. Phase 2 — Bootstrap the Fly app (15 min)

Because we've pre-written `fly.toml`, we use `fly launch --no-deploy` to register the app and link the toml without letting Fly try to deploy from scratch.

From `backend/`:

```powershell
cd backend
fly launch --no-deploy --copy-config --name reviva-backend --region ams
```

When prompted:
- "Would you like to copy its configuration to the new app?" -> **Yes**
- "Would you like to set up a Postgresql database now?" -> **No**
- "Would you like to set up an Upstash Redis database now?" -> **No**
- "Create .dockerignore from 1 .gitignore files?" -> **No** (we already wrote one)
- "Would you like to deploy now?" -> **No**

This:
- Reserves the app name `reviva-backend` globally on Fly.
- Confirms the org and region.
- Does NOT deploy yet — we set secrets first.

- [ ] Confirm:
  ```powershell
  fly apps list
  ```
  Should show `reviva-backend` with status `pending`.

---

## 5. Phase 3 — Migrate secrets (20 min)

Fly's `fly secrets set` writes the value to the encrypted secret store; it never appears in `fly.toml` or git. You can set them all in one `fly secrets set` call, but doing them grouped lets you confirm each succeeds.

**For each variable below, copy the value from the Render dashboard** (Render -> reviva-backend -> Environment).

### 5.1 Required — interview engine

```powershell
fly secrets set `
  GEMINI_API_KEY="paste-here" `
  DEEPGRAM_API_KEY="paste-here" `
  -a reviva-backend
```

### 5.2 Required — Google Cloud TTS fallback

The Render value is the JSON contents of the service account key as one line. Copy it whole:

```powershell
fly secrets set GOOGLE_APPLICATION_CREDENTIALS_JSON="paste-the-entire-json-here" -a reviva-backend
```

`backend/src/config/index.js:12` already writes this JSON to a temp file at startup and points `GOOGLE_APPLICATION_CREDENTIALS` at it — no Fly-specific code change needed.

### 5.3 Required — Supabase

```powershell
fly secrets set `
  SUPABASE_URL="https://vsdiovgjnbziwwukpvqo.supabase.co" `
  SUPABASE_SERVICE_KEY="paste-service-role-key" `
  -a reviva-backend
```

### 5.4 Required — Stripe

```powershell
fly secrets set `
  STRIPE_SECRET_KEY="sk_live_..." `
  STRIPE_WEBHOOK_SECRET="whsec_..." `
  STRIPE_PRICE_ID_MONTHLY="price_..." `
  STRIPE_PRICE_ID_ANNUAL="price_..." `
  -a reviva-backend
```

### 5.5 Required — frontend URL + admin allowlist

```powershell
fly secrets set `
  FRONTEND_URL="https://www.reviva.live" `
  PROMPT_LAB_ENABLED="true" `
  PROMPT_LAB_ADMIN_EMAILS="mezzeldolify@gmail.com" `
  NODE_ENV="production" `
  -a reviva-backend
```

### 5.6 Required — Prompt Lab GitHub auto-commit (`src/services/GitHubService.js`)

```powershell
fly secrets set `
  GITHUB_TOKEN="ghp_..." `
  GITHUB_OWNER="mezzeldolify" `
  GITHUB_REPO="AI-ST3-Coach-V4" `
  -a reviva-backend
```

### 5.7 Optional — Sentry (only if/when configured)

```powershell
fly secrets set SENTRY_DSN="https://...@sentry.io/..." -a reviva-backend
```

### 5.8 Verify

```powershell
fly secrets list -a reviva-backend
```

You should see every secret name. Values are never displayed — that's fine.

---

## 6. Phase 4 — First deploy + smoke tests on the Fly URL (45 min)

```powershell
fly deploy -a reviva-backend
```

Expected timeline:
- Builder boots: ~30 s
- Image build: ~3–5 min first time
- Push to Fly registry: ~30–60 s
- Machine creation + start: ~30 s
- Health check passes: ~10–20 s after start

If `fly deploy` exits 0, the app is live at `https://reviva-backend.fly.dev`.

### 6.1 Health endpoint

```powershell
curl https://reviva-backend.fly.dev/health
```
- [ ] Should return `{"status":"ok"}`.

### 6.2 Logs

```powershell
fly logs -a reviva-backend
```
- [ ] Confirm: `[CONFIG] Using Google Cloud credentials from environment variable`, no `BLOCKER` warnings, no Sentry errors.

### 6.3 WebSocket handshake against the Fly URL

Temporarily override `BACKEND_URL` in `frontend-react/src/config.js` to `wss://reviva-backend.fly.dev` (DO NOT commit this — it's a local test only), run `cd frontend-react && npm run dev`, log in, start an interview.

- [ ] Mic captures, transcript appears, AI responds with audio, barge-in works, End Interview returns feedback.

If the WS upgrade fails, the most likely cause is the `Sec-WebSocket-Protocol` sub-protocol header being stripped — Fly does NOT strip it, but verify in `fly logs` that the `[AUTH]` extractAuthToken path succeeds.

- [ ] Revert your local `config.js` override before moving on.

### 6.4 Stripe webhook against the Fly URL (test mode)

In the Stripe dashboard, temporarily add a SECOND webhook endpoint pointing to `https://reviva-backend.fly.dev/stripe-webhook` (test mode only). Trigger a `checkout.session.completed` event via Stripe CLI:

```powershell
stripe listen --forward-to https://reviva-backend.fly.dev/stripe-webhook
stripe trigger checkout.session.completed
```

- [ ] Confirm Fly logs show `[STRIPE] Event id=evt_... type=checkout.session.completed verified` (or your current log shape).
- [ ] Delete the temporary test-mode webhook from Stripe before continuing.

---

## 7. Phase 5 — Add custom domain `api.reviva.live` (45 min, mostly wall-clock DNS time)

This phase issues the TLS cert FIRST so we have it ready when we flip DNS in Phase 7.

### 7.1 Issue the certificate

```powershell
fly certs create api.reviva.live -a reviva-backend
```

Fly will print TWO DNS records to add — one A or AAAA challenge, one CNAME. **Note them down.**

### 7.2 Add the DNS validation records at your DNS provider

At Cloudflare / GoDaddy / wherever `reviva.live` lives:
- [ ] Add the `_acme-challenge.api.reviva.live` CNAME record exactly as Fly printed.
- [ ] Do NOT change the existing `api.reviva.live` CNAME yet (that's Phase 7 — it still points to Render).

### 7.3 Wait for cert verification

```powershell
fly certs show api.reviva.live -a reviva-backend
```
- [ ] Wait until `Status: Ready` and `Source: lets_encrypt`. Typically 1–5 min after DNS propagates; can take up to 30 min.

You now have a valid TLS cert ready on Fly, but `api.reviva.live` still resolves to Render. Good — that's the safe state.

---

## 8. Phase 6 — Update external integrations (15 min — most are no-ops)

This is the integrations audit walked through line by line. **The headline: almost nothing changes because the domain `api.reviva.live` is preserved.**

### What STAYS `api.reviva.live` (no action)
- [x] Stripe webhook URL (`https://api.reviva.live/stripe-webhook`) — no Stripe dashboard change.
- [x] Supabase auth redirects — verify no `api.reviva.live` is hardcoded in Supabase dashboard -> Auth -> URL Configuration -> Redirect URLs. (Per audit, OAuth uses `window.location.origin`, so it's pointed at `www.reviva.live`, not the backend.)
- [x] Google OAuth — managed by Supabase; no Google Console change.
- [x] `vercel.json` rewrite -> `https://api.reviva.live/prompt-lab/api/$1` — stays as-is, DNS handles routing.
- [x] `frontend-react/src/config.js` `BACKEND_URL` and `HTTP_BACKEND_URL` — stay hardcoded to `api.reviva.live`.
- [x] UptimeRobot monitor on `https://api.reviva.live/health` — no change.
- [x] GitHub Actions workflows (`test.yml`, `keep-alive.yml`) — neither references the backend; no change.

### What needs a small code commit (do this NOW on the migration branch, BEFORE Phase 7 cutover)

- [ ] **Remove `'wss://*.onrender.com'` from CSP** in `backend/server.js` (search for `onrender.com` in the helmet/CSP config). Per the integrations audit, the entry is now stale.
  ```js
  // Before
  connectSrc: ["'self'", 'https://*.supabase.co', 'wss://*.onrender.com', 'https://api.stripe.com'],
  // After
  connectSrc: ["'self'", 'https://*.supabase.co', 'https://api.stripe.com'],
  ```
  Commit:
  ```powershell
  git add backend/server.js
  git commit -m "chore(csp): drop onrender.com connectSrc allowlist (Fly migration)"
  ```

### Optional during cutover (recommended)
- [ ] In UptimeRobot, add a **second** monitor temporarily pointing at `https://reviva-backend.fly.dev/health` so you have visibility during the DNS flip on whether Fly itself is up vs whether DNS has propagated.

---

## 9. Phase 7 — DNS cutover (30 min + DNS propagation wait)

This is the only step the public will see. Do it during a low-traffic window (UK early morning is fine pre-launch).

### 9.1 Lower TTL beforehand

**24 hours BEFORE cutover:** lower the TTL on the `api.reviva.live` CNAME at your DNS provider to **60 seconds**. This means if anything goes wrong, the rollback DNS change propagates fast.

If you forgot to do this 24h in advance, you can still proceed — propagation will just take longer (5–30 min instead of <2 min).

### 9.2 Flip the CNAME

At your DNS provider:
- [ ] Change the CNAME for `api.reviva.live` from the current Render hostname to `reviva-backend.fly.dev`.
- [ ] Keep TTL at 60 seconds for the next 48 hours (raise back to 3600 after that).

### 9.3 Watch propagation

```powershell
nslookup api.reviva.live 1.1.1.1
nslookup api.reviva.live 8.8.8.8
```
- [ ] Both should eventually return Fly's IP (anycast). Run every 60 s until both flip.

### 9.4 Verify HTTPS resolves to Fly

```powershell
curl -v https://api.reviva.live/health
```
- [ ] The TLS cert in the response should be issued by Let's Encrypt for `api.reviva.live` (the one Fly minted in Phase 5).

---

## 10. Phase 8 — Post-cutover verification (30 min)

Run the **Verification checklist** in §15 against `https://api.reviva.live` (NOT the .fly.dev URL).

If everything passes, congratulations — you're on Fly.

---

## 11. Phase 9 — Decommission Render (1 week later)

**Wait at least 7 days** before deleting the Render service. Reasons:
1. Stripe webhook retries can take up to 3 days; if any retry hits a stale DNS cache somewhere, you want Render still answering.
2. You want one full week of real traffic on Fly to surface any issues you didn't see in smoke tests.
3. Cost of one extra week of Render is trivial vs. the cost of needing to roll back without infrastructure.

After 7 days of green Fly metrics:

- [ ] Render dashboard -> reviva-backend -> Settings -> **Suspend** (not delete). Suspended services keep config but don't run.
- [ ] Wait ANOTHER 7 days.
- [ ] Render dashboard -> reviva-backend -> Settings -> **Delete**.
- [ ] Remove the temporary UptimeRobot monitor on `reviva-backend.fly.dev` (the canonical `api.reviva.live` monitor stays).
- [ ] Delete the `.env.docker` smoke-test file if it's still hanging around locally.

**What to keep:**
- The list of Render env var values, in a password manager, until Render is fully deleted. After deletion you can purge them.
- The `chore/fly-migration` branch in git history (don't delete) — it's the audit trail.

---

## 12. Rollback plan

### Rollback during Phase 1 (local containerize)
Just don't commit. No external state touched.

### Rollback during Phase 2 (fly launch)
```powershell
fly apps destroy reviva-backend
```
No external state touched.

### Rollback during Phase 3 (secrets)
Secrets exist on Fly but nothing's deployed and DNS still points at Render. Either leave them (free) or `fly apps destroy reviva-backend`.

### Rollback during Phase 4 (first deploy, .fly.dev URL only)
DNS still on Render. Production is unaffected. Either fix forward on Fly, or destroy the Fly app.

### Rollback during Phase 5 (cert issued, DNS not flipped)
Production still on Render. Either keep the cert (free) or `fly certs delete api.reviva.live -a reviva-backend`.

### **Rollback during Phase 7 (DNS cutover — the only risky one)**

If post-cutover smoke tests fail:

1. **At the DNS provider:** change the `api.reviva.live` CNAME back to the original Render hostname.
2. Because TTL is 60 s (per §9.1), propagation back to Render is <2 min globally.
3. Confirm rollback worked:
   ```powershell
   curl -v https://api.reviva.live/health
   ```
   TLS cert in the response should be Render's again.
4. Fly stays running on `reviva-backend.fly.dev` — debug it offline without time pressure.
5. Re-attempt cutover only after the root cause is fixed and re-verified against the .fly.dev URL.

### Rollback after Phase 9 (Render deleted)
Not possible cheaply. That's why we wait 7+7 days. If a deep-buried bug surfaces a month later, fix forward on Fly.

---

## 13. Gotchas (from codebase + integrations audits)

### BLOCKER-level

1. **`auto_stop_machines = false` is non-negotiable.** Fly's default is to stop idle machines. With long-lived voice WebSockets (up to 30 min interview + 5 min feedback), stopping mid-session disconnects users. The `fly.toml` already sets this; if you ever regenerate it via `fly launch` without `--copy-config`, this WILL get reset. Always check before deploying.

2. **`min_machines_running = 1`.** Same reason. Combined with above, this guarantees 1 always-on machine.

3. **`PORT` env var.** Render injects `PORT`; Fly defers to `internal_port` in `fly.toml`. `backend/src/config/index.js:55` already reads `process.env.PORT || 8080`. The Dockerfile sets `PORT=8080` and exposes 8080; `fly.toml` says `internal_port = 8080`. All aligned — don't change one without changing the others.

4. **`GOOGLE_APPLICATION_CREDENTIALS_JSON` must be set as a Fly *secret*, not regular env var.** It contains a private key. Use `fly secrets set` (Phase 5.2), never `fly.toml`. `backend/src/config/index.js:12` writes it to a temp file at `/tmp/gcloud-creds-<random>.json` on every boot — this works on Fly's writable rootfs without changes.

5. **WebSocket auth via `Sec-WebSocket-Protocol` sub-protocol header.** Per the CLAUDE.md "Access Control (Server-Side)" section, the JWT travels in `Sec-WebSocket-Protocol: st3.auth.bearer, <jwt>`. Fly's proxy preserves this header — verified by Fly docs — but it's worth confirming in Phase 6.3 logs that `extractAuthToken(req)` succeeds.

### IMPORTANT-level

6. **`onnxruntime-node` native module.** Pulled in by Silero VAD v4 (`backend/models/silero_vad_v4.onnx`, ~1.72 MB). It ships prebuilt binaries for `linux-x64`, which is what `node:22-bookworm-slim` provides. The Dockerfile installs `python3` `make` `g++` `libc6-dev` just in case the prebuilt isn't picked up — this is defensive, not always necessary. If `npm ci` is slow, you can try removing those build tools and see if the prebuilt works on its own.

7. **Stripe webhook raw-body parser.** `backend/server.js` mounts a `bodyParser.raw({ type: 'application/json' })` specifically on `/stripe-webhook` BEFORE `express.json()`. Fly does not modify request bodies — this works unchanged. Smoke-test it in Phase 4.4 to be sure.

8. **CSP `wss://*.onrender.com` is stale** — remove per §8. Not security-critical (it's an allowlist, removing it tightens things), but it's a clear "this is no longer Render" signal in the code.

9. **CSP does NOT need a Fly entry.** The frontend connects to `wss://api.reviva.live` (the user-facing domain), not the underlying provider. CSP stays domain-based.

10. **`vercel.json` rewrite stays unchanged.** It targets `https://api.reviva.live/prompt-lab/api/$1`. DNS routes that to Fly. No Vercel redeploy needed for the migration.

11. **Husky pre-push hook runs `git pull --rebase`.** Per CLAUDE.md, this exists to sync Prompt Lab remote edits. It is NOT a deploy hook — Render's GitHub integration handled that. **Fly has no equivalent auto-deploy on push.** Deploys are manual via `fly deploy` (or via a new GitHub Action you add later). Document this in CLAUDE.md after migration — see §16.

12. **GitHub Actions `test.yml` and `keep-alive.yml` are unaffected** — neither knows about Render or Fly. No changes.

13. **`PROMPT_LAB_ADMIN_EMAILS` must be set on Fly** or all `/prompt-lab/api/*` endpoints will return 503 in production. Already covered in Phase 5.5.

14. **Sentry DSN copies straight across.** It's a provider-issued URL, not derived from the host. If it was unset on Render (per audit, it currently is), it stays unset on Fly until you configure Sentry.

15. **Google Cloud TTS service account doesn't care about hosting provider** — it authenticates via the JSON key, not by IP allowlist. No GCP console change.

16. **Deepgram and Gemini API keys don't care about hosting provider** either. No provider dashboard changes.

17. **DNS TTL must be lowered 24h BEFORE cutover** (§9.1) for fast rollback. If you skip this, rollback still works, just slower (could be 30+ min depending on resolver caching).

18. **Fly egress to external APIs.** `ams` (Amsterdam) -> Deepgram (US), Gemini (US), Stripe (US), Supabase (`eu-west-1` Ireland), GitHub (US). All add 80–120 ms latency vs a US-hosted backend, but the user-facing path is UK->Fly-AMS->OpenAI/Deepgram->Fly-AMS->UK and the UK->AMS leg is <20 ms. Net effect: comparable to Render's nearest EU region.

---

## 14. Cost estimate

Fly's pricing (current as of 2026-05): `shared-cpu-1x` 1024 MB at `min_machines_running = 1` runs **24/7 = ~720 machine-hours/month**. At ~$0.0000022/sec for the VM size, plus ~$0.15/GB outbound bandwidth from `ams`.

Currency conversion at 1 GBP ~= 1.27 USD (round to nearest £).

| Scenario | Machine hours | Bandwidth | Monthly USD | Monthly GBP |
|---|---|---|---|---|
| **Pre-launch (zero real traffic)** | 720 hrs always-on | <1 GB | ~$5.70 + ~$0.15 = $5.85 | **~£5** |
| **Modest launch (50 GB/month outbound)** | 720 hrs | 50 GB | ~$5.70 + ~$7.50 = $13.20 | **~£11** |
| **Scaled (200 GB/month outbound)** | 720 hrs | 200 GB | ~$5.70 + ~$30 = $35.70 | **~£28** |

**Caveats:**
- TTS audio is the bandwidth heavy hitter — WAV chunks at 24 kHz mono 16-bit ~= 48 KB/s. A 30-min interview with 5 min of AI speech ~= ~15 MB outbound per session. At 50 GB/month that's ~3,300 sessions/month, which is well above pre-launch volumes.
- If we ever need to scale up the machine (e.g. RAM pressure from many concurrent WS sessions), `shared-cpu-2x` / 2048 MB roughly doubles the VM cost. Plenty of headroom before that's needed.
- Fly bills monthly in USD; your card statement will show the £ conversion.

**Versus Render:** Render's current Starter tier is $7/month flat, but does not give us EU region pinning at our tier and has cold-start risk. Fly at pre-launch is comparable (~£5 vs ~£6); at scaled it's still well under £30/month, which is fine.

---

## 15. Verification checklist (post-cutover)

Run all of these against `https://api.reviva.live` (NOT the .fly.dev URL) after Phase 7 DNS propagation.

- [ ] **Health endpoint:**
  ```powershell
  curl https://api.reviva.live/health
  ```
  Returns `{"status":"ok"}`.
- [ ] **TLS cert is Fly's:**
  ```powershell
  curl -v https://api.reviva.live/health 2>&1 | Select-String "issuer|subject"
  ```
  Issuer is Let's Encrypt; subject CN includes `api.reviva.live`.
- [ ] **WebSocket upgrade succeeds:** Open `https://www.reviva.live`, log in, go to `/scenarios`, pick necrotising fasciitis, start interview. Browser DevTools -> Network -> WS -> confirm `wss://api.reviva.live` connection opens with status 101.
- [ ] **Full interview round trip:** Speak a clinical answer, confirm transcript appears, AI responds with British-accented audio, barge-in works (interrupt the AI mid-sentence), End Interview returns 6 feedback sections + JSON summary.
- [ ] **Stripe checkout in test mode:** From `/scenarios` upgrade modal, run a test-mode checkout with card `4242 4242 4242 4242`. Confirm:
  - Checkout session created (Stripe dashboard test mode).
  - Webhook fires and Fly logs show `verified` event.
  - `subscriptions` table in Supabase updates to `status: active`.
- [ ] **GDPR delete endpoint:** Hit `DELETE https://api.reviva.live/api/account` from a test user session. Confirm Supabase row removed and Fly logs show the session terminated.
- [ ] **Sentry test event** (only if SENTRY_DSN was set): trigger a test error via the frontend ErrorBoundary, confirm event appears in Sentry frontend project. Throw a deliberate backend error, confirm it appears in the backend project.
- [ ] **UptimeRobot:** confirm the canonical `https://api.reviva.live/health` monitor stays green for 24 hours.
- [ ] **Fly logs are clean:**
  ```powershell
  fly logs -a reviva-backend
  ```
  No repeated errors, no "BLOCKER", no Sentry init failures.
- [ ] **No mixed-content warnings** in browser DevTools console when using the app.

---

## 16. Memory + CLAUDE.md updates after migration succeeds

Once Phase 9 is complete (Render deleted), update:

### `CLAUDE.md`

Find the **Deployment** section and replace:
- "Backend API: https://api.reviva.live/ (Render)" -> "Backend API: https://api.reviva.live/ (Fly.io, app `reviva-backend`, region `ams`)"
- "WebSocket: wss://api.reviva.live/" stays as-is.

Find the **Render Environment Variables** subsection and rename to **Fly.io Environment Variables (Secrets)**. Replace the prose with a pointer to `docs/render-to-fly-migration.md` §5 for the canonical secret list, and add:

```markdown
Deploy command:
\`\`\`powershell
cd backend && fly deploy -a reviva-backend
\`\`\`

View logs:
\`\`\`powershell
fly logs -a reviva-backend
\`\`\`
```

Add a note under **Git Workflow**: "Pushes to `main` do NOT auto-deploy to Fly. Run `fly deploy` manually from `backend/` after merging."

### `MEMORY.md`

Add a line under **Architecture Overview**:
> Backend hosted on **Fly.io** (`reviva-backend` app, region `ams`), single machine, `auto_stop_machines = false`. Deploys are manual via `fly deploy -a reviva-backend` from `backend/`.

Remove or update any references to Render-specific behaviour (cold starts, Render dashboard, etc).

### `docs/`

- [ ] Keep `docs/render-to-fly-migration.md` as the historical record.
- [ ] If `docs/runbook.md` or similar exists, update the "How to deploy" section to point at `fly deploy`.

### Stale audit references

- HANDOVER.md §7 #14 "still says ~163 placeholders" is already stale per MEMORY.md — no migration impact.
- The CLAUDE.md section "Render Environment Variables" header itself should be renamed; the values listed are still correct.

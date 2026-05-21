# Live Probe Log — Adversarial Security Audit (2026-05-21)

Chronological record of every HTTP request sent to production during the audit. Times in UTC.

## Rules of engagement
- Read-only probes only
- No load testing, no fuzzing
- Single throwaway audit identity (no account creation yet — to be done in Phase D)
- Stop on any unexpected 5xx

---

## 14:22 UTC — External recon (passive)

| Probe | Result | Note |
|---|---|---|
| `curl -I https://api.reviva.live/health` | 200 OK | Render serves directly; Cloudflare in front. Strong header set: HSTS preload, CSP (with cdn.jsdelivr.net + js.stripe.com), X-Frame-Options DENY, COOP/CORP same-origin, X-XSS-Protection 0 (modern correct), Referrer-Policy strict-origin-when-cross-origin. `Server: cloudflare` and `x-render-origin-server: Render` confirm topology. |
| `curl -I https://www.reviva.live/` | (failed first attempt — schannel revocation offline) | Re-tried with `-H Host` and got 200 from Vercel cache. |
| `curl https://www.reviva.live/.env` | 200 (SPA shell) | Vercel SPA rewrite — returns index.html for any unmatched route. Not a real file leak, but a vanity-scan annoyance. |
| `curl https://www.reviva.live/.git/config` | 200 (SPA shell) | Same as above. |
| `curl https://www.reviva.live/backend/.env` | 200 (SPA shell) | Same. |
| `curl https://www.reviva.live/admin` | 200 (SPA shell) | Same. |
| `curl https://www.reviva.live/prompt-lab` | 200 (SPA shell) | Lab UI loads client-side; auth happens on the `/prompt-lab/api/*` xhr. |
| `curl https://api.reviva.live/prompt-lab/api/transcripts/test` (no token) | **503** | `Prompt Lab admin allowlist not configured on the server` — confirms `PROMPT_LAB_ADMIN_EMAILS` env var not set on Render. Fails-closed behaviour working as intended; this also confirms Prompt Lab routes are mounted in prod (`PROMPT_LAB_ENABLED=true`). |
| `curl -X GET https://api.reviva.live/api/account/export` (no token) | 401 | `Authorization Bearer token required`. Correct. |
| `curl -X DELETE https://api.reviva.live/api/account` (no token) | 401 | Correct. |
| `curl -H "Origin: https://evil.example" https://api.reviva.live/health` | 200, ACAO = https://www.reviva.live | CORS does not echo the hostile origin — strict allowlist. Correct. |
| `curl -X POST -H "Content-Type: application/json" -d '{"customerId":"cus_invalid"}' https://api.reviva.live/create-portal-session` | **500** | **No auth required — endpoint accepts request and only fails when Stripe rejects the customer ID.** See Finding HIGH-01 in the report. |

## Observations to triage

1. **HIGH-01 candidate**: `POST /create-portal-session` is unauthenticated and proxies the `customerId` directly to Stripe's billing portal API. Any leaked or guessed Stripe customer ID becomes a full billing-portal URL, exposing past invoices, payment methods, subscription cancel. Probed live with `cus_invalid` and got 500 (no auth challenge first).
2. **MED candidate**: Server still accepts the legacy `?token=` query-param WS auth fallback ([backend/server.js:500](backend/server.js#L500)) — commit `37c889c` said this was a one-deploy back-compat to be removed in a follow-up. The follow-up has not happened. JWTs in URLs continue to leak into Render request logs.
3. **MED candidate**: `Prompt Lab admin allowlist not configured` — confirms the user has not set `PROMPT_LAB_ADMIN_EMAILS` yet, so any legitimate admin access is currently blocked. Fails closed → not a security finding (defensive). Operational TODO.
4. **LOW candidate**: CSP `script-src` includes `https://cdn.jsdelivr.net` — used by the legacy vanilla frontend, not the React SPA. Tightenable.

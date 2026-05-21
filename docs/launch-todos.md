# Launch action list — things you need to do yourself

Everything below is human-driven setup that can't be done in code. Organised
by priority — work from top to bottom, but most of section 3 ("config &
dashboards") can be done in parallel with the rest.

The launch plan lives at `~/.claude/plans/hi-i-want-to-linked-petal.md`.

---

## 1. Legal foundation — start here (Weeks 1-3)

These gate everything else: bank account, Stripe in the company's name,
ToS that mention a real legal entity, ICO registration. Order matters.

- [ ] **Register UK Limited company** with Companies House
  ([gov.uk/limited-company-formation](https://www.gov.uk/limited-company-formation))
  — £50, ~24 hr turnaround. Suggested name: "Reviva Learning Ltd" (keep it
  specialty-neutral). SIC codes: **85590** + **62012**. Single director,
  single shareholder (you), 100 × £0.01 ordinary shares.
- [ ] **Open business bank account** — recommend Tide (free, online,
  fastest). Alternatives: Starling, Mettle.
- [ ] **Update Stripe to the company** — Stripe dashboard → Settings →
  Business details. Upload certificate of incorporation, update payout
  bank to the new business account, update business address.
- [ ] **Register with the ICO** at
  [ico.org.uk/registration](https://ico.org.uk/registration/) — £40/year,
  mandatory for UK businesses processing personal data.
- [ ] **Create internal ROPA** (Records of Processing Activities) — a
  simple Google Doc listing data categories, purposes, lawful bases,
  retention. Not public; you keep it on file. Template in the launch plan
  workstream 1.5.

---

## 2. Public-facing legal pages content (Week 2-3)

Code is already shipped — pages are at `/privacy`, `/terms`, `/cookies`
with structured placeholder content and "DRAFT" banners visible. You need
to drop in real policy text.

- [ ] **Sign up at [Termly](https://termly.io)** (free plan). Generate
  three policies via their wizard: Privacy Policy, Terms of Service,
  Cookie Policy. Use the sub-processor list already documented in
  [PrivacyPolicy.jsx](../frontend-react/src/pages/Legal/PrivacyPolicy.jsx)
  section 5 (Supabase, Deepgram, Google, Stripe, Vercel, Render, Sentry).
- [ ] **Paste Termly text** into the three page files, replacing each
  `<em>[Termly: …]</em>` placeholder block. Set the `lastUpdated` prop on
  each page to today's date. Remove the yellow "DRAFT" banner div.
- [ ] **Founder bio** in
  [AboutPage.jsx](../frontend-react/src/pages/About/AboutPage.jsx) —
  replace the example `<blockquote>` text with 2-3 sentences of factual
  bio (training stage, motivation, qualifications). Keep it factual, not
  personality-driven.
- [ ] **Email routing** for `hello@`, `privacy@`, `support@` `@reviva.live`
  — easiest: Cloudflare Email Routing (free, 5 min if DNS is on
  Cloudflare). Otherwise Google Workspace (~£5/user/mo) or Zoho Mail
  (free tier).
- [ ] **Formspree endpoint** for the contact form — sign up at
  [formspree.io](https://formspree.io) (free, 50 submissions/mo), copy
  the endpoint URL, paste into `FORMSPREE_ENDPOINT` constant at the top
  of
  [ContactPage.jsx](../frontend-react/src/pages/Contact/ContactPage.jsx).

---

## 3. Config & dashboards — wire up the deployed services (any time)

Code-wise everything is dormant. These switches turn on the monitoring
and security features already shipped.

### Sentry (error tracking)
- [ ] Sign up at [sentry.io](https://sentry.io) — free Developer plan
  covers 5k events/month.
- [ ] Create two projects: `reviva-frontend` (React) and `reviva-backend`
  (Node.js).
- [ ] Copy each DSN.
- [ ] **Render** → backend service → Environment → add `SENTRY_DSN=…` →
  Manual Deploy.
- [ ] **Vercel** → project → Settings → Environment Variables → add
  `VITE_SENTRY_DSN=…` for both **Production** and **Preview** scopes →
  redeploy.
- [ ] Trigger a deliberate error somewhere (or just wait — first real
  error will surface) to verify the wiring.

### UptimeRobot
- [ ] Follow the checklist in
  [docs/uptime-monitoring.md](./uptime-monitoring.md) — sign up, two
  HTTPS monitors, ~5 min including alert verification.

### Cost caps (optional — defaults are sensible)
- [ ] Defaults: free 30 min audio/day, premium 240 min/day, global LLM
  kill-switch disabled. Override on Render env if needed:
  - `DAILY_AUDIO_MINUTES_FREE` (default 30)
  - `DAILY_AUDIO_MINUTES_PREMIUM` (default 240)
  - `MAX_DAILY_LLM_CALLS` (default 0 = disabled). Set this to something
    like `500` once you have real traffic data — it's your "surprise
    bill" insurance policy.

### Prompt Lab admin allowlist (only if you re-enable Prompt Lab in prod)
- [ ] Render → backend service → Environment → set
  `PROMPT_LAB_ADMIN_EMAILS=mezzeldolify@gmail.com` (comma-separated for
  more admins). Without this set, Prompt Lab returns 503 in prod even
  with `PROMPT_LAB_ENABLED=true`.

### Outstanding security follow-ups from the 2026-05-17 audit
- [ ] Rotate the three previously-leaked credentials in their
  dashboards: **Supabase service-role key**, **Google Cloud
  service-account key** (st3-coach-v4 project), **Google OAuth client
  secret**. The leaked values were purged from git history but the
  credentials themselves are still live — they're inert risk until
  rotated.

---

## 4. Domain & brand (Week 4)

- [ ] Reserve `reviva.co.uk` — important for UK SEO/trust.
- [ ] Reserve company-name domains if you went with "Reviva Learning Ltd"
  (e.g. `revivalearning.com`, `.co.uk`).
- [ ] Reserve social handles on Twitter/X, LinkedIn, Instagram, TikTok —
  even if you won't post immediately. Squatter prevention.
- [ ] Use Cloudflare Registrar (at-cost pricing) or Porkbun.

---

## 5. Pre-launch verification (Week 12-13, before public soft launch)

Full end-to-end readiness check.

- [ ] **Fresh-account walkthroughs** — do 3 from scratch:
  - Free user: signup → free scenario → complete interview → see feedback →
    delete account → verify cascade in Supabase dashboard
  - Premium user: signup → Stripe checkout (real card, refund after) →
    premium scenario → manage subscription → cancel
  - Mobile user: same on a phone with throttled network
- [ ] **Abuse test**: hit the daily audio cap on a free account, confirm
  the error banner fires and chunks are dropped after.
- [ ] **GDPR walkthrough**: export your own data, get the file, then
  delete. Confirm no rows remain in any table for that user.
- [ ] **Sentry verification**: trigger a JS error + a backend exception,
  confirm both arrive in Sentry with correct tags.
- [ ] **UptimeRobot verification**: briefly pause Render, confirm alert
  email arrives within 10 minutes.
- [ ] **Legal pages**: confirm all five footer links go to real, populated
  pages. Read each one once out loud.

---

## 6. Marketing — start the engine running (Weeks 5-12)

These are the slow-burn items in the plan that need 12+ weeks of
consistent effort to compound. Start early.

- [ ] Pick brand voice (recommend: "AI examiner that doesn't get tired"
  — see plan workstream 3.1).
- [ ] Set up blog at `reviva.live/blog` (or via Beehiiv embed) — 1-2
  posts/week, targeted at high-intent ST3 keywords. Pillar post: "Complete
  Guide to ST3 Plastics Interviews 2027".
- [ ] Recruit 5-10 closed beta users from network — give them a year free
  in exchange for genuine feedback + a written testimonial.
- [ ] Aim for soft launch around **August/September 2026** so content +
  SEO compound into the **November** application window.

---

## Order-of-operations summary

| Week | Critical thing this week |
|---|---|
| 1 | Companies House registered, Tide account opened |
| 2 | Stripe re-papered, Sentry + UptimeRobot wired |
| 3 | ICO registered, Termly policies generated and pasted in |
| 4 | Email routing live, Formspree endpoint set, domains reserved |
| 5-6 | First 2 blog posts; full end-to-end self-test |
| 7-8 | Beta access form live, 4-6 blog posts, beta begins with 5 users |
| 9-12 | Iterate on beta feedback, 10-12 blog posts total |
| 13+ | Public soft launch → November ST3 application window |

If anything here is blocking or unclear, ask — most of these have
multiple paths and I can help pick the lowest-friction one for your
situation.

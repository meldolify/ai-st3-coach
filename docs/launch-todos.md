# Launch action list — step-by-step

Everything below is human-driven setup that can't be done in code. Worked examples,
exact URLs, and what to type/click. Tick boxes are markdown — edit this file as you go.

**How to read this:** sections 1-3 are the critical path. Do them in order. Section
4 (marketing) is parallel — start when you have time. Section 5 is the pre-launch
verification you do once everything else is in place.

The launch plan lives at `~/.claude/plans/hi-i-want-to-linked-petal.md`.

---

## 1. Legal foundation (Weeks 1-3)

### 1.1 Register UK Limited company with Companies House

**Time:** 30 min on the form + ~24 hours for approval. **Cost:** £50.

**Before you start, you need:**
- A company name (check it's available — see step 1)
- Your home address (will be on the Companies House register; service-address upgrade is optional, ~£40-80/yr)
- DoB and nationality
- The 3 personal details for "fraud prevention" (eye colour, mother's maiden name, etc.)

**Steps:**

1. **Check name availability** at <https://find-and-update.company-information.service.gov.uk/>
   - Suggested: **"Reviva Learning Ltd"** — broad enough for multi-specialty expansion.
     Fallbacks if taken: "Reviva Education Ltd", "Reviva Training Ltd", "Reviva Health Ltd".
   - Avoid "Reviva Plastics Ltd" — boxes you into one specialty.
   - Trademark check (optional but smart): <https://www.gov.uk/search-for-trademark>

2. **Start registration** at <https://www.gov.uk/limited-company-formation>
   - Sign in or create a Government Gateway account (keep these credentials safe — used for HMRC, Companies House filings, VAT later).
   - Pick "Register a private limited company" → "Apply online".

3. **Company details:**
   - Company name: as chosen above
   - Registered office address: your UK home address (or service-office address if you've bought one)
   - "Same address for service" → tick yes if you don't have a separate one
   - Use **"Model articles"** (standard, no customisation) — don't upload custom ones

4. **SIC codes** (what the business does — pick TWO):
   - **85590** – Other education not elsewhere classified
   - **62012** – Business and domestic software development

5. **Director:**
   - Name, DoB, nationality, occupation: "Director" or your actual job title
   - Country of residence: UK
   - Service address: your home address (or a service-office one if you have one)
   - Residential address: your home (kept private from public register)

6. **Person with Significant Control (PSC):**
   - You. Tick "Director who holds more than 75% of shares"

7. **Shareholder / share capital:**
   - **100 ordinary shares × £0.01 each = £1 total** (keep it simple)
   - You hold all 100. "Prescribed particulars": full voting/dividend/distribution rights

8. **Pay £50** by debit card.

9. **Wait.** Companies House emails within 24 hours (usually a few hours during weekdays) with:
   - Certificate of incorporation (PDF — **save this; you'll need it for Stripe + the bank**)
   - Company number (8 digits)
   - Authentication code (6-character — **save this; required for all future filings**)

10. **After approval:**
    - [ ] Save certificate + auth code to a password manager (1Password, Bitwarden — never email or local notes)
    - [ ] HMRC will email separately within ~7 days to ask you to register for Corporation Tax — do that when prompted (free, online)

### 1.2 Open Tide business bank account

**Time:** 15 min application + 1-2 days verification. **Cost:** free (free tier).

**Why Tide:** Fully online, opens fastest, integrates with Xero/QuickBooks if you go that
route later. Alternatives if you prefer: Starling Business, Mettle (NatWest-backed, free),
Revolut Business. Avoid high-street banks for v1 — slower onboarding.

**Steps:**

1. Go to <https://www.tide.co> → "Open a business account" → choose **Free Plan**.

2. App-based signup (download Tide app or use web flow). They'll ask for:
   - Photo of UK driving licence OR passport
   - Selfie (liveness check)
   - Your address (matches Companies House registered office)
   - Company name + Companies House number (from step 1.1)
   - SIC code(s) — same ones you used at Companies House
   - Estimated annual turnover — "£0-25k" for year 1 is fine

3. Submit. Tide does the rest (Companies House cross-check). Approval usually within 24-48 hours.

4. After approval:
   - [ ] Note account number + sort code from the app
   - [ ] Order debit card (free, arrives in ~5 days)
   - [ ] Connect to Xero / FreeAgent if you want auto-bookkeeping later

### 1.3 Re-paper Stripe under the new company

**Time:** 30 min after bank is open. **Cost:** free.

**Before:** You need certificate of incorporation (1.1) and Tide account details (1.2).

**Steps:**

1. **Update Stripe business entity:**
   - Stripe Dashboard → Settings (cog top right) → **Business settings → Public details**
   - Change account name to "Reviva Learning Ltd"
   - Update business address to registered office

2. **Update business type:**
   - Settings → **Business settings → Business details**
   - Change "Business type" from individual to **Company** → "Single-member limited company"
   - Enter Companies House number (8 digits)
   - Upload certificate of incorporation
   - Submit for re-verification (Stripe usually approves in <24h)

3. **Switch payout bank:**
   - Settings → **Bank accounts and scheduling**
   - "Add new bank account" → enter Tide sort code + account number → save
   - Tide will receive 2 micro-deposits within 1-2 business days — confirm them in Stripe
   - Once verified: Set Tide as the default payout destination
   - Delete the old personal bank account if you want (optional)

4. **VAT status decision:**
   - At <£90k revenue you're below the UK VAT threshold. **Do not register voluntarily yet**
     — it adds quarterly returns for no benefit at your scale.
   - Revisit when MRR × 12 approaches £85k.

### 1.4 Register with the ICO (data protection)

**Time:** 10 min. **Cost:** £40/year.

**Legally mandatory** for any UK business processing personal data (you process email
addresses + audio transcripts, so yes).

**Steps:**

1. Go to <https://ico.org.uk/registration/>
2. "Pay a fee" → "Self-assessment"
3. Most likely answer: **Tier 1** (small org, turnover under £632k, fewer than 11 staff)
4. Fill the form:
   - Business name + Companies House number
   - Registered office
   - Data protection officer: leave blank if not required at your scale (it isn't)
   - "Data controller contact name + email": you + a privacy@ email
5. Pay £40 by Direct Debit (or one-off card payment — DD is cheaper if there's a discount)
6. ICO emails confirmation with your **registration number** (e.g. ZA000000)
   - [ ] Display this on the Privacy Policy footer (Termly's template has a field for it)

### 1.5 Generate legal policies via Termly + paste into the React pages

**Time:** 1 hour. **Cost:** free (Termly free tier) or £8-12/mo to remove their footer branding.

**Steps:**

1. Sign up at <https://termly.io> → free plan.

2. **Privacy Policy** — Termly wizard:
   - Business name: Reviva Learning Ltd
   - Address: your registered office
   - ICO registration number (from 1.4)
   - Country: United Kingdom
   - Data you collect: email, name, IP, audio transcripts (NOT raw audio — you don't store it), session metadata, payment info via Stripe
   - Sub-processors (copy from
     [PrivacyPolicy.jsx](../frontend-react/src/pages/Legal/PrivacyPolicy.jsx) §5):
     - Supabase (EU, eu-west-1)
     - Deepgram (US)
     - Google (Gemini API + Cloud TTS) (US)
     - Stripe (US)
     - Vercel (US)
     - Render (EU, Frankfurt)
     - Sentry (US) — once you've set up 2.1
   - Cookies used: only auth (strictly necessary) — match the table in
     [CookiePolicy.jsx](../frontend-react/src/pages/Legal/CookiePolicy.jsx)
   - User rights: include access, deletion, rectification, portability, objection
   - Children: "We do not knowingly collect data from anyone under 18"
   - Lawful basis: contract (paying users), legitimate interest (analytics + service improvement)

3. **Terms of Service** — Termly wizard:
   - Service type: "AI-powered SaaS"
   - Country: UK
   - Refund policy: 14-day cancellation right for digital services (UK Consumer
     Contracts Regulations 2013), waived once user accesses premium content
   - Governing law: England and Wales
   - Acceptable use: include the items already listed in
     [TermsOfService.jsx](../frontend-react/src/pages/Legal/TermsOfService.jsx) §6
   - AI disclaimer: include — see TermsOfService.jsx §9 for wording

4. **Cookie Policy** — Termly wizard:
   - Only strictly necessary cookies for now (the inventory in
     [CookiePolicy.jsx](../frontend-react/src/pages/Legal/CookiePolicy.jsx) is accurate)
   - No consent banner needed yet (no analytics) — Termly's policy text says so

5. **Paste into the React files:**

   Each file has structured sections with `<em>[Termly: …]</em>` placeholders. Open in
   VS Code and replace the placeholders with the relevant Termly-generated text:

   - Privacy → [`frontend-react/src/pages/Legal/PrivacyPolicy.jsx`](../frontend-react/src/pages/Legal/PrivacyPolicy.jsx)
   - Terms → [`frontend-react/src/pages/Legal/TermsOfService.jsx`](../frontend-react/src/pages/Legal/TermsOfService.jsx)
   - Cookies → [`frontend-react/src/pages/Legal/CookiePolicy.jsx`](../frontend-react/src/pages/Legal/CookiePolicy.jsx)

   For each file:
   - [ ] Replace each `<em>[Termly: …]</em>` block with the Termly text for that section
   - [ ] Set `lastUpdated="2026-05-DD"` (whatever today is, ISO format) — currently
         says `"DRAFT — not yet published"`
   - [ ] Delete the yellow draft banner div (the `<div className="page-layout__placeholder">…</div>`
         right after the `<PageLayout>` opening tag)
   - [ ] If you upgrade Termly to paid (recommend after ARR > £1k), they'll
         add a "Powered by Termly" line to the footer — remove that too

6. Commit + push: `feat(legal): real Termly policies live`

### 1.6 ROPA + internal data SOP

**Time:** 30 min, one-off. **Required by UK GDPR Article 30.**

Open a Google Doc (or Notion page) titled "Reviva — Records of Processing Activities".
Single table with these columns: data category, source, purpose, lawful basis,
recipients (sub-processors), retention period, security measures.

Rows to populate (matches what's in Privacy Policy):

| Data category | Source | Purpose | Lawful basis | Recipients | Retention |
|---|---|---|---|---|---|
| Email + hashed password | User sign-up | Account access | Contract | Supabase | Until account deleted |
| Profile fields (name, training level, specialty) | User sets | Personalisation | Contract | Supabase | Until account deleted |
| Audio transcripts | User during session | Train + grade interview | Contract | Supabase, Deepgram, Google Gemini | Until account deleted |
| Subscription data | Stripe webhooks | Billing | Contract | Stripe, Supabase | 7 years (UK accounting law) |
| Payment card details | User via Stripe Checkout | Subscription billing | Contract | Stripe (NOT us) | We never see/store these |
| Server logs (IP, errors) | Auto | Operations + abuse detection | Legitimate interest | Render, Sentry | 30 days rolling |

Keep this doc on file. Not public. If ICO ever asks, you produce this.

---

## 2. Wire deployed services — code is ready, config switches on

### 2.1 Sentry (error tracking)

**Time:** 15 min. **Cost:** free up to 5k events/month.

1. Sign up at <https://sentry.io>. Create org "Reviva".

2. Create project #1:
   - **Platform: React** (vite)
   - Name: `reviva-frontend`
   - On the "Configure" screen, copy the **DSN** (looks like `https://abc123@sentry.io/1234567`)
   - Skip the SDK install instructions — we already wrote that code

3. Create project #2:
   - **Platform: Node.js** (express)
   - Name: `reviva-backend`
   - Copy its **DSN**

4. **Render** (backend):
   - Dashboard → your service → **Environment** tab → "Add Environment Variable"
   - Key: `SENTRY_DSN`
   - Value: (backend DSN)
   - Save → top-right "Manual Deploy" → "Deploy latest commit"
   - When the deploy finishes, the Render logs should show:
     `[CONFIG] Sentry enabled (env: production)`

5. **Vercel** (frontend):
   - Dashboard → project → **Settings → Environment Variables**
   - "Add New" → key: `VITE_SENTRY_DSN`, value: (frontend DSN)
   - Environments: tick **Production** AND **Preview** (NOT Development — keeps your laptop quiet)
   - Save → go to **Deployments**, click "..." on latest, "Redeploy"

6. **Verify both:**
   - Visit the live site, open browser DevTools console, paste: `throw new Error('Sentry frontend test')` → should appear in Sentry within 60 seconds
   - For backend: hit `https://api.reviva.live/health?force_error=1` (or just wait — first real error will surface)
   - In Sentry, both projects should now show your test event in the Issues tab

### 2.2 UptimeRobot

**Time:** 5 min. **Cost:** free.

Already documented in detail at [docs/uptime-monitoring.md](./uptime-monitoring.md). The summary:

- Sign up at <https://uptimerobot.com>
- Monitor 1: `https://www.reviva.live`, HTTPS, 5min interval, keyword "ReViva"
- Monitor 2: `https://api.reviva.live/health`, HTTPS, 5min interval, keyword "ok"
- Settings → Alert Contacts → ensure your email is verified
- Test by pausing the Render service for 60 seconds

### 2.3 Cloudflare email routing

**Time:** 10 min if your DNS is already on Cloudflare. **Cost:** free.

**Prereq:** your `reviva.live` domain must be using Cloudflare nameservers. Check:
- Cloudflare dashboard → does `reviva.live` appear in your domain list?
- If not: free tier, add domain → update nameservers at your registrar → wait ~12h for propagation

**Steps:**

1. Cloudflare → reviva.live → **Email → Email Routing**
2. "Get started" → confirm Cloudflare adds the required MX + TXT + SPF records (yes, auto)
3. **Destination addresses:** add your personal email (gmail/proton). Cloudflare sends a verification — click the link in the email.
4. **Custom addresses** (rules):
   - `hello@reviva.live` → your-personal@email.com
   - `privacy@reviva.live` → same
   - `support@reviva.live` → same
   - (Or quicker: "Catch-all" → `*@reviva.live` → your email)
5. Test: send an email from a different account to `hello@reviva.live` → should arrive within 1 min.

**Later (after launch):** consider Google Workspace (£5/user/mo) so you can SEND from
`hello@reviva.live`, not just receive. Cloudflare Routing is receive-only.

### 2.4 Formspree contact form

**Time:** 5 min. **Cost:** free up to 50 submissions/month.

1. Sign up at <https://formspree.io>
2. "+ New Form" → name "Reviva Contact"
3. Copy the **endpoint URL** (looks like `https://formspree.io/f/xyz123abc`)
4. Edit [`frontend-react/src/pages/Contact/ContactPage.jsx`](../frontend-react/src/pages/Contact/ContactPage.jsx), line ~13:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xyz123abc' // paste here
   ```
5. Commit + push.
6. Test: submit the form on the live site, confirm Formspree dashboard shows the submission and you get an email.

### 2.5 (Optional) Cost cap env vars

Defaults are sensible. Only override on Render if you want to tighten/loosen:
- `DAILY_AUDIO_MINUTES_FREE` (default 30) — free-tier per-user daily audio cap
- `DAILY_AUDIO_MINUTES_PREMIUM` (default 240) — premium daily cap
- `MAX_DAILY_LLM_CALLS` (default 0 = disabled) — global daily kill-switch

**Recommend:** set `MAX_DAILY_LLM_CALLS=500` once you have real traffic data. Sized
for ~30-60 interviews/day = several pounds Gemini spend. Tune up if you're ramping.

---

## 3. Outstanding security follow-ups (CRITICAL — still not done)

These were on the 2026-05-17 audit and **haven't been actioned**. The leaked
credentials are live until you rotate them — anyone with the previous git history
can read them.

### 3.1 Supabase service-role key rotation

**Risk:** full admin access to the Supabase project. Highest-priority rotation.

1. Supabase Dashboard → project `vsdiovgjnbziwwukpvqo` → **Settings → API**
2. Find the `service_role` key (NOT the `anon` key). Click "Reveal" → "Reset"
3. Confirm reset. **Old key invalidates instantly** — backend will fail until you update the env.
4. Copy the new key (one-time display).
5. Render Dashboard → backend service → **Environment**:
   - Find `SUPABASE_SERVICE_KEY` → "Edit" → paste new key → Save
   - "Manual Deploy" → "Deploy latest commit"
6. Tail the Render logs during deploy. After "Server ready" appears, hit
   `https://api.reviva.live/health` — should return `{"status":"ok"}`.
7. Run a quick end-to-end check: log into the site → start a free scenario →
   confirm WebSocket auth still works.

### 3.2 Google Cloud service-account key rotation

**Risk:** access to the Cloud TTS API (paid). Could rack up bills.

1. Cloud Console → **IAM & Admin → Service Accounts** → project `st3-coach-v4`
2. Click the service account used for TTS (probably named `tts-service` or similar)
3. **Keys** tab → existing key → "..." → "Delete"
   - Confirm — old key invalidated immediately, backend Cloud TTS fallback will fail until you swap
4. Same Keys tab → "Add Key" → "Create new key" → JSON → Download
5. Open the downloaded JSON in a text editor, copy the entire contents (it's one big JSON object)
6. Render Dashboard → backend service → **Environment**:
   - Find `GOOGLE_APPLICATION_CREDENTIALS_JSON` → "Edit"
   - Paste the entire new JSON content (one line, no line breaks — Render's UI handles it)
   - Save → Manual Deploy
7. Verify: Render logs show `[CONFIG] Using Google Cloud credentials from environment variable`.
8. Delete the downloaded JSON file from your computer (don't leave it lying around).

### 3.3 Google OAuth client secret rotation

**Risk:** "Sign in with Google" flow could be hijacked.

1. Cloud Console → **APIs & Services → Credentials**
2. Find the OAuth 2.0 Client ID for Reviva (the one used by Supabase Auth Google provider)
3. Click it → "Reset Secret" → confirm
4. Copy the new client secret
5. Supabase Dashboard → **Authentication → Providers → Google**:
   - Paste new "Client Secret" → save
6. Test: log out, click "Sign in with Google" on the site, confirm auth still works.

### 3.4 (Conditional) Prompt Lab admin allowlist

Only do this if you re-enable Prompt Lab in production (`PROMPT_LAB_ENABLED=true`
on Render). Without it, every Prompt Lab request returns 503.

1. Render → backend → Environment
2. Add `PROMPT_LAB_ADMIN_EMAILS=mezzeldolify@gmail.com` (comma-separated for multiple admins)
3. Save → Manual Deploy

---

## 4. Brand + content — start the long burn (Weeks 4-12)

This compounds over months — start small but start early.

### 4.1 Domains + social handles

- [ ] Buy `reviva.co.uk` at Cloudflare Registrar or Porkbun (~£8/yr). Important for UK SEO trust.
- [ ] Buy `revivalearning.com` + `.co.uk` if you went with "Reviva Learning Ltd" as the company name (~£12/yr each)
- [ ] Point new domains to the same Vercel project (Vercel → Domains → add). Vercel auto-issues TLS.
- [ ] Reserve handles on:
  - X / Twitter: `@reviva_uk` or `@reviva_live`
  - LinkedIn: company page (you'll need this for marketing later)
  - Instagram: `@reviva.live`
  - TikTok: `@reviva.live`
  - Reddit: `u/RevivaTeam` (not strictly needed — but reserve before someone else does)

### 4.2 Brand voice doc

10 minutes — write a 1-page `docs/brand-voice.md` so all content stays consistent.
Suggested rules:

- **What we are:** "An AI examiner for ST3 surgical training interviews"
- **What we're not:** "AI tutor", "AI coach", "AI mentor" — those imply ongoing
  relationship. We're a deliberate-practice tool.
- **Words to avoid:** "amazing", "revolutionary", "literally", "perfect for…", "AI-powered"
  as a feature (it's a means, not an end), "doctors" generically (we serve trainees)
- **Words to use:** "ST3" (not "FRCS" — different exam), "rehearsal" (not "practice"
  alone), "examiner" (not "tutor"), "trainee" (not "doctor" or "student")
- **Tone:** confident, specific, technical-but-readable. Imagine you're explaining
  to a peer who knows the field but not your product.

### 4.3 Blog setup + first posts

**Recommend: Beehiiv** (free up to 2,500 subs, doubles as a newsletter).
Embed posts at `reviva.live/blog` via their `<iframe>` or by setting up a subdomain
(`blog.reviva.live` → Beehiiv) — faster than building a custom blog route.

**Alternative if you want it fully in-app:** add a `/blog/[slug]` route that reads
Markdown from `frontend-react/src/blog-posts/`. Better long-term but more code work.

**First 4 posts to write (pillar + spokes):**

1. **Pillar** (~3000 words): "Complete Guide to ST3 Plastic Surgery Interviews 2027"
   - Cover: timeline (Nov apps → Feb-Mar interviews), portfolio scoring breakdown,
     interview structure (clinical stations + call the boss + consent + structured),
     common pitfalls, what examiners actually want
   - Update annually
2. **Topic deep-dive** (~1500 words): "How to talk through necrotising fasciitis in an ST3 interview"
   - Use the scenario content as scaffolding. Same shape can be repeated for 20+ topics.
3. **Portfolio angle** (~1000 words): "ST3 plastic surgery portfolio scoring: 2027 rubric breakdown"
4. **Candidate experience**: "What it's like to sit ST3 plastics — by a recent applicant"
   - Anonymised, ghostwritten from beta user interviews (with permission)

**SEO basics:**
- Add `<title>` and `<meta name="description">` tags via React Helmet or Next-style head
  (we're on Vite — see `frontend-react/index.html` for current setup)
- Submit `reviva.live/sitemap.xml` to Google Search Console once posts are up
- Target keywords: "ST3 plastic surgery interview", "ST3 plastics portfolio", "ISFP plastic surgery"
- Aim for top-5 ranking on "ST3 plastic surgery interview" within 6 months of consistent posting

### 4.4 Closed beta recruitment

- [ ] Add a "Request beta access" form on the landing page (reuses Formspree from 2.4 —
  just add a second Formspree form with different routing rules)
- [ ] Manually approve beta users by flipping a boolean in their Supabase profile
  (or add a `beta_approved` column — needs a migration)
- [ ] Recruit 5-10 from your direct network — current/recent ST3 applicants you know personally
- [ ] Each beta user gets: 1 year of premium free in exchange for (a) feedback form
  after each session, (b) a written testimonial they're happy to publish
- [ ] Optional: 30-min Zoom debrief with each beta user — slow but very high signal

### 4.5 Founder bio (About page)

Edit [`frontend-react/src/pages/About/AboutPage.jsx`](../frontend-react/src/pages/About/AboutPage.jsx),
replace the example `<blockquote>` content.

Suggested structure (2-3 sentences, factual, no superlatives):

> Reviva was built by a UK plastic surgery trainee preparing for ST3 selection. After
> sitting the interview themselves and noticing how thin the realistic rehearsal
> options were, they developed the scenario library, scoring rubric, and examiner
> personalities against the published ST3 plastic surgery person specification and
> the national selection mark scheme.

You can use your name or stay first-name-only / "the founder" — the rest of the brand
remains brand-led per the marketing rule.

Commit + push when done.

---

## 5. Pre-launch verification (Week 12-13)

End-to-end check before flipping from closed beta to public soft launch.

- [ ] **CI green:** `cd backend && npm test && cd .. && npm run test:e2e` — local
- [ ] **GitHub Actions:** check latest commit's run is all-green at <https://github.com/meldolify/ai-st3-coach/actions>
- [ ] **Free user walkthrough** (fresh Supabase account):
  - [ ] Sign up → land on `/scenarios` → pick a free scenario → complete interview → see feedback
  - [ ] Profile → Export my data → JSON downloads, contains your test session
  - [ ] Profile → Delete account → type DELETE → confirm
  - [ ] Sign in again with same email — should fail (account gone)
  - [ ] Supabase dashboard → confirm zero rows for that user in profiles, subscriptions, session_history
- [ ] **Premium user walkthrough** (fresh account):
  - [ ] Sign up → try a premium scenario → upgrade modal appears
  - [ ] Stripe checkout with a real card → real refund after
  - [ ] After webhook fires (~5s), retry premium scenario → access granted
  - [ ] Profile → Manage Subscription → Stripe portal opens → cancel sub
  - [ ] Confirm sub now reads "Cancelled" in Profile after webhook fires
- [ ] **Mobile walkthrough:** open Chrome DevTools → device toolbar → iPhone 12 → reload
  → complete an interview on the mobile layout. Same on slow 3G throttling.
- [ ] **Abuse test:**
  - [ ] Open browser, start a free scenario, leave it streaming audio for 30+ minutes
  - [ ] Confirm a "Daily audio limit reached" error appears in the transcript
  - [ ] Confirm no more audio_chunks are processed (check Render logs — `[USAGE] Audio cap hit`)
- [ ] **Sentry verification:**
  - [ ] Trigger a JS error in DevTools console → appears in Sentry frontend project
  - [ ] Hit a deliberately bad backend endpoint → backend Sentry catches the 500
- [ ] **UptimeRobot verification:**
  - [ ] Render dashboard → backend service → "Suspend" briefly (60s)
  - [ ] Email arrives within 5-10 min
  - [ ] Resume Render → "back up" email arrives
- [ ] **Legal pages live and real:**
  - [ ] All 5 footer links resolve to real content (no "DRAFT" banners visible)
  - [ ] Privacy Policy sub-processor list matches reality
  - [ ] Contact form actually delivers to your inbox
- [ ] **GDPR walkthrough:**
  - [ ] As a logged-in user, GET /api/account/export returns valid JSON
  - [ ] DELETE /api/account succeeds, Stripe sub cancelled, all DB rows gone
- [ ] **Cost dashboards sanity:**
  - [ ] Gemini console — daily usage matches what your test traffic should produce
  - [ ] Deepgram console — same
  - [ ] Stripe MRR — matches the subs you've created (minus the ones you cancelled)

If all of the above pass, you're public-launch ready. Announce on Reddit
(/r/JuniorDoctorsUK + /r/medicalschooluk), via PLASTA channels, and via any
trainee WhatsApp / Telegram groups you have access to.

---

## Order-of-operations recap

| Week | Critical thing this week | Why |
|---|---|---|
| 1 | Companies House + Tide application | Blocks everything else |
| 2 | Tide approved → Stripe re-papered → Sentry + UptimeRobot wired | Monitoring up before content goes live |
| 3 | ICO registered → Termly policies generated + pasted in → email routing live | Compliance + reachability done |
| 4 | Formspree, domains, founder bio, brand voice doc | Brand foundations |
| 5 | Rotate 3 leaked credentials (3.1-3.3) | Security backlog cleared |
| 5-6 | First 2 blog posts written + published | SEO clock starts ticking |
| 7-8 | Beta access form live, recruit 5 beta users | Real product feedback begins |
| 9-12 | 8-12 blog posts total, iterate on beta feedback | SEO compounds, product improves |
| 13 | Pre-launch verification (section 5) → soft launch | Go public |
| 14-17 | Monitor signups, conversion, support load | Tune, fix bugs, prepare for November |
| 18+ | November ST3 application window opens | Peak demand — be ready |

Ask any time if a step is unclear or you hit a blocker — most have multiple paths
and the right one depends on stuff you know about your situation that I don't.

# Uptime monitoring — UptimeRobot setup

> **Status:** Not yet configured. ~5 minutes of setup, all on the
> UptimeRobot dashboard (no code changes).

## Why

Today, the only signal that the site is down is a user emailing to say
"it's broken". Uptime monitoring closes that gap with a free-tier ping
service that hits the public surfaces every 5 minutes and emails on the
first failure.

This pairs with Sentry: Sentry catches in-process errors that the server
handled; UptimeRobot catches "server didn't respond at all" (process
crashed, Render in degraded state, DNS broken, etc.).

## Setup (~5 min)

1. Sign up at <https://uptimerobot.com> (free tier: 50 monitors,
   5-minute interval, free email alerts).

2. Add monitor #1 — **Frontend (Vercel)**:
   - Type: **HTTPS**
   - Friendly name: `Reviva frontend`
   - URL: `https://www.reviva.live`
   - Interval: 5 minutes (max on free plan)
   - Keyword monitoring (optional but recommended): tick "Keyword exists"
     and set the keyword to `ReViva` — catches the case where Vercel
     returns a 200 but serves a blank/broken page.

3. Add monitor #2 — **Backend (Render)**:
   - Type: **HTTPS**
   - Friendly name: `Reviva backend health`
   - URL: `https://api.reviva.live/health`
   - Interval: 5 minutes
   - Keyword monitoring: tick "Keyword exists", keyword `ok`. The
     `/health` endpoint returns `{"status":"ok"}` so this confirms
     it's not just a 200 from a generic error page.

4. Configure alerts:
   - Dashboard → My Settings → Alert Contacts → make sure your email is
     there and verified.
   - Optional: add a Discord/Slack webhook for a feed channel.
   - Default alert thresholds (alert after 1 confirmed down check) are
     fine for launch. You can dial down later if you find them flappy.

5. Verify by pausing the backend service in Render briefly and
   confirming you get an email within ~10 minutes. (Don't bother doing
   this with paying users on the system.)

## Optional later: deep health check

Currently `/health` returns `{"status":"ok"}` regardless of whether
Gemini/Deepgram/Supabase are reachable. If you want to catch upstream
outages (not just "our process is alive"), add a `/health/deep` route
that pings each dependency with a short timeout and returns 503 if any
is down. Then add a third UptimeRobot monitor pointing at it with a
longer interval (15 min) to avoid running up Gemini/Deepgram costs from
the synthetic check.

Defer this until after launch — basic uptime first.

## What this doesn't catch

- Slow responses (UptimeRobot's "Slow" detection is coarse; if it
  matters later, switch to Better Stack or add Sentry performance
  monitoring)
- Partial outages (e.g. WebSocket broken but HTTP fine) — would need a
  WebSocket-specific synthetic check, not built yet
- Specific user flows broken (account creation, payment) — covered by
  Sentry capturing the resulting exceptions

## Cost

Free tier covers everything above. UptimeRobot Pro (£7/mo) would give
1-minute intervals and SMS alerts. Not worth it pre-launch.

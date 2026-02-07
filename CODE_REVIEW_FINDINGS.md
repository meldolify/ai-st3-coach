# Code Review Findings — ST3 Coach V4

**Date:** 2026-02-07
**Reviewers:** 3 parallel agents (Security, Performance, Test Coverage)
**Scope:** Full codebase review — backend, frontend, tests, configuration

---

## Architecture Overview

Two-page vanilla JS app with Node.js/WebSocket backend:
- **index.html** — Landing, auth, scenario selection (SPA with hash routing)
- **simulation.html** — Standalone simulation room (state via sessionStorage)
- **Backend** — Express + WebSocket server (server.js 683 lines) + modular services
- **Auth** — Supabase (JWT tokens)
- **Payments** — Stripe (webhooks + checkout sessions)
- **AI** — GPT-4o-mini (conversation) + Google Cloud TTS (speech synthesis)
- **STT** — Web Speech API / Silero VAD / SimpleVAD / Push-to-Talk cascade
- **Tests** — 51 backend unit tests (Jest) + 22 E2E tests (Playwright)
- **Deployment** — Frontend on Vercel, Backend on Render

---

## CRITICAL — Fix Immediately

### CR-1: Sidebar builds wrong prompt file paths for medium difficulty
- **Files:** `frontend/js/sidebar.js:209` and `frontend/js/sidebar.js:597`
- **Bug:** `difficultyMap` maps `'medium'` to `'moderate'`, but prompt files on disk use `medium_` prefix (e.g., `medium_clinical_breast_reconstruction_1.txt`). Zero files exist with `moderate_` prefix.
- **Impact:** Every sidebar scenario selection at medium difficulty silently fails — server falls back to a generic template prompt. Users get an incoherent AI examiner.
- **Note:** `mock-exam.js:322` does NOT have this bug — it uses `selectedDifficulty` directly (correct).
- **Fix:** Change `difficultyMap` to `{ 'easy': 'easy', 'medium': 'medium', 'strict': 'strict' }` or remove the map entirely. Apply fix at both line 209 (desktop) and line 597 (mobile).

### CR-2: 71% of backend tests are fake — they test hardcoded literals, not actual code
- **Files:**
  - `backend/__tests__/server.test.js` — 5 tests, creates in-memory objects and asserts their own properties. Never connects to server.
  - `backend/__tests__/gpt-integration.test.js` — 10 tests, tests that `'gpt-4o-mini' === 'gpt-4o-mini'`. Never imports source.
  - `backend/__tests__/tts-integration.test.js` — 11 tests, tests that `'MP3' === 'MP3'`. Reimplements SSML inline.
  - `backend/__tests__/vad-logic.test.js` — 10 tests, tests local constants against themselves.
- **Impact:** 36 of 51 tests never import any source module. Only 15 tests actually test real code (`audioHelpers.test.js`, `config.test.js`, `services.test.js`, `websocketSecurity.test.js`).
- **Fix:** Rewrite all 4 fake test files to import and test actual modules:
  - `server.test.js` → Integration tests using `ws` client connecting to real server
  - `gpt-integration.test.js` → Test `OpenAIService.generateResponse()` with mocked OpenAI client
  - `tts-integration.test.js` → Test `TTSService.synthesize()` with mocked Google TTS client
  - `vad-logic.test.js` → Test actual `isNoiseTranscript()` with edge cases (already partially covered in audioHelpers.test.js, consider merging)

### CR-3: No global uncaught exception/rejection handler
- **File:** `backend/server.js` (entire file — zero matches for `process.on`, `uncaughtException`, `unhandledRejection`)
- **Impact:** Any unhandled promise rejection (e.g., from setTimeout callbacks in feedback continuation, or async IIFE at line 119) crashes Node.js, disconnecting ALL active WebSocket sessions on Render.
- **Fix:** Add at the top of server.js after imports:
  ```javascript
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (error) => {
    console.error('[FATAL] Uncaught Exception:', error);
    // Optionally: gracefully close all WebSocket connections, then exit
  });
  ```

---

## HIGH — Fix Soon

### H-1: Auth token passed in WebSocket URL query string
- **Files:** `frontend/js/session.js:239` (constructs URL), `backend/server.js:114` (reads from URL)
- **Issue:** JWT access token appended as `?token=...` in WebSocket URL. Visible in server logs, proxy logs, Render platform logs, browser history. Frontend masks it in its own log (session.js:249) but server and infrastructure log the full URL.
- **Fix:** Send auth token as the first WebSocket message after connection. Server should hold off creating the session until the auth message is validated. Requires changes in both session.js (frontend) and server.js (backend connection handler).

### H-2: Error messages leak internal details to clients
- **Files:** `backend/server.js:407`, `backend/server.js:512`
- **Issue:** At line 407: `ws.send(JSON.stringify({ type: 'error', message: error.message }))` — raw error.message from OpenAI/TTS/Node.js internals sent to client. At line 512: Stripe webhook error reflected in response.
- **Fix:** Replace with generic messages:
  - Line 407: `message: 'An error occurred processing your request'`
  - Line 512: `return res.status(400).send('Webhook processing failed')`
  - Keep `console.error` with full details for server-side logging.

### H-3: CORS origin fallback to wildcard
- **File:** `backend/server.js:430`
- **Issue:** `origin: config.FRONTEND_URL || '*'` falls back to `*` if FRONTEND_URL env var is unset. Default in config is `http://localhost:5500`, but if accidentally unset in production, all origins allowed.
- **Fix:** Fail closed:
  ```javascript
  origin: config.FRONTEND_URL || (config.isProduction ? false : '*'),
  ```

### H-4: Feedback auto-continuation error leaves session broken
- **File:** `backend/server.js:323-349`
- **Issue:** If `callGPT4oMini()` or `googleTTS()` throws during feedback auto-continuation (inside setTimeout), the catch block only logs. Client receives `feedback_processing` but never gets `ai_response` back — stuck showing "Processing..." indefinitely.
- **Fix:** In the catch block at line 346, add:
  ```javascript
  try {
    ws.send(JSON.stringify({ type: 'error', message: 'Feedback generation failed' }));
  } catch (sendErr) { /* ws may be closed */ }
  session.inFeedbackMode = false;
  session.feedbackCount = 0;
  ```

### H-5: WebSocket send after close in feedback continuation
- **File:** `backend/server.js:323-349`
- **Issue:** 300ms setTimeout fires after `ai_finished`. If WebSocket closes during that window, `ws.send()` throws.
- **Fix:** Add guard at the top of the setTimeout callback:
  ```javascript
  if (ws.readyState !== WebSocket.OPEN || !sessions.has(sessionId)) return;
  ```

### H-6: Zombie WebSocket connections — no heartbeat/ping
- **File:** `backend/server.js:99-102`
- **Issue:** No ping/pong heartbeat. Silent network drops (no TCP FIN) leave sessions in Map indefinitely — slow memory leak.
- **Fix:** Add ping/pong mechanism:
  ```javascript
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    // ... existing handler
  });
  ```

### H-7: Whisper temp files not unique under concurrency
- **File:** `backend/src/services/OpenAIService.js:68`
- **Issue:** Temp path is `temp_audio_${sessionId}.${extension}`. Two concurrent `whisper_audio` messages from same session overwrite the file.
- **Fix:** Change to: `temp_audio_${sessionId}_${Date.now()}.${extension}` or use `crypto.randomUUID()` suffix.

### H-8: `loadSimulationParams()` duplicated with different behavior
- **Files:** `frontend/js/state.js:87` and `frontend/js/simulation-app.js:12`
- **Issue:** simulation-app.js version silently overrides state.js version (loads after). Different logging behavior between them.
- **Fix:** Remove the duplicate from `simulation-app.js`. Use the one from `state.js` which is already globally available.

### H-9: No integration tests for core WebSocket message flows
- **Impact:** The entire product flow has zero test coverage:
  - `user_transcript` → GPT → TTS → `ai_response`
  - `whisper_audio` → Whisper → noise filter → `whisper_transcript`
  - `ai_finished` → feedback auto-continuation (6 iterations)
  - `request_feedback` → GPT → JSON parse → `feedback_summary`
  - Session lifecycle: create → messages → disconnect → cleanup
- **Fix:** Add integration tests using `ws` client library connecting to a test server instance.

### H-10: Stripe webhook handlers have zero test coverage
- **File:** `backend/server.js:494-582`
- **Issue:** Three Stripe events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) processed with no tests.
- **Fix:** Add tests mocking Stripe signature verification and Supabase database calls.

### H-11: E2E access control tests silently pass when function not found
- **File:** `e2e-tests/tests/access-control.spec.ts:8-17`
- **Issue:** Assertions wrapped in `if (canAccess !== null)` — if `canAccessScenario` not exposed on window, tests pass with zero assertions.
- **Fix:** Change to `expect(canAccess).not.toBeNull()` before proceeding with tier assertions.

### H-12: Mock exam results page is a TODO — incomplete paid feature
- **File:** `frontend/js/mock-exam.js:538`
- **Issue:** `// TODO: Show summary page with results`. `mockExamResults` array tracks results but they're never displayed or saved to database.
- **Fix:** Build a summary page showing station results, scores, and time taken. Save to `session_history` table.

---

## MEDIUM

### M-1: Google Cloud credentials written to /tmp world-readable
- **File:** `backend/src/config/index.js:13-14`
- **Issue:** `fs.writeFileSync(credsPath, ...)` with default permissions (0644).
- **Fix:** Add `{ mode: 0o600 }` to writeFileSync options. Or use Google Auth Library's `fromJSON()` to load directly.

### M-2: No WebSocket origin validation
- **File:** `backend/server.js:99-104`
- **Issue:** WebSocket.Server created without `verifyClient`. Any website can connect and consume API credits via free-tier scenarios.
- **Fix:** Add `verifyClient` that checks `Origin` header against `config.FRONTEND_URL`.

### M-3: Stripe webhook not idempotent (event replay)
- **File:** `backend/server.js:517-578`
- **Issue:** No deduplication of `event.id`. Stripe retries could process same event twice.
- **Fix:** Store processed event IDs (in-memory Set or database) and skip duplicates.

### M-4: XSS risk in `openModelAnswerDrawer` via innerHTML
- **File:** `frontend/js/ui-helpers.js:261-265`
- **Issue:** Content split by `\n\n`, wrapped in `<p>` tags, inserted via innerHTML without escaping. `escapeHtml` helper exists at line 242 but is NOT used here.
- **Fix:** Apply `escapeHtml()` to each paragraph before wrapping in `<p>` tags.

### M-5: innerHTML with template literals in scenario/auth cards
- **Files:** `frontend/js/scenarios.js:96`, `frontend/js/scenarios.js:461`, `frontend/js/auth.js:424`
- **Issue:** Data interpolated into HTML templates via innerHTML. Currently from hardcoded JS objects (low risk), but becomes XSS vector if data ever comes from API.
- **Fix:** Switch to DOM element creation methods, or sanitize before innerHTML.

### M-6: No session timeout / maximum duration
- **File:** `backend/server.js:184-193`
- **Issue:** Sessions live until WebSocket disconnect. No max duration.
- **Fix:** Add a session TTL (e.g., 45 minutes) that auto-disconnects with a warning message.

### M-7: OrbVisualizer AudioContext never closed
- **File:** `frontend/js/orb-visualizer.js:59`
- **Issue:** AudioContext created but never closed. Analyser stays connected. No `destroy()` method.
- **Fix:** Add `destroy()` method that disconnects analyser and closes AudioContext. Call on session disconnect.

### M-8: SimpleVAD creates new AudioContext per recording
- **File:** `frontend/js/vad/SimpleVAD.js:375`
- **Issue:** `convertToWav()` creates new AudioContext each time. Chrome limits to 6 concurrent.
- **Fix:** Reuse existing `this.audioContext` with `decodeAudioData`.

### M-9: 20+ render-blocking scripts, ~1.2MB external JS
- **File:** `frontend/index.html:1464-1492`, `frontend/simulation.html:1186-1201`
- **Issue:** 22 scripts on index.html, 19 on simulation.html. None use `async` or `defer`. External CDN: ~1.2MB (Three.js alone is 590KB, only used on landing page).
- **Fix:** Add `defer` to all scripts. Lazy-load Three.js and GSAP only on landing page. Consider bundling local scripts.

### M-10: Mock exam timer freezes on background tabs
- **File:** `frontend/js/mock-exam.js:627`
- **Issue:** `setInterval` throttled when tab backgrounded. Timer display freezes. More critically, `advanceToNextStation()` won't fire until tab is foregrounded.
- **Fix:** Add `document.addEventListener('visibilitychange')` to check timer on tab focus.

### M-11: No concurrency limits on GPT/TTS API calls
- **File:** `backend/server.js:274`, `backend/server.js:290`
- **Issue:** Each `user_transcript` triggers GPT + TTS with no concurrency cap. 100 concurrent sessions = 100 simultaneous API calls.
- **Fix:** Use `p-limit` package to cap concurrent API calls (e.g., 20 concurrent).

### M-12: Legacy `mockExamTopicsData` retained (~200 lines)
- **File:** `frontend/js/mock-exam.js:67-283`
- **Issue:** `// TODO: Remove after confirming getMockExamTopics works correctly`. Fallback creates maintenance burden.
- **Fix:** Remove legacy data after verifying `getMockExamTopics()` works.

### M-13: `scenario-loader.test.js` never tests actual loading function
- **File:** `backend/__tests__/scenario-loader.test.js`
- **Issue:** Tests check `fs.existsSync()` for directories, never imports or calls `loadScenarioPrompt()`.
- **Fix:** Import the actual function and test it with valid paths, invalid paths, and traversal attempts.

### M-14: `feedback_summary` and `feedback_processing` missing from message validation schema
- **File:** `backend/src/middleware/websocketSecurity.js:111-134`
- **Issue:** Server sends these types but they're not in `MESSAGE_SCHEMAS`. Schema is incomplete.
- **Fix:** Add schemas for server-to-client message types for documentation completeness.

### M-15: No E2E tests for mock exam flow
- **Files:** `e2e-tests/tests/`
- **Issue:** Mock exam (by-station and full-mock) is a premium feature with complex state — zero E2E coverage.
- **Fix:** Add tests for station selection, timer display, scenario switching, and (when built) results page.

---

## LOW

### L-1: Supabase anon key in frontend (by design)
- **File:** `frontend/config.js:38`
- **Action:** Verify RLS policies are properly configured in Supabase dashboard.

### L-2: Session ID contains timestamp (minor info disclosure)
- **File:** `backend/src/middleware/websocketSecurity.js:17-19`
- **Action:** Low priority — UUID portion makes it unguessable regardless.

### L-3: Rate limiter bypassed by reconnecting (new session ID each time)
- **Files:** `backend/src/middleware/websocketSecurity.js:40-84`, `backend/server.js:413`
- **Action:** Consider adding IP-based rate limiting for more robust abuse prevention.

### L-4: `unsafe-inline` for styles in CSP
- **File:** `backend/server.js:441`
- **Action:** Low priority. Move inline styles to CSS classes if possible.

### L-5: CSP `connectSrc` uses `wss://*.onrender.com` wildcard
- **File:** `backend/server.js:443`
- **Action:** Use specific domain `wss://api.reviva.live` instead.

### L-6: User transcript not sanitized before GPT (prompt injection)
- **File:** `backend/server.js:271`
- **Action:** Consider adding system-level instruction to ignore override attempts.

### L-7: Google TTS has no retry/timeout
- **File:** `backend/src/services/TTSService.js:60`
- **Action:** Add 10s timeout and 1 retry with backoff for transient errors.

### L-8: Orb shimmer runs at 60fps during idle
- **File:** `frontend/js/orb-visualizer.js:438-458`
- **Action:** Reduce to 30fps or use CSS animation for idle state.

### L-9: CLAUDE.md line numbers are inaccurate
- **File:** `CLAUDE.md`
- **Action:** Update line references and file counts to match current code.

### L-10: Duplicate SSML tests in audioHelpers and tts-integration
- **Files:** `backend/__tests__/audioHelpers.test.js`, `backend/__tests__/tts-integration.test.js`
- **Action:** Remove duplicate inline tests from tts-integration.test.js.

### L-11: E2E mock-data uses wrong path for premium scenario
- **File:** `e2e-tests/fixtures/mock-data.ts:27`
- **Issue:** Uses `breast_aesthetic` but actual path is `breast_and_aesthetic`.
- **Action:** Fix the path in mock-data.ts.

---

## Prioritized Implementation Order

### Phase 1: Ship-Blocking Bugs (Immediate)
1. **CR-1** — Fix sidebar `medium` → `moderate` mapping bug (sidebar.js:209, 597)
2. **CR-3** — Add global error handlers (server.js)
3. **H-2** — Stop leaking error details to clients (server.js:407, 512)
4. **H-4/H-5** — Fix feedback continuation error handling + ws.readyState guard (server.js:323-349)

### Phase 2: Security Hardening
5. **H-1** — Move auth token out of WebSocket URL (session.js + server.js)
6. **H-3** — Fix CORS wildcard fallback (server.js:430)
7. **M-2** — Add WebSocket origin validation (server.js:99-104)
8. **M-1** — Fix /tmp credentials permissions (config/index.js:13)
9. **M-4/M-5** — Fix innerHTML XSS vectors (ui-helpers.js:261, scenarios.js:96, auth.js:424)
10. **M-3** — Add Stripe webhook idempotency (server.js:517-578)

### Phase 3: Reliability & Performance
11. **H-6** — Add WebSocket ping/pong heartbeat (server.js)
12. **H-7** — Fix Whisper temp file uniqueness (OpenAIService.js:68)
13. **H-8** — Remove duplicate `loadSimulationParams()` (simulation-app.js:12)
14. **M-6** — Add session timeout (server.js)
15. **M-7/M-8** — Fix AudioContext leaks (orb-visualizer.js, SimpleVAD.js)
16. **M-9** — Add defer to scripts, lazy-load Three.js/GSAP
17. **M-10** — Fix mock exam timer on background tabs
18. **M-11** — Add API concurrency limits

### Phase 4: Test Quality
19. **CR-2** — Rewrite 36 fake backend tests (server, gpt, tts, vad test files)
20. **H-9** — Add WebSocket integration tests
21. **H-10** — Add Stripe webhook tests
22. **H-11** — Fix E2E access control silent pass
23. **M-13** — Fix scenario-loader tests to test actual function
24. **M-15** — Add mock exam E2E tests

### Phase 5: Feature Completion & Polish
25. **H-12** — Build mock exam results/summary page
26. **M-12** — Remove legacy mockExamTopicsData
27. **M-14** — Complete message validation schema
28. All LOW items as time permits

---

## Passed Security Checks
- Path traversal protection (server.js:57-67) — `path.normalize()` + `startsWith()` correctly prevents traversal
- Stripe webhook signature verification — correctly uses `express.raw()` at route level
- Stripe checkout input validation — proper express-validator usage
- FREE_TIER_SCENARIOS sync — frontend and backend lists are identical (12 entries)
- Service key isolation — Supabase service key only on server side
- .gitignore coverage — all sensitive files properly excluded
- WebSocket message validation — 5 message types with schemas, length limits, type checks
- Secure session ID generation — `crypto.randomUUID()` with 122 bits of entropy
- UserID spoofing prevention — server verifies token then checks `user.id !== userId`
- HTTPS enforcement — 301 redirect in production, HSTS with preload

## Passed Performance Checks
- Session cleanup on disconnect — `sessions.delete()` + rate limiter cleanup in `ws.on('close')`
- `isAISpeaking` flag recovery — safety timeouts prevent permanent stuck state
- Audio playback race conditions — previous audio properly stopped before new playback
- VAD cleanup — both VADManager and SimpleVAD properly release resources
- Session state isolation — no shared mutable state between sessions
- Timer wall-clock accuracy — uses `Date.now()` not interval counting
- `feedbackCount` reset — properly initialized and bounded at 6

## Passed Test/Quality Checks
- FREE_TIER_SCENARIOS config consistency — identical between frontend and backend
- WebSocket security middleware tests — thorough (17 real tests)
- Config module tests — properly tests env parsing and defaults
- Audio helpers tests — imports and tests actual functions
- E2E test infrastructure — solid tier-control via route interception, centralized selectors
- CSS design system — well-organized custom properties with semantic naming

/**
 * Audit-fix wiring regression guards.
 *
 * Most audit fixes have behavioural tests in their own files
 * (stripe-auth.test.js for PR-1, stripe-webhook.test.js for PR-2). A few
 * fixes are not amenable to a clean behavioural test because the test-mode
 * bypass shortcircuits the very code path they fixed (e.g. the WS auth
 * fallback removal — DEV_BYPASS_AUTH means the auth flow is skipped
 * entirely in tests). For those, we put a regression-guard here that
 * inspects the source code to confirm the dangerous pattern hasn't crept
 * back in.
 *
 * Source-string assertions are noisy when the surrounding code changes,
 * so they're scoped to small, well-anchored snippets. If a test in here
 * starts failing after an unrelated edit, the test is doing its job:
 * verify the audit fix is still in place and update the anchor.
 */

const fs = require('fs');
const path = require('path');

const SERVER_JS = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

describe('Audit 2026-05-21 §MED-01 — WS query-param token fallback removed', () => {
  test('server.js no longer accepts ?token= as a WS auth fallback', () => {
    // The legacy fallback was:
    //   const authToken = extractAuthToken(req) || queryParams.token || null;
    // After PR-2 it must be:
    //   const authToken = extractAuthToken(req);
    expect(SERVER_JS).not.toMatch(/queryParams\.token/);
  });

  test('server.js still extracts the JWT via Sec-WebSocket-Protocol only', () => {
    expect(SERVER_JS).toMatch(/const\s+authToken\s*=\s*extractAuthToken\(req\)\s*;/);
  });
});

describe('Audit 2026-05-21 §MED-02 — Stripe webhook handler factored out', () => {
  test('server.js mounts the extracted webhook handler factory', () => {
    expect(SERVER_JS).toMatch(/createStripeWebhookHandler\(\{/);
    expect(SERVER_JS).toMatch(/require\(['"]\.\/src\/routes\/stripeWebhook['"]\)/);
  });

  test('the extracted handler module exists and exports the factory', () => {
    const mod = require('../src/routes/stripeWebhook');
    expect(typeof mod.createStripeWebhookHandler).toBe('function');
  });
});

describe('Audit 2026-05-21 §MED-02 — Status mapping moved to a utility', () => {
  test('stripeStatus utility exists and is consumed by the webhook handler', () => {
    const status = require('../src/utils/stripeStatus');
    expect(typeof status.mapStripeStatus).toBe('function');
    expect(status.STRIPE_STATUS_MAP.trialing).toBe('trialing');
    const handler = fs.readFileSync(path.join(__dirname, '../src/routes/stripeWebhook.js'), 'utf8');
    expect(handler).toMatch(/mapStripeStatus/);
  });
});

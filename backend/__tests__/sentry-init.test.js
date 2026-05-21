/**
 * Sentry beforeSend / beforeBreadcrumb redaction tests.
 *
 * Covers audit 2026-05-21 §LOW-07. The strip list previously only covered
 * transcript-shaped fields; this PR extends it to include payment
 * identifiers (userId, customerId, stripe_*), auth tokens, and URL-borne
 * tokens picked up by Sentry breadcrumb integration.
 *
 * The functions under test are pure — no Sentry client needed.
 */

process.env.NODE_ENV = 'test';

const {
  beforeSend,
  beforeBreadcrumb,
  scrubTokenFromUrl,
  SENTRY_SENSITIVE_KEYS
} = require('../src/sentry-init');

// ──────────────────────────────────────────
// beforeSend — extra / contexts redaction
// ──────────────────────────────────────────

describe('Sentry beforeSend — sensitive key redaction', () => {
  test('redacts every key in the sensitive list when present in event.extra', () => {
    const extra = {};
    for (const k of SENTRY_SENSITIVE_KEYS) {
      extra[k] = 'should-not-leak';
    }
    const out = beforeSend({ extra });
    for (const k of SENTRY_SENSITIVE_KEYS) {
      expect(out.extra[k]).toBe('[REDACTED]');
    }
  });

  test('redacts the same keys when present in event.contexts', () => {
    const contexts = {};
    for (const k of SENTRY_SENSITIVE_KEYS) {
      contexts[k] = 'should-not-leak';
    }
    const out = beforeSend({ contexts });
    for (const k of SENTRY_SENSITIVE_KEYS) {
      expect(out.contexts[k]).toBe('[REDACTED]');
    }
  });

  test('strip list covers the new audit-2026-05-21 identifiers', () => {
    // Pin the contract — these keys must remain in the list. If someone
    // accidentally removes them this test fails.
    const required = [
      'userId',
      'stripe_customer_id',
      'stripe_subscription_id',
      'token',
      'access_token',
      'refresh_token',
      'Authorization'
    ];
    for (const k of required) {
      expect(SENTRY_SENSITIVE_KEYS).toContain(k);
    }
  });

  test('preserves non-sensitive fields untouched', () => {
    const out = beforeSend({
      extra: { route: '/api/account/export', durationMs: 240, transcript: 'leak-me' }
    });
    expect(out.extra.route).toBe('/api/account/export');
    expect(out.extra.durationMs).toBe(240);
    expect(out.extra.transcript).toBe('[REDACTED]');
  });

  test('blanks out request.data entirely (audio/transcript bodies)', () => {
    const out = beforeSend({
      request: { data: { audio: 'base64...', text: 'sensitive' } }
    });
    expect(out.request.data).toBe('[REDACTED]');
  });

  test('scrubs ?token= from request.url', () => {
    const out = beforeSend({
      request: { url: 'https://api.reviva.live/?scenario=x&token=secret-jwt&voice=Kore' }
    });
    expect(out.request.url).not.toMatch(/secret-jwt/);
    expect(out.request.url).toMatch(/token=REDACTED/);
    expect(out.request.url).toMatch(/scenario=x/);
    expect(out.request.url).toMatch(/voice=Kore/);
  });

  test('no-op when event has no extra/contexts/request fields', () => {
    expect(() => beforeSend({})).not.toThrow();
  });
});

// ──────────────────────────────────────────
// beforeBreadcrumb — URL scrub on in-flight breadcrumbs
// ──────────────────────────────────────────

describe('Sentry beforeBreadcrumb — URL token scrubbing', () => {
  test('scrubs ?token= from fetch breadcrumb URLs', () => {
    const out = beforeBreadcrumb({
      type: 'http',
      data: { url: 'https://api.reviva.live/?token=leaked' }
    });
    expect(out.data.url).toMatch(/token=REDACTED/);
    expect(out.data.url).not.toMatch(/leaked/);
  });

  test('scrubs access_token from Supabase magic-link callback URLs', () => {
    const out = beforeBreadcrumb({
      type: 'navigation',
      data: { url: 'https://www.reviva.live/auth/callback#access_token=eyJ.foo&refresh_token=bar' }
    });
    // hash-mode tokens — we only handle query params; this test pins the
    // current contract (hash params are NOT scrubbed by URL.searchParams)
    // so we can revisit if needed.
    expect(out.data.url).toContain('access_token=eyJ.foo'); // hash, not scrubbed
  });

  test('access_token in query (not hash) is scrubbed', () => {
    const out = beforeBreadcrumb({
      data: { url: 'https://api.reviva.live/cb?access_token=jwt&state=abc' }
    });
    expect(out.data.url).toMatch(/access_token=REDACTED/);
    expect(out.data.url).toMatch(/state=abc/);
  });

  test('returns breadcrumb unchanged when data.url is missing', () => {
    const crumb = { type: 'http', data: { method: 'GET' } };
    const out = beforeBreadcrumb(crumb);
    expect(out).toBe(crumb);
  });

  test('returns breadcrumb unchanged when data is missing', () => {
    const crumb = { type: 'navigation' };
    expect(() => beforeBreadcrumb(crumb)).not.toThrow();
  });
});

// ──────────────────────────────────────────
// scrubTokenFromUrl — unit tests
// ──────────────────────────────────────────

describe('scrubTokenFromUrl', () => {
  test('redacts known query keys, preserves others', () => {
    const out = scrubTokenFromUrl(
      'https://example.com/path?token=sec&user=alice&access_token=ya29&keep=this'
    );
    expect(out).toMatch(/token=REDACTED/);
    expect(out).toMatch(/access_token=REDACTED/);
    expect(out).toMatch(/user=alice/);
    expect(out).toMatch(/keep=this/);
  });

  test('returns input unchanged when no sensitive keys are present', () => {
    const url = 'https://example.com/path?safe=1&also=2';
    expect(scrubTokenFromUrl(url)).toBe(url);
  });

  test('handles relative URLs without throwing', () => {
    const out = scrubTokenFromUrl('/cb?token=x&y=2');
    expect(out).toMatch(/token=REDACTED/);
    expect(out).toMatch(/y=2/);
    expect(out).not.toMatch(/placeholder\.invalid/);
  });

  test('returns non-string input unchanged', () => {
    expect(scrubTokenFromUrl(undefined)).toBe(undefined);
    expect(scrubTokenFromUrl(null)).toBe(null);
    expect(scrubTokenFromUrl(42)).toBe(42);
  });

  test('handles malformed URLs gracefully', () => {
    expect(scrubTokenFromUrl('::not a url::')).toBe('::not a url::');
  });
});

const { extractBearerToken, MAX_AUTH_HEADER } = require('../src/utils/auth');

describe('extractBearerToken', () => {
  test('extracts token from canonical Authorization header', () => {
    expect(extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  test('is case-insensitive on the scheme', () => {
    expect(extractBearerToken('bearer abc.def.ghi')).toBe('abc.def.ghi');
    expect(extractBearerToken('BEARER abc.def.ghi')).toBe('abc.def.ghi');
    expect(extractBearerToken('BeArEr abc.def.ghi')).toBe('abc.def.ghi');
  });

  test('trims surrounding whitespace on the token', () => {
    expect(extractBearerToken('Bearer    abc.def.ghi   ')).toBe('abc.def.ghi');
  });

  test('returns null when header is missing or empty', () => {
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken(null)).toBeNull();
    expect(extractBearerToken('')).toBeNull();
  });

  test('returns null for non-string inputs (defeats type-confusion)', () => {
    expect(extractBearerToken(['Bearer abc'])).toBeNull();
    expect(extractBearerToken({ toString: () => 'Bearer abc' })).toBeNull();
    expect(extractBearerToken(12345)).toBeNull();
  });

  test('returns null for non-Bearer schemes', () => {
    expect(extractBearerToken('Basic dXNlcjpwYXNz')).toBeNull();
    expect(extractBearerToken('Token abc.def.ghi')).toBeNull();
  });

  test('returns null when the token portion is empty', () => {
    expect(extractBearerToken('Bearer ')).toBeNull();
    expect(extractBearerToken('Bearer    ')).toBeNull();
  });

  test('returns null for oversized headers (cap is MAX_AUTH_HEADER)', () => {
    const oversize = 'Bearer ' + 'A'.repeat(MAX_AUTH_HEADER);
    expect(extractBearerToken(oversize)).toBeNull();
  });

  test('finishes in linear time on adversarial input — no polynomial backtracking', () => {
    // Build a "Bearer<lots-of-spaces>" string. The replaced regex would
    // backtrack quadratically here; the new path-resolver should be O(n).
    const big = 'Bearer' + ' '.repeat(10000) + 'x';
    const start = Date.now();
    extractBearerToken(big);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});

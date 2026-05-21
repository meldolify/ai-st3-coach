/**
 * Shared auth helpers.
 *
 * extractBearerToken — non-regex bearer-token parser used by REST auth
 * middlewares. Replaces the prior `auth.match(/^Bearer\s+(.+)$/i)` which
 * CodeQL flagged as polynomial-ReDoS (js/polynomial-redos, sev 7.5): the
 * Authorization header is parsed on every request before any auth check,
 * so an anonymous client can pin a worker on a crafted header.
 */

// 8 KiB is comfortably above a typical Supabase JWT (~1 KiB) and below
// the Node default header limit (~8 KiB / 80 KiB). Anything larger is
// not a real token and gets rejected without a regex pass.
const MAX_AUTH_HEADER = 8 * 1024;

function extractBearerToken(authHeader) {
  if (typeof authHeader !== 'string') {
    return null;
  }
  if (authHeader.length > MAX_AUTH_HEADER) {
    return null;
  }
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token || null;
}

module.exports = { extractBearerToken, MAX_AUTH_HEADER };

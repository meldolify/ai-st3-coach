/**
 * userAuth — REST middleware that verifies a Supabase Bearer token and
 * sets req.user to the authenticated user object.
 *
 * Differs from promptLabAuth: that one ALSO checks the email is on an
 * admin allowlist. This one accepts any authenticated user — use it for
 * "logged-in user acting on their own data" endpoints (e.g. account
 * delete, data export).
 *
 * Bypassed in NODE_ENV=test and when DEV_BYPASS_AUTH=true so local
 * workflows continue without a live Supabase session.
 */

const config = require('../config');

let supabaseAdmin = null;
function getSupabase() {
  if (!supabaseAdmin && config.isSupabaseEnabled) {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
  }
  return supabaseAdmin;
}

async function userAuth(req, res, next) {
  if (process.env.NODE_ENV === 'test' || config.DEV_BYPASS_AUTH) {
    // Test/dev shim: routes can still read req.user if downstream needs it.
    req.user = req.user || { id: 'test-user', email: 'test@example.com' };
    return next();
  }

  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: 'Authorization Bearer token required' });
  }
  const token = match[1];

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Auth backend not configured' });
  }

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error('[userAuth] Auth error:', err.message);
    return res.status(500).json({ error: 'Auth check failed' });
  }
}

module.exports = { userAuth };

/**
 * Prompt Lab Auth Middleware
 *
 * Requires a Supabase Bearer token on every /prompt-lab/api/* request and
 * checks the authenticated user's email against a comma-separated allowlist
 * in PROMPT_LAB_ADMIN_EMAILS. Fails closed when the allowlist is unset.
 *
 * Bypassed in test mode (NODE_ENV=test) and when DEV_BYPASS_AUTH=true so local
 * development and unit tests continue to work without a live Supabase session.
 */

const config = require('../config');
const { extractBearerToken } = require('../utils/auth');

let supabaseAdmin = null;
function getSupabase() {
  if (!supabaseAdmin && config.isSupabaseEnabled) {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
  }
  return supabaseAdmin;
}

function getAdminEmails() {
  const raw = process.env.PROMPT_LAB_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

async function promptLabAuth(req, res, next) {
  if (process.env.NODE_ENV === 'test' || config.DEV_BYPASS_AUTH) {
    return next();
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    console.warn('[PROMPT LAB] Blocked: PROMPT_LAB_ADMIN_EMAILS not configured');
    return res
      .status(503)
      .json({ error: 'Prompt Lab admin allowlist not configured on the server' });
  }

  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authorization Bearer token required' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Auth backend not configured' });
  }

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!adminEmails.includes(user.email.toLowerCase())) {
      console.warn(`[PROMPT LAB] Forbidden: ${user.email} not in admin allowlist`);
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error('[PROMPT LAB] Auth error:', err.message);
    return res.status(500).json({ error: 'Auth check failed' });
  }
}

module.exports = { promptLabAuth };

/**
 * Account management routes — GDPR rights for the authenticated user.
 *
 *   GET    /api/account/export   →  JSON export of all the caller's data
 *   DELETE /api/account          →  Cascading delete + Stripe subscription cancel
 *
 * Both require a Supabase Bearer token; userAuth middleware enforces that.
 * Caller can only act on their own account — req.user.id is the only
 * identifier used downstream, never a body/query value.
 */

const express = require('express');
const config = require('../config');
const { userAuth } = require('../middleware/userAuth');
const { terminateUserSessions } = require('../services/sessions');

const router = express.Router();

/**
 * Truncated support reference derived from the user's id — non-PII (8 hex
 * chars of the UUID), unique enough for the operator to find the matching
 * server-side log entry, opaque enough to not leak the full user id back
 * to the client. Audit 2026-05-21 §MED-03.
 */
function supportReference(userId) {
  if (!userId || typeof userId !== 'string') {
    return 'unknown';
  }
  return userId.replace(/-/g, '').slice(0, 8);
}

let supabaseAdmin = null;
function getSupabase() {
  if (!supabaseAdmin && config.isSupabaseEnabled) {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
  }
  return supabaseAdmin;
}

let stripe = null;
function getStripe() {
  if (!stripe && config.isStripeEnabled) {
    stripe = require('stripe')(config.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/**
 * GET /api/account/export
 *
 * Returns a single JSON document with everything we hold against this
 * user account: profile, subscription, session history. Suitable for
 * Article 15 (right of access) DSAR responses.
 */
router.get('/export', userAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const userId = req.user.id;
  const email = req.user.email;

  try {
    const [profileRes, subRes, sessionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('session_history').select('*').eq('user_id', userId)
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      account: {
        id: userId,
        email,
        created_at: req.user.created_at || null
      },
      profile: profileRes.data || null,
      subscription: subRes.data
        ? {
          // Redact internal Stripe ids from the export — they're not the
          // user's data, they're our payment-processor reference. Status,
          // dates, and plan tier are fine.
          status: subRes.data.status,
          price_type: subRes.data.price_type,
          specialty: subRes.data.specialty,
          current_period_end: subRes.data.current_period_end,
          created_at: subRes.data.created_at
        }
        : null,
      sessions: sessionsRes.data || []
    };

    const filename = `reviva-data-export-${userId}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.json(payload);
  } catch (err) {
    console.error('[account/export] Failed:', err.message);
    return res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * DELETE /api/account
 *
 * Cascading delete for Article 17 (right to erasure). Order matters:
 *   1. Cancel Stripe subscription (so future invoices don't fire)
 *   2. Delete domain rows (session_history, subscriptions, profiles)
 *   3. Delete the auth.users row last via Supabase admin API
 *
 * Stripe cancel failures don't block the DB delete — the user takes
 * precedence over the payment side. Any orphaned Stripe sub gets caught
 * by the user reporting it or by the customer.subscription.deleted
 * webhook never firing (manual cleanup via dashboard).
 */
router.delete('/', userAuth, async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const userId = req.user.id;
  const errors = [];

  // 1. Cancel Stripe subscription, if any.
  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    const stripeClient = getStripe();
    if (sub?.stripe_subscription_id && stripeClient) {
      try {
        await stripeClient.subscriptions.cancel(sub.stripe_subscription_id);
        console.log(`[account/delete] Cancelled Stripe sub for ${userId}`);
      } catch (err) {
        // Already cancelled or not found — log and continue.
        console.warn(
          `[account/delete] Stripe cancel for ${userId} returned: ${err.message} (continuing)`
        );
        errors.push({ step: 'stripe_cancel', message: err.message });
      }
    }
  } catch (err) {
    console.warn(`[account/delete] Stripe lookup failed: ${err.message} (continuing)`);
    errors.push({ step: 'stripe_lookup', message: err.message });
  }

  // 2. Delete domain rows. Order: child rows before parent rows.
  const tableDeletes = [
    { table: 'session_history', column: 'user_id' },
    { table: 'subscriptions', column: 'user_id' },
    { table: 'profiles', column: 'id' }
  ];

  for (const { table, column } of tableDeletes) {
    try {
      const { error } = await supabase.from(table).delete().eq(column, userId);
      if (error) {
        console.warn(`[account/delete] Failed to delete from ${table}: ${error.message}`);
        errors.push({ step: `delete_${table}`, message: error.message });
      }
    } catch (err) {
      console.warn(`[account/delete] Exception deleting from ${table}: ${err.message}`);
      errors.push({ step: `delete_${table}`, message: err.message });
    }
  }

  // 3. Delete the auth user. Service role key required — already in use.
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      // If we can't delete the auth row the user is in a half-deleted
      // state: domain data gone, but they can still log in to a now-empty
      // account. Surface a generic 500 so the client knows to escalate;
      // full error chain is logged server-side only — see audit
      // 2026-05-21 §MED-03.
      const ref = supportReference(userId);
      const fullErrors = errors.concat([{ step: 'auth_delete', message: error.message }]);
      console.error(`[account/delete] ref=${ref} step-errors:`, fullErrors);
      return res.status(500).json({
        error: `Account deletion failed at the auth step. Please contact support and reference id ${ref}.`
      });
    }
  } catch (err) {
    const ref = supportReference(userId);
    const fullErrors = errors.concat([{ step: 'auth_delete', message: err.message }]);
    console.error(`[account/delete] ref=${ref} step-exception:`, fullErrors);
    return res.status(500).json({
      error: `Account deletion failed. Please contact support and reference id ${ref}.`
    });
  }

  // 4. Terminate any live WS sessions for this user — otherwise they keep
  //    streaming audio to Deepgram and consuming Gemini tokens against an
  //    account that no longer exists. Audit 2026-05-21 §LOW-06.
  try {
    const terminated = terminateUserSessions(userId);
    if (terminated.length > 0) {
      console.log(
        `[account/delete] Terminated ${terminated.length} live session(s) for ${supportReference(userId)}`
      );
    }
  } catch (err) {
    // Non-fatal: the account is already deleted; if a teardown error here
    // leaves a zombie session, the idle-cleanup sweep will catch it within
    // 30 minutes.
    console.warn(`[account/delete] Session teardown failed: ${err.message}`);
  }

  if (errors.length > 0) {
    console.warn(
      `[account/delete] ref=${supportReference(userId)} completed with non-fatal step-errors:`,
      errors
    );
  }
  console.log(`[account/delete] Completed for user ${supportReference(userId)}`);
  return res.status(200).json({ deleted: true });
});

module.exports = router;

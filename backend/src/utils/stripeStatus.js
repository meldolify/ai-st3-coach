/**
 * Map the full Stripe subscription-status enum onto the project's internal
 * status values stored in the `subscriptions.status` column.
 *
 * Why this exists: the prior code used a binary
 *   `status === 'active' ? 'active' : 'past_due'`
 * which collapsed `trialing`, `paused`, `incomplete`, etc. all into
 * `past_due`. That was wrong for `trialing` (those users have legitimate
 * access) and inconsistent with `canceled` (handled separately by the
 * customer.subscription.deleted event). Audit 2026-05-21 §MED-02.
 *
 * Internal values we use elsewhere:
 *   - 'active'      → access granted (server.js WS upgrade check)
 *   - 'trialing'    → access granted (frontend canAccessScenario)
 *   - 'past_due'    → no access; user needs to update payment
 *   - 'incomplete'  → checkout not yet finished; no access
 *   - 'cancelled'   → no access (note British spelling for DB compatibility
 *                     with existing rows — Stripe uses 'canceled')
 *
 * Default: anything we don't recognise maps to 'past_due' (fail-closed —
 * the user loses access until the situation is clarified, rather than
 * being silently granted access on an unknown Stripe state).
 */

const STRIPE_STATUS_MAP = Object.freeze({
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  unpaid: 'past_due',
  canceled: 'cancelled',
  incomplete: 'incomplete',
  incomplete_expired: 'cancelled',
  paused: 'past_due'
});

function mapStripeStatus(stripeStatus) {
  return STRIPE_STATUS_MAP[stripeStatus] || 'past_due';
}

module.exports = { STRIPE_STATUS_MAP, mapStripeStatus };

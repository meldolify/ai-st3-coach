/**
 * Payment routes — Stripe Checkout + Customer Portal session creation.
 *
 *   POST /create-checkout-session  → returns a Stripe Checkout URL
 *   POST /create-portal-session    → returns a Stripe Billing Portal URL
 *
 * Both require a Supabase Bearer token (userAuth middleware) and derive the
 * caller's identifiers from `req.user`, never from the request body. This
 * closes audit findings HIGH-01 + HIGH-02 (2026-05-21): previously both
 * endpoints were unauthenticated and trusted `userId`/`email`/`customerId`
 * from the body, letting any client open a portal for any customer ID or
 * pin a paid subscription to an arbitrary user.
 *
 * The Stripe webhook handler stays in server.js because it needs a raw-body
 * parser; the two Checkout/Portal endpoints share JSON parsing and the same
 * auth pattern, so they live here together.
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const config = require('../config');
const { userAuth } = require('../middleware/userAuth');
const { sanitizeForLog } = require('../middleware/websocketSecurity');

const router = express.Router();

let stripe = null;
function getStripe() {
  if (!stripe && config.isStripeEnabled) {
    stripe = require('stripe')(config.STRIPE_SECRET_KEY);
  }
  return stripe;
}

let supabaseAdmin = null;
function getSupabase() {
  if (!supabaseAdmin && config.isSupabaseEnabled) {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
  }
  return supabaseAdmin;
}

/**
 * POST /create-checkout-session
 *
 * Creates a Stripe Checkout session for the authenticated user. The userId
 * and email come from `req.user` (set by userAuth from the Supabase JWT),
 * NOT from the request body. The only body field consulted is the optional
 * `priceType` — anything else is ignored.
 */
router.post(
  '/create-checkout-session',
  userAuth,
  express.json(),
  [body('priceType').optional().isIn(['monthly', 'annual'])],
  async (req, res) => {
    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    try {
      const priceType = req.body.priceType || 'monthly';
      const priceId =
        priceType === 'annual' ? config.STRIPE_PRICE_ID_ANNUAL : config.STRIPE_PRICE_ID_MONTHLY;

      if (!priceId) {
        console.error('[STRIPE] Price ID not configured for:', sanitizeForLog(priceType));
        return res.status(500).json({ error: 'Payment configuration error' });
      }

      const session = await stripeClient.checkout.sessions.create({
        customer_email: req.user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${config.FRONTEND_URL}?payment=success`,
        cancel_url: `${config.FRONTEND_URL}?payment=cancelled`,
        metadata: {
          userId: req.user.id,
          priceType,
          specialty: 'plastic-surgery'
        }
      });

      console.log(
        '[STRIPE] Checkout session created for user:',
        sanitizeForLog(req.user.id),
        'plan:',
        sanitizeForLog(priceType)
      );
      res.json({ url: session.url });
    } catch (error) {
      console.error('[STRIPE] Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

/**
 * POST /create-portal-session
 *
 * Creates a Stripe Billing Portal session for the authenticated user.
 * The Stripe `customer` is looked up server-side from the `subscriptions`
 * table keyed on `req.user.id` — the request body is ignored entirely.
 * Returns 404 if the caller has no subscription on file.
 */
router.post('/create-portal-session', userAuth, express.json(), async (req, res) => {
  const stripeClient = getStripe();
  const supabase = getSupabase();
  if (!stripeClient || !supabase) {
    return res.status(503).json({ error: 'Payment processing not configured' });
  }

  try {
    const { data: sub, error: lookupErr } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (lookupErr) {
      console.error('[STRIPE] Subscription lookup failed:', lookupErr.message);
      return res.status(500).json({ error: 'Subscription lookup failed' });
    }

    if (!sub?.stripe_customer_id) {
      return res.status(404).json({ error: 'No subscription found for this account' });
    }

    const session = await stripeClient.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${config.FRONTEND_URL}?page=profile`
    });

    console.log('[STRIPE] Portal session created for user:', sanitizeForLog(req.user.id));
    res.json({ url: session.url });
  } catch (error) {
    console.error('[STRIPE] Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

module.exports = router;

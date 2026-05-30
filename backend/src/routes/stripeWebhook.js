/**
 * Stripe webhook handler.
 *
 * Factored out of server.js for testability — tests can construct a handler
 * with mocked stripe + supabaseAdmin clients and exercise the dedup / status
 * mapping / current_period_end flows without touching the WS server.
 *
 * Idempotency: Stripe burst-retries webhooks on non-2xx response or timeout
 * (default 3 days, exponential backoff) and is allowed to deliver the same
 * event.id more than once or out of order. We INSERT into
 * processed_stripe_events keyed on event.id BEFORE any side-effect. A unique
 * violation (postgres 23505) means we've already processed this event — we
 * ack 200 and skip all side-effects so Stripe stops retrying. Audit
 * 2026-05-21 §MED-02 (CWE-345).
 *
 * The handler is mounted with `express.raw()` in server.js because Stripe
 * signs the raw bytes — JSON-parsing the body first would break signature
 * verification.
 */

const { mapStripeStatus } = require('../utils/stripeStatus');

/**
 * @param {object} deps
 * @param {import('stripe').Stripe} deps.stripe - Stripe client (used for both
 *   webhooks.constructEvent and subscriptions.retrieve)
 * @param {object} deps.supabaseAdmin - Supabase client with service_role,
 *   used to update the subscriptions table and record processed event ids
 * @param {string} deps.webhookSecret - Stripe webhook signing secret
 * @returns {(req, res) => Promise<void>} Express handler
 */
function createStripeWebhookHandler({ stripe, supabaseAdmin, webhookSecret }) {
  return async function stripeWebhookHandler(req, res) {
    if (!stripe || !supabaseAdmin) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
      return res.status(400).send('Webhook processing failed');
    }

    // Idempotency gate. Insert-or-noop: if event.id already exists we ack
    // (200) and skip all side-effects. Errors other than unique-violation
    // propagate as a 500 so Stripe retries — better than silently processing
    // twice or losing the event.
    const { error: dedupErr } = await supabaseAdmin
      .from('processed_stripe_events')
      .insert({ event_id: event.id, type: event.type });
    if (dedupErr) {
      if (dedupErr.code === '23505') {
        console.log('[STRIPE WEBHOOK] Duplicate event ignored:', event.id);
        return res.json({ received: true, duplicate: true });
      }
      console.error('[STRIPE WEBHOOK] Dedup insert failed:', dedupErr.message);
      return res.status(500).json({ error: 'Webhook bookkeeping failed' });
    }

    console.log('[STRIPE WEBHOOK] Event received:', event.type, event.id);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const customerId = session.customer;
          const subscriptionId = session.subscription;
          const priceType = session.metadata?.priceType || 'monthly';
          const specialty = session.metadata?.specialty || 'plastic-surgery';

          if (userId) {
            // Pull current_period_end at activation time — otherwise the row
            // stays null until the next customer.subscription.updated webhook,
            // which may be delayed or lost.
            let currentPeriodEnd = null;
            if (subscriptionId) {
              try {
                const subObj = await stripe.subscriptions.retrieve(subscriptionId);
                if (subObj?.current_period_end) {
                  currentPeriodEnd = new Date(subObj.current_period_end * 1000).toISOString();
                }
              } catch (err) {
                console.warn('[STRIPE] Failed to fetch subscription on activation:', err.message);
              }
            }

            // Supabase JS returns { data, error } — DON'T discard the error.
            // The original code logged "activated" regardless of outcome; if
            // user_id lacks a UNIQUE constraint the upsert errors silently and
            // the row never lands. Diagnosed 2026-05-30 when a real live-mode
            // payment succeeded in Stripe but the DB never updated.
            const { error: upsertErr } = await supabaseAdmin.from('subscriptions').upsert(
              {
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                price_type: priceType,
                specialty: specialty,
                current_period_end: currentPeriodEnd,
                created_at: new Date().toISOString()
              },
              { onConflict: 'user_id' }
            );

            if (upsertErr) {
              console.error(
                '[STRIPE] Failed to upsert subscription for user:',
                userId,
                upsertErr.code,
                upsertErr.message
              );
              // Return 500 so Stripe retries — Stripe's default retry policy
              // re-delivers webhooks for up to 3 days with exponential backoff.
              // Better to surface the failure than silently lose the row.
              return res
                .status(500)
                .json({ error: 'Subscription persistence failed', code: upsertErr.code });
            }

            console.log('[STRIPE] Subscription activated for user:', userId);
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const status = mapStripeStatus(subscription.status);

          const { error: updateErr } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null
            })
            .eq('stripe_subscription_id', subscription.id);

          if (updateErr) {
            console.error(
              '[STRIPE] Failed to update subscription:',
              subscription.id,
              updateErr.code,
              updateErr.message
            );
            return res
              .status(500)
              .json({ error: 'Subscription update failed', code: updateErr.code });
          }

          console.log('[STRIPE] Subscription updated:', subscription.id, status);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;

          const { error: cancelErr } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id);

          if (cancelErr) {
            console.error(
              '[STRIPE] Failed to mark subscription cancelled:',
              subscription.id,
              cancelErr.code,
              cancelErr.message
            );
            return res
              .status(500)
              .json({ error: 'Subscription cancel failed', code: cancelErr.code });
          }

          console.log('[STRIPE] Subscription cancelled:', subscription.id);
          break;
        }
      }
    } catch (error) {
      console.error('[STRIPE WEBHOOK] Error processing event:', error);
      // Don't roll back the dedup-insert: re-processing on retry is worse
      // than losing one event (recoverable via dashboard).
      return res.status(500).json({ error: 'Event processing failed' });
    }

    return res.json({ received: true });
  };
}

module.exports = { createStripeWebhookHandler };

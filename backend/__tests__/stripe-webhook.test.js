/**
 * Stripe webhook handler tests.
 *
 * Covers audit 2026-05-21 §MED-02. The handler factory in
 * backend/src/routes/stripeWebhook.js takes injected stripe + supabaseAdmin
 * mocks so we can exercise:
 *
 *   1. Idempotency: same event.id delivered twice → second call returns
 *      `{received:true, duplicate:true}` and produces ZERO side-effects.
 *   2. Status mapping: trialing → 'trialing' (not the prior 'past_due').
 *   3. current_period_end is populated on checkout.session.completed.
 *   4. Signature verification failure → 400 without DB write.
 *   5. Non-unique-violation dedup error → 500 (don't fail open).
 *
 * The handler is independent of server.js auth/WS plumbing — tests use a
 * fresh Express app with express.raw() + the handler mounted, mirroring how
 * server.js mounts it in production.
 */

process.env.NODE_ENV = 'test';

const express = require('express');
const request = require('supertest');
const { createStripeWebhookHandler } = require('../src/routes/stripeWebhook');
const { mapStripeStatus, STRIPE_STATUS_MAP } = require('../src/utils/stripeStatus');

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function buildSupabaseMock({ insertResult, upsertResult, updateResult } = {}) {
  const insert = jest.fn().mockResolvedValue(insertResult || { error: null });
  const upsert = jest.fn().mockResolvedValue(upsertResult || { error: null });
  const update = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue(updateResult || { error: null })
  });

  const from = jest.fn(table => {
    if (table === 'processed_stripe_events') {
      return { insert };
    }
    if (table === 'subscriptions') {
      return { upsert, update };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  return { from, _spies: { insert, upsert, update } };
}

function buildStripeMock({ event, constructEventThrows, subscriptionRetrieve }) {
  return {
    webhooks: {
      constructEvent: constructEventThrows
        ? jest.fn(() => {
          throw new Error('Stripe signature verification failed');
        })
        : jest.fn(() => event)
    },
    subscriptions: {
      retrieve: jest
        .fn()
        .mockResolvedValue(subscriptionRetrieve || { current_period_end: 1800000000 })
    }
  };
}

function buildApp(handler) {
  const app = express();
  app.post('/stripe-webhook', express.raw({ type: 'application/json' }), handler);
  return app;
}

// ──────────────────────────────────────────
// Idempotency (MED-02 core)
// ──────────────────────────────────────────

describe('Stripe webhook idempotency', () => {
  test('duplicate event.id returns 200 with duplicate:true and skips ALL side-effects', async () => {
    const event = {
      id: 'evt_test_duplicate',
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_x', status: 'active', current_period_end: 1800000000 } }
    };
    // unique_violation on the dedup insert
    const supabase = buildSupabaseMock({
      insertResult: { error: { code: '23505', message: 'duplicate key' } }
    });
    const stripe = buildStripeMock({ event });
    const handler = createStripeWebhookHandler({
      stripe,
      supabaseAdmin: supabase,
      webhookSecret: 'whsec_test'
    });

    const res = await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true, duplicate: true });
    // dedup attempted exactly once
    expect(supabase._spies.insert).toHaveBeenCalledTimes(1);
    // NO side-effects on the subscription
    expect(supabase._spies.upsert).not.toHaveBeenCalled();
    expect(supabase._spies.update).not.toHaveBeenCalled();
  });

  test('first delivery of an event proceeds and records the event id', async () => {
    const event = {
      id: 'evt_test_first',
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_x', status: 'active', current_period_end: 1800000000 } }
    };
    const supabase = buildSupabaseMock();
    const stripe = buildStripeMock({ event });
    const handler = createStripeWebhookHandler({
      stripe,
      supabaseAdmin: supabase,
      webhookSecret: 'whsec_test'
    });

    const res = await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(supabase._spies.insert).toHaveBeenCalledWith({
      event_id: 'evt_test_first',
      type: 'customer.subscription.updated'
    });
    expect(supabase._spies.update).toHaveBeenCalled();
  });

  test('non-unique-violation dedup error returns 500 (fail-closed — Stripe will retry)', async () => {
    const event = { id: 'evt_x', type: 'customer.subscription.updated', data: { object: {} } };
    const supabase = buildSupabaseMock({
      insertResult: { error: { code: '08000', message: 'connection lost' } }
    });
    const stripe = buildStripeMock({ event });
    const handler = createStripeWebhookHandler({
      stripe,
      supabaseAdmin: supabase,
      webhookSecret: 'whsec_test'
    });

    const res = await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');

    expect(res.status).toBe(500);
    expect(supabase._spies.upsert).not.toHaveBeenCalled();
    expect(supabase._spies.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────
// Status mapping (full Stripe enum)
// ──────────────────────────────────────────

describe('Stripe status mapping (MED-02)', () => {
  test('trialing maps to trialing (was: past_due)', () => {
    expect(mapStripeStatus('trialing')).toBe('trialing');
  });

  test('active maps to active', () => {
    expect(mapStripeStatus('active')).toBe('active');
  });

  test('past_due maps to past_due', () => {
    expect(mapStripeStatus('past_due')).toBe('past_due');
  });

  test('unpaid maps to past_due', () => {
    expect(mapStripeStatus('unpaid')).toBe('past_due');
  });

  test('canceled maps to cancelled (note British spelling for DB compat)', () => {
    expect(mapStripeStatus('canceled')).toBe('cancelled');
  });

  test('incomplete maps to incomplete (no access)', () => {
    expect(mapStripeStatus('incomplete')).toBe('incomplete');
  });

  test('incomplete_expired maps to cancelled', () => {
    expect(mapStripeStatus('incomplete_expired')).toBe('cancelled');
  });

  test('paused maps to past_due', () => {
    expect(mapStripeStatus('paused')).toBe('past_due');
  });

  test('unknown status fails closed (past_due) — never silently grants access', () => {
    expect(mapStripeStatus('mystery_new_stripe_state')).toBe('past_due');
    expect(mapStripeStatus(undefined)).toBe('past_due');
    expect(mapStripeStatus(null)).toBe('past_due');
  });

  test('updated event with trialing is stored as trialing in subscriptions row', async () => {
    const event = {
      id: 'evt_trialing',
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_t', status: 'trialing', current_period_end: 1800000000 } }
    };
    const supabase = buildSupabaseMock();
    const stripe = buildStripeMock({ event });
    const handler = createStripeWebhookHandler({
      stripe,
      supabaseAdmin: supabase,
      webhookSecret: 'whsec_test'
    });

    await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');

    const updateArg = supabase._spies.update.mock.calls[0][0];
    expect(updateArg.status).toBe('trialing');
  });

  test('STRIPE_STATUS_MAP is frozen (no runtime tampering)', () => {
    expect(Object.isFrozen(STRIPE_STATUS_MAP)).toBe(true);
  });
});

// ──────────────────────────────────────────
// current_period_end on activation
// ──────────────────────────────────────────

describe('current_period_end at activation', () => {
  test('checkout.session.completed populates current_period_end from stripe.subscriptions.retrieve', async () => {
    const event = {
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user-uuid', priceType: 'monthly', specialty: 'plastic-surgery' },
          customer: 'cus_test',
          subscription: 'sub_test'
        }
      }
    };
    const supabase = buildSupabaseMock();
    const stripe = buildStripeMock({
      event,
      subscriptionRetrieve: { current_period_end: 1900000000 }
    });
    const handler = createStripeWebhookHandler({
      stripe,
      supabaseAdmin: supabase,
      webhookSecret: 'whsec_test'
    });

    await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_test');
    const upsertArg = supabase._spies.upsert.mock.calls[0][0];
    expect(upsertArg.user_id).toBe('user-uuid');
    expect(upsertArg.status).toBe('active');
    expect(upsertArg.current_period_end).toBe(new Date(1900000000 * 1000).toISOString());
  });

  test('checkout.session.completed tolerates stripe.subscriptions.retrieve failure', async () => {
    const event = {
      id: 'evt_checkout_no_period',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user-uuid' },
          customer: 'cus_test',
          subscription: 'sub_test'
        }
      }
    };
    const supabase = buildSupabaseMock();
    const stripe = buildStripeMock({ event });
    stripe.subscriptions.retrieve = jest.fn().mockRejectedValue(new Error('Stripe down'));
    const handler = createStripeWebhookHandler({
      stripe,
      supabaseAdmin: supabase,
      webhookSecret: 'whsec_test'
    });

    const res = await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');

    expect(res.status).toBe(200);
    const upsertArg = supabase._spies.upsert.mock.calls[0][0];
    expect(upsertArg.current_period_end).toBeNull();
  });
});

// ──────────────────────────────────────────
// Signature verification
// ──────────────────────────────────────────

describe('Signature verification', () => {
  test('invalid signature returns 400 and does NOT touch the DB', async () => {
    const supabase = buildSupabaseMock();
    const stripe = buildStripeMock({ constructEventThrows: true });
    const handler = createStripeWebhookHandler({
      stripe,
      supabaseAdmin: supabase,
      webhookSecret: 'whsec_test'
    });

    const res = await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 'bogus')
      .send('{}');

    expect(res.status).toBe(400);
    expect(supabase._spies.insert).not.toHaveBeenCalled();
    expect(supabase._spies.upsert).not.toHaveBeenCalled();
    expect(supabase._spies.update).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────
// 503 when dependencies missing
// ──────────────────────────────────────────

describe('Misconfiguration', () => {
  test('returns 503 when stripe is null', async () => {
    const handler = createStripeWebhookHandler({
      stripe: null,
      supabaseAdmin: buildSupabaseMock(),
      webhookSecret: 'whsec_test'
    });
    const res = await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');
    expect(res.status).toBe(503);
  });

  test('returns 503 when supabaseAdmin is null', async () => {
    const handler = createStripeWebhookHandler({
      stripe: buildStripeMock({ event: {} }),
      supabaseAdmin: null,
      webhookSecret: 'whsec_test'
    });
    const res = await request(buildApp(handler))
      .post('/stripe-webhook')
      .set('stripe-signature', 't=1,v1=fake')
      .send('{}');
    expect(res.status).toBe(503);
  });
});

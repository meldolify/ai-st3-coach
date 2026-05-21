/**
 * Stripe payment-route auth tests.
 *
 * Covers audit 2026-05-21 §HIGH-01 (portal session) and §HIGH-02 (checkout
 * session). The audit found both endpoints were unauthenticated and trusted
 * `userId`/`email`/`customerId` from the request body, letting any caller
 * open a billing portal for any customer ID, or pin a paid subscription to
 * an arbitrary user's account.
 *
 * Behaviour we verify here:
 *
 *   1. /create-checkout-session ignores body.userId / body.email; Stripe
 *      receives the authenticated user's id and email (from req.user).
 *   2. /create-portal-session ignores body.customerId; Stripe receives the
 *      stripe_customer_id looked up from the subscriptions table for
 *      req.user.id.
 *   3. /create-portal-session returns 404 when no subscription is on file.
 *   4. The router's middleware stack includes userAuth (regression guard:
 *      catches an accidental removal of the auth middleware).
 *
 * In NODE_ENV=test the userAuth middleware sets req.user to a default
 * { id: 'test-user', email: 'test@example.com' } when no caller-supplied
 * user is present — so the IDOR-fix assertions become "did the body
 * field override that default?" (it must not).
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.DEEPGRAM_API_KEY = 'test-deepgram-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
process.env.STRIPE_PRICE_ID_MONTHLY = 'price_test_monthly';
process.env.STRIPE_PRICE_ID_ANNUAL = 'price_test_annual';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'service-role-key';
process.env.FRONTEND_URL = 'http://localhost:3001';

// ──────────────────────────────────────────
// MOCKS — must register before requiring the route module
// ──────────────────────────────────────────

const mockStripeCheckoutCreate = jest.fn();
const mockStripePortalCreate = jest.fn();
const mockSupabaseSelect = jest.fn();

jest.mock('stripe', () =>
  jest.fn(() => ({
    checkout: { sessions: { create: mockStripeCheckoutCreate } },
    billingPortal: { sessions: { create: mockStripePortalCreate } }
  }))
);

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockSupabaseSelect
        })
      })
    })
  })
}));

// ──────────────────────────────────────────
// IMPORTS (after mocks)
// ──────────────────────────────────────────

const express = require('express');
const request = require('supertest');
const paymentsRouter = require('../src/routes/payments');

function buildApp() {
  const app = express();
  app.use(paymentsRouter);
  return app;
}

const app = buildApp();

beforeEach(() => {
  mockStripeCheckoutCreate.mockReset();
  mockStripePortalCreate.mockReset();
  mockSupabaseSelect.mockReset();
  mockStripeCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test' });
  mockStripePortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/test' });
});

// ──────────────────────────────────────────
// /create-checkout-session
// ──────────────────────────────────────────

describe('POST /create-checkout-session', () => {
  test('uses req.user.id + req.user.email in Stripe metadata — body userId/email IGNORED', async () => {
    const res = await request(app).post('/create-checkout-session').send({
      userId: 'attacker-controlled-victim-uuid',
      email: 'victim@example.com',
      priceType: 'monthly'
    });

    expect(res.status).toBe(200);
    expect(res.body.url).toBe('https://checkout.stripe.com/test');
    expect(mockStripeCheckoutCreate).toHaveBeenCalledTimes(1);

    const stripeArgs = mockStripeCheckoutCreate.mock.calls[0][0];
    // The dangerous body fields must not influence the Stripe call.
    expect(stripeArgs.metadata.userId).toBe('test-user');
    expect(stripeArgs.metadata.userId).not.toBe('attacker-controlled-victim-uuid');
    expect(stripeArgs.customer_email).toBe('test@example.com');
    expect(stripeArgs.customer_email).not.toBe('victim@example.com');
  });

  test('selects the annual price when priceType=annual', async () => {
    const res = await request(app).post('/create-checkout-session').send({ priceType: 'annual' });

    expect(res.status).toBe(200);
    const stripeArgs = mockStripeCheckoutCreate.mock.calls[0][0];
    expect(stripeArgs.line_items[0].price).toBe('price_test_annual');
    expect(stripeArgs.metadata.priceType).toBe('annual');
  });

  test('defaults to monthly when priceType is omitted', async () => {
    const res = await request(app).post('/create-checkout-session').send({});

    expect(res.status).toBe(200);
    const stripeArgs = mockStripeCheckoutCreate.mock.calls[0][0];
    expect(stripeArgs.line_items[0].price).toBe('price_test_monthly');
    expect(stripeArgs.metadata.priceType).toBe('monthly');
  });

  test('rejects invalid priceType', async () => {
    const res = await request(app)
      .post('/create-checkout-session')
      .send({ priceType: '../../../evil' });

    expect(res.status).toBe(400);
    expect(mockStripeCheckoutCreate).not.toHaveBeenCalled();
  });

  test('hardcodes specialty server-side — body.specialty ignored', async () => {
    const res = await request(app)
      .post('/create-checkout-session')
      .send({ specialty: 'attacker-injected-specialty' });

    expect(res.status).toBe(200);
    const stripeArgs = mockStripeCheckoutCreate.mock.calls[0][0];
    expect(stripeArgs.metadata.specialty).toBe('plastic-surgery');
  });
});

// ──────────────────────────────────────────
// /create-portal-session
// ──────────────────────────────────────────

describe('POST /create-portal-session', () => {
  test('looks up stripe_customer_id from subscriptions for req.user.id — body customerId IGNORED', async () => {
    mockSupabaseSelect.mockResolvedValue({
      data: { stripe_customer_id: 'cus_real_customer_from_db' },
      error: null
    });

    const res = await request(app)
      .post('/create-portal-session')
      .send({ customerId: 'cus_attacker_controlled_victim' });

    expect(res.status).toBe(200);
    expect(res.body.url).toBe('https://billing.stripe.com/test');
    expect(mockStripePortalCreate).toHaveBeenCalledTimes(1);

    const stripeArgs = mockStripePortalCreate.mock.calls[0][0];
    // The dangerous body field must not influence the Stripe call.
    expect(stripeArgs.customer).toBe('cus_real_customer_from_db');
    expect(stripeArgs.customer).not.toBe('cus_attacker_controlled_victim');
  });

  test('returns 404 when the authenticated user has no subscription on file', async () => {
    mockSupabaseSelect.mockResolvedValue({ data: null, error: null });

    const res = await request(app).post('/create-portal-session').send({});

    expect(res.status).toBe(404);
    expect(mockStripePortalCreate).not.toHaveBeenCalled();
  });

  test('returns 500 when subscription lookup errors', async () => {
    mockSupabaseSelect.mockResolvedValue({
      data: null,
      error: { message: 'database connection failed' }
    });

    const res = await request(app).post('/create-portal-session').send({});

    expect(res.status).toBe(500);
    expect(mockStripePortalCreate).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────
// Middleware-chain regression guard
// ──────────────────────────────────────────

describe('payments router middleware chain', () => {
  test('userAuth is in the middleware chain for both Stripe endpoints', () => {
    // If someone removes userAuth from payments.js, the IDOR-fix is undone
    // and the auth-bypass-in-test stops working — but the IDOR tests above
    // would still pass because they don't depend on userAuth running.
    // This regression-guard asserts userAuth is wired in by name.
    const userAuthName = require('../src/middleware/userAuth').userAuth.name;

    const routes = paymentsRouter.stack
      .filter(layer => layer.route)
      .map(layer => ({
        path: layer.route.path,
        middlewareNames: layer.route.stack.map(s => s.name)
      }));

    const checkout = routes.find(r => r.path === '/create-checkout-session');
    const portal = routes.find(r => r.path === '/create-portal-session');

    expect(checkout).toBeDefined();
    expect(portal).toBeDefined();
    expect(checkout.middlewareNames).toContain(userAuthName);
    expect(portal.middlewareNames).toContain(userAuthName);
  });
});

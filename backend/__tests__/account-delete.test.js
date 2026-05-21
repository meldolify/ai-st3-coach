/**
 * DELETE /api/account behaviour tests.
 *
 * Covers audit 2026-05-21:
 *   §MED-03 — partial_errors is no longer returned to the client; the user
 *             gets a generic message with a short support reference and the
 *             full error chain is server-side log only.
 *   §LOW-06 — Active WS sessions belonging to the deleted user are
 *             terminated as the final step of the cascading delete.
 *
 * Auth bypass: userAuth sets req.user to { id: 'test-user', email: 'test@example.com' }
 * in NODE_ENV=test, so we don't need to mint a real JWT here.
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.DEEPGRAM_API_KEY = 'test-deepgram-key';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'service-role-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
process.env.FRONTEND_URL = 'http://localhost:3001';

// ──────────────────────────────────────────
// Mocks — must register before requiring the route module
// ──────────────────────────────────────────

const mockSelectMaybeSingle = jest.fn();
const mockDelete = jest.fn();
const mockAuthDeleteUser = jest.fn();
const mockStripeCancel = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockSelectMaybeSingle })
      }),
      delete: () => ({ eq: mockDelete })
    }),
    auth: {
      admin: { deleteUser: mockAuthDeleteUser }
    }
  })
}));

jest.mock('stripe', () =>
  jest.fn(() => ({
    subscriptions: { cancel: mockStripeCancel }
  }))
);

// Mock the sessions service so we can assert terminateUserSessions is called
// with the right user id and observe its behaviour.
const mockTerminateUserSessions = jest.fn();
jest.mock('../src/services/sessions', () => ({
  sessions: new Map(),
  terminateUserSessions: mockTerminateUserSessions
}));

// ──────────────────────────────────────────
// Imports (after mocks)
// ──────────────────────────────────────────

const express = require('express');
const request = require('supertest');
const accountRouter = require('../src/routes/account');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/account', accountRouter);
  return app;
}

const app = buildApp();

beforeEach(() => {
  mockSelectMaybeSingle.mockReset();
  mockDelete.mockReset();
  mockAuthDeleteUser.mockReset();
  mockStripeCancel.mockReset();
  mockTerminateUserSessions.mockReset();
  // Sensible defaults — happy path everywhere
  mockSelectMaybeSingle.mockResolvedValue({ data: null });
  mockDelete.mockResolvedValue({ error: null });
  mockAuthDeleteUser.mockResolvedValue({ error: null });
  mockTerminateUserSessions.mockReturnValue([]);
});

// ──────────────────────────────────────────
// MED-03 — partial_errors no longer leaks
// ──────────────────────────────────────────

describe('DELETE /api/account — MED-03 error disclosure', () => {
  test('happy path response does NOT include partial_errors', async () => {
    const res = await request(app).delete('/api/account').send();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
    expect(res.body).not.toHaveProperty('partial_errors');
  });

  test('table-delete error is logged server-side but NOT returned to client', async () => {
    // First two delete calls succeed, third fails (profiles table)
    mockDelete
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'foreign key constraint xyz_fkey' } });

    const res = await request(app).delete('/api/account').send();

    // Cascading delete continues; auth-delete succeeds → 200, no leakage
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
    expect(res.body).not.toHaveProperty('partial_errors');
    expect(JSON.stringify(res.body)).not.toMatch(/foreign key constraint/);
  });

  test('auth-delete error returns 500 with a generic support reference, NO error details', async () => {
    mockAuthDeleteUser.mockResolvedValue({
      error: { message: 'duplicate key in auth.users.email_idx' }
    });

    const res = await request(app).delete('/api/account').send();

    expect(res.status).toBe(500);
    expect(res.body).not.toHaveProperty('partial_errors');
    // Generic message must not include the Postgres error text
    expect(res.body.error).toMatch(/contact support and reference id/);
    expect(JSON.stringify(res.body)).not.toMatch(/duplicate key/);
    expect(JSON.stringify(res.body)).not.toMatch(/email_idx/);
  });

  test('auth-delete exception returns 500 generic and does not include exception message', async () => {
    mockAuthDeleteUser.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.5:5432'));

    const res = await request(app).delete('/api/account').send();

    expect(res.status).toBe(500);
    expect(res.body).not.toHaveProperty('partial_errors');
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED/);
    expect(JSON.stringify(res.body)).not.toMatch(/10\.0\.0\.5/);
  });
});

// ──────────────────────────────────────────
// LOW-06 — WS termination on delete
// ──────────────────────────────────────────

describe('DELETE /api/account — LOW-06 WS session termination', () => {
  test('terminateUserSessions is called with req.user.id on successful delete', async () => {
    mockTerminateUserSessions.mockReturnValue(['session_a', 'session_b']);

    const res = await request(app).delete('/api/account').send();

    expect(res.status).toBe(200);
    expect(mockTerminateUserSessions).toHaveBeenCalledTimes(1);
    expect(mockTerminateUserSessions).toHaveBeenCalledWith('test-user');
  });

  test('terminateUserSessions is NOT called when auth-delete fails', async () => {
    mockAuthDeleteUser.mockResolvedValue({ error: { message: 'auth row failed' } });

    const res = await request(app).delete('/api/account').send();

    expect(res.status).toBe(500);
    expect(mockTerminateUserSessions).not.toHaveBeenCalled();
  });

  test('terminateUserSessions throwing does NOT fail the request (non-fatal)', async () => {
    mockTerminateUserSessions.mockImplementation(() => {
      throw new Error('ws teardown blew up');
    });

    const res = await request(app).delete('/api/account').send();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });
});

// ──────────────────────────────────────────
// Sessions service behaviour
// ──────────────────────────────────────────

describe('sessions service — terminateUserSessions', () => {
  // These tests use the actual implementation (not the jest.mock above) so
  // they live in their own file: nb. behaviour-level tests for the service
  // implementation live in ./sessions-service.test.js.
  test('module exports the expected surface', () => {
    const mod = jest.requireActual('../src/services/sessions');
    expect(typeof mod.terminateUserSessions).toBe('function');
    expect(mod.sessions).toBeInstanceOf(Map);
  });
});

/**
 * Tests for configuration module
 */

describe('Config Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh config load
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('loads with required OPENAI_API_KEY', () => {
    const config = require('../src/config');
    expect(config.OPENAI_API_KEY).toBe('test-api-key');
  });

  test('has correct default PORT values', () => {
    const config = require('../src/config');
    expect(config.PORT).toBe(8080);
    expect(config.HTTP_PORT).toBe(3000);
  });

  test('has correct default TTS_VOICE', () => {
    const config = require('../src/config');
    expect(config.TTS_VOICE).toBe('en-GB-Neural2-D');
  });

  test('has correct default FRONTEND_URL', () => {
    const config = require('../src/config');
    expect(config.FRONTEND_URL).toBe('http://localhost:5500');
  });

  test('isStripeEnabled returns false when STRIPE_SECRET_KEY is not set', () => {
    delete process.env.STRIPE_SECRET_KEY;
    const config = require('../src/config');
    expect(config.isStripeEnabled).toBe(false);
  });

  test('isStripeEnabled returns true when STRIPE_SECRET_KEY is set', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    jest.resetModules();
    const config = require('../src/config');
    expect(config.isStripeEnabled).toBe(true);
  });

  test('isSupabaseEnabled returns false when credentials are not set', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
    const config = require('../src/config');
    expect(config.isSupabaseEnabled).toBe(false);
  });

  test('isSupabaseEnabled returns true when both credentials are set', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
    jest.resetModules();
    const config = require('../src/config');
    expect(config.isSupabaseEnabled).toBe(true);
  });

  test('isProduction returns false for test environment', () => {
    const config = require('../src/config');
    expect(config.isProduction).toBe(false);
  });

  test('parses PORT as integer', () => {
    process.env.PORT = '9000';
    jest.resetModules();
    const config = require('../src/config');
    expect(config.PORT).toBe(9000);
    expect(typeof config.PORT).toBe('number');
  });
});

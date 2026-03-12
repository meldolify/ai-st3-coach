/**
 * Tests for configuration module
 */

describe('Config Module', () => {
  let savedEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    jest.resetModules();
    // Prevent dotenv from loading .env file into process.env
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    // Start with a minimal env so config defaults are exercised
    process.env = {
      PATH: savedEnv.PATH,
      SystemRoot: savedEnv.SystemRoot,
      NODE_ENV: 'test',
      GEMINI_API_KEY: 'test-gemini-key',
      OPENAI_API_KEY: 'test-api-key'
    };
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  test('loads defaults correctly (model, ports, TTS voice, frontend URL)', () => {
    const config = require('../src/config');
    expect(config.LLM_MODEL).toBe('gemini-2.5-flash');
    expect(config.PORT).toBe(8080);
    expect(config.HTTP_PORT).toBe(3000);
    expect(config.TTS_VOICE).toBe('Fenrir');
    expect(config.FRONTEND_URL).toBe('http://localhost:5500');
  });

  test('environment variable overrides work (PORT parsed as integer)', () => {
    process.env.PORT = '9000';
    jest.resetModules();
    const config = require('../src/config');
    expect(config.PORT).toBe(9000);
    expect(typeof config.PORT).toBe('number');
  });

  test('production vs development mode detection', () => {
    const config = require('../src/config');
    expect(config.isProduction).toBe(false);
  });

  test('isStripeEnabled detects STRIPE_SECRET_KEY presence', () => {
    delete process.env.STRIPE_SECRET_KEY;
    const configWithout = require('../src/config');
    expect(configWithout.isStripeEnabled).toBe(false);

    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    jest.resetModules();
    const configWith = require('../src/config');
    expect(configWith.isStripeEnabled).toBe(true);
  });

  test('isSupabaseEnabled detects both URL and key presence', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
    const configWithout = require('../src/config');
    expect(configWithout.isSupabaseEnabled).toBe(false);

    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
    jest.resetModules();
    const configWith = require('../src/config');
    expect(configWith.isSupabaseEnabled).toBe(true);
  });
});

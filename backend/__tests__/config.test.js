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

  test('loads with required API keys', () => {
    const config = require('../src/config');
    expect(config.GEMINI_API_KEY).toBe('test-gemini-key');
    expect(config.OPENAI_API_KEY).toBe('test-api-key');
  });

  test('has correct default LLM_MODEL', () => {
    const config = require('../src/config');
    expect(config.LLM_MODEL).toBe('gemini-2.5-flash');
  });

  test('has correct default PORT values', () => {
    const config = require('../src/config');
    expect(config.PORT).toBe(8080);
    expect(config.HTTP_PORT).toBe(3000);
  });

  test('has correct default TTS_VOICE', () => {
    const config = require('../src/config');
    expect(config.TTS_VOICE).toBe('Fenrir');
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

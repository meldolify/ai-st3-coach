/**
 * Server integration tests
 * Tests scenario loading, session management, and WebSocket message handling
 */

// Must set NODE_ENV before requiring config
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-key';

const { loadScenarioPrompt } = require('../src/utils/scenarioLoader');
const {
  validateMessage,
  sanitizeForLog,
  generateSecureSessionId
} = require('../src/middleware/websocketSecurity');

describe('loadScenarioPrompt', () => {
  test('loads an existing scenario file', () => {
    const prompt = loadScenarioPrompt(
      'prompts/clinical/emergencies/necrotising_fasciitis/easy_clinical_necrotising_fasciitis_1.txt'
    );
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('SECTION');
  });

  test('rejects path traversal attempts', () => {
    const prompt = loadScenarioPrompt('../../../etc/passwd');
    // Should return fallback template since path traversal is blocked
    expect(prompt).toContain('Plastic Surgery');
  });

  test('returns fallback for non-existent file', () => {
    const prompt = loadScenarioPrompt('prompts/does_not_exist.txt');
    expect(prompt).toContain('Plastic Surgery');
  });

  test('loads files from nested subdirectories', () => {
    const prompt = loadScenarioPrompt(
      'prompts/consent/hand_surgery/carpal_tunnel_release_consent/easy_consent_carpal_tunnel_release_consent_1.txt'
    );
    expect(prompt.length).toBeGreaterThan(50);
  });

  test('handles empty string scenario file', () => {
    const prompt = loadScenarioPrompt('');
    // Empty path resolves to the backend dir itself, which is a directory not a file
    expect(typeof prompt).toBe('string');
  });
});

describe('WebSocket message validation', () => {
  test('validates a well-formed user_transcript message', () => {
    const result = validateMessage({
      type: 'user_transcript',
      sessionId: 'session_abc123',
      text: 'Hello, I would like to discuss the case.'
    });
    expect(result.valid).toBe(true);
  });

  test('rejects message with missing type', () => {
    const result = validateMessage({ sessionId: 'abc', text: 'hello' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('type');
  });

  test('rejects message with unknown type', () => {
    const result = validateMessage({ type: 'invalid_type', sessionId: 'abc' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unknown');
  });

  test('rejects user_transcript without text field', () => {
    const result = validateMessage({ type: 'user_transcript', sessionId: 'abc' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('text');
  });

  test('rejects non-object messages', () => {
    expect(validateMessage(null).valid).toBe(false);
    expect(validateMessage('string').valid).toBe(false);
    expect(validateMessage(42).valid).toBe(false);
  });
});

describe('Session ID generation', () => {
  test('generates unique session IDs', () => {
    const id1 = generateSecureSessionId();
    const id2 = generateSecureSessionId();
    expect(id1).not.toBe(id2);
  });

  test('session ID has expected prefix', () => {
    const id = generateSecureSessionId();
    expect(id).toMatch(/^session_/);
  });
});

describe('sanitizeForLog', () => {
  test('truncates long text', () => {
    const longText = 'a'.repeat(500);
    const result = sanitizeForLog(longText);
    expect(result.length).toBeLessThan(500);
    expect(result).toContain('...');
  });

  test('removes control characters', () => {
    const result = sanitizeForLog('hello\x00world\x1F');
    expect(result).toBe('helloworld');
  });

  test('returns placeholder for non-string input', () => {
    expect(sanitizeForLog(123)).toBe('[non-string]');
    expect(sanitizeForLog(null)).toBe('[non-string]');
  });
});

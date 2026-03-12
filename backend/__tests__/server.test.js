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
    expect(prompt).toContain('Plastic Surgery');
  });

  test('returns fallback for non-existent file', () => {
    const prompt = loadScenarioPrompt('prompts/does_not_exist.txt');
    expect(prompt).toContain('Plastic Surgery');
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

  test('rejects invalid messages', () => {
    expect(validateMessage(null).valid).toBe(false);
    expect(validateMessage({ sessionId: 'abc', text: 'hello' }).valid).toBe(false);
    expect(validateMessage({ type: 'invalid_type', sessionId: 'abc' }).valid).toBe(false);
    expect(validateMessage({ type: 'user_transcript', sessionId: 'abc' }).valid).toBe(false);
  });
});

describe('Session ID generation', () => {
  test('generates unique session IDs with expected format', () => {
    const id1 = generateSecureSessionId();
    const id2 = generateSecureSessionId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^session_/);
  });
});

describe('sanitizeForLog', () => {
  test('removes control characters and truncates long text', () => {
    expect(sanitizeForLog('hello\x00world\x1F')).toBe('helloworld');

    const longText = 'a'.repeat(500);
    const result = sanitizeForLog(longText);
    expect(result.length).toBeLessThan(500);
    expect(result).toContain('...');
  });

  test('returns placeholder for non-string input', () => {
    expect(sanitizeForLog(123)).toBe('[non-string]');
    expect(sanitizeForLog(null)).toBe('[non-string]');
  });
});

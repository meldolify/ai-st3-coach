/**
 * Tests for WebSocket Security Middleware
 */

const {
  generateSecureSessionId,
  WebSocketRateLimiter,
  validateMessage,
  sanitizeForLog
} = require('../src/middleware/websocketSecurity');

describe('WebSocket Security Middleware', () => {
  describe('generateSecureSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSecureSessionId();
      const id2 = generateSecureSessionId();
      expect(id1).not.toBe(id2);
    });

    it('should start with "session_" prefix', () => {
      const id = generateSecureSessionId();
      expect(id).toMatch(/^session_/);
    });

    it('should contain a UUID', () => {
      const id = generateSecureSessionId();
      // UUID pattern: 8-4-4-4-12 hex characters
      expect(id).toMatch(/session_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/);
    });
  });

  describe('WebSocketRateLimiter', () => {
    let limiter;

    beforeEach(() => {
      limiter = new WebSocketRateLimiter({
        windowMs: 1000, // 1 second for testing
        maxMessages: 5,
        maxAudioPerMinute: 2
      });
    });

    it('should allow messages under the limit', () => {
      const result = limiter.checkLimit('session1', 'other');
      expect(result.allowed).toBe(true);
    });

    it('should block messages over the limit', () => {
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('session1', 'other');
      }
      const result = limiter.checkLimit('session1', 'other');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded');
    });

    it('should track audio messages separately', () => {
      // Use 2 audio slots
      limiter.checkLimit('session1', 'audio');
      limiter.checkLimit('session1', 'audio');

      // 3rd audio should be blocked
      const result = limiter.checkLimit('session1', 'audio');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Audio rate limit');
    });

    it('should allow other messages after audio limit reached', () => {
      limiter.checkLimit('session1', 'audio');
      limiter.checkLimit('session1', 'audio');
      limiter.checkLimit('session1', 'audio'); // This would fail

      const result = limiter.checkLimit('session1', 'other');
      expect(result.allowed).toBe(true);
    });

    it('should track sessions independently', () => {
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('session1', 'other');
      }

      const result1 = limiter.checkLimit('session1', 'other');
      const result2 = limiter.checkLimit('session2', 'other');

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });

    it('should remove client data', () => {
      limiter.checkLimit('session1', 'other');
      expect(limiter.clients.has('session1')).toBe(true);

      limiter.removeClient('session1');
      expect(limiter.clients.has('session1')).toBe(false);
    });
  });

  describe('validateMessage', () => {
    it('should accept valid user_transcript message', () => {
      const msg = {
        type: 'user_transcript',
        sessionId: 'session_123',
        text: 'Hello, this is a test'
      };
      const result = validateMessage(msg);
      expect(result.valid).toBe(true);
    });

    it('should accept valid whisper_audio message', () => {
      const msg = {
        type: 'whisper_audio',
        sessionId: 'session_123',
        audio: 'base64audiodata'
      };
      const result = validateMessage(msg);
      expect(result.valid).toBe(true);
    });

    it('should accept valid user_speaking message', () => {
      const msg = {
        type: 'user_speaking',
        sessionId: 'session_123'
      };
      const result = validateMessage(msg);
      expect(result.valid).toBe(true);
    });

    it('should accept valid ai_finished message', () => {
      const msg = {
        type: 'ai_finished',
        sessionId: 'session_123'
      };
      const result = validateMessage(msg);
      expect(result.valid).toBe(true);
    });

    it('should reject null message', () => {
      const result = validateMessage(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid message format');
    });

    it('should reject message without type', () => {
      const msg = { sessionId: 'session_123' };
      const result = validateMessage(msg);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing or invalid message type');
    });

    it('should reject unknown message type', () => {
      const msg = { type: 'unknown_type', sessionId: 'session_123' };
      const result = validateMessage(msg);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown message type');
    });

    it('should reject message missing required field', () => {
      const msg = { type: 'user_transcript', sessionId: 'session_123' }; // missing text
      const result = validateMessage(msg);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required field');
    });

    it('should reject text exceeding max length', () => {
      const msg = {
        type: 'user_transcript',
        sessionId: 'session_123',
        text: 'x'.repeat(10001) // Over 10000 limit
      };
      const result = validateMessage(msg);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });

    it('should reject audio exceeding max length', () => {
      const msg = {
        type: 'whisper_audio',
        sessionId: 'session_123',
        audio: 'x'.repeat(5 * 1024 * 1024 + 1) // Over 5MB limit
      };
      const result = validateMessage(msg);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });

    it('should reject non-string sessionId', () => {
      const msg = {
        type: 'user_transcript',
        sessionId: 12345,
        text: 'Hello'
      };
      const result = validateMessage(msg);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('sanitizeForLog', () => {
    it('should pass through normal text', () => {
      const result = sanitizeForLog('Hello, world!');
      expect(result).toBe('Hello, world!');
    });

    it('should remove control characters', () => {
      const result = sanitizeForLog('Hello\x00\x1FWorld');
      expect(result).toBe('HelloWorld');
    });

    it('should truncate long text', () => {
      const longText = 'x'.repeat(300);
      const result = sanitizeForLog(longText, 100);
      expect(result).toBe('x'.repeat(100) + '...');
    });

    it('should handle non-string input', () => {
      expect(sanitizeForLog(null)).toBe('[non-string]');
      expect(sanitizeForLog(123)).toBe('[non-string]');
      expect(sanitizeForLog({})).toBe('[non-string]');
    });

    it('should use default max length of 200', () => {
      const longText = 'x'.repeat(250);
      const result = sanitizeForLog(longText);
      expect(result).toBe('x'.repeat(200) + '...');
    });
  });
});

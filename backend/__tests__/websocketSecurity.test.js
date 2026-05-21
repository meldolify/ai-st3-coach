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
    it('generates unique session IDs with expected format', () => {
      const id1 = generateSecureSessionId();
      const id2 = generateSecureSessionId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^session_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/);
    });
  });

  describe('WebSocketRateLimiter', () => {
    let limiter;

    beforeEach(() => {
      limiter = new WebSocketRateLimiter({
        windowMs: 1000,
        maxMessages: 5,
        maxAudioPerMinute: 2
      });
    });

    it('allows messages under the limit and blocks after exceeding', () => {
      expect(limiter.checkLimit('session1', 'other').allowed).toBe(true);

      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('session1', 'other');
      }
      const blocked = limiter.checkLimit('session1', 'other');
      expect(blocked.allowed).toBe(false);
    });

    it('tracks audio messages separately from general messages', () => {
      limiter.checkLimit('session1', 'audio');
      limiter.checkLimit('session1', 'audio');

      // 3rd audio should be blocked
      const audioBlocked = limiter.checkLimit('session1', 'audio');
      expect(audioBlocked.allowed).toBe(false);

      // But other messages still allowed
      const otherAllowed = limiter.checkLimit('session1', 'other');
      expect(otherAllowed.allowed).toBe(true);
    });

    it('tracks sessions independently', () => {
      for (let i = 0; i < 5; i++) {
        limiter.checkLimit('session1', 'other');
      }

      expect(limiter.checkLimit('session1', 'other').allowed).toBe(false);
      expect(limiter.checkLimit('session2', 'other').allowed).toBe(true);
    });

    it('cleans up client data on removal', () => {
      limiter.checkLimit('session1', 'other');
      expect(limiter.clients.has('session1')).toBe(true);

      limiter.removeClient('session1');
      expect(limiter.clients.has('session1')).toBe(false);
    });
  });

  describe('validateMessage', () => {
    it('accepts valid message types', () => {
      expect(
        validateMessage({
          type: 'user_transcript',
          sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_lzz1pm6',
          text: 'Hello'
        }).valid
      ).toBe(true);
      expect(
        validateMessage({
          type: 'user_speaking',
          sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_lzz1pm6'
        }).valid
      ).toBe(true);
      expect(
        validateMessage({
          type: 'ai_finished',
          sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_lzz1pm6'
        }).valid
      ).toBe(true);
    });

    // Audit 2026-05-21 §LOW-04: whisper_audio schema was removed
    it('rejects the removed whisper_audio type as unknown', () => {
      const result = validateMessage({
        type: 'whisper_audio',
        sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_lzz1pm6',
        audio: 'x'
      });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Unknown message type/i);
    });

    // Audit 2026-05-21 §LOW-05: strict sessionId pattern is enforced
    it('rejects malformed sessionId (defence in depth)', () => {
      const bad = [
        'session_abc123',
        'session_',
        'session__lzz1pm6',
        'session_550e8400-e29b-41d4-a716-446655440000_', // missing timestamp
        'evil_550e8400-e29b-41d4-a716-446655440000_lzz1pm6', // wrong prefix
        'session_NOT-HEX!-e29b-41d4-a716-446655440000_lzz1pm6'
      ];
      for (const sid of bad) {
        const result = validateMessage({ type: 'user_speaking', sessionId: sid });
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/invalid format/i);
      }
    });

    it('rejects invalid message formats', () => {
      expect(validateMessage(null).valid).toBe(false);
      expect(validateMessage({ sessionId: 'abc' }).valid).toBe(false);
      expect(validateMessage({ type: 'unknown_type', sessionId: 'abc' }).valid).toBe(false);
    });

    it('rejects messages missing required fields', () => {
      const result = validateMessage({
        type: 'user_transcript',
        sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_lzz1pm6'
      });
      expect(result.valid).toBe(false);
    });

    it('enforces message size limits', () => {
      const textResult = validateMessage({
        type: 'user_transcript',
        sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_lzz1pm6',
        text: 'x'.repeat(10001)
      });
      expect(textResult.valid).toBe(false);

      // audio_chunk is the live STT path (Deepgram). 32 KB base64 cap.
      const audioResult = validateMessage({
        type: 'audio_chunk',
        sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_lzz1pm6',
        audio: 'x'.repeat(32 * 1024 + 1)
      });
      expect(audioResult.valid).toBe(false);
    });

    it('rejects non-string sessionId', () => {
      const result = validateMessage({ type: 'user_transcript', sessionId: 12345, text: 'Hello' });
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeForLog', () => {
    it('sanitizes text: removes control chars, truncates, handles non-strings', () => {
      expect(sanitizeForLog('Hello\x00\x1FWorld')).toBe('HelloWorld');
      expect(sanitizeForLog('x'.repeat(300), 100)).toBe('x'.repeat(100) + '...');
      expect(sanitizeForLog('x'.repeat(250))).toBe('x'.repeat(200) + '...');
      expect(sanitizeForLog(null)).toBe('[non-string]');
      expect(sanitizeForLog(123)).toBe('[non-string]');
    });
  });
});

/**
 * WebSocket Security Middleware
 * Provides rate limiting, message validation, and payload size limits
 */

const crypto = require('crypto');

// ============================================================================
// SECURE SESSION ID GENERATION
// ============================================================================

/**
 * Generate a cryptographically secure session ID
 * @returns {string} Secure session ID
 */
function generateSecureSessionId() {
  const randomPart = crypto.randomUUID();
  const timestamp = Date.now().toString(36);
  return `session_${randomPart}_${timestamp}`;
}

// ============================================================================
// RATE LIMITING FOR WEBSOCKET
// ============================================================================

class WebSocketRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute window
    this.maxMessages = options.maxMessages || 60; // 60 messages per window
    this.maxAudioPerMinute = options.maxAudioPerMinute || 10; // 10 audio uploads per minute
    this.clients = new Map();
  }

  /**
   * Check if a client has exceeded rate limits
   * @param {string} sessionId - The session ID
   * @param {string} messageType - Type of message ('audio' or 'other')
   * @returns {object} { allowed: boolean, reason?: string }
   */
  checkLimit(sessionId, messageType = 'other') {
    const now = Date.now();
    let client = this.clients.get(sessionId);

    // Initialize client tracking if new
    if (!client) {
      client = {
        messages: [],
        audioMessages: [],
        windowStart: now
      };
      this.clients.set(sessionId, client);
    }

    // Reset window if expired
    if (now - client.windowStart > this.windowMs) {
      client.messages = [];
      client.audioMessages = [];
      client.windowStart = now;
    }

    // Check general message limit
    if (client.messages.length >= this.maxMessages) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${this.maxMessages} messages per minute`
      };
    }

    // Check audio-specific limit
    if (messageType === 'audio' && client.audioMessages.length >= this.maxAudioPerMinute) {
      return {
        allowed: false,
        reason: `Audio rate limit exceeded: ${this.maxAudioPerMinute} uploads per minute`
      };
    }

    // Record this message
    client.messages.push(now);
    if (messageType === 'audio') {
      client.audioMessages.push(now);
    }

    return { allowed: true };
  }

  /**
   * Clean up a client when they disconnect
   * @param {string} sessionId - The session ID to remove
   */
  removeClient(sessionId) {
    this.clients.delete(sessionId);
  }

  /**
   * Periodic cleanup of stale entries
   */
  cleanup() {
    const now = Date.now();
    for (const [sessionId, client] of this.clients.entries()) {
      if (now - client.windowStart > this.windowMs * 2) {
        this.clients.delete(sessionId);
      }
    }
  }
}

// ============================================================================
// MESSAGE VALIDATION
// ============================================================================

const MESSAGE_SCHEMAS = {
  audio_chunk: {
    required: ['sessionId', 'audio'],
    sessionId: { type: 'string', maxLength: 100 },
    audio: { type: 'string', maxLength: 32 * 1024 } // ~16KB base64 per 250ms chunk at 16kHz mono
  },
  user_transcript: {
    required: ['sessionId', 'text'],
    sessionId: { type: 'string', maxLength: 100 },
    text: { type: 'string', maxLength: 10000 }
  },
  whisper_audio: {
    required: ['sessionId', 'audio'],
    sessionId: { type: 'string', maxLength: 100 },
    audio: { type: 'string', maxLength: 5 * 1024 * 1024 } // 5MB base64 limit (~3.75MB audio)
  },
  user_speaking: {
    required: ['sessionId'],
    sessionId: { type: 'string', maxLength: 100 }
  },
  ai_finished: {
    required: ['sessionId'],
    sessionId: { type: 'string', maxLength: 100 }
  },
  request_feedback: {
    required: ['sessionId'],
    sessionId: { type: 'string', maxLength: 100 }
  },
  end_interview: {
    required: ['sessionId'],
    sessionId: { type: 'string', maxLength: 100 }
  }
};

/**
 * Validate a WebSocket message against its schema
 * @param {object} message - The parsed message object
 * @returns {object} { valid: boolean, error?: string }
 */
function validateMessage(message) {
  // Check message has a type
  if (!message || typeof message !== 'object') {
    return { valid: false, error: 'Invalid message format' };
  }

  if (!message.type || typeof message.type !== 'string') {
    return { valid: false, error: 'Missing or invalid message type' };
  }

  // Get schema for this message type
  const schema = MESSAGE_SCHEMAS[message.type];
  if (!schema) {
    return { valid: false, error: `Unknown message type: ${message.type}` };
  }

  // Check required fields
  for (const field of schema.required) {
    if (message[field] === undefined || message[field] === null) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate field types and constraints
  for (const [field, constraints] of Object.entries(schema)) {
    if (field === 'required') {
      continue;
    }

    const value = message[field];
    if (value === undefined) {
      continue;
    }

    // Type check
    if (constraints.type === 'string' && typeof value !== 'string') {
      return { valid: false, error: `Field ${field} must be a string` };
    }

    // Length check
    if (
      constraints.maxLength &&
      typeof value === 'string' &&
      value.length > constraints.maxLength
    ) {
      return {
        valid: false,
        error: `Field ${field} exceeds maximum length (${value.length} > ${constraints.maxLength})`
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitize text for logging (remove potential injection)
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum length to log
 * @returns {string} Sanitized text
 */
function sanitizeForLog(text, maxLength = 200) {
  if (typeof text !== 'string') {
    return '[non-string]';
  }

  // Remove control characters first
  // eslint-disable-next-line no-control-regex
  const cleaned = text.replace(/[\x00-\x1F\x7F]/g, '');

  // Then truncate if needed
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength) + '...';
  }

  return cleaned;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateSecureSessionId,
  WebSocketRateLimiter,
  validateMessage,
  sanitizeForLog,
  MESSAGE_SCHEMAS
};

/**
 * WebSocket Integration Tests
 * Tests real WebSocket connections against the server.
 *
 * Strategy: Monkey-patch http.createServer BEFORE requiring server.js
 * to capture the HTTP server reference. Mock OpenAI, Google TTS,
 * and ServerVAD to avoid external dependencies.
 */

/* eslint-disable no-console */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.DEEPGRAM_API_KEY = 'test-deepgram-key';
// Ensure DEV_BYPASS_AUTH is set so we don't need Supabase
process.env.DEV_BYPASS_AUTH = 'true';

// ============================================================================
// MOCKS — must be declared before any require() of server.js
// ============================================================================

// Track all Flux instances created for test assertions
const fluxInstances = [];

// Mock FluxSTTService BEFORE it's imported by server.js.
// Uses a real constructor (this.xxx = ...) so `new MockFluxSTTService()`
// returns a populated instance.
jest.mock('../src/services/FluxSTTService', () => {
  function MockFluxSTTService() {
    this.initialize = jest.fn(() => Promise.resolve());
    this.processChunk = jest.fn();
    this.destroy = jest.fn();
    this.reset = jest.fn();
    this.onSpeechStart = null;
    this.onTranscript = null;
    this.onError = null;
    fluxInstances.push(this);
  }
  return { FluxSTTService: MockFluxSTTService };
});

// ============================================================================
// IMPORTS and SERVER CAPTURE
// ============================================================================

const WebSocket = require('ws');
const http = require('http');

let capturedServer = null;
let port = 0;
let openaiService;
let ttsService;
let geminiTTSService;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Connect to WebSocket and buffer ALL messages from the start.
 * This prevents the race condition where scenario_loaded arrives
 * before the test attaches a message listener.
 */
function connectWS(queryString = '', protocols = undefined) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(
      `ws://127.0.0.1:${port}${queryString ? '?' + queryString : ''}`,
      protocols
    );
    const timeout = setTimeout(() => reject(new Error('Connection timed out')), 5000);

    // Buffer messages from the very first moment
    ws._messageBuffer = [];
    ws._messageWaiters = [];
    ws.on('message', data => {
      const parsed = JSON.parse(data.toString());
      if (ws._messageWaiters.length > 0) {
        const waiter = ws._messageWaiters.shift();
        waiter(parsed);
      } else {
        ws._messageBuffer.push(parsed);
      }
    });

    ws.on('open', () => {
      clearTimeout(timeout);
      resolve(ws);
    });
    ws.on('error', err => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Wait for the next message. Consumes from buffer first, then waits.
 */
function waitForMessage(ws, timeoutMs = 5000) {
  if (ws._messageBuffer && ws._messageBuffer.length > 0) {
    return Promise.resolve(ws._messageBuffer.shift());
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for message')), timeoutMs);
    ws._messageWaiters.push(msg => {
      clearTimeout(timer);
      resolve(msg);
    });
  });
}

/**
 * Collect N messages. Consumes from buffer first, then waits for the rest.
 */
function collectMessages(ws, count, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const messages = [];
    const timer = setTimeout(
      () => reject(new Error(`Timed out after ${messages.length}/${count} messages`)),
      timeoutMs
    );

    function tryResolve() {
      // Drain buffer first
      while (ws._messageBuffer.length > 0 && messages.length < count) {
        messages.push(ws._messageBuffer.shift());
      }
      if (messages.length >= count) {
        clearTimeout(timer);
        resolve(messages);
        return;
      }
      // Wait for remaining messages
      ws._messageWaiters.push(msg => {
        messages.push(msg);
        if (messages.length >= count) {
          clearTimeout(timer);
          resolve(messages);
        } else {
          tryResolve();
        }
      });
    }

    tryResolve();
  });
}

/**
 * Set up streaming mock for OpenAI: yields tokens then completes.
 */
function mockStreamingResponse(tokens) {
  const chunks = tokens.map(t => ({
    choices: [{ delta: { content: t } }]
  }));
  chunks.push({ choices: [{ delta: {} }] });

  const asyncIterable = {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        next() {
          if (i < chunks.length) {
            return Promise.resolve({ value: chunks[i++], done: false });
          }
          return Promise.resolve({ done: true });
        }
      };
    }
  };

  openaiService.llmClient.chat.completions.create.mockResolvedValue(asyncIterable);
}

// ============================================================================
// SETUP / TEARDOWN
// ============================================================================

const FREE_SCENARIO = 'clinical/emergencies/necrotising_fasciitis';

beforeAll(async () => {
  // 1. Get service singletons and mock their clients
  openaiService = require('../src/services/OpenAIService');
  ttsService = require('../src/services/TTSService');
  geminiTTSService = require('../src/services/GeminiTTSService');

  openaiService.llmClient = {
    chat: { completions: { create: jest.fn() } }
  };

  ttsService.client = {
    synthesizeSpeech: jest.fn()
  };

  // Mock GeminiTTSService to prevent real Gemini API calls
  geminiTTSService.synthesize = jest.fn().mockResolvedValue(Buffer.from('fake-wav-audio'));
  geminiTTSService.synthesizeStream = jest.fn(async function* () {
    yield Buffer.from('fake-wav-audio');
  });

  // 2. Monkey-patch http.createServer to capture the server reference
  const origCreateServer = http.createServer;
  http.createServer = function (...args) {
    capturedServer = origCreateServer.apply(this, args);
    return capturedServer;
  };

  // 3. Require server.js (NODE_ENV=test prevents auto-listen)
  require('../server');

  // 4. Restore original createServer
  http.createServer = origCreateServer;

  if (!capturedServer) {
    throw new Error('Failed to capture http.Server from server.js');
  }

  // 5. Start listening on random port
  await new Promise((resolve, reject) => {
    capturedServer.listen(0, '127.0.0.1', () => {
      port = capturedServer.address().port;
      console.log(`[TEST] Server listening on port ${port}`);
      resolve();
    });
    capturedServer.on('error', reject);
  });
}, 15000);

afterAll(async () => {
  if (capturedServer) {
    await new Promise(resolve => capturedServer.close(resolve));
  }
});

beforeEach(() => {
  jest.clearAllMocks();

  // Re-set Gemini TTS mocks (resetMocks: true wipes them before each test)
  geminiTTSService.synthesize = jest.fn().mockResolvedValue(Buffer.from('fake-wav-audio'));
  geminiTTSService.synthesizeStream = jest.fn(async function* () {
    yield Buffer.from('fake-wav-audio');
  });

  // Default mocks
  mockStreamingResponse(['Hello. ']);
  ttsService.client.synthesizeSpeech.mockResolvedValue([
    {
      audioContent: Buffer.from('fake-mp3-audio')
    }
  ]);
});

// ============================================================================
// TESTS
// ============================================================================

describe('Server startup and shutdown', () => {
  test('server is listening on a port', () => {
    expect(port).toBeGreaterThan(0);
    expect(capturedServer.listening).toBe(true);
  });
});

describe('WebSocket connection lifecycle', () => {
  test('client connects and receives scenario_loaded message', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const msg = await waitForMessage(ws);
      expect(msg.type).toBe('scenario_loaded');
      expect(msg.sessionId).toMatch(/^session_/);
      expect(msg.scenario).toBe(FREE_SCENARIO);
    } finally {
      ws.close();
    }
  });

  test('connection with default scenario loads nec fasc fallback', async () => {
    const ws = await connectWS();
    try {
      const msg = await waitForMessage(ws);
      expect(msg.type).toBe('scenario_loaded');
      expect(msg.scenario).toBe('clinical/emergencies/necrotising_fasciitis');
    } finally {
      ws.close();
    }
  });

  test('multiple concurrent connections get unique session IDs', async () => {
    const ws1 = await connectWS(`scenario=${FREE_SCENARIO}`);
    const ws2 = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const msg1 = await waitForMessage(ws1);
      const msg2 = await waitForMessage(ws2);
      expect(msg1.type).toBe('scenario_loaded');
      expect(msg2.type).toBe('scenario_loaded');
      expect(msg1.sessionId).not.toBe(msg2.sessionId);
    } finally {
      ws1.close();
      ws2.close();
    }
  });

  test('disconnect cleans up without errors', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    const msg = await waitForMessage(ws);
    expect(msg.type).toBe('scenario_loaded');

    await new Promise(resolve => {
      ws.on('close', resolve);
      ws.close();
    });
  });

  // The Supabase JWT is carried on Sec-WebSocket-Protocol rather than the URL
  // (see AUTH_SUBPROTOCOL in server.js). These tests exercise the parsing
  // branches in extractAuthToken — DEV_BYPASS_AUTH is on, so the token isn't
  // verified, but the connection-handler code path is.
  describe('auth subprotocol parsing', () => {
    // Three URL-safe-base64 segments separated by dots — enough to satisfy
    // extractAuthToken's shape regex. Auth is bypassed in test mode so the
    // value is never validated by Supabase.
    const FAKE_JWT = 'header-segment.payload-segment.signature-segment';

    test('connection succeeds when token is offered via sub-protocol', async () => {
      const ws = await connectWS(`scenario=${FREE_SCENARIO}`, ['st3.auth.bearer', FAKE_JWT]);
      try {
        const msg = await waitForMessage(ws);
        expect(msg.type).toBe('scenario_loaded');
        // Server must echo the sentinel sub-protocol back to satisfy the
        // WS handshake; the JWT itself must NOT be echoed.
        expect(ws.protocol).toBe('st3.auth.bearer');
      } finally {
        ws.close();
      }
    });

    test('malformed JWT in sub-protocol is rejected by the extractor (no token)', async () => {
      // Token doesn't match the three-segment base64url pattern → extractor
      // returns null. With DEV_BYPASS_AUTH on, the connection still
      // succeeds; in production this would short-circuit at the auth check.
      const ws = await connectWS(`scenario=${FREE_SCENARIO}`, [
        'st3.auth.bearer',
        'not-a-real-jwt'
      ]);
      try {
        const msg = await waitForMessage(ws);
        expect(msg.type).toBe('scenario_loaded');
      } finally {
        ws.close();
      }
    });

    test('connection still works with no sub-protocol at all', async () => {
      // Tests the early-return branch in extractAuthToken (header missing).
      const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
      try {
        const msg = await waitForMessage(ws);
        expect(msg.type).toBe('scenario_loaded');
        expect(ws.protocol).toBe('');
      } finally {
        ws.close();
      }
    });
  });
});

describe('Message flow - user_transcript', () => {
  test('sending user_transcript triggers streaming AI response', async () => {
    mockStreamingResponse(['Good morning. ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('fake-audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      const sessionId = initMsg.sessionId;

      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'I think this patient has necrotising fasciitis.'
        })
      );

      // Expect: ai_response_start, ai_response_chunk, ai_response_end
      const messages = await collectMessages(ws, 3, 10000);
      expect(messages[0].type).toBe('ai_response_start');
      expect(messages[1].type).toBe('ai_response_chunk');
      expect(messages[1].text).toBe('Good morning. ');
      expect(messages[1].audio).toBeDefined();
      expect(messages[1].chunkIndex).toBe(0);
      expect(messages[2].type).toBe('ai_response_end');
      expect(messages[2].fullText).toBe('Good morning. ');
    } finally {
      ws.close();
    }
  });

  test('response contains base64 audio from TTS', async () => {
    // Gemini TTS is the primary path; mock returns 'fake-wav-audio'
    const expectedAudio = Buffer.from('fake-wav-audio').toString('base64');
    mockStreamingResponse(['Hello there. ']);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId,
          text: 'Hello'
        })
      );

      const messages = await collectMessages(ws, 3);
      const chunk = messages.find(m => m.type === 'ai_response_chunk');
      expect(chunk.audio).toBe(expectedAudio);
    } finally {
      ws.close();
    }
  });

  test('conversation history accumulates across turns', async () => {
    mockStreamingResponse(['First response. ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      const sessionId = initMsg.sessionId;

      // Turn 1
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'First message'
        })
      );
      await collectMessages(ws, 3);

      // Setup for turn 2
      mockStreamingResponse(['Second response. ']);

      // Turn 2
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'Second message'
        })
      );
      await collectMessages(ws, 3);

      // GPT was called twice (once per user_transcript)
      const calls = openaiService.llmClient.chat.completions.create.mock.calls;
      expect(calls.length).toBe(2);

      // Both calls reference the same session.history array, which now contains
      // the full conversation. Verify the final accumulated state:
      // system + user1 + assistant1 + user2 + assistant2
      const history = calls[0][0].messages;
      expect(history[0].role).toBe('system');
      const userMsgs = history.filter(m => m.role === 'user');
      const assistantMsgs = history.filter(m => m.role === 'assistant');
      expect(userMsgs.length).toBe(2);
      expect(assistantMsgs.length).toBe(2);
      expect(userMsgs[0].content).toBe('First message');
      expect(userMsgs[1].content).toBe('Second message');
      expect(assistantMsgs[0].content).toContain('First response');
      expect(assistantMsgs[1].content).toContain('Second response');
    } finally {
      ws.close();
    }
  });

  test('multi-sentence response produces a single chunk for the full turn', async () => {
    // One TTS call per turn: full text is synthesized as a single audio buffer.
    mockStreamingResponse(['Hello there my friend. ', 'How are you doing today? ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId,
          text: 'Test'
        })
      );

      // ai_response_start + 1 chunk + ai_response_end
      const messages = await collectMessages(ws, 3);
      expect(messages[0].type).toBe('ai_response_start');
      expect(messages[1].type).toBe('ai_response_chunk');
      expect(messages[1].chunkIndex).toBe(0);
      expect(messages[1].text).toBe('Hello there my friend. How are you doing today? ');
      expect(messages[2].type).toBe('ai_response_end');
      expect(messages[2].fullText).toBe('Hello there my friend. How are you doing today? ');
    } finally {
      ws.close();
    }
  });
});

describe('Message flow - audio_chunk', () => {
  test('sending audio_chunk forwards PCM to Flux', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      const samples = new Int16Array(1365);
      const base64Audio = Buffer.from(samples.buffer).toString('base64');

      ws.send(
        JSON.stringify({
          type: 'audio_chunk',
          sessionId: initMsg.sessionId,
          audio: base64Audio
        })
      );

      await new Promise(resolve => setTimeout(resolve, 300));

      const lastInstance = fluxInstances[fluxInstances.length - 1];
      expect(lastInstance.processChunk).toHaveBeenCalled();
    } finally {
      ws.close();
    }
  });

  test('audio_chunk continues to be forwarded while AI is speaking (enables barge-in)', async () => {
    mockStreamingResponse(['Hello. ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([{ audioContent: Buffer.from('audio') }]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      const sessionId = initMsg.sessionId;

      // Make AI speak
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'Hello'
        })
      );
      await collectMessages(ws, 3);

      // AI is now speaking. Mic stays open so Flux can detect StartOfTurn.
      const lastInstance = fluxInstances[fluxInstances.length - 1];
      lastInstance.processChunk.mockClear();

      const samples = new Int16Array(1365);
      ws.send(
        JSON.stringify({
          type: 'audio_chunk',
          sessionId,
          audio: Buffer.from(samples.buffer).toString('base64')
        })
      );

      await new Promise(resolve => setTimeout(resolve, 300));
      expect(lastInstance.processChunk).toHaveBeenCalled();
    } finally {
      ws.close();
    }
  });
});

describe('Message flow - user_speaking (interrupts)', () => {
  test('user_speaking during AI speech sends interrupt', async () => {
    mockStreamingResponse(['Hello. ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      const sessionId = initMsg.sessionId;

      // Trigger AI response
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'Hello'
        })
      );

      // Wait for ai_response_start (AI is now speaking)
      const startMsg = await waitForMessage(ws);
      expect(startMsg.type).toBe('ai_response_start');

      // Send interrupt
      ws.send(
        JSON.stringify({
          type: 'user_speaking',
          sessionId
        })
      );

      // Collect remaining messages - should include an interrupt
      const messages = [];
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 3000);
        const handler = data => {
          messages.push(JSON.parse(data.toString()));
          if (messages.some(m => m.type === 'interrupt')) {
            clearTimeout(timer);
            ws.removeListener('message', handler);
            resolve();
          }
        };
        ws.on('message', handler);
      });

      expect(messages.some(m => m.type === 'interrupt')).toBe(true);
    } finally {
      ws.close();
    }
  });

  test('user_speaking when AI is not speaking does not send interrupt', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'user_speaking',
          sessionId: initMsg.sessionId
        })
      );

      const gotMessage = await Promise.race([
        waitForMessage(ws).then(m => m),
        new Promise(resolve => setTimeout(() => resolve(null), 1000))
      ]);

      // Either no message was received (null) or the message is not an interrupt
      expect(gotMessage === null || gotMessage.type !== 'interrupt').toBe(true);
    } finally {
      ws.close();
    }
  });
});

describe('Message flow - ai_finished', () => {
  test('ai_finished resets AI speaking state', async () => {
    mockStreamingResponse(['Hello. ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      const sessionId = initMsg.sessionId;

      // Make AI speak
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'Hello'
        })
      );
      await collectMessages(ws, 3);

      // Tell server playback finished
      ws.send(
        JSON.stringify({
          type: 'ai_finished',
          sessionId
        })
      );
      await new Promise(resolve => setTimeout(resolve, 200));

      // Now user_speaking should NOT produce interrupt
      ws.send(
        JSON.stringify({
          type: 'user_speaking',
          sessionId
        })
      );

      const gotInterrupt = await Promise.race([
        waitForMessage(ws).then(m => m.type === 'interrupt'),
        new Promise(resolve => setTimeout(() => resolve(false), 1000))
      ]);
      expect(gotInterrupt).toBe(false);
    } finally {
      ws.close();
    }
  });
});

describe('Error handling', () => {
  test('malformed JSON message returns error without crashing', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      expect(initMsg.type).toBe('scenario_loaded');

      ws.send('this is not json{{{');

      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('Invalid JSON');

      // Server should still be alive
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(ws.readyState).toBe(WebSocket.OPEN);
    } finally {
      ws.close();
    }
  });

  test('unknown message type returns error', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'nonexistent_type',
          sessionId: initMsg.sessionId
        })
      );

      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('Unknown');
    } finally {
      ws.close();
    }
  });

  test('missing required fields returns error', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId
          // missing 'text' field
        })
      );

      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('text');
    } finally {
      ws.close();
    }
  });

  test('invalid session ID returns session not found', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      await waitForMessage(ws); // consume scenario_loaded

      ws.send(
        JSON.stringify({
          type: 'user_speaking',
          sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_dne1234'
        })
      );

      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('Session not found');
    } finally {
      ws.close();
    }
  });

  test('cross-connection session hijack is rejected (CWE-639)', async () => {
    // Two authenticated WS connections. Connection B sends a message claiming
    // A's sessionId — must be refused with the same generic "Session not
    // found" error used for unknown ids (so the error message doesn't leak
    // whether the id was valid-but-not-owned).
    const wsA = await connectWS(`scenario=${FREE_SCENARIO}`);
    const wsB = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initA = await waitForMessage(wsA);
      await waitForMessage(wsB); // consume B's scenario_loaded

      // Sanity: A got a valid session id we can target from B
      expect(initA.sessionId).toMatch(/^session_/);

      wsB.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initA.sessionId, // A's id, not B's
          text: 'hijack attempt'
        })
      );

      const errorMsg = await waitForMessage(wsB);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('Session not found');

      // A must NOT receive any ai_response_* triggered by B's injected turn.
      // Give the server a beat to (mis)process, then confirm A's buffer is
      // empty.
      await new Promise(r => setTimeout(r, 200));
      const leaked = wsA._messageBuffer || [];
      expect(leaked).toHaveLength(0);
    } finally {
      wsA.close();
      wsB.close();
    }
  });

  test('GPT streaming error returns error message', async () => {
    openaiService.llmClient.chat.completions.create.mockRejectedValue(
      new Error('OpenAI API rate limited')
    );

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId,
          text: 'Hello'
        })
      );

      // Should get ai_response_start then error
      const messages = await collectMessages(ws, 2, 5000);
      expect(messages[0].type).toBe('ai_response_start');
      expect(messages[1].type).toBe('error');
      expect(messages[1].message).toContain('Streaming response failed');
    } finally {
      ws.close();
    }
  });

  test('message with missing type returns error', async () => {
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          sessionId: initMsg.sessionId,
          text: 'hello'
        })
      );

      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('type');
    } finally {
      ws.close();
    }
  });
});

describe('Session management', () => {
  test('voice query parameter is used for Cloud TTS fallback', async () => {
    const customVoice = 'en-GB-Neural2-B';
    mockStreamingResponse(['Test. ']);

    // Force Gemini TTS streaming to fail so the live path falls back to Cloud TTS
    geminiTTSService.synthesizeStream = jest.fn(async function* () {
      throw new Error('Gemini TTS unavailable');
      // eslint-disable-next-line no-unreachable
      yield;
    });
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}&voice=${customVoice}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId,
          text: 'Test'
        })
      );
      await collectMessages(ws, 3);

      expect(ttsService.client.synthesizeSpeech).toHaveBeenCalled();
      const ttsCall = ttsService.client.synthesizeSpeech.mock.calls[0][0];
      expect(ttsCall.voice.name).toBe(customVoice);
    } finally {
      ws.close();
    }
  });

  test('scenario prompt is loaded into conversation history', async () => {
    mockStreamingResponse(['Response. ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);

      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId,
          text: 'Hello examiner'
        })
      );
      await collectMessages(ws, 3);

      const call = openaiService.llmClient.chat.completions.create.mock.calls[0][0];
      expect(call.messages[0].role).toBe('system');
      expect(call.messages[0].content.length).toBeGreaterThan(50);
      expect(call.messages[1].role).toBe('user');
      expect(call.messages[1].content).toBe('Hello examiner');
    } finally {
      ws.close();
    }
  });
});

describe('Request feedback flow', () => {
  test('request_feedback triggers feedback response with sections', async () => {
    // First: streaming for the interview turn
    mockStreamingResponse(['Hello candidate. ']);
    ttsService.client.synthesizeSpeech.mockResolvedValue([
      {
        audioContent: Buffer.from('audio')
      }
    ]);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      const sessionId = initMsg.sessionId;

      // Have a conversation turn
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'I believe this is necrotising fasciitis'
        })
      );
      await collectMessages(ws, 3);

      // Mock feedback LLM call (streaming) with section delimiters
      mockStreamingResponse([
        '===SECTION_1===\n',
        'Overall good performance.\n',
        '===SECTION_2===\n',
        'Strong clinical knowledge.\n',
        '===SECTION_3===\n',
        'Good practical examples.\n',
        '===SECTION_4===\n',
        'Excellent systematic approach.\n',
        '===SECTION_5===\n',
        'Could improve differentials.\n',
        '===SECTION_6===\n',
        'That concludes feedback.\n',
        '===JSON_SUMMARY===\n',
        '{"score":4,"overallImpression":"Good","strengths":["Systematic"],"improvements":["Differentials"],"summary":"Good overall."}'
      ]);

      // Request feedback
      ws.send(
        JSON.stringify({
          type: 'request_feedback',
          sessionId
        })
      );

      // Streaming flow: feedback_processing → feedback_summary → 6 feedback_response messages
      const processingMsg = await waitForMessage(ws, 10000);
      expect(processingMsg.type).toBe('feedback_processing');

      const summaryMsg = await waitForMessage(ws, 10000);
      expect(summaryMsg.type).toBe('feedback_summary');
      expect(summaryMsg.feedback.score).toBe(4);

      // All 6 feedback_response messages (TTS runs in parallel, dispatched in order)
      for (let i = 0; i < 6; i++) {
        const fbMsg = await waitForMessage(ws, 10000);
        expect(fbMsg.type).toBe('feedback_response');
        expect(fbMsg.section).toBe(i + 1);
        expect(fbMsg.totalSections).toBe(6);
        expect(fbMsg.audio).toBeDefined();
      }
    } finally {
      ws.close();
    }
  }, 30000);
});

describe('Health check endpoint', () => {
  test('GET /health returns ok status', async () => {
    const response = await new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${port}/health`, res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });
      req.on('error', reject);
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});

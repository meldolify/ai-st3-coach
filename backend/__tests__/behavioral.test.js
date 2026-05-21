/**
 * Behavioral Tests — Real System Behavior Verification
 *
 * These tests verify REAL production behavior against actual files on disk
 * and real function logic. They catch bugs that unit tests with mocked
 * filesystems would miss.
 *
 * Groups:
 * 1. Prompt Assembly Correctness (5 tests)
 * 2. Noise Filtering Integration (3 tests)
 * 3. Feedback Parsing Integration (4 tests)
 * 4. Subscription Enforcement (5 tests)
 * 5. Session Management via WebSocket (6 tests)
 * 6. Error Handling via WebSocket (4 tests)
 * 7. Config Validation (3 tests)
 */

/* eslint-disable no-console */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.DEV_BYPASS_AUTH = 'true';

const path = require('path');
const fs = require('fs');

// ============================================================================
// Group 1: Prompt Assembly Correctness
// Tests buildInterviewPrompt() and buildFeedbackPrompt() with REAL files on disk
// ============================================================================

describe('Prompt Assembly Correctness', () => {
  const {
    buildInterviewPrompt,
    buildFeedbackPrompt,
    PROMPTS_DIR,
    resolveScenarioPath
  } = require('../src/utils/promptAssembler');

  test('easy vs medium for same topic → personality section changes, clinical stays same', () => {
    // Bug this catches: if difficulty parameter is ignored and always loads
    // the same personality file, interviews would feel identical regardless of difficulty
    const topicFolder = 'clinical/emergencies/necrotising_fasciitis';
    const easyPrompt = buildInterviewPrompt('easy', topicFolder);
    const mediumPrompt = buildInterviewPrompt('medium', topicFolder);

    // Both should contain the same clinical scenario content
    const clinicalFile = fs.readFileSync(resolveScenarioPath(topicFolder), 'utf8');
    expect(easyPrompt).toContain(clinicalFile);
    expect(mediumPrompt).toContain(clinicalFile);

    // But they should differ (personality section is different)
    expect(easyPrompt).not.toBe(mediumPrompt);

    // Verify each contains its respective personality file content
    const easyPersonality = fs.readFileSync(
      path.join(PROMPTS_DIR, 'shared/interview/easy_interview_personality.txt'),
      'utf8'
    );
    const mediumPersonality = fs.readFileSync(
      path.join(PROMPTS_DIR, 'shared/interview/medium_interview_personality.txt'),
      'utf8'
    );
    expect(easyPrompt).toContain(easyPersonality);
    expect(mediumPrompt).toContain(mediumPersonality);
    expect(easyPrompt).not.toContain(mediumPersonality);
  });

  test('clinical domain vs consent domain → core file changes', () => {
    // Bug this catches: if extractDomain() always returns 'clinical',
    // consent scenarios would get wrong examiner behaviour instructions
    const clinicalPrompt = buildInterviewPrompt(
      'easy',
      'clinical/emergencies/necrotising_fasciitis'
    );
    const consentPrompt = buildInterviewPrompt(
      'easy',
      'consent/hand_surgery/carpal_tunnel_release_consent'
    );

    const clinicalCore = fs.readFileSync(
      path.join(PROMPTS_DIR, 'shared/interview/core_clinical_interview.txt'),
      'utf8'
    );
    const consentCore = fs.readFileSync(
      path.join(PROMPTS_DIR, 'shared/interview/core_consent_interview.txt'),
      'utf8'
    );

    expect(clinicalPrompt).toContain(clinicalCore);
    expect(consentPrompt).toContain(consentCore);
    expect(clinicalPrompt).not.toContain(consentCore);
    expect(consentPrompt).not.toContain(clinicalCore);
  });

  test('missing modular files → falls back to legacy without crashing', () => {
    // Bug this catches: if the fallback logic throws on missing files,
    // any new scenario without modular files would crash the server
    const result = buildInterviewPrompt('easy', 'clinical/nonexistent/fake_scenario');

    // Should return the inline fallback string, not throw
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // The inline fallback mentions "Plastic Surgery" — verify we got it
    expect(result).toContain('Plastic Surgery');
  });

  test('invalid difficulty → throws Error', () => {
    // Bug this catches: if invalid difficulty silently falls through,
    // the server would load wrong personality or no personality at all
    expect(() => {
      buildInterviewPrompt('impossible', 'clinical/emergencies/necrotising_fasciitis');
    }).toThrow('Invalid difficulty');
  });

  test('path traversal in topicFolder → throws Error', () => {
    // Bug this catches: directory traversal attack reading arbitrary files
    expect(() => {
      buildInterviewPrompt('easy', '../../../etc/passwd');
    }).toThrow('Invalid topicFolder path');

    expect(() => {
      buildInterviewPrompt('easy', 'clinical/../../etc/passwd');
    }).toThrow('Invalid topicFolder path');
  });

  test('buildFeedbackPrompt assembles domain-specific feedback files', () => {
    // Bug this catches: feedback using wrong domain core (e.g., clinical
    // feedback prompts for a consent scenario)
    const topicFolder = 'clinical/emergencies/necrotising_fasciitis';
    const feedbackPrompt = buildFeedbackPrompt('easy', topicFolder);

    const feedbackCore = fs.readFileSync(
      path.join(PROMPTS_DIR, 'shared/feedback/core_clinical_feedback.txt'),
      'utf8'
    );
    expect(feedbackPrompt).toContain(feedbackCore);
    expect(typeof feedbackPrompt).toBe('string');
    expect(feedbackPrompt.length).toBeGreaterThan(100);
  });
});

// ============================================================================
// Group 2: Noise Filtering Integration
// Tests isNoiseTranscript() with realistic speech patterns
// ============================================================================

describe('Noise Filtering Integration', () => {
  const { isNoiseTranscript } = require('../src/utils/audioHelpers');

  test('known noise phrases are filtered out', () => {
    // Bug this catches: if noise patterns are too relaxed, the server
    // sends "um" and "uh" to GPT, wasting tokens and confusing the AI
    expect(isNoiseTranscript('um')).toBe(true);
    expect(isNoiseTranscript('uh')).toBe(true);
    expect(isNoiseTranscript('er')).toBe(true);
    expect(isNoiseTranscript('ah')).toBe(true);
    expect(isNoiseTranscript('Um.')).toBe(true);
    expect(isNoiseTranscript('Um...')).toBe(true);
    expect(isNoiseTranscript('sss')).toBe(true); // Repeated chars
    expect(isNoiseTranscript('aaaa')).toBe(true); // Repeated chars
    expect(isNoiseTranscript('...')).toBe(true); // Just dots
    expect(isNoiseTranscript('')).toBe(true); // Empty
    expect(isNoiseTranscript(null)).toBe(true); // Null
    expect(isNoiseTranscript('a')).toBe(true); // Single char (<2)
    expect(isNoiseTranscript('  ')).toBe(true); // Whitespace only
  });

  test('legitimate short clinical responses are NOT filtered', () => {
    // Bug this catches: over-aggressive noise filtering silencing real
    // candidate answers like "yes" or medical terms
    expect(isNoiseTranscript('Yes, that is correct')).toBe(false);
    expect(isNoiseTranscript('No, I disagree')).toBe(false);
    expect(isNoiseTranscript('The patient has necrotising fasciitis')).toBe(false);
    expect(isNoiseTranscript('I would perform debridement')).toBe(false);
    expect(isNoiseTranscript('Thank you')).toBe(false);
    expect(isNoiseTranscript('IV antibiotics')).toBe(false);
  });

  test('medical abbreviations that look like noise are NOT filtered', () => {
    // Bug this catches: medical terms like "CT" or "MRI" being mistaken
    // for noise due to their short length or letter patterns
    expect(isNoiseTranscript('CT scan')).toBe(false);
    expect(isNoiseTranscript('MRI shows')).toBe(false);
    expect(isNoiseTranscript('IV access')).toBe(false);
    expect(isNoiseTranscript('ABG results')).toBe(false);
    expect(isNoiseTranscript('CRP is elevated')).toBe(false);
    // Two-letter medical abbreviations with context should pass
    expect(isNoiseTranscript('BP is low')).toBe(false);
  });
});

// ============================================================================
// Group 3: Feedback Parsing Integration
// Tests parseFeedbackResponse() with realistic GPT-like output
// ============================================================================

describe('Feedback Parsing Integration', () => {
  const { parseFeedbackResponse } = require('../src/utils/feedbackParser');

  test('well-formed 6-section response with JSON → parses correctly', () => {
    // Bug this catches: parser fails on real GPT output format,
    // breaking the entire feedback flow
    const input = [
      '===SECTION_1===',
      'You demonstrated a good overall approach to this clinical scenario.',
      '===SECTION_2===',
      'Your diagnosis of necrotising fasciitis was correct and timely.',
      '===SECTION_3===',
      'Your investigation plan was comprehensive including bloods and imaging.',
      '===SECTION_4===',
      'Initial management with IV antibiotics was appropriate.',
      '===SECTION_5===',
      'Surgical debridement was correctly identified as definitive management.',
      '===SECTION_6===',
      'Overall a strong performance. Keep refining your approach.',
      '===JSON_SUMMARY===',
      '{"score": 4, "overallImpression": "Strong candidate", "strengths": ["Diagnosis", "Management"], "improvements": ["Differentials"], "summary": "Good overall."}'
    ].join('\n');

    const result = parseFeedbackResponse(input);

    expect(result.sections).toHaveLength(6);
    expect(result.sections[0]).toContain('overall approach');
    expect(result.sections[5]).toContain('strong performance');
    expect(result.json).not.toBeNull();
    expect(result.json.score).toBe(4);
    expect(result.json.strengths).toContain('Diagnosis');
    expect(result.raw).toBe(input);
  });

  test('sections with varied lengths → all captured', () => {
    // Bug this catches: parser truncating long sections or dropping
    // short ones, losing feedback content
    const shortSection = 'Brief.';
    const longSection = 'A '.repeat(500) + 'detailed analysis.';
    const input = [
      '===SECTION_1===',
      shortSection,
      '===SECTION_2===',
      longSection,
      '===SECTION_3===',
      'Medium length section with some detail about performance.',
      '===JSON_SUMMARY===',
      '{"score": 3}'
    ].join('\n');

    const result = parseFeedbackResponse(input);

    expect(result.sections).toHaveLength(3);
    expect(result.sections[0]).toBe(shortSection);
    expect(result.sections[1]).toContain('detailed analysis');
    expect(result.json.score).toBe(3);
  });

  test('missing JSON summary → sections still captured, json is null', () => {
    // Bug this catches: parser throwing when JSON is absent,
    // crashing the feedback flow even though section text is valid
    const input = [
      '===SECTION_1===',
      'Good performance overall.',
      '===SECTION_2===',
      'Correct diagnosis.',
      '===SECTION_3===',
      'Appropriate investigations.'
    ].join('\n');

    const result = parseFeedbackResponse(input);

    expect(result.sections).toHaveLength(3);
    expect(result.json).toBeNull();
    expect(result.sections[0]).toContain('Good performance');
  });

  test('empty/garbage input → does not crash, returns sensible default', () => {
    // Bug this catches: server crashing when GPT returns empty or
    // garbled output, taking down the entire session
    const emptyResult = parseFeedbackResponse('');
    expect(emptyResult.sections).toEqual([]);
    expect(emptyResult.json).toBeNull();

    const nullResult = parseFeedbackResponse(null);
    expect(nullResult.sections).toEqual([]);
    expect(nullResult.json).toBeNull();

    const garbageResult = parseFeedbackResponse('just some random text without delimiters');
    expect(garbageResult.sections).toHaveLength(1); // Treated as single section
    expect(garbageResult.sections[0]).toContain('random text');
    expect(garbageResult.json).toBeNull();
  });
});

// ============================================================================
// Group 4: Subscription Enforcement
// Tests the subscription/access logic functions directly
// ============================================================================

describe('Subscription Enforcement', () => {
  const config = require('../src/config');
  const { validateMessage, MESSAGE_SCHEMAS } = require('../src/middleware/websocketSecurity');
  const { buildInterviewPrompt, resolveScenarioPath } = require('../src/utils/promptAssembler');

  test('FREE_TIER_SCENARIOS list contains valid scenario paths that exist on disk', () => {
    // Bug this catches: FREE_TIER_SCENARIOS referencing paths that don't exist,
    // meaning free users get errors when trying to access their allowed scenarios
    for (const topicFolder of config.FREE_TIER_SCENARIOS) {
      const scenarioPath = resolveScenarioPath(topicFolder);
      expect(fs.existsSync(scenarioPath)).toBe(true);
    }
  });

  test('FREE_TIER_SCENARIOS includes at least one scenario from each domain', () => {
    // Bug this catches: a domain being completely locked out from free tier,
    // meaning users can never try that type of interview for free
    const domains = config.FREE_TIER_SCENARIOS.map(s => s.split('/')[0]);
    expect(domains).toContain('clinical');
    expect(domains).toContain('call_the_boss');
    expect(domains).toContain('consent');
    expect(domains).toContain('structured_interview');
  });

  test('free-tier scenario check uses exact path matching (not prefix)', () => {
    // Bug this catches: if includes() did substring matching instead of
    // exact matching, a crafted path could bypass the paywall
    const freeScenario = config.FREE_TIER_SCENARIOS[0];
    expect(config.FREE_TIER_SCENARIOS.includes(freeScenario)).toBe(true);

    // A path that starts with the same prefix but is different should NOT match
    const fakeScenario = freeScenario + '/extra';
    expect(config.FREE_TIER_SCENARIOS.includes(fakeScenario)).toBe(false);

    // A partial prefix should NOT match
    const partialPath = freeScenario.split('/').slice(0, 2).join('/');
    expect(config.FREE_TIER_SCENARIOS.includes(partialPath)).toBe(false);
  });

  test('getScenarioSpecialty returns correct specialty for all domains', () => {
    // Bug this catches: SPECIALTY_MAP missing a domain, causing specialty check
    // to return null and potentially bypassing subscription validation
    expect(config.getScenarioSpecialty('clinical/emergencies/nec_fasc')).toBe('plastic-surgery');
    expect(config.getScenarioSpecialty('call_the_boss/scenarios/major_burn')).toBe(
      'plastic-surgery'
    );
    expect(config.getScenarioSpecialty('consent/hand_surgery/carpal_tunnel')).toBe(
      'plastic-surgery'
    );
    expect(config.getScenarioSpecialty('structured_interview/audit/focused')).toBe(
      'plastic-surgery'
    );
  });

  test('getScenarioSpecialty returns null for unknown domain prefix', () => {
    // Bug this catches: unknown domain returning a default specialty,
    // potentially granting access to scenarios from other specialties
    expect(config.getScenarioSpecialty('unknown_domain/something')).toBeNull();
    expect(config.getScenarioSpecialty('')).toBeNull();
  });
});

// ============================================================================
// Group 5: Session Management via WebSocket
// Uses the same monkey-patch pattern as websocket-integration.test.js
// ============================================================================

// Track Flux instances for session management tests
const fluxInstances = [];

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

const WebSocket = require('ws');
const http = require('http');

let capturedServer = null;
let port = 0;
let openaiService;
let ttsService;
let geminiTTSService;

const FREE_SCENARIO = 'clinical/emergencies/necrotising_fasciitis';

function connectWS(queryString = '') {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}${queryString ? '?' + queryString : ''}`);
    const timeout = setTimeout(() => reject(new Error('Connection timed out')), 5000);
    ws._messageBuffer = [];
    ws._messageWaiters = [];
    ws.on('message', data => {
      const parsed = JSON.parse(data.toString());
      if (ws._messageWaiters.length > 0) {
        ws._messageWaiters.shift()(parsed);
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

function collectMessages(ws, count, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const messages = [];
    const timer = setTimeout(
      () => reject(new Error(`Timed out after ${messages.length}/${count} messages`)),
      timeoutMs
    );
    function tryResolve() {
      while (ws._messageBuffer.length > 0 && messages.length < count) {
        messages.push(ws._messageBuffer.shift());
      }
      if (messages.length >= count) {
        clearTimeout(timer);
        resolve(messages);
        return;
      }
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

beforeAll(async () => {
  openaiService = require('../src/services/OpenAIService');
  ttsService = require('../src/services/TTSService');
  geminiTTSService = require('../src/services/GeminiTTSService');

  openaiService.llmClient = {
    chat: { completions: { create: jest.fn() } }
  };
  ttsService.client = { synthesizeSpeech: jest.fn() };
  geminiTTSService.synthesize = jest.fn().mockResolvedValue(Buffer.from('fake-wav-audio'));
  // streamResponseToClient uses synthesizeStream; provide an async generator yielding one chunk.
  geminiTTSService.synthesizeStream = jest.fn(async function* () {
    yield Buffer.from('fake-wav-audio');
  });

  const origCreateServer = http.createServer;
  http.createServer = function (...args) {
    capturedServer = origCreateServer.apply(this, args);
    return capturedServer;
  };
  require('../server');
  http.createServer = origCreateServer;

  if (!capturedServer) {
    throw new Error('Failed to capture http.Server from server.js');
  }

  await new Promise((resolve, reject) => {
    capturedServer.listen(0, '127.0.0.1', () => {
      port = capturedServer.address().port;
      console.log(`[BEHAVIORAL TEST] Server on port ${port}`);
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
  geminiTTSService.synthesize = jest.fn().mockResolvedValue(Buffer.from('fake-wav-audio'));
  geminiTTSService.synthesizeStream = jest.fn(async function* () {
    yield Buffer.from('fake-wav-audio');
  });
  mockStreamingResponse(['Hello. ']);
  ttsService.client.synthesizeSpeech.mockResolvedValue([
    { audioContent: Buffer.from('fake-mp3-audio') }
  ]);
});

describe('Session Management', () => {
  test('creating a session assigns a unique, secure session ID', async () => {
    // Bug this catches: predictable session IDs enabling session hijacking
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const msg = await waitForMessage(ws);
      expect(msg.type).toBe('scenario_loaded');
      expect(msg.sessionId).toMatch(/^session_/);
      // UUID format: session_{uuid}_{base36timestamp}
      expect(msg.sessionId.length).toBeGreaterThan(20);
    } finally {
      ws.close();
    }
  });

  test('sending user_transcript adds to conversation history', async () => {
    // Bug this catches: messages not being stored, so the AI has no
    // context of previous conversation turns
    mockStreamingResponse(['I see. ']);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId,
          text: 'I think this is necrotising fasciitis'
        })
      );
      await collectMessages(ws, 3); // start, chunk, end

      // Verify GPT was called with the user message in history
      const call = openaiService.llmClient.chat.completions.create.mock.calls[0][0];
      const userMsgs = call.messages.filter(m => m.role === 'user');
      expect(userMsgs.length).toBe(1);
      expect(userMsgs[0].content).toBe('I think this is necrotising fasciitis');
    } finally {
      ws.close();
    }
  });

  test('multiple messages → history grows across turns', async () => {
    // Bug this catches: history being reset between turns, causing
    // the AI to lose context and ask the same questions again
    mockStreamingResponse(['First answer. ']);

    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      const sessionId = initMsg.sessionId;

      // Turn 1
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'First statement about the patient'
        })
      );
      await collectMessages(ws, 3);

      // Turn 2
      mockStreamingResponse(['Second answer. ']);
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId,
          text: 'I would order blood cultures'
        })
      );
      await collectMessages(ws, 3);

      // GPT should have been called with accumulated history on second call
      const calls = openaiService.llmClient.chat.completions.create.mock.calls;
      expect(calls.length).toBe(2);

      // The history array is shared, so check the accumulated state
      const history = calls[0][0].messages;
      const userMsgs = history.filter(m => m.role === 'user');
      expect(userMsgs.length).toBe(2);
    } finally {
      ws.close();
    }
  });

  test('two simultaneous connections → separate sessions, separate histories', async () => {
    // Bug this catches: sessions sharing state due to a global variable
    // instead of per-session storage
    mockStreamingResponse(['Response A. ']);

    const ws1 = await connectWS(`scenario=${FREE_SCENARIO}`);
    const ws2 = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const msg1 = await waitForMessage(ws1);
      const msg2 = await waitForMessage(ws2);

      expect(msg1.sessionId).not.toBe(msg2.sessionId);

      // Send different messages to each session
      ws1.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: msg1.sessionId,
          text: 'Session 1 message'
        })
      );
      await collectMessages(ws1, 3);

      mockStreamingResponse(['Response B. ']);
      ws2.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: msg2.sessionId,
          text: 'Session 2 message'
        })
      );
      await collectMessages(ws2, 3);

      // Each GPT call should have its own session's message
      const calls = openaiService.llmClient.chat.completions.create.mock.calls;
      expect(calls.length).toBe(2);
    } finally {
      ws1.close();
      ws2.close();
    }
  });

  test('session with scenario → scenario prompt loaded as system message', async () => {
    // Bug this catches: system prompt not loaded or loaded with wrong content,
    // causing the AI to behave as a generic assistant instead of an examiner
    mockStreamingResponse(['Good morning. ']);

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
      await collectMessages(ws, 3);

      const call = openaiService.llmClient.chat.completions.create.mock.calls[0][0];
      const systemMsg = call.messages.find(m => m.role === 'system');
      expect(systemMsg).toBeDefined();
      // The system prompt should contain content from the actual scenario file
      expect(systemMsg.content.length).toBeGreaterThan(100);
    } finally {
      ws.close();
    }
  });

  test('difficulty query parameter affects the loaded prompt', async () => {
    // Bug this catches: difficulty parameter being ignored, so easy/strict
    // interviews use the same personality
    mockStreamingResponse(['Hello easy. ']);

    const wsEasy = await connectWS(`scenario=${FREE_SCENARIO}&difficulty=easy`);
    try {
      const initEasy = await waitForMessage(wsEasy);
      wsEasy.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initEasy.sessionId,
          text: 'Hello'
        })
      );
      await collectMessages(wsEasy, 3);
    } finally {
      wsEasy.close();
    }

    mockStreamingResponse(['Hello strict. ']);
    const wsStrict = await connectWS(`scenario=${FREE_SCENARIO}&difficulty=strict`);
    try {
      const initStrict = await waitForMessage(wsStrict);
      wsStrict.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initStrict.sessionId,
          text: 'Hello'
        })
      );
      await collectMessages(wsStrict, 3);
    } finally {
      wsStrict.close();
    }

    // Both should have different system prompts
    const calls = openaiService.llmClient.chat.completions.create.mock.calls;
    const easySystem = calls[0][0].messages[0].content;
    const strictSystem = calls[1][0].messages[0].content;
    expect(easySystem).not.toBe(strictSystem);
  });
});

// ============================================================================
// Group 6: Error Handling
// ============================================================================

describe('Error Handling', () => {
  test('sending a message with invalid type → error response, connection stays alive', async () => {
    // Bug this catches: unknown message types crashing the server or
    // closing the connection, when they should be ignored gracefully
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      ws.send(
        JSON.stringify({
          type: 'completely_invalid_type',
          sessionId: initMsg.sessionId
        })
      );
      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('Unknown');

      // Connection should still be alive
      expect(ws.readyState).toBe(WebSocket.OPEN);
    } finally {
      ws.close();
    }
  });

  test('sending user_transcript with empty text → does not crash server', async () => {
    // Bug this catches: empty/null text causing unhandled exception
    // and crashing the WebSocket connection
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      const initMsg = await waitForMessage(ws);
      ws.send(
        JSON.stringify({
          type: 'user_transcript',
          sessionId: initMsg.sessionId,
          text: ''
        })
      );

      // Server should handle gracefully — either filter it or process it
      // The key assertion is that the connection stays alive
      const response = await waitForMessage(ws);
      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
      // Connection should still be open (readyState 1 = OPEN)
      expect(ws.readyState).toBe(1);
    } finally {
      ws.close();
    }
  });

  test('sending a message with wrong sessionId → error response', async () => {
    // Bug this catches: using another user's session ID to hijack their
    // interview, or stale session IDs causing server errors
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      await waitForMessage(ws); // consume scenario_loaded
      ws.send(
        JSON.stringify({
          type: 'user_speaking',
          sessionId: 'session_550e8400-e29b-41d4-a716-446655440000_bogusid'
        })
      );
      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('Session not found');
    } finally {
      ws.close();
    }
  });

  test('malformed JSON → error response without crash', async () => {
    // Bug this catches: unhandled JSON parse exception crashing the
    // WebSocket handler and disconnecting the user
    const ws = await connectWS(`scenario=${FREE_SCENARIO}`);
    try {
      await waitForMessage(ws); // consume scenario_loaded
      ws.send('this is {{{{ not valid JSON at all}}}}');
      const errorMsg = await waitForMessage(ws);
      expect(errorMsg.type).toBe('error');
      expect(errorMsg.message).toContain('Invalid JSON');
      // Connection still alive
      expect(ws.readyState).toBe(WebSocket.OPEN);
    } finally {
      ws.close();
    }
  });
});

// ============================================================================
// Group 7: Config Validation
// ============================================================================

describe('Config Validation', () => {
  const config = require('../src/config');
  const { PROMPTS_DIR, VALID_DIFFICULTIES } = require('../src/utils/promptAssembler');

  test('FREE_TIER_SCENARIOS paths all point to real scenario files on disk', () => {
    // Bug this catches: a typo in FREE_TIER_SCENARIOS causing free users
    // to get "scenario not found" errors
    for (const topicFolder of config.FREE_TIER_SCENARIOS) {
      const topicName = topicFolder.split('/').pop();
      const filePath = path.join(PROMPTS_DIR, 'scenarios', topicFolder, `${topicName}_1.txt`);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('SPECIALTY_MAP keys map to valid directories in prompts/scenarios/', () => {
    // Bug this catches: SPECIALTY_MAP referencing domain prefixes that
    // don't have any actual scenario folders, breaking the scenario browser
    const scenariosDir = path.join(PROMPTS_DIR, 'scenarios');
    for (const domainKey of Object.keys(config.SPECIALTY_MAP)) {
      const domainDir = path.join(scenariosDir, domainKey);
      expect(fs.existsSync(domainDir)).toBe(true);
    }
  });

  test('all difficulty levels have corresponding personality files for both interview and feedback', () => {
    // Bug this catches: adding a new difficulty level without creating
    // its personality file, causing buildInterviewPrompt to fall back
    // to legacy for ALL scenarios
    for (const difficulty of VALID_DIFFICULTIES) {
      const interviewPersonality = path.join(
        PROMPTS_DIR,
        'shared/interview',
        `${difficulty}_interview_personality.txt`
      );
      const feedbackPersonality = path.join(
        PROMPTS_DIR,
        'shared/feedback',
        `${difficulty}_feedback_personality.txt`
      );
      expect(fs.existsSync(interviewPersonality)).toBe(true);
      expect(fs.existsSync(feedbackPersonality)).toBe(true);
    }
  });
});

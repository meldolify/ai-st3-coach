/**
 * Prompt Lab Routes Tests
 * Tests REST API endpoints for the text-only prompt testing environment.
 * Uses supertest to test Express routes with mocked service layer.
 */

const express = require('express');
const request = require('supertest');
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-key';

const promptLabService = require('../src/services/PromptLabService');
const openaiService = require('../src/services/OpenAIService');

// Build a minimal Express app with prompt lab routes mounted
function createApp() {
  const app = express();
  app.use(express.json());
  const promptLabRoutes = require('../src/routes/promptLab');
  app.use('/prompt-lab/api', promptLabRoutes);
  return app;
}

const app = createApp();

// ──────────────────────────────────────────
// TOPICS ENDPOINT
// ──────────────────────────────────────────

describe('GET /prompt-lab/api/topics', () => {
  test('returns topics including necrotising_fasciitis', async () => {
    const res = await request(app).get('/prompt-lab/api/topics');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.topics)).toBe(true);
    const necFasc = res.body.topics.find(
      t => t.path === 'clinical/emergencies/necrotising_fasciitis'
    );
    expect(necFasc).toBeDefined();
    expect(necFasc.label).toBe('Necrotising Fasciitis');
  });
});

// ──────────────────────────────────────────
// SESSION + CHAT FLOW
// ──────────────────────────────────────────

describe('Session and chat flow', () => {
  test('creates session, chats, and increments turn number', async () => {
    // Create session
    const sessionRes = await request(app)
      .post('/prompt-lab/api/session')
      .send({
        promptSections: { core: 'Examiner.', difficulty: 'Easy.', clinical: 'Case.' },
        metadata: { difficulty: 'easy' }
      });
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.sessionId).toMatch(/^pl_/);
    const sessionId = sessionRes.body.sessionId;

    // Chat twice
    const spy = jest.spyOn(openaiService, 'generateResponse');
    spy.mockResolvedValueOnce('Reply 1');
    spy.mockResolvedValueOnce('Reply 2');

    const r1 = await request(app)
      .post('/prompt-lab/api/chat')
      .send({ sessionId, message: 'First' });
    expect(r1.status).toBe(200);
    expect(r1.body.response).toBe('Reply 1');
    expect(r1.body.turnNumber).toBe(1);

    const r2 = await request(app)
      .post('/prompt-lab/api/chat')
      .send({ sessionId, message: 'Second' });
    expect(r2.body.turnNumber).toBe(2);

    promptLabService.deleteSession(sessionId);
  });

  test('returns 400 when session creation missing promptSections', async () => {
    const res = await request(app).post('/prompt-lab/api/session').send({});
    expect(res.status).toBe(400);
  });

  test('returns 404 for chat with invalid session', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/chat')
      .send({ sessionId: 'pl_nonexistent', message: 'hello' });
    expect(res.status).toBe(404);
  });
});

// ──────────────────────────────────────────
// FEEDBACK ENDPOINT
// ──────────────────────────────────────────

describe('POST /prompt-lab/api/feedback', () => {
  test('generates feedback with sections and summary', async () => {
    const sessionRes = await request(app)
      .post('/prompt-lab/api/session')
      .send({
        promptSections: { core: 'Examiner.', difficulty: 'Easy.', clinical: 'Case.' },
        metadata: { difficulty: 'easy' }
      });
    const sessionId = sessionRes.body.sessionId;
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'I would do ABCDE.' },
      { role: 'assistant', content: 'What next?' }
    );

    jest
      .spyOn(openaiService, 'generateResponse')
      .mockResolvedValueOnce(
        '===SECTION_1===\nSection 1.\n===SECTION_2===\nSection 2.\n===SECTION_3===\nSection 3.\n===SECTION_4===\nSection 4.\n===SECTION_5===\nSection 5.\n===SECTION_6===\nSection 6.\n===JSON_SUMMARY===\n{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
      );

    const res = await request(app).post('/prompt-lab/api/feedback').send({ sessionId });
    expect(res.status).toBe(200);
    expect(res.body.sections).toHaveLength(6);
    expect(res.body.summary.score).toBe(3);

    promptLabService.deleteSession(sessionId);
  });

  test('returns 404 for non-existent session', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/feedback')
      .send({ sessionId: 'pl_nonexistent_session' });
    expect(res.status).toBe(404);
  });
});

// ──────────────────────────────────────────
// PROMPT ENDPOINTS
// ──────────────────────────────────────────

describe('Prompt endpoints', () => {
  test('GET loads prompts for valid topic and difficulty', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(200);
    expect(res.body.sections.core.length).toBeGreaterThan(0);
    expect(res.body.sections.difficulty.length).toBeGreaterThan(0);
    expect(res.body.sections.clinical.length).toBeGreaterThan(0);
  });

  test('GET returns 400 for invalid difficulty', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/invalid')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(400);
  });

  test('GET loads different content per difficulty', async () => {
    const easy = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    const medium = await request(app)
      .get('/prompt-lab/api/prompts/medium')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(easy.body.sections.difficulty).not.toBe(medium.body.sections.difficulty);
  });
});

// ──────────────────────────────────────────
// TEST EXECUTION
// ──────────────────────────────────────────

describe('POST /prompt-lab/api/run-test', () => {
  const BACKEND_DIR = path.join(__dirname, '..');
  const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
  const TEMP_TOPIC = '__test_routes__';
  const TEMP_DIR = path.join(TEST_SCRIPTS_DIR, TEMP_TOPIC);
  const TOPIC_PATH = `test/routes/${TEMP_TOPIC}`;

  beforeEach(() => {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    fs.writeFileSync(
      path.join(TEMP_DIR, 'route_test.json'),
      JSON.stringify({
        name: 'Route Test',
        description: 'test',
        difficulty: 'easy',
        inputs: ['hello'],
        assertions: [{ turn: 1, type: 'contains', value: 'reply', desc: 'test' }]
      })
    );
  });

  afterEach(() => {
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      for (const f of files) {
        fs.unlinkSync(path.join(TEMP_DIR, f));
      }
      fs.rmdirSync(TEMP_DIR);
    }
  });

  test('executes test and returns assertion results', async () => {
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('This is a reply.');

    const res = await request(app)
      .post('/prompt-lab/api/run-test')
      .send({
        testId: 'route_test',
        topic: TOPIC_PATH,
        promptSections: { core: 'test', difficulty: 'test', clinical: 'test' }
      });
    expect(res.status).toBe(200);
    expect(res.body.assertions.passed).toBe(1);
    expect(res.body.type).toBe('automated');
  });

  test('returns 404 for non-existent test script', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/run-test')
      .send({ testId: 'nonexistent_test_xyz' });
    expect(res.status).toBe(404);
  });
});

// Transcript CRUD tested via PromptLabService directly in prompt-lab-service.test.js.
// Route-level transcript test removed — flaky due to parallel Jest workers sharing test-results/ dir.

// ──────────────────────────────────────────
// SECURITY
// ──────────────────────────────────────────

describe('Path traversal security', () => {
  test('path traversal with .. in topic is rejected', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: '../../../etc/passwd' });
    expect(res.status).toBe(500);
  });

  test('absolute path starting with / is rejected', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: '/clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(500);
  });
});

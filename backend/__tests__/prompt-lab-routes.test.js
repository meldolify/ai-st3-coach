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
  test('returns array of topics', async () => {
    const res = await request(app).get('/prompt-lab/api/topics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('topics');
    expect(Array.isArray(res.body.topics)).toBe(true);
    expect(res.body.topics.length).toBeGreaterThan(0);
  });

  test('each topic has path, label, group properties', async () => {
    const res = await request(app).get('/prompt-lab/api/topics');
    const topic = res.body.topics[0];
    expect(topic).toHaveProperty('path');
    expect(topic).toHaveProperty('label');
    expect(topic).toHaveProperty('group');
  });

  test('includes necrotising_fasciitis topic', async () => {
    const res = await request(app).get('/prompt-lab/api/topics');
    const necFasc = res.body.topics.find(
      t => t.path === 'clinical/emergencies/necrotising_fasciitis'
    );
    expect(necFasc).toBeDefined();
    expect(necFasc.label).toBe('Necrotising Fasciitis');
  });

  test('returns 500 when service throws', async () => {
    const spy = jest.spyOn(promptLabService, 'listTopics').mockImplementation(() => {
      throw new Error('Filesystem error');
    });
    const res = await request(app).get('/prompt-lab/api/topics');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Filesystem error');
    spy.mockRestore();
  });
});

// ──────────────────────────────────────────
// SESSION ENDPOINTS
// ──────────────────────────────────────────

describe('POST /prompt-lab/api/session', () => {
  test('creates session with pl_ prefix ID', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/session')
      .send({
        promptSections: { core: 'Test core.', difficulty: 'Easy.', clinical: 'Case.' },
        metadata: { difficulty: 'easy' }
      });
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toMatch(/^pl_/);

    // Cleanup
    promptLabService.deleteSession(res.body.sessionId);
  });

  test('returns 400 when promptSections missing', async () => {
    const res = await request(app).post('/prompt-lab/api/session').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('promptSections required');
  });

  test('returns 400 when promptSections has no content', async () => {
    const res = await request(app).post('/prompt-lab/api/session').send({ promptSections: {} });
    expect(res.status).toBe(400);
  });

  test('accepts session with only core section', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/session')
      .send({ promptSections: { core: 'Just the core.' } });
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toMatch(/^pl_/);
    promptLabService.deleteSession(res.body.sessionId);
  });
});

describe('POST /prompt-lab/api/chat', () => {
  let sessionId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/prompt-lab/api/session')
      .send({
        promptSections: { core: 'Examiner.', difficulty: 'Easy.', clinical: 'Case.' },
        metadata: { difficulty: 'easy' }
      });
    sessionId = res.body.sessionId;
  });

  afterEach(() => {
    promptLabService.deleteSession(sessionId);
  });

  test('returns response for valid session', async () => {
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Hello candidate.');

    const res = await request(app)
      .post('/prompt-lab/api/chat')
      .send({ sessionId, message: 'Good morning.' });
    expect(res.status).toBe(200);
    expect(res.body.response).toBe('Hello candidate.');
    expect(res.body.turnNumber).toBe(1);
  });

  test('returns 404 for invalid session', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/chat')
      .send({ sessionId: 'pl_nonexistent', message: 'hello' });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  test('returns 400 when sessionId missing', async () => {
    const res = await request(app).post('/prompt-lab/api/chat').send({ message: 'hello' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  test('returns 400 when message missing', async () => {
    const res = await request(app).post('/prompt-lab/api/chat').send({ sessionId });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  test('returns 400 when both fields missing', async () => {
    const res = await request(app).post('/prompt-lab/api/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  test('increments turnNumber across multiple chats', async () => {
    const spy = jest.spyOn(openaiService, 'generateResponse');
    spy.mockResolvedValueOnce('Reply 1');
    spy.mockResolvedValueOnce('Reply 2');

    const r1 = await request(app)
      .post('/prompt-lab/api/chat')
      .send({ sessionId, message: 'First' });
    expect(r1.body.turnNumber).toBe(1);

    const r2 = await request(app)
      .post('/prompt-lab/api/chat')
      .send({ sessionId, message: 'Second' });
    expect(r2.body.turnNumber).toBe(2);
  });
});

describe('POST /prompt-lab/api/feedback', () => {
  let sessionId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/prompt-lab/api/session')
      .send({
        promptSections: { core: 'Examiner.', difficulty: 'Easy.', clinical: 'Case.' },
        metadata: { difficulty: 'easy' }
      });
    sessionId = res.body.sessionId;

    // Add some conversation history
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'I would do ABCDE.' },
      { role: 'assistant', content: 'What next?' }
    );
  });

  afterEach(() => {
    promptLabService.deleteSession(sessionId);
  });

  test('triggers feedback generation and returns sections + summary', async () => {
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce(
      '===SECTION_1===\nSection 1.\n===SECTION_2===\nSection 2.\n===SECTION_3===\nSection 3.\n===SECTION_4===\nSection 4.\n===SECTION_5===\nSection 5.\n===SECTION_6===\nSection 6.\n===JSON_SUMMARY===\n{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );

    const res = await request(app).post('/prompt-lab/api/feedback').send({ sessionId });
    expect(res.status).toBe(200);
    expect(res.body.sections).toHaveLength(6);
    expect(res.body.summary.score).toBe(3);
  });

  test('accepts custom feedbackPrompt override', async () => {
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce(
      '===SECTION_1===\nSection 1.\n===SECTION_2===\nSection 2.\n===SECTION_3===\nSection 3.\n===SECTION_4===\nSection 4.\n===SECTION_5===\nSection 5.\n===SECTION_6===\nSection 6.\n===JSON_SUMMARY===\n{"score":4,"overallImpression":"Good","clinicalKnowledge":{"diagnosis":"Good","management":"Good"},"strengths":["Clear"],"improvements":["Speed"],"summary":"Good"}'
    );

    const res = await request(app)
      .post('/prompt-lab/api/feedback')
      .send({ sessionId, feedbackPrompt: 'Custom feedback instructions here' });
    expect(res.status).toBe(200);
    expect(res.body.summary.score).toBe(4);
  });

  test('returns 400 when sessionId missing', async () => {
    const res = await request(app).post('/prompt-lab/api/feedback').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('sessionId required');
  });

  test('returns 404 for non-existent session', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/feedback')
      .send({ sessionId: 'pl_nonexistent_session' });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });
});

// ──────────────────────────────────────────
// SAVE MANUAL ENDPOINT
// ──────────────────────────────────────────

describe('POST /prompt-lab/api/save-manual', () => {
  const BACKEND_DIR = path.join(__dirname, '..');
  const TEST_RESULTS_DIR = path.join(BACKEND_DIR, 'test-results');
  const createdIds = [];

  afterEach(() => {
    for (const id of createdIds) {
      try {
        const filePath = path.join(TEST_RESULTS_DIR, `${id}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        /* ignore */
      }
    }
    createdIds.length = 0;
  });

  test('saves session and returns transcriptId', async () => {
    const sessionRes = await request(app)
      .post('/prompt-lab/api/session')
      .send({
        promptSections: { core: 'test', difficulty: 'test', clinical: 'test' },
        metadata: { difficulty: 'easy' }
      });
    const sessionId = sessionRes.body.sessionId;
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'test message' },
      { role: 'assistant', content: 'test reply' }
    );

    const res = await request(app).post('/prompt-lab/api/save-manual').send({ sessionId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transcriptId');
    expect(res.body.transcriptId).toContain('manual');
    createdIds.push(res.body.transcriptId);
    promptLabService.deleteSession(sessionId);
  });

  test('returns 400 when sessionId missing', async () => {
    const res = await request(app).post('/prompt-lab/api/save-manual').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('sessionId required');
  });
});

// ──────────────────────────────────────────
// PROMPT ENDPOINTS
// ──────────────────────────────────────────

describe('GET /prompt-lab/api/prompts/:difficulty', () => {
  test('returns prompt sections for valid topic and difficulty', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sections');
    expect(res.body).toHaveProperty('paths');
    expect(res.body).toHaveProperty('source');
    expect(res.body.sections).toHaveProperty('core');
    expect(res.body.sections).toHaveProperty('difficulty');
    expect(res.body.sections).toHaveProperty('clinical');
  });

  test('returns 400 for invalid difficulty', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/invalid')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('difficulty must be');
  });

  test('uses default topic when not specified', async () => {
    const res = await request(app).get('/prompt-lab/api/prompts/easy');
    expect(res.status).toBe(200);
    const pathStr = JSON.stringify(res.body.paths);
    expect(pathStr).toContain('necrotising_fasciitis');
  });

  test('returns 404 for non-existent topic', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/fake_topic' });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  test('loads different content for each difficulty level', async () => {
    const easy = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    const medium = await request(app)
      .get('/prompt-lab/api/prompts/medium')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(easy.body.sections.difficulty).not.toBe(medium.body.sections.difficulty);
  });

  test('returns 400 for difficulty "hard" (not in allowed list)', async () => {
    const res = await request(app).get('/prompt-lab/api/prompts/hard');
    expect(res.status).toBe(400);
  });
});

describe('PUT /prompt-lab/api/prompts/:difficulty', () => {
  // Save and restore original content to avoid modifying real files
  let originalSections;

  beforeAll(() => {
    const loaded = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    originalSections = loaded.sections;
  });

  afterEach(() => {
    // Restore original
    promptLabService.savePrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy',
      originalSections
    );
    promptLabService.clearModifiedFiles();
  });

  test('saves prompt sections', async () => {
    const res = await request(app)
      .put('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' })
      .send({ sections: originalSections });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('paths');
    expect(res.body).toHaveProperty('savedAt');
  });

  test('returns 400 when sections missing', async () => {
    const res = await request(app)
      .put('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' })
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('sections object required');
  });

  test('returns 400 for invalid difficulty', async () => {
    const res = await request(app)
      .put('/prompt-lab/api/prompts/impossible')
      .send({ sections: { core: 'x', difficulty: 'x', clinical: 'x' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('difficulty must be');
  });
});

describe('GET /prompt-lab/api/feedback-prompt/:difficulty', () => {
  test('returns feedback prompt content and path', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/feedback-prompt/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(res.body).toHaveProperty('path');
    expect(res.body.content.length).toBeGreaterThan(50);
  });

  test('returns 400 for invalid difficulty', async () => {
    const res = await request(app).get('/prompt-lab/api/feedback-prompt/invalid');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('difficulty must be');
  });

  test('uses default topic when not specified', async () => {
    const res = await request(app).get('/prompt-lab/api/feedback-prompt/easy');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
  });
});

describe('PUT /prompt-lab/api/feedback-prompt/:difficulty', () => {
  test('returns 400 for invalid difficulty', async () => {
    const res = await request(app)
      .put('/prompt-lab/api/feedback-prompt/hard')
      .send({ content: 'test content' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('difficulty must be');
  });

  test('returns 400 when content is missing', async () => {
    const res = await request(app).put('/prompt-lab/api/feedback-prompt/easy').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('content required');
  });

  test('saves feedback prompt and returns path and timestamp', async () => {
    // Read original to restore after test
    const original = await request(app)
      .get('/prompt-lab/api/feedback-prompt/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });

    const res = await request(app)
      .put('/prompt-lab/api/feedback-prompt/easy')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' })
      .send({ content: original.body.content });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('path');
    expect(res.body).toHaveProperty('savedAt');
    expect(res.body.path).toContain('feedback');
    promptLabService.clearModifiedFiles();
  });
});

// ──────────────────────────────────────────
// TEST SCRIPT ENDPOINTS
// ──────────────────────────────────────────

describe('GET /prompt-lab/api/tests', () => {
  test('returns available tests for topic', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/tests')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tests');
    expect(Array.isArray(res.body.tests)).toBe(true);
    expect(res.body.tests.length).toBeGreaterThan(0);
  });

  test('each test has id, name, description, difficulty, inputCount, triggerFeedback', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/tests')
      .query({ topic: 'clinical/emergencies/necrotising_fasciitis' });
    const t = res.body.tests[0];
    expect(t).toHaveProperty('id');
    expect(t).toHaveProperty('name');
    expect(t).toHaveProperty('description');
    expect(t).toHaveProperty('difficulty');
    expect(t).toHaveProperty('inputCount');
    expect(t).toHaveProperty('triggerFeedback');
  });

  test('returns generic tests for unknown topic', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/tests')
      .query({ topic: 'fake/unknown/topic' });
    expect(res.status).toBe(200);
    // Generic behavioral templates are always available
    res.body.tests.forEach(t => expect(t.source).toBe('generic'));
  });

  test('uses default topic when none specified', async () => {
    const res = await request(app).get('/prompt-lab/api/tests');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tests');
  });
});

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
    // Write a minimal test script
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

  test('executes test and returns results with assertions', async () => {
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
    expect(res.body).toHaveProperty('history');
    expect(res.body).toHaveProperty('metadata');
  });

  test('returns 400 when testId missing', async () => {
    const res = await request(app).post('/prompt-lab/api/run-test').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('testId required');
  });

  test('returns 404 for non-existent test script', async () => {
    const res = await request(app)
      .post('/prompt-lab/api/run-test')
      .send({ testId: 'nonexistent_test_xyz' });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });
});

// ──────────────────────────────────────────
// TRANSCRIPT ENDPOINTS
// ──────────────────────────────────────────

describe('Transcript endpoints', () => {
  const BACKEND_DIR = path.join(__dirname, '..');
  const TEST_RESULTS_DIR = path.join(BACKEND_DIR, 'test-results');
  const createdIds = [];

  afterEach(() => {
    for (const id of createdIds) {
      try {
        const filePath = path.join(TEST_RESULTS_DIR, `${id}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        /* ignore */
      }
    }
    createdIds.length = 0;
  });

  test('GET /transcripts returns transcript list', async () => {
    const res = await request(app).get('/prompt-lab/api/transcripts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transcripts');
    expect(Array.isArray(res.body.transcripts)).toBe(true);
  });

  test('GET /transcripts/:id returns specific transcript', async () => {
    const sections = { core: 'route test', difficulty: 'test', clinical: 'test' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    const session = promptLabService.getSession(sessionId);
    session.history.push({ role: 'user', content: 'route transcript test' });
    const transcriptId = promptLabService.saveManualTranscript(sessionId);
    createdIds.push(transcriptId);
    promptLabService.deleteSession(sessionId);

    const res = await request(app).get(`/prompt-lab/api/transcripts/${transcriptId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(transcriptId);
    expect(res.body.type).toBe('manual');
  });

  test('GET /transcripts/:id returns 404 for non-existent transcript', async () => {
    const res = await request(app).get('/prompt-lab/api/transcripts/nonexistent_id_xyz');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  test('DELETE /transcripts/:id removes transcript', async () => {
    const sections = { core: 'delete test', difficulty: 'test', clinical: 'test' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    const session = promptLabService.getSession(sessionId);
    session.history.push({ role: 'user', content: 'to delete' });
    const transcriptId = promptLabService.saveManualTranscript(sessionId);
    promptLabService.deleteSession(sessionId);

    const res = await request(app).delete(`/prompt-lab/api/transcripts/${transcriptId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const filePath = path.join(TEST_RESULTS_DIR, `${transcriptId}.json`);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  test('DELETE /transcripts/:id returns 404 for non-existent transcript', async () => {
    const res = await request(app).delete('/prompt-lab/api/transcripts/nonexistent_id_xyz');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });
});

// ──────────────────────────────────────────
// TRANSCRIPT ROUND-TRIP (create, list, load, delete)
// ──────────────────────────────────────────

describe('Transcript round-trip via routes', () => {
  const BACKEND_DIR = path.join(__dirname, '..');
  const TEST_RESULTS_DIR = path.join(BACKEND_DIR, 'test-results');

  test('save, list, load, and delete a transcript end-to-end', async () => {
    // Create session
    const sessionRes = await request(app)
      .post('/prompt-lab/api/session')
      .send({
        promptSections: { core: 'Roundtrip', difficulty: 'Test', clinical: 'Test' },
        metadata: { difficulty: 'easy' }
      });
    const sessionId = sessionRes.body.sessionId;
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'Roundtrip test' },
      { role: 'assistant', content: 'Reply' }
    );

    // Save
    const saveRes = await request(app).post('/prompt-lab/api/save-manual').send({ sessionId });
    expect(saveRes.status).toBe(200);
    const transcriptId = saveRes.body.transcriptId;

    // List and find it
    const listRes = await request(app).get('/prompt-lab/api/transcripts');
    expect(listRes.status).toBe(200);
    const found = listRes.body.transcripts.find(t => t.id === transcriptId);
    expect(found).toBeDefined();
    expect(found.type).toBe('manual');

    // Load
    const loadRes = await request(app).get(`/prompt-lab/api/transcripts/${transcriptId}`);
    expect(loadRes.status).toBe(200);
    expect(loadRes.body.id).toBe(transcriptId);
    expect(loadRes.body.history.some(m => m.content === 'Roundtrip test')).toBe(true);

    // Delete
    const deleteRes = await request(app).delete(`/prompt-lab/api/transcripts/${transcriptId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify deleted
    const reloadRes = await request(app).get(`/prompt-lab/api/transcripts/${transcriptId}`);
    expect(reloadRes.status).toBe(404);

    promptLabService.deleteSession(sessionId);
  });
});

// ──────────────────────────────────────────
// CONFIG AND CHANGES ENDPOINTS
// ──────────────────────────────────────────

describe('GET /prompt-lab/api/changes', () => {
  beforeEach(() => {
    promptLabService.clearModifiedFiles();
  });

  test('returns modified files list with count', async () => {
    const res = await request(app).get('/prompt-lab/api/changes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('files');
    expect(res.body).toHaveProperty('count');
    expect(res.body.count).toBe(0);
    expect(res.body.files).toEqual([]);
  });
});

describe('GET /prompt-lab/api/config', () => {
  test('returns feature flags including githubEnabled', async () => {
    const res = await request(app).get('/prompt-lab/api/config');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('githubEnabled');
    expect(typeof res.body.githubEnabled).toBe('boolean');
  });
});

describe('POST /prompt-lab/api/create-pr', () => {
  test('returns 400 when no modified files exist', async () => {
    promptLabService.clearModifiedFiles();
    const res = await request(app).post('/prompt-lab/api/create-pr').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('No modified files');
  });
});

// ──────────────────────────────────────────
// ERROR HANDLING / SECURITY
// ──────────────────────────────────────────

describe('Error handling and security', () => {
  test('path traversal with .. in topic is rejected', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: '../../../etc/passwd' });
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Invalid topic path');
  });

  test('path with uppercase letters is rejected', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: 'Clinical/Emergencies/NecFasc' });
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Invalid topic path');
  });

  test('path with spaces is rejected', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: 'clinical/emergencies/nec fasc' });
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Invalid topic path');
  });

  test('absolute path starting with / is rejected', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/prompts/easy')
      .query({ topic: '/clinical/emergencies/necrotising_fasciitis' });
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Invalid topic path');
  });

  test('path traversal in feedback-prompt endpoint is rejected', async () => {
    const res = await request(app)
      .get('/prompt-lab/api/feedback-prompt/easy')
      .query({ topic: '../../etc/passwd' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ──────────────────────────────────────────
// GATING (PROMPT_LAB_ENABLED)
// ──────────────────────────────────────────

describe('Prompt Lab gating', () => {
  test('routes are available when mounted (non-production environment)', async () => {
    // The test app above mounts routes directly, so they are always available.
    // This verifies the routes respond rather than returning 404.
    const res = await request(app).get('/prompt-lab/api/topics');
    expect(res.status).toBe(200);
  });

  test('unmounted routes return 404', async () => {
    // Create an app WITHOUT prompt lab routes to simulate gating
    const gatedApp = express();
    gatedApp.use(express.json());
    // Do NOT mount prompt lab routes

    const res = await request(gatedApp).get('/prompt-lab/api/topics');
    expect(res.status).toBe(404);
  });
});

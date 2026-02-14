/**
 * Prompt Lab Service Tests
 * Tests topic discovery, path validation, prompt file operations,
 * feedback fallback chain, modified file tracking, test script listing,
 * chat, feedback generation, assertion evaluation, test execution, and transcript CRUD.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-key';

const openaiService = require('../src/services/OpenAIService');
const promptLabService = require('../src/services/PromptLabService');

const BACKEND_DIR = path.join(__dirname, '..');
const PROMPTS_DIR = path.join(BACKEND_DIR, 'prompts');
const FEEDBACK_DIR = path.join(PROMPTS_DIR, 'feedback');

// ──────────────────────────────────────────
// PATH VALIDATION
// ──────────────────────────────────────────

describe('PromptLabService - Path Validation', () => {
  test('accepts valid nested path with underscores', () => {
    expect(() => {
      promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    }).not.toThrow(/Invalid topic path/);
  });

  test('rejects path traversal with ..', () => {
    expect(() => {
      promptLabService.loadPrompt('clinical/../../etc/passwd', 'easy');
    }).toThrow(/Invalid topic path/);
  });

  test('rejects absolute paths starting with /', () => {
    expect(() => {
      promptLabService.loadPrompt('/clinical/emergencies/necrotising_fasciitis', 'easy');
    }).toThrow(/Invalid topic path/);
  });

  test('rejects paths with uppercase letters', () => {
    expect(() => {
      promptLabService.loadPrompt('Clinical/Emergencies/NecFasc', 'easy');
    }).toThrow(/Invalid topic path/);
  });

  test('rejects paths with spaces', () => {
    expect(() => {
      promptLabService.loadPrompt('clinical/emergencies/nec fasc', 'easy');
    }).toThrow(/Invalid topic path/);
  });

  test('rejects empty path', () => {
    expect(() => {
      promptLabService.loadPrompt('', 'easy');
    }).toThrow(/Invalid topic path/);
  });

  test('rejects null path', () => {
    expect(() => {
      promptLabService.loadPrompt(null, 'easy');
    }).toThrow(/Invalid topic path/);
  });

  test('rejects undefined path', () => {
    expect(() => {
      promptLabService.loadPrompt(undefined, 'easy');
    }).toThrow(/Invalid topic path/);
  });
});

// ──────────────────────────────────────────
// TOPIC DISCOVERY
// ──────────────────────────────────────────

describe('PromptLabService - Topic Discovery', () => {
  let topics;

  beforeAll(() => {
    topics = promptLabService.listTopics();
  });

  test('returns non-empty array', () => {
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBeGreaterThan(0);
  });

  test('each topic has path, label, and group properties', () => {
    const topic = topics[0];
    expect(topic).toHaveProperty('path');
    expect(topic).toHaveProperty('label');
    expect(topic).toHaveProperty('group');
    expect(typeof topic.path).toBe('string');
    expect(typeof topic.label).toBe('string');
    expect(typeof topic.group).toBe('string');
  });

  test('includes necrotising_fasciitis with correct label', () => {
    const necFasc = topics.find(t => t.path === 'clinical/emergencies/necrotising_fasciitis');
    expect(necFasc).toBeDefined();
    expect(necFasc.label).toBe('Necrotising Fasciitis');
  });

  test('group labels contain > separator', () => {
    const necFasc = topics.find(t => t.path === 'clinical/emergencies/necrotising_fasciitis');
    expect(necFasc.group).toContain('>');
    expect(necFasc.group).toContain('Clinical');
    expect(necFasc.group).toContain('Emergencies');
  });

  test('excludes feedback, system, and test directories', () => {
    const invalidTopics = topics.filter(
      t =>
        t.path.startsWith('feedback/') || t.path.startsWith('system/') || t.path.startsWith('test/')
    );
    expect(invalidTopics).toHaveLength(0);
  });

  test('results are sorted by group then label', () => {
    for (let i = 0; i < topics.length - 1; i++) {
      const cmp = topics[i].group.localeCompare(topics[i + 1].group);
      // Within the same group, labels should be in order; across groups, groups should be in order
      const labelCmp = topics[i].label.localeCompare(topics[i + 1].label);
      const isValidOrder = cmp < 0 || (cmp === 0 && labelCmp <= 0);
      expect(isValidOrder).toBe(true);
    }
  });

  test('topic paths have 3 segments (category/subcategory/topic)', () => {
    for (const topic of topics) {
      const segments = topic.path.split('/');
      expect(segments.length).toBe(3);
    }
  });
});

// ──────────────────────────────────────────
// PROMPT LOADING
// ──────────────────────────────────────────

describe('PromptLabService - Prompt Loading', () => {
  test('returns raw, sections, and path for valid topic', () => {
    const result = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    expect(result).toHaveProperty('raw');
    expect(result).toHaveProperty('sections');
    expect(result).toHaveProperty('path');
    expect(typeof result.raw).toBe('string');
    expect(result.raw.length).toBeGreaterThan(100);
  });

  test('sections contain core, difficulty, and clinical keys', () => {
    const result = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    expect(result.sections).toHaveProperty('core');
    expect(result.sections).toHaveProperty('difficulty');
    expect(result.sections).toHaveProperty('clinical');
    expect(result.sections.core.length).toBeGreaterThan(0);
    expect(result.sections.difficulty.length).toBeGreaterThan(0);
    expect(result.sections.clinical.length).toBeGreaterThan(0);
  });

  test('path contains correct filename pattern', () => {
    const result = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'medium'
    );
    expect(result.path).toContain('medium_clinical_necrotising_fasciitis_1.txt');
  });

  test('throws for non-existent topic', () => {
    expect(() => {
      promptLabService.loadPrompt('clinical/emergencies/fake_topic', 'easy');
    }).toThrow(/Prompt not found/);
  });

  test('loads different content for different difficulties', () => {
    const easy = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    const medium = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'medium'
    );
    expect(easy.sections.difficulty).not.toBe(medium.sections.difficulty);
  });
});

// ──────────────────────────────────────────
// FEEDBACK PROMPTS
// ──────────────────────────────────────────

describe('PromptLabService - Feedback Prompts', () => {
  test('loads difficulty-specific feedback prompt for nec fasc', () => {
    const result = promptLabService.loadFeedbackPromptFile(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('path');
    expect(result.content.length).toBeGreaterThan(100);
    expect(result.path).toContain('easy_clinical_necrotising_fasciitis_feedback.txt');
  });

  test('returns content and path as strings', () => {
    const result = promptLabService.loadFeedbackPromptFile(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    expect(typeof result.content).toBe('string');
    expect(typeof result.path).toBe('string');
  });

  test('falls back to generic feedback for topic without specific feedback', () => {
    // Find a topic that exists but has no dedicated feedback prompt
    const topics = promptLabService.listTopics();
    const nonNecFasc = topics.find(t => !t.path.includes('necrotising_fasciitis'));
    // Ensure we actually found a non-nec-fasc topic to test with
    expect(nonNecFasc).toBeDefined();
    const result = promptLabService.loadFeedbackPromptFile(nonNecFasc.path, 'easy');
    expect(result.content.length).toBeGreaterThan(0);
    // Should fall back to generic
    expect(result.path).toContain('generic_feedback.txt');
  });
});

// ──────────────────────────────────────────
// MODIFIED FILES TRACKING
// ──────────────────────────────────────────

describe('PromptLabService - Modified Files Tracking', () => {
  beforeEach(() => {
    promptLabService.clearModifiedFiles();
  });

  afterAll(() => {
    promptLabService.clearModifiedFiles();
  });

  test('getModifiedFiles returns empty array initially', () => {
    const files = promptLabService.getModifiedFiles();
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBe(0);
  });

  test('clearModifiedFiles empties the tracking set', () => {
    // Save a prompt to add to modified files (backup & restore)
    const original = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    promptLabService.savePrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy',
      original.sections
    );

    expect(promptLabService.getModifiedFiles().length).toBeGreaterThan(0);
    promptLabService.clearModifiedFiles();
    expect(promptLabService.getModifiedFiles().length).toBe(0);
  });

  test('savePrompt adds file to modifiedFiles', () => {
    const original = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    promptLabService.savePrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy',
      original.sections
    );

    const files = promptLabService.getModifiedFiles();
    expect(files.length).toBe(1);
    expect(files[0]).toContain('prompts');
    expect(files[0]).toContain('necrotising_fasciitis');
  });

  test('no duplicates when saving same file twice', () => {
    const original = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    promptLabService.savePrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy',
      original.sections
    );
    promptLabService.savePrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy',
      original.sections
    );

    const files = promptLabService.getModifiedFiles();
    expect(files.length).toBe(1);
  });

  test('tracks multiple different files', () => {
    const easy = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    const medium = promptLabService.loadPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'medium'
    );
    promptLabService.savePrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy',
      easy.sections
    );
    promptLabService.savePrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'medium',
      medium.sections
    );

    const files = promptLabService.getModifiedFiles();
    expect(files.length).toBe(2);
  });

  test('saveFeedbackPrompt adds to modifiedFiles', () => {
    // Read original, save it back (no content change), check tracking
    const original = promptLabService.loadFeedbackPromptFile(
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );
    promptLabService.saveFeedbackPrompt(
      'clinical/emergencies/necrotising_fasciitis',
      'easy',
      original.content
    );

    const files = promptLabService.getModifiedFiles();
    expect(files.some(f => f.includes('feedback'))).toBe(true);
  });
});

// ──────────────────────────────────────────
// TEST SCRIPTS
// ──────────────────────────────────────────

describe('PromptLabService - Test Scripts', () => {
  test('returns test scripts for necrotising_fasciitis', () => {
    const tests = promptLabService.listTestScripts('necrotising_fasciitis');
    expect(Array.isArray(tests)).toBe(true);
    expect(tests.length).toBeGreaterThan(0);
  });

  test('each test script has required properties', () => {
    const tests = promptLabService.listTestScripts('necrotising_fasciitis');
    const firstTest = tests[0];
    expect(firstTest).toHaveProperty('id');
    expect(firstTest).toHaveProperty('name');
    expect(firstTest).toHaveProperty('description');
    expect(firstTest).toHaveProperty('difficulty');
    expect(firstTest).toHaveProperty('inputCount');
    expect(firstTest).toHaveProperty('triggerFeedback');
    expect(firstTest).toHaveProperty('source');
    expect(firstTest.inputCount).toBeGreaterThan(0);
  });

  test('includes good_candidate test', () => {
    const tests = promptLabService.listTestScripts('necrotising_fasciitis');
    const goodTest = tests.find(t => t.id === 'good_candidate');
    expect(goodTest).toBeDefined();
  });

  test('returns only generic tests for unknown topic', () => {
    const tests = promptLabService.listTestScripts('fake_nonexistent_topic');
    expect(Array.isArray(tests)).toBe(true);
    // Should only contain generic behavioral templates (no premade, no generatable)
    tests.forEach(t => expect(t.source).toBe('generic'));
  });

  test('returns only generic tests for null input', () => {
    const tests = promptLabService.listTestScripts(null);
    expect(Array.isArray(tests)).toBe(true);
    tests.forEach(t => expect(t.source).toBe('generic'));
  });

  test('returns only generic tests for empty string', () => {
    const tests = promptLabService.listTestScripts('');
    expect(Array.isArray(tests)).toBe(true);
    tests.forEach(t => expect(t.source).toBe('generic'));
  });
});

// ──────────────────────────────────────────
// SESSION MANAGEMENT (basic)
// ──────────────────────────────────────────

describe('PromptLabService - Session Management', () => {
  test('createSession returns a sessionId with pl_ prefix', () => {
    const sections = { core: 'test', difficulty: 'test', clinical: 'test' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    expect(sessionId).toMatch(/^pl_/);
  });

  test('getSession returns session data', () => {
    const sections = { core: 'test', difficulty: 'test', clinical: 'test' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    const session = promptLabService.getSession(sessionId);
    expect(session).not.toBeNull();
    expect(session.difficulty).toBe('easy');
  });

  test('deleteSession removes session', () => {
    const sections = { core: 'test', difficulty: 'test', clinical: 'test' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    promptLabService.deleteSession(sessionId);
    expect(promptLabService.getSession(sessionId)).toBeNull();
  });

  test('getSession returns null for non-existent session', () => {
    expect(promptLabService.getSession('pl_nonexistent')).toBeNull();
  });
});

// ──────────────────────────────────────────
// CHAT (requires OpenAI mock)
// ──────────────────────────────────────────

describe('PromptLabService - Chat', () => {
  let sessionId;

  beforeEach(() => {
    const sections = {
      core: 'You are a test examiner.',
      difficulty: 'Be nice.',
      clinical: 'Test scenario.'
    };
    const result = promptLabService.createSession(sections, { difficulty: 'easy' });
    sessionId = result.sessionId;
  });

  afterEach(() => {
    promptLabService.deleteSession(sessionId);
  });

  test('sends message and gets response', async () => {
    jest
      .spyOn(openaiService, 'generateResponse')
      .mockResolvedValue('Hello, welcome to the station.');
    const result = await promptLabService.chat(sessionId, 'Good morning.');
    expect(result).toHaveProperty('response', 'Hello, welcome to the station.');
    expect(result).toHaveProperty('turnNumber');
  });

  test('increments turn counter on each call', async () => {
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Response 1');
    const r1 = await promptLabService.chat(sessionId, 'First message');
    expect(r1.turnNumber).toBe(1);

    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Response 2');
    const r2 = await promptLabService.chat(sessionId, 'Second message');
    expect(r2.turnNumber).toBe(2);
  });

  test('accumulates user and assistant messages in history', async () => {
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('AI reply 1');
    await promptLabService.chat(sessionId, 'User msg 1');

    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('AI reply 2');
    await promptLabService.chat(sessionId, 'User msg 2');

    const session = promptLabService.getSession(sessionId);
    // history: system + user1 + assistant1 + user2 + assistant2 = 5 messages
    expect(session.history.length).toBe(5);
    expect(session.history[1]).toEqual({ role: 'user', content: 'User msg 1' });
    expect(session.history[2]).toEqual({ role: 'assistant', content: 'AI reply 1' });
    expect(session.history[3]).toEqual({ role: 'user', content: 'User msg 2' });
    expect(session.history[4]).toEqual({ role: 'assistant', content: 'AI reply 2' });
  });

  test('throws for non-existent session', async () => {
    await expect(promptLabService.chat('pl_fake_id', 'hello')).rejects.toThrow(/Session not found/);
  });
});

// ──────────────────────────────────────────
// FEEDBACK GENERATION (requires OpenAI mock)
// ──────────────────────────────────────────

describe('PromptLabService - Feedback Generation', () => {
  let sessionId;

  beforeEach(() => {
    const sections = {
      core: 'Examiner prompt.',
      difficulty: 'Easy mode.',
      clinical: 'Nec fasc case.'
    };
    const result = promptLabService.createSession(sections, { difficulty: 'easy' });
    sessionId = result.sessionId;
    // Simulate a conversation in the session
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'I would start with ABCDE assessment.' },
      { role: 'assistant', content: 'What would you do next?' }
    );
  });

  afterEach(() => {
    promptLabService.deleteSession(sessionId);
  });

  test('generates 6 feedback sections', async () => {
    const mockGenerate = jest.spyOn(openaiService, 'generateResponse');
    // 6 section calls + 1 JSON summary call = 7 total
    for (let i = 0; i < 6; i++) {
      mockGenerate.mockResolvedValueOnce(`Section ${i + 1} feedback content.`);
    }
    mockGenerate.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"Good","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"Decent"}'
    );

    const result = await promptLabService.generateFeedback(sessionId, 'Custom feedback prompt');
    expect(result.sections).toHaveLength(6);
    expect(result.sections[0]).toBe('Section 1 feedback content.');
    expect(result.sections[5]).toBe('Section 6 feedback content.');
  });

  test('returns JSON summary with score', async () => {
    const mockGenerate = jest.spyOn(openaiService, 'generateResponse');
    for (let i = 0; i < 6; i++) {
      mockGenerate.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mockGenerate.mockResolvedValueOnce(
      '{"score":4,"overallImpression":"Very good","clinicalKnowledge":{"diagnosis":"Excellent","management":"Good"},"strengths":["Clear","Structured"],"improvements":["Speed"],"summary":"Well done"}'
    );

    const result = await promptLabService.generateFeedback(sessionId, 'Feedback prompt');
    expect(result.summary.score).toBe(4);
    expect(result.summary.overallImpression).toBe('Very good');
    expect(result.summary.strengths).toContain('Clear');
  });

  test('handles malformed JSON from GPT gracefully with fallback', async () => {
    const mockGenerate = jest.spyOn(openaiService, 'generateResponse');
    for (let i = 0; i < 6; i++) {
      mockGenerate.mockResolvedValueOnce(`Section ${i + 1} text.`);
    }
    // Return invalid JSON for summary
    mockGenerate.mockResolvedValueOnce('This is not JSON at all, just text.');

    const result = await promptLabService.generateFeedback(sessionId, 'Feedback prompt');
    expect(result.sections).toHaveLength(6);
    expect(result.summary.score).toBe(-1);
    expect(result.summary.overallImpression).toBe('Unable to parse structured feedback');
    expect(result.summary.improvements).toContain('JSON parsing failed');
  });

  test('uses correct feedback prompt based on difficulty', async () => {
    const mockGenerate = jest.spyOn(openaiService, 'generateResponse');
    for (let i = 0; i < 7; i++) {
      mockGenerate.mockResolvedValueOnce(
        i < 6
          ? `Section ${i + 1}.`
          : '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
      );
    }

    // Pass topicPath, no feedbackPromptOverride — it should load from file
    await promptLabService.generateFeedback(
      sessionId,
      null,
      'clinical/emergencies/necrotising_fasciitis'
    );

    // The first call should have received a system message containing the loaded feedback prompt
    const firstCallHistory = mockGenerate.mock.calls[0][0];
    expect(firstCallHistory[0].role).toBe('system');
    // The feedback prompt for easy nec fasc should exist (loaded from disk)
    expect(firstCallHistory[0].content.length).toBeGreaterThan(50);
  });

  test('throws for non-existent session', async () => {
    await expect(promptLabService.generateFeedback('pl_fake_id')).rejects.toThrow(
      /Session not found/
    );
  });
});

// ──────────────────────────────────────────
// ASSERTION EVALUATION (tested via runTest)
// ──────────────────────────────────────────

describe('PromptLabService - evaluateAssertions / evaluateSingleAssertion', () => {
  // evaluateAssertions is not exported, so we test assertion behavior through runTest.
  // Each test creates a temp test script, mocks OpenAI, and checks assertion results.
  // topicPath must end with the temp folder name so loadTestScript finds the right dir.

  const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
  const TEMP_TOPIC = '__test_assertions__';
  const TEMP_DIR = path.join(TEST_SCRIPTS_DIR, TEMP_TOPIC);
  // topicPath whose last segment matches TEMP_TOPIC
  const TOPIC_PATH = `test/assertions/${TEMP_TOPIC}`;
  const PROMPT_SECTIONS = { core: 'test', difficulty: 'test', clinical: 'test' };

  beforeEach(() => {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
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

  function writeTestScript(id, script) {
    fs.writeFileSync(path.join(TEMP_DIR, `${id}.json`), JSON.stringify(script));
  }

  test('contains assertion passes when value found at correct turn', async () => {
    writeTestScript('contains_pass', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'contains', value: 'welcome', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Welcome to the station.');
    const result = await promptLabService.runTest('contains_pass', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
    expect(result.assertions.failed).toBe(0);
  });

  test('contains assertion fails when value not found', async () => {
    writeTestScript('contains_fail', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'contains', value: 'xyz_not_present', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Welcome to the station.');
    const result = await promptLabService.runTest('contains_fail', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(0);
    expect(result.assertions.failed).toBe(1);
  });

  test('not_contains assertion passes when value absent', async () => {
    writeTestScript('not_cont_pass', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'not_contains', value: 'forbidden', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Welcome.');
    const result = await promptLabService.runTest('not_cont_pass', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('not_contains assertion fails when value present', async () => {
    writeTestScript('not_cont_fail', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'not_contains', value: 'welcome', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Welcome to the station.');
    const result = await promptLabService.runTest('not_cont_fail', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
  });

  test('never_contains passes when value in no response', async () => {
    writeTestScript('never_pass', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1', 'msg2'],
      assertions: [{ type: 'never_contains', value: 'forbidden', desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Response one.');
    mock.mockResolvedValueOnce('Response two.');
    const result = await promptLabService.runTest('never_pass', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('never_contains fails when value in any response', async () => {
    writeTestScript('never_fail', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1', 'msg2'],
      assertions: [{ type: 'never_contains', value: 'correct', desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('That is correct, well done.');
    mock.mockResolvedValueOnce('Continue please.');
    const result = await promptLabService.runTest('never_fail', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
  });

  test('regex assertion matches pattern at turn', async () => {
    writeTestScript('regex_pass', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'regex', pattern: '\\d+ year', desc: 'test' }]
    });
    jest
      .spyOn(openaiService, 'generateResponse')
      .mockResolvedValue('A 64 year old male presents...');
    const result = await promptLabService.runTest('regex_pass', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('avg_word_count passes within min/max bounds', async () => {
    writeTestScript('avg_wc_pass', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1'],
      assertions: [{ type: 'avg_word_count', min: 3, max: 20, desc: 'test' }]
    });
    jest
      .spyOn(openaiService, 'generateResponse')
      .mockResolvedValue('This is a short response here.');
    const result = await promptLabService.runTest('avg_wc_pass', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('avg_word_count fails outside bounds', async () => {
    writeTestScript('avg_wc_fail', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1'],
      assertions: [{ type: 'avg_word_count', min: 100, max: 200, desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Short.');
    const result = await promptLabService.runTest('avg_wc_fail', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
  });

  test('turn_count validates correct count', async () => {
    writeTestScript('turn_count', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1', 'msg2', 'msg3'],
      assertions: [{ type: 'turn_count', min: 3, max: 3, desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Reply 1');
    mock.mockResolvedValueOnce('Reply 2');
    mock.mockResolvedValueOnce('Reply 3');
    const result = await promptLabService.runTest('turn_count', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('score_range passes within range', async () => {
    writeTestScript('score_pass', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'score_range', min: 2, max: 4, desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );
    const result = await promptLabService.runTest('score_pass', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'score_range');
    expect(detail.passed).toBe(true);
  });

  test('score_range fails outside range', async () => {
    writeTestScript('score_fail', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'score_range', min: 4, max: 5, desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":1,"overallImpression":"Poor","clinicalKnowledge":{"diagnosis":"Bad","management":"Bad"},"strengths":["None"],"improvements":["All"],"summary":"Poor"}'
    );
    const result = await promptLabService.runTest('score_fail', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'score_range');
    expect(detail.passed).toBe(false);
  });

  test('section_count validates feedback section count', async () => {
    writeTestScript('sec_count', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'section_count', expected: 6, desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );
    const result = await promptLabService.runTest('sec_count', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'section_count');
    expect(detail.passed).toBe(true);
  });

  test('feedback_contains checks feedback text', async () => {
    writeTestScript('fb_contains', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'feedback_contains', value: 'debridement', desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    mock.mockResolvedValueOnce('You discussed debridement well.');
    for (let i = 1; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );
    const result = await promptLabService.runTest('fb_contains', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'feedback_contains');
    expect(detail.passed).toBe(true);
  });

  test('contains_any passes with any matching value', async () => {
    writeTestScript('cont_any', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [
        { turn: 1, type: 'contains_any', values: ['goodbye', 'welcome', 'greetings'], desc: 'test' }
      ]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Welcome to the exam station.');
    const result = await promptLabService.runTest('cont_any', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });
});

// ──────────────────────────────────────────
// ASSERTION ENGINE — EDGE CASES
// ──────────────────────────────────────────

describe('PromptLabService - Assertion engine edge cases', () => {
  const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
  const TEMP_TOPIC = '__test_assert_edge__';
  const TEMP_DIR = path.join(TEST_SCRIPTS_DIR, TEMP_TOPIC);
  const TOPIC_PATH = `test/edge/${TEMP_TOPIC}`;
  const PROMPT_SECTIONS = { core: 'test', difficulty: 'test', clinical: 'test' };

  beforeEach(() => {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
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

  function writeTestScript(id, script) {
    fs.writeFileSync(path.join(TEMP_DIR, `${id}.json`), JSON.stringify(script));
  }

  test('contains assertion returns "[no response at turn]" for missing turn', async () => {
    writeTestScript('missing_turn', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 99, type: 'contains', value: 'anything', desc: 'missing turn' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('missing_turn', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
    expect(result.assertions.details[0].actual).toBe('[no response at turn]');
  });

  test('contains_any fails when no values match', async () => {
    writeTestScript('cont_any_fail', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [
        { turn: 1, type: 'contains_any', values: ['alpha', 'beta', 'gamma'], desc: 'test' }
      ]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('No matching words here.');
    const result = await promptLabService.runTest('cont_any_fail', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
  });

  test('contains_any returns "[no response at turn]" for missing turn', async () => {
    writeTestScript('cont_any_miss', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 50, type: 'contains_any', values: ['x'], desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('cont_any_miss', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.details[0].actual).toBe('[no response at turn]');
    expect(result.assertions.failed).toBe(1);
  });

  test('not_contains passes when turn does not exist', async () => {
    writeTestScript('not_cont_miss', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 99, type: 'not_contains', value: 'anything', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('not_cont_miss', TOPIC_PATH, PROMPT_SECTIONS);
    // not_contains passes if turn is missing (no content to violate)
    expect(result.assertions.passed).toBe(1);
  });

  test('regex assertion returns "[no response at turn]" for missing turn', async () => {
    writeTestScript('regex_miss', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 50, type: 'regex', pattern: '\\d+', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('regex_miss', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
    expect(result.assertions.details[0].actual).toBe('[no response at turn]');
  });

  test('regex assertion fails when pattern does not match', async () => {
    writeTestScript('regex_fail', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'regex', pattern: '^EXACT_START', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('This does not match.');
    const result = await promptLabService.runTest('regex_fail', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
  });

  test('contains is case insensitive', async () => {
    writeTestScript('case_insensitive', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'contains', value: 'WELCOME', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('welcome to the station.');
    const result = await promptLabService.runTest('case_insensitive', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('never_contains is case insensitive', async () => {
    writeTestScript('never_case', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ turn: 1, type: 'never_contains', value: 'REPLY', desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('This is a reply.');
    const result = await promptLabService.runTest('never_case', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
  });

  test('avg_word_count returns "0 turns" for empty history', async () => {
    writeTestScript('avg_wc_empty', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: [],
      assertions: [{ type: 'avg_word_count', min: 1, max: 100, desc: 'test' }]
    });
    const result = await promptLabService.runTest('avg_wc_empty', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.details[0].actual).toBe('0 turns');
    expect(result.assertions.failed).toBe(1);
  });

  test('avg_word_count passes with only max bound', async () => {
    writeTestScript('avg_wc_max_only', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ type: 'avg_word_count', max: 100, desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Short reply.');
    const result = await promptLabService.runTest('avg_wc_max_only', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('avg_word_count passes with only min bound', async () => {
    writeTestScript('avg_wc_min_only', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ type: 'avg_word_count', min: 1, desc: 'test' }]
    });
    jest
      .spyOn(openaiService, 'generateResponse')
      .mockResolvedValue('This is a response with several words.');
    const result = await promptLabService.runTest('avg_wc_min_only', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
  });

  test('turn_count fails when count below min', async () => {
    writeTestScript('turn_low', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [{ type: 'turn_count', min: 5, max: 10, desc: 'test' }]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('turn_low', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
    expect(result.assertions.details[0].actual).toBe('1 turns');
  });

  test('turn_count fails when count above max', async () => {
    writeTestScript('turn_high', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['a', 'b', 'c', 'd', 'e'],
      assertions: [{ type: 'turn_count', min: 1, max: 2, desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    for (let i = 0; i < 5; i++) {
      mock.mockResolvedValueOnce(`Reply ${i + 1}.`);
    }
    const result = await promptLabService.runTest('turn_high', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.failed).toBe(1);
    expect(result.assertions.details[0].actual).toBe('5 turns');
  });

  test('score_range returns "[no score]" when feedback has no score', async () => {
    writeTestScript('score_no_fb', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'score_range', min: 0, max: 5, desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    // Return JSON with no score field
    mock.mockResolvedValueOnce('Not valid JSON at all');
    const result = await promptLabService.runTest('score_no_fb', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'score_range');
    // Fallback summary has score: -1, which is outside 0-5 range
    expect(detail.passed).toBe(false);
  });

  test('section_count fails when count differs from expected', async () => {
    writeTestScript('sec_wrong', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'section_count', expected: 10, desc: 'test' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );
    const result = await promptLabService.runTest('sec_wrong', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'section_count');
    expect(detail.passed).toBe(false);
    expect(detail.actual).toBe('6 sections');
  });

  test('feedback_contains fails when value not in feedback', async () => {
    writeTestScript('fb_missing', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [
        { type: 'feedback_contains', value: 'xylophone_not_present', desc: 'test' }
      ]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1} feedback.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );
    const result = await promptLabService.runTest('fb_missing', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'feedback_contains');
    expect(detail.passed).toBe(false);
  });

  test('empty assertions array returns zero counts', async () => {
    writeTestScript('empty_asserts', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: []
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('empty_asserts', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(0);
    expect(result.assertions.failed).toBe(0);
    expect(result.assertions.total).toBe(0);
    expect(result.assertions.details).toHaveLength(0);
  });

  test('multiple assertions of different types evaluated together', async () => {
    writeTestScript('multi_types', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello', 'another message'],
      assertions: [
        { turn: 1, type: 'contains', value: 'welcome', desc: 'has welcome' },
        { turn: 2, type: 'not_contains', value: 'forbidden', desc: 'no forbidden' },
        { type: 'never_contains', value: 'secret', desc: 'no secret' },
        { type: 'avg_word_count', min: 1, max: 50, desc: 'reasonable length' },
        { type: 'turn_count', min: 2, max: 2, desc: 'exactly 2 turns' }
      ]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Welcome to the station.');
    mock.mockResolvedValueOnce('Please continue with your assessment.');
    const result = await promptLabService.runTest('multi_types', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.total).toBe(5);
    expect(result.assertions.passed).toBe(5);
    expect(result.assertions.failed).toBe(0);
  });

  test('assertion desc falls back to description field', async () => {
    writeTestScript('desc_fallback', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [
        { turn: 1, type: 'contains', value: 'reply', description: 'Uses description field' }
      ]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('This is a reply.');
    const result = await promptLabService.runTest('desc_fallback', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.details[0].desc).toBe('Uses description field');
    expect(result.assertions.passed).toBe(1);
  });

  test('score_range passes when score is exactly at boundary', async () => {
    writeTestScript('score_boundary', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'score_range', min: 3, max: 3, desc: 'exact score' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );
    const result = await promptLabService.runTest('score_boundary', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'score_range');
    expect(detail.passed).toBe(true);
  });

  test('score_range handles score of 0 correctly', async () => {
    writeTestScript('score_zero', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'score_range', min: 0, max: 1, desc: 'low score' }]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":0,"overallImpression":"Unsafe","clinicalKnowledge":{"diagnosis":"Bad","management":"Bad"},"strengths":["None"],"improvements":["All"],"summary":"Unsafe"}'
    );
    const result = await promptLabService.runTest('score_zero', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'score_range');
    expect(detail.passed).toBe(true);
    expect(detail.actual).toBe('score: 0');
  });
});

// ──────────────────────────────────────────
// RUN TEST (integration-level)
// ──────────────────────────────────────────

describe('PromptLabService - runTest', () => {
  const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
  const TEMP_TOPIC = '__test_runtest__';
  const TEMP_DIR = path.join(TEST_SCRIPTS_DIR, TEMP_TOPIC);
  const TOPIC_PATH = `test/run/${TEMP_TOPIC}`;
  const PROMPT_SECTIONS = { core: 'test', difficulty: 'test', clinical: 'test' };

  beforeEach(() => {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
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

  function writeTestScript(id, script) {
    fs.writeFileSync(path.join(TEMP_DIR, `${id}.json`), JSON.stringify(script));
  }

  test('executes test script inputs in order', async () => {
    writeTestScript('order_test', {
      name: 'Order Test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['First input', 'Second input', 'Third input'],
      assertions: []
    });

    const calls = [];
    jest.spyOn(openaiService, 'generateResponse').mockImplementation(async history => {
      const lastUserMsg = [...history].reverse().find(m => m.role === 'user');
      calls.push(lastUserMsg.content);
      return 'Reply.';
    });

    await promptLabService.runTest('order_test', TOPIC_PATH, PROMPT_SECTIONS);
    expect(calls).toEqual(['First input', 'Second input', 'Third input']);
  });

  test('evaluates assertions and returns results', async () => {
    writeTestScript('assert_test', {
      name: 'Assert Test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [
        { turn: 1, type: 'contains', value: 'reply', desc: 'Pass' },
        { turn: 1, type: 'contains', value: 'xyz_missing', desc: 'Fail' }
      ]
    });

    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('This is a reply.');
    const result = await promptLabService.runTest('assert_test', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.total).toBe(2);
    expect(result.assertions.passed).toBe(1);
    expect(result.assertions.failed).toBe(1);
    expect(result.assertions.details).toHaveLength(2);
  });

  test('includes feedback when triggerFeedback is true', async () => {
    writeTestScript('fb_test', {
      name: 'FB Test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [],
      triggerFeedback: true,
      feedbackAssertions: []
    });

    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Chat reply.');
    for (let i = 0; i < 6; i++) {
      mock.mockResolvedValueOnce(`Section ${i + 1}.`);
    }
    mock.mockResolvedValueOnce(
      '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );

    const result = await promptLabService.runTest('fb_test', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.feedback).not.toBeNull();
    expect(result.feedback.sections).toHaveLength(6);
    expect(result.feedback.summary.score).toBe(3);
  });

  test('session is cleaned up after test run', async () => {
    writeTestScript('sess_test', {
      name: 'Session Test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: []
    });

    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('sess_test', TOPIC_PATH, PROMPT_SECTIONS);
    // Session existed during run (history populated)
    expect(result.history.length).toBeGreaterThan(0);
    expect(result.metadata.testId).toBe('sess_test');
  });

  test('returns transcript with correct metadata', async () => {
    writeTestScript('meta_test', {
      name: 'Metadata Test',
      description: 'test',
      difficulty: 'medium',
      inputs: ['hello'],
      assertions: []
    });

    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Reply.');
    const result = await promptLabService.runTest('meta_test', TOPIC_PATH, PROMPT_SECTIONS);

    expect(result.id).toBeDefined();
    expect(result.type).toBe('automated');
    expect(result.metadata.testName).toBe('Metadata Test');
    expect(result.metadata.testId).toBe('meta_test');
    expect(result.metadata.difficulty).toBe('medium');
    expect(result.metadata.timestamp).toBeDefined();
    expect(result.metadata.duration).toBeGreaterThanOrEqual(0);
    expect(result.metadata.promptHash).toBeDefined();
    expect(result.promptContent).toEqual(PROMPT_SECTIONS);
  });
});

// ──────────────────────────────────────────
// TRANSCRIPT CRUD
// ──────────────────────────────────────────

describe('PromptLabService - Transcript CRUD', () => {
  // Use the real test-results dir but clean up after ourselves.
  // Each test creates uniquely named transcripts via the service.
  const TEST_RESULTS_DIR = path.join(BACKEND_DIR, 'test-results');
  const createdIds = [];

  afterEach(() => {
    // Clean up any transcripts we created
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

  test('saveManualTranscript creates file in test-results/', async () => {
    const sections = { core: 'Transcript test prompt.', difficulty: 'Easy.', clinical: 'Case.' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });

    // Add some history
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Welcome' }
    );

    const transcriptId = promptLabService.saveManualTranscript(sessionId);
    createdIds.push(transcriptId);

    expect(transcriptId).toContain('manual');
    const filePath = path.join(TEST_RESULTS_DIR, `${transcriptId}.json`);
    expect(fs.existsSync(filePath)).toBe(true);

    promptLabService.deleteSession(sessionId);
  });

  test('saveManualTranscript throws for non-existent session', () => {
    expect(() => promptLabService.saveManualTranscript('pl_nonexistent')).toThrow(
      /Session not found/
    );
  });

  test('listTranscripts returns array with transcript metadata', () => {
    const sections = { core: 'test', difficulty: 'test', clinical: 'test' };

    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    const session = promptLabService.getSession(sessionId);
    session.history.push({ role: 'user', content: 'list test msg' });
    const id = promptLabService.saveManualTranscript(sessionId);
    createdIds.push(id);
    promptLabService.deleteSession(sessionId);

    const transcripts = promptLabService.listTranscripts();
    expect(Array.isArray(transcripts)).toBe(true);

    const ours = transcripts.find(t => t.id === id);
    expect(ours).toBeDefined();
    expect(ours.type).toBe('manual');
    expect(ours.testName).toBe('Manual Chat');
    expect(ours.difficulty).toBe('easy');
    expect(ours.timestamp).toBeDefined();
  });

  test('loadTranscript reads correct file', () => {
    const sections = { core: 'load test', difficulty: 'test', clinical: 'test' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    const session = promptLabService.getSession(sessionId);
    session.history.push({ role: 'user', content: 'test message for load' });
    const transcriptId = promptLabService.saveManualTranscript(sessionId);
    createdIds.push(transcriptId);
    promptLabService.deleteSession(sessionId);

    const loaded = promptLabService.loadTranscript(transcriptId);
    expect(loaded.id).toBe(transcriptId);
    expect(loaded.type).toBe('manual');
    expect(loaded.metadata.testName).toBe('Manual Chat');
    expect(loaded.history.some(m => m.content === 'test message for load')).toBe(true);
  });

  test('deleteTranscript removes file', () => {
    const sections = { core: 'delete test', difficulty: 'test', clinical: 'test' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    const session = promptLabService.getSession(sessionId);
    session.history.push({ role: 'user', content: 'to be deleted' });
    const transcriptId = promptLabService.saveManualTranscript(sessionId);
    promptLabService.deleteSession(sessionId);

    // Verify it exists first
    expect(fs.existsSync(path.join(TEST_RESULTS_DIR, `${transcriptId}.json`))).toBe(true);

    promptLabService.deleteTranscript(transcriptId);
    expect(fs.existsSync(path.join(TEST_RESULTS_DIR, `${transcriptId}.json`))).toBe(false);
    // Don't add to createdIds since we already deleted it
  });

  test('loadTranscript throws for non-existent ID', () => {
    expect(() => promptLabService.loadTranscript('nonexistent_fake_id_12345')).toThrow(
      /Transcript not found/
    );
  });

  test('deleteTranscript throws for non-existent ID', () => {
    expect(() => promptLabService.deleteTranscript('nonexistent_fake_id_12345')).toThrow(
      /Transcript not found/
    );
  });
});

// ──────────────────────────────────────────
// SERIALIZE TRANSCRIPT
// ──────────────────────────────────────────

describe('PromptLabService - serializeTranscript', () => {
  test('formats history as labeled transcript excluding system messages', () => {
    const history = [
      { role: 'system', content: 'You are an examiner.' },
      { role: 'user', content: 'Hello, I am ready.' },
      { role: 'assistant', content: 'Welcome. Let us begin.' },
      { role: 'user', content: 'I would assess ABCDE.' },
      { role: 'assistant', content: 'What next?' }
    ];
    const result = promptLabService.serializeTranscript(history);
    expect(result).not.toContain('You are an examiner');
    expect(result).toContain('[Candidate]: Hello, I am ready.');
    expect(result).toContain('[Examiner]: Welcome. Let us begin.');
    expect(result).toContain('[Candidate]: I would assess ABCDE.');
    expect(result).toContain('[Examiner]: What next?');
  });
});

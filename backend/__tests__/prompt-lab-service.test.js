/**
 * Prompt Lab Service Tests
 * Tests path validation security, prompt file operations,
 * feedback fallback chain, modified file tracking, assertion evaluation,
 * test execution, structural assertions, and transcript CRUD.
 */

const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-key';

const openaiService = require('../src/services/OpenAIService');
const promptLabService = require('../src/services/PromptLabService');

const BACKEND_DIR = path.join(__dirname, '..');

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
});

// ──────────────────────────────────────────
// TOPIC DISCOVERY
// ──────────────────────────────────────────

describe('PromptLabService - Topic Discovery', () => {
  let topics;

  beforeAll(() => {
    topics = promptLabService.listTopics();
  });

  test('includes necrotising_fasciitis with correct label', () => {
    const necFasc = topics.find(t => t.path === 'clinical/emergencies/necrotising_fasciitis');
    expect(necFasc).toBeDefined();
    expect(necFasc.label).toBe('Necrotising Fasciitis');
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
      const labelCmp = topics[i].label.localeCompare(topics[i + 1].label);
      const isValidOrder = cmp < 0 || (cmp === 0 && labelCmp <= 0);
      expect(isValidOrder).toBe(true);
    }
  });
});

// ──────────────────────────────────────────
// PROMPT LOADING
// ──────────────────────────────────────────

describe('PromptLabService - Prompt Loading', () => {
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
    // Core and clinical should be the same across difficulties
    expect(easy.sections.core).toBe(medium.sections.core);
    expect(easy.sections.clinical).toBe(medium.sections.clinical);
  });
});

// ──────────────────────────────────────────
// FEEDBACK PROMPTS
// ──────────────────────────────────────────

describe('PromptLabService - Feedback Prompts', () => {
  test('falls back to generic feedback for topic without specific feedback', () => {
    const topics = promptLabService.listTopics();
    const nonNecFasc = topics.find(t => !t.path.includes('necrotising_fasciitis'));
    expect(nonNecFasc).toBeDefined();
    const result = promptLabService.loadFeedbackPromptFile(nonNecFasc.path, 'easy');
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.path.replace(/\\/g, '/')).toContain('feedback');
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

  test('savePrompt adds files and clearModifiedFiles resets', () => {
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
    expect(files.length).toBe(3);
    expect(files.every(f => f.includes('prompts'))).toBe(true);
    expect(files.some(f => f.includes('necrotising_fasciitis'))).toBe(true);

    promptLabService.clearModifiedFiles();
    expect(promptLabService.getModifiedFiles().length).toBe(0);
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
    expect(files.length).toBe(3);
  });
});

// ──────────────────────────────────────────
// CHAT
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
    await expect(promptLabService.chat('pl_fake_id', 'hello')).rejects.toThrow();
  });
});

// ──────────────────────────────────────────
// FEEDBACK GENERATION
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
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'I would start with ABCDE assessment.' },
      { role: 'assistant', content: 'What would you do next?' }
    );
  });

  afterEach(() => {
    promptLabService.deleteSession(sessionId);
  });

  test('generates 6 feedback sections with JSON summary', async () => {
    const mockGenerate = jest.spyOn(openaiService, 'generateResponse');
    mockGenerate.mockResolvedValueOnce(
      '===SECTION_1===\nSection 1 feedback content.\n===SECTION_2===\nSection 2 feedback content.\n===SECTION_3===\nSection 3 feedback content.\n===SECTION_4===\nSection 4 feedback content.\n===SECTION_5===\nSection 5 feedback content.\n===SECTION_6===\nSection 6 feedback content.\n===JSON_SUMMARY===\n{"score":3,"overallImpression":"Good","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"Decent"}'
    );

    const result = await promptLabService.generateFeedback(sessionId, 'Custom feedback prompt');
    expect(result.sections).toHaveLength(6);
    expect(result.sections[0]).toBe('Section 1 feedback content.');
    expect(result.summary.score).toBe(3);
    expect(result.summary.overallImpression).toBe('Good');
  });

  test('handles malformed JSON from GPT gracefully with fallback', async () => {
    const mockGenerate = jest.spyOn(openaiService, 'generateResponse');
    mockGenerate.mockResolvedValueOnce(
      '===SECTION_1===\nSection 1 text.\n===SECTION_2===\nSection 2 text.\n===SECTION_3===\nSection 3 text.\n===SECTION_4===\nSection 4 text.\n===SECTION_5===\nSection 5 text.\n===SECTION_6===\nSection 6 text.\n===JSON_SUMMARY===\nThis is not JSON at all, just text.'
    );

    const result = await promptLabService.generateFeedback(sessionId, 'Feedback prompt');
    expect(result.sections).toHaveLength(6);
    expect(result.summary.score).toBe(-1);
    expect(result.summary.improvements).toContain('JSON parsing failed');
  });

  test('loads feedback prompt from disk when no override provided', async () => {
    const mockGenerate = jest.spyOn(openaiService, 'generateResponse');
    for (let i = 0; i < 7; i++) {
      mockGenerate.mockResolvedValueOnce(
        i < 6
          ? `Section ${i + 1}.`
          : '{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
      );
    }

    await promptLabService.generateFeedback(
      sessionId,
      null,
      'clinical/emergencies/necrotising_fasciitis'
    );

    const firstCallHistory = mockGenerate.mock.calls[0][0];
    expect(firstCallHistory[0].role).toBe('system');
    expect(firstCallHistory[0].content.length).toBeGreaterThan(50);
  });
});

// ──────────────────────────────────────────
// ASSERTION EVALUATION
// ──────────────────────────────────────────

describe('PromptLabService - Assertion evaluation', () => {
  const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
  const TEMP_TOPIC = '__test_assertions__';
  const TEMP_DIR = path.join(TEST_SCRIPTS_DIR, TEMP_TOPIC);
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

  test('contains assertion passes/fails correctly', async () => {
    writeTestScript('contains_test', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [
        { turn: 1, type: 'contains', value: 'welcome', desc: 'should pass' },
        { turn: 1, type: 'contains', value: 'xyz_not_present', desc: 'should fail' }
      ]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Welcome to the station.');
    const result = await promptLabService.runTest('contains_test', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
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

  test('not_contains assertion works correctly', async () => {
    writeTestScript('not_cont', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [
        { turn: 1, type: 'not_contains', value: 'forbidden', desc: 'should pass' },
        { turn: 1, type: 'not_contains', value: 'welcome', desc: 'should fail' }
      ]
    });
    jest.spyOn(openaiService, 'generateResponse').mockResolvedValue('Welcome.');
    const result = await promptLabService.runTest('not_cont', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
    expect(result.assertions.failed).toBe(1);
  });

  test('never_contains checks across all responses', async () => {
    writeTestScript('never_test', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1', 'msg2'],
      assertions: [
        { type: 'never_contains', value: 'forbidden', desc: 'should pass' },
        { type: 'never_contains', value: 'correct', desc: 'should fail' }
      ]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('That is correct, well done.');
    mock.mockResolvedValueOnce('Continue please.');
    const result = await promptLabService.runTest('never_test', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
    expect(result.assertions.failed).toBe(1);
  });

  test('regex assertion matches pattern at turn', async () => {
    writeTestScript('regex_test', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['hello'],
      assertions: [
        { turn: 1, type: 'regex', pattern: '\\d+ year', desc: 'should pass' },
        { turn: 1, type: 'regex', pattern: '^EXACT_START', desc: 'should fail' }
      ]
    });
    jest
      .spyOn(openaiService, 'generateResponse')
      .mockResolvedValue('A 64 year old male presents...');
    const result = await promptLabService.runTest('regex_test', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
    expect(result.assertions.failed).toBe(1);
  });

  test('avg_word_count passes within bounds and fails outside', async () => {
    writeTestScript('avg_wc', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1'],
      assertions: [
        { type: 'avg_word_count', min: 3, max: 20, desc: 'should pass' },
        { type: 'avg_word_count', min: 100, max: 200, desc: 'should fail' }
      ]
    });
    jest
      .spyOn(openaiService, 'generateResponse')
      .mockResolvedValue('This is a short response here.');
    const result = await promptLabService.runTest('avg_wc', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
    expect(result.assertions.failed).toBe(1);
  });

  test('turn_count validates correct and incorrect counts', async () => {
    writeTestScript('turn_count', {
      name: 'test',
      description: 'test',
      difficulty: 'easy',
      inputs: ['msg1', 'msg2', 'msg3'],
      assertions: [
        { type: 'turn_count', min: 3, max: 3, desc: 'should pass' },
        { type: 'turn_count', min: 5, max: 10, desc: 'should fail' }
      ]
    });
    const mock = jest.spyOn(openaiService, 'generateResponse');
    mock.mockResolvedValueOnce('Reply 1');
    mock.mockResolvedValueOnce('Reply 2');
    mock.mockResolvedValueOnce('Reply 3');
    const result = await promptLabService.runTest('turn_count', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.assertions.passed).toBe(1);
    expect(result.assertions.failed).toBe(1);
  });

  test('contains returns "[no response at turn]" for missing turn', async () => {
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

  test('score_range checks feedback score within and outside range', async () => {
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
    mock.mockResolvedValueOnce(
      '===SECTION_1===\nSection 1.\n===SECTION_2===\nSection 2.\n===SECTION_3===\nSection 3.\n===SECTION_4===\nSection 4.\n===SECTION_5===\nSection 5.\n===SECTION_6===\nSection 6.\n===JSON_SUMMARY===\n{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );
    const result = await promptLabService.runTest('score_pass', TOPIC_PATH, PROMPT_SECTIONS);
    const detail = result.assertions.details.find(d => d.type === 'score_range');
    expect(detail.passed).toBe(true);
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
});

// ──────────────────────────────────────────
// STRUCTURAL ASSERTIONS (6-state machine)
// ──────────────────────────────────────────

describe('PromptLabService - Structural assertions', () => {
  const assistantTurns = [
    { turn: 1, content: 'Good morning. Are you ready?' },
    { turn: 2, content: 'This is a 64 year old man. How would you approach this case?' },
    { turn: 3, content: 'What would you expect to find on examination?' },
    { turn: 4, content: 'What blood tests would you want to send?' },
    { turn: 5, content: 'How would you stabilise this patient initially?' },
    { turn: 6, content: 'What surgical intervention does this patient need?' }
  ];

  test('stage_covered passes when keywords present and fails when absent', () => {
    const assertion = {
      type: 'stage_covered',
      stage: 'investigations',
      minKeywords: 1,
      desc: 'test'
    };
    const result = promptLabService.evaluateSingleAssertion(assertion, assistantTurns, null);
    expect(result.passed).toBe(true);
    expect(result.actual).toContain('blood test');

    const minimalTurns = [{ turn: 1, content: 'Hello, how are you?' }];
    const failResult = promptLabService.evaluateSingleAssertion(assertion, minimalTurns, null);
    expect(failResult.passed).toBe(false);
  });

  test('no_stage_announcement passes for clean responses and fails for announcements', () => {
    const assertion = { type: 'no_stage_announcement', desc: 'test' };
    const result = promptLabService.evaluateSingleAssertion(assertion, assistantTurns, null);
    expect(result.passed).toBe(true);

    const badTurns = [{ turn: 3, content: 'We are now moving on to investigations.' }];
    const failResult = promptLabService.evaluateSingleAssertion(assertion, badTurns, null);
    expect(failResult.passed).toBe(false);
  });

  test('redirect_on_skip passes when redirect keywords found and fails otherwise', () => {
    const assertion = {
      type: 'redirect_on_skip',
      turn: 3,
      redirectKeywords: ['examination', 'assess'],
      desc: 'test'
    };
    const result = promptLabService.evaluateSingleAssertion(assertion, assistantTurns, null);
    expect(result.passed).toBe(true);

    const failAssertion = {
      type: 'redirect_on_skip',
      turn: 1,
      redirectKeywords: ['surgery', 'debridement'],
      desc: 'test'
    };
    const failResult = promptLabService.evaluateSingleAssertion(
      failAssertion,
      assistantTurns,
      null
    );
    expect(failResult.passed).toBe(false);
  });

  test('redirect_on_skip handles missing turn', () => {
    const assertion = {
      type: 'redirect_on_skip',
      turn: 99,
      redirectKeywords: ['anything'],
      desc: 'test'
    };
    const result = promptLabService.evaluateSingleAssertion(assertion, assistantTurns, null);
    expect(result.passed).toBe(false);
    expect(result.actual).toBe('[no response at turn]');
  });

  test('prompt_depth easy passes with specific questions', () => {
    const assertion = {
      type: 'prompt_depth',
      expectedDifficulty: 'easy',
      minSpecificQuestions: 2,
      desc: 'test'
    };
    const result = promptLabService.evaluateSingleAssertion(assertion, assistantTurns, null);
    expect(result.passed).toBe(true);
  });

  test('prompt_depth strict passes with few specific questions', () => {
    const assertion = {
      type: 'prompt_depth',
      expectedDifficulty: 'strict',
      maxSpecificQuestions: 1,
      desc: 'test'
    };
    const vagueTurns = [
      { turn: 3, content: 'Anything else?' },
      { turn: 4, content: 'And?' },
      { turn: 5, content: 'Right. Next.' }
    ];
    const result = promptLabService.evaluateSingleAssertion(assertion, vagueTurns, null);
    expect(result.passed).toBe(true);
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
    mock.mockResolvedValueOnce(
      '===SECTION_1===\nSection 1.\n===SECTION_2===\nSection 2.\n===SECTION_3===\nSection 3.\n===SECTION_4===\nSection 4.\n===SECTION_5===\nSection 5.\n===SECTION_6===\nSection 6.\n===JSON_SUMMARY===\n{"score":3,"overallImpression":"OK","clinicalKnowledge":{"diagnosis":"OK","management":"OK"},"strengths":["A"],"improvements":["B"],"summary":"OK"}'
    );

    const result = await promptLabService.runTest('fb_test', TOPIC_PATH, PROMPT_SECTIONS);
    expect(result.feedback).not.toBeNull();
    expect(result.feedback.sections).toHaveLength(6);
    expect(result.feedback.summary.score).toBe(3);
  });
});

// ──────────────────────────────────────────
// TRANSCRIPT CRUD
// ──────────────────────────────────────────

describe('PromptLabService - Transcript CRUD', () => {
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

  test('save, load, list, and delete transcript round-trip', () => {
    const sections = { core: 'Transcript test.', difficulty: 'Easy.', clinical: 'Case.' };
    const { sessionId } = promptLabService.createSession(sections, { difficulty: 'easy' });
    const session = promptLabService.getSession(sessionId);
    session.history.push(
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Welcome' }
    );

    // Save
    const transcriptId = promptLabService.saveManualTranscript(sessionId);
    createdIds.push(transcriptId);
    expect(transcriptId).toContain('manual');
    expect(fs.existsSync(path.join(TEST_RESULTS_DIR, `${transcriptId}.json`))).toBe(true);

    // Load
    const loaded = promptLabService.loadTranscript(transcriptId);
    expect(loaded.id).toBe(transcriptId);
    expect(loaded.type).toBe('manual');
    expect(loaded.history.some(m => m.content === 'Hello')).toBe(true);

    // List
    const transcripts = promptLabService.listTranscripts();
    const ours = transcripts.find(t => t.id === transcriptId);
    expect(ours).toBeDefined();
    expect(ours.type).toBe('manual');

    // Delete
    promptLabService.deleteTranscript(transcriptId);
    expect(fs.existsSync(path.join(TEST_RESULTS_DIR, `${transcriptId}.json`))).toBe(false);
    createdIds.length = 0; // Already deleted

    promptLabService.deleteSession(sessionId);
  });

  test('loadTranscript throws for non-existent ID', () => {
    expect(() => promptLabService.loadTranscript('nonexistent_fake_id_12345')).toThrow();
  });

  test('saveManualTranscript throws for non-existent session', () => {
    expect(() => promptLabService.saveManualTranscript('pl_nonexistent')).toThrow();
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
  });
});

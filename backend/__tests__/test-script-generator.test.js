/**
 * Tests for TestScriptGenerator
 * Covers pure functions (validation, extraction, caching) and mocks GPT for generation.
 */

const fs = require('fs');
const path = require('path');

// Mock OpenAI service before requiring the module
jest.mock('../src/services/OpenAIService', () => ({
  generateResponse: jest.fn()
}));

const openaiService = require('../src/services/OpenAIService');
const testScriptGenerator = require('../src/services/TestScriptGenerator');

const BACKEND_DIR = path.join(__dirname, '..');
const GENERATED_DIR = path.join(BACKEND_DIR, 'test-scripts', '_generated');

// ──────────────────────────────────────────
// CLEANUP
// ──────────────────────────────────────────

afterEach(() => {
  // Clean up any generated test files
  const testDir = path.join(GENERATED_DIR, '_test_topic');
  if (fs.existsSync(testDir)) {
    fs.readdirSync(testDir).forEach(f => fs.unlinkSync(path.join(testDir, f)));
    fs.rmdirSync(testDir);
  }
});

// ──────────────────────────────────────────
// EXPORTS
// ──────────────────────────────────────────

describe('TestScriptGenerator - Exports', () => {
  test('exports required functions', () => {
    expect(typeof testScriptGenerator.generateTestScript).toBe('function');
    expect(typeof testScriptGenerator.getCachedScript).toBe('function');
    expect(typeof testScriptGenerator.cacheScript).toBe('function');
    expect(typeof testScriptGenerator.clearCache).toBe('function');
    expect(typeof testScriptGenerator.hasRealContent).toBe('function');
    expect(typeof testScriptGenerator.validateGeneratedScript).toBe('function');
    expect(typeof testScriptGenerator.buildGenerationPrompt).toBe('function');
    expect(typeof testScriptGenerator.extractScenarioTitle).toBe('function');
  });

  test('GENERATABLE_TEST_TYPES is an array of 7 types', () => {
    expect(Array.isArray(testScriptGenerator.GENERATABLE_TEST_TYPES)).toBe(true);
    expect(testScriptGenerator.GENERATABLE_TEST_TYPES.length).toBe(7);
    expect(testScriptGenerator.GENERATABLE_TEST_TYPES).toContain('excellent_candidate');
    expect(testScriptGenerator.GENERATABLE_TEST_TYPES).toContain('poor_candidate');
    expect(testScriptGenerator.GENERATABLE_TEST_TYPES).toContain('derailing');
  });
});

// ──────────────────────────────────────────
// SCENARIO TITLE EXTRACTION
// ──────────────────────────────────────────

describe('TestScriptGenerator - extractScenarioTitle', () => {
  test('extracts title from standard format', () => {
    const section = 'SCENARIO TITLE\nNecrotising Fasciitis\n\nCASE INTRODUCTION\n...';
    expect(testScriptGenerator.extractScenarioTitle(section)).toBe('Necrotising Fasciitis');
  });

  test('extracts title with extra whitespace', () => {
    const section = 'SCENARIO TITLE\n  Burns Assessment  \n\nCASE INTRODUCTION\n...';
    expect(testScriptGenerator.extractScenarioTitle(section)).toBe('Burns Assessment');
  });

  test('returns null for missing title', () => {
    const section = 'CASE INTRODUCTION\nSome case...';
    expect(testScriptGenerator.extractScenarioTitle(section)).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(testScriptGenerator.extractScenarioTitle('')).toBeNull();
  });
});

// ──────────────────────────────────────────
// VALIDATION
// ──────────────────────────────────────────

describe('TestScriptGenerator - validateGeneratedScript', () => {
  test('accepts valid script', () => {
    const script = {
      name: 'Test',
      inputs: ['a', 'b', 'c'],
      assertions: [{ type: 'never_contains', value: 'x', desc: 'test' }],
      feedbackAssertions: []
    };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).not.toThrow();
  });

  test('rejects script without name', () => {
    const script = { inputs: ['a', 'b', 'c'], assertions: [] };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).toThrow('missing name');
  });

  test('rejects script with too few inputs', () => {
    const script = { name: 'Test', inputs: ['a'], assertions: [] };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).toThrow('too few inputs');
  });

  test('rejects script with no inputs array', () => {
    const script = { name: 'Test', assertions: [] };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).toThrow('too few inputs');
  });

  test('rejects script without assertions array', () => {
    const script = { name: 'Test', inputs: ['a', 'b', 'c'] };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).toThrow('no assertions');
  });

  test('rejects assertion without type', () => {
    const script = {
      name: 'Test',
      inputs: ['a', 'b', 'c'],
      assertions: [{ desc: 'test' }]
    };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).toThrow('missing type');
  });

  test('rejects assertion without desc', () => {
    const script = {
      name: 'Test',
      inputs: ['a', 'b', 'c'],
      assertions: [{ type: 'never_contains', value: 'x' }]
    };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).toThrow('missing desc');
  });

  test('validates feedbackAssertions too', () => {
    const script = {
      name: 'Test',
      inputs: ['a', 'b', 'c'],
      assertions: [{ type: 'never_contains', value: 'x', desc: 'ok' }],
      feedbackAssertions: [{ value: 'x' }]
    };
    expect(() => testScriptGenerator.validateGeneratedScript(script)).toThrow('missing type');
  });
});

// ──────────────────────────────────────────
// BUILD GENERATION PROMPT
// ──────────────────────────────────────────

describe('TestScriptGenerator - buildGenerationPrompt', () => {
  const clinicalSection = 'SCENARIO TITLE\nTest Case\n\nESSENTIAL MARKING POINTS\nDiagnosis: Test';
  const title = 'Test Case';

  test('builds prompt for excellent_candidate', () => {
    const prompt = testScriptGenerator.buildGenerationPrompt(
      'excellent_candidate',
      clinicalSection,
      title
    );
    expect(prompt).toContain('EXCELLENT');
    expect(prompt).toContain('score 4-5');
    expect(prompt).toContain(clinicalSection);
    expect(prompt).toContain(title);
  });

  test('builds prompt for good_candidate', () => {
    const prompt = testScriptGenerator.buildGenerationPrompt(
      'good_candidate',
      clinicalSection,
      title
    );
    expect(prompt).toContain('GOOD');
    expect(prompt).toContain('score 3-4');
  });

  test('builds prompt for poor_candidate', () => {
    const prompt = testScriptGenerator.buildGenerationPrompt(
      'poor_candidate',
      clinicalSection,
      title
    );
    expect(prompt).toContain('POOR');
    expect(prompt).toContain('score 0-1');
  });

  test('builds prompt for questioning', () => {
    const prompt = testScriptGenerator.buildGenerationPrompt('questioning', clinicalSection, title);
    expect(prompt).toContain('QUESTIONING');
    expect(prompt).toContain('reverses roles');
  });

  test('builds prompt for feedback_interrupt', () => {
    const prompt = testScriptGenerator.buildGenerationPrompt(
      'feedback_interrupt',
      clinicalSection,
      title
    );
    expect(prompt).toContain('FEEDBACK INTERRUPT');
    expect(prompt).toContain('re-engage');
  });

  test('still builds a valid base prompt for unknown type', () => {
    const prompt = testScriptGenerator.buildGenerationPrompt(
      'unknown_type',
      clinicalSection,
      title
    );
    // Base instructions are always present
    expect(prompt).toContain('test script generator');
    expect(prompt).toContain(clinicalSection);
    expect(prompt).toContain(title);
  });

  test('includes assertion type documentation', () => {
    const prompt = testScriptGenerator.buildGenerationPrompt(
      'excellent_candidate',
      clinicalSection,
      title
    );
    expect(prompt).toContain('contains_any');
    expect(prompt).toContain('never_contains');
    expect(prompt).toContain('score_range');
    expect(prompt).toContain('feedback_contains');
  });
});

// ──────────────────────────────────────────
// hasRealContent
// ──────────────────────────────────────────

describe('TestScriptGenerator - hasRealContent', () => {
  test('returns true for necrotising_fasciitis (has real content)', () => {
    expect(testScriptGenerator.hasRealContent('clinical/emergencies/necrotising_fasciitis')).toBe(
      true
    );
  });

  test('returns false for non-existent topic', () => {
    expect(testScriptGenerator.hasRealContent('fake/nonexistent/topic')).toBe(false);
  });

  test('returns false for invalid path', () => {
    expect(testScriptGenerator.hasRealContent('../../../etc/passwd')).toBe(false);
  });
});

// ──────────────────────────────────────────
// CACHING
// ──────────────────────────────────────────

describe('TestScriptGenerator - Caching', () => {
  const testTopic = 'clinical/emergencies/_test_topic';
  const testScript = {
    name: 'Cached Test',
    inputs: ['a', 'b', 'c'],
    assertions: [{ type: 'never_contains', value: 'x', desc: 'test' }]
  };

  test('getCachedScript returns null for non-existent cache', () => {
    expect(testScriptGenerator.getCachedScript(testTopic, 'excellent_candidate')).toBeNull();
  });

  test('cacheScript and getCachedScript round-trip', () => {
    testScriptGenerator.cacheScript(testTopic, 'excellent_candidate', testScript);
    const cached = testScriptGenerator.getCachedScript(testTopic, 'excellent_candidate');
    expect(cached).not.toBeNull();
    expect(cached.name).toBe('Cached Test');
    expect(cached._cachedAt).toBeDefined();
    expect(cached._generatedFor).toBe(testTopic);
  });

  test('clearCache removes cached scripts', () => {
    testScriptGenerator.cacheScript(testTopic, 'poor_candidate', testScript);
    expect(testScriptGenerator.getCachedScript(testTopic, 'poor_candidate')).not.toBeNull();

    testScriptGenerator.clearCache(testTopic);
    expect(testScriptGenerator.getCachedScript(testTopic, 'poor_candidate')).toBeNull();
  });

  test('clearCache handles non-existent directory', () => {
    expect(() => testScriptGenerator.clearCache('fake/nonexistent/topic')).not.toThrow();
  });
});

// ──────────────────────────────────────────
// GENERATION (with mocked GPT)
// ──────────────────────────────────────────

describe('TestScriptGenerator - generateTestScript', () => {
  test('generates a valid test script from GPT response', async () => {
    const mockScript = {
      name: 'Excellent Candidate - Necrotising Fasciitis',
      description: 'Tests an excellent candidate',
      difficulty: 'easy',
      inputs: [
        'Good morning. Yes, I am ready.',
        'This is a surgical emergency. I would begin with A B C D E.',
        'I would request blood tests including lactate.',
        'Urgent surgical debridement is required.'
      ],
      assertions: [{ type: 'never_contains', value: 'you should', desc: 'AI does not teach' }],
      triggerFeedback: true,
      feedbackAssertions: [{ type: 'score_range', min: 4, max: 5, desc: 'Excellent score' }]
    };

    openaiService.generateResponse.mockResolvedValue(JSON.stringify(mockScript));

    const result = await testScriptGenerator.generateTestScript(
      'excellent_candidate',
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );

    expect(result.name).toBe(mockScript.name);
    expect(result.inputs.length).toBe(4);
    // Universal assertions should be injected
    const greetAssertion = result.assertions.find(a => a.desc === 'AI greets the candidate');
    expect(greetAssertion).toBeDefined();
    const neverAI = result.assertions.find(a => a.value === "I'm an AI");
    expect(neverAI).toBeDefined();
    // Feedback universal assertions
    const sectionCount = result.feedbackAssertions.find(a => a.type === 'section_count');
    expect(sectionCount).toBeDefined();
  });

  test('handles GPT response with markdown fences', async () => {
    const mockScript = {
      name: 'Good Candidate - Test',
      inputs: ['Ready.', 'I would assess.', 'Treatment approach.'],
      assertions: [{ type: 'never_contains', value: 'test', desc: 'test' }],
      triggerFeedback: false,
      feedbackAssertions: []
    };

    openaiService.generateResponse.mockResolvedValue(
      '```json\n' + JSON.stringify(mockScript) + '\n```'
    );

    const result = await testScriptGenerator.generateTestScript(
      'good_candidate',
      'clinical/emergencies/necrotising_fasciitis',
      'easy'
    );

    expect(result.name).toBe(mockScript.name);
  });

  test('throws for non-existent prompt file', async () => {
    await expect(
      testScriptGenerator.generateTestScript('excellent_candidate', 'fake/nonexistent/topic')
    ).rejects.toThrow('Prompt file not found');
  });

  test('throws when GPT returns invalid JSON', async () => {
    openaiService.generateResponse.mockResolvedValue('This is not valid JSON at all');

    await expect(
      testScriptGenerator.generateTestScript(
        'excellent_candidate',
        'clinical/emergencies/necrotising_fasciitis'
      )
    ).rejects.toThrow('invalid JSON');
  });
});

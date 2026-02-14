/**
 * Prompt Lab Service Tests
 * Tests topic discovery, path validation, prompt file operations,
 * feedback fallback chain, modified file tracking, and test script listing.
 */

const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key';

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
    const invalidTopics = topics.filter(t =>
      t.path.startsWith('feedback/') ||
      t.path.startsWith('system/') ||
      t.path.startsWith('test/')
    );
    expect(invalidTopics).toHaveLength(0);
  });

  test('results are sorted by group then label', () => {
    for (let i = 0; i < topics.length - 1; i++) {
      const cmp = topics[i].group.localeCompare(topics[i + 1].group);
      if (cmp === 0) {
        expect(topics[i].label.localeCompare(topics[i + 1].label)).toBeLessThanOrEqual(0);
      } else {
        expect(cmp).toBeLessThan(0);
      }
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
    const result = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    expect(result).toHaveProperty('raw');
    expect(result).toHaveProperty('sections');
    expect(result).toHaveProperty('path');
    expect(typeof result.raw).toBe('string');
    expect(result.raw.length).toBeGreaterThan(100);
  });

  test('sections contain core, difficulty, and clinical keys', () => {
    const result = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    expect(result.sections).toHaveProperty('core');
    expect(result.sections).toHaveProperty('difficulty');
    expect(result.sections).toHaveProperty('clinical');
    expect(result.sections.core.length).toBeGreaterThan(0);
    expect(result.sections.difficulty.length).toBeGreaterThan(0);
    expect(result.sections.clinical.length).toBeGreaterThan(0);
  });

  test('path contains correct filename pattern', () => {
    const result = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'medium');
    expect(result.path).toContain('medium_clinical_necrotising_fasciitis_1.txt');
  });

  test('throws for non-existent topic', () => {
    expect(() => {
      promptLabService.loadPrompt('clinical/emergencies/fake_topic', 'easy');
    }).toThrow(/Prompt not found/);
  });

  test('loads different content for different difficulties', () => {
    const easy = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    const medium = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'medium');
    expect(easy.sections.difficulty).not.toBe(medium.sections.difficulty);
  });
});

// ──────────────────────────────────────────
// FEEDBACK PROMPTS
// ──────────────────────────────────────────

describe('PromptLabService - Feedback Prompts', () => {
  test('loads difficulty-specific feedback prompt for nec fasc', () => {
    const result = promptLabService.loadFeedbackPromptFile(
      'clinical/emergencies/necrotising_fasciitis', 'easy'
    );
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('path');
    expect(result.content.length).toBeGreaterThan(100);
    expect(result.path).toContain('easy_clinical_necrotising_fasciitis_feedback.txt');
  });

  test('returns content and path as strings', () => {
    const result = promptLabService.loadFeedbackPromptFile(
      'clinical/emergencies/necrotising_fasciitis', 'easy'
    );
    expect(typeof result.content).toBe('string');
    expect(typeof result.path).toBe('string');
  });

  test('falls back to generic feedback for topic without specific feedback', () => {
    // Find a topic that exists but has no dedicated feedback prompt
    const topics = promptLabService.listTopics();
    const nonNecFasc = topics.find(t => !t.path.includes('necrotising_fasciitis'));
    if (nonNecFasc) {
      const result = promptLabService.loadFeedbackPromptFile(nonNecFasc.path, 'easy');
      expect(result.content.length).toBeGreaterThan(0);
      // Should fall back to generic
      expect(result.path).toContain('generic_feedback.txt');
    }
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
    const original = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    promptLabService.savePrompt('clinical/emergencies/necrotising_fasciitis', 'easy', original.sections);

    expect(promptLabService.getModifiedFiles().length).toBeGreaterThan(0);
    promptLabService.clearModifiedFiles();
    expect(promptLabService.getModifiedFiles().length).toBe(0);
  });

  test('savePrompt adds file to modifiedFiles', () => {
    const original = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    promptLabService.savePrompt('clinical/emergencies/necrotising_fasciitis', 'easy', original.sections);

    const files = promptLabService.getModifiedFiles();
    expect(files.length).toBe(1);
    expect(files[0]).toContain('prompts');
    expect(files[0]).toContain('necrotising_fasciitis');
  });

  test('no duplicates when saving same file twice', () => {
    const original = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    promptLabService.savePrompt('clinical/emergencies/necrotising_fasciitis', 'easy', original.sections);
    promptLabService.savePrompt('clinical/emergencies/necrotising_fasciitis', 'easy', original.sections);

    const files = promptLabService.getModifiedFiles();
    expect(files.length).toBe(1);
  });

  test('tracks multiple different files', () => {
    const easy = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'easy');
    const medium = promptLabService.loadPrompt('clinical/emergencies/necrotising_fasciitis', 'medium');
    promptLabService.savePrompt('clinical/emergencies/necrotising_fasciitis', 'easy', easy.sections);
    promptLabService.savePrompt('clinical/emergencies/necrotising_fasciitis', 'medium', medium.sections);

    const files = promptLabService.getModifiedFiles();
    expect(files.length).toBe(2);
  });

  test('saveFeedbackPrompt adds to modifiedFiles', () => {
    // Read original, save it back (no content change), check tracking
    const original = promptLabService.loadFeedbackPromptFile(
      'clinical/emergencies/necrotising_fasciitis', 'easy'
    );
    promptLabService.saveFeedbackPrompt(
      'clinical/emergencies/necrotising_fasciitis', 'easy', original.content
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
    expect(firstTest.inputCount).toBeGreaterThan(0);
  });

  test('includes good_candidate test', () => {
    const tests = promptLabService.listTestScripts('necrotising_fasciitis');
    const goodTest = tests.find(t => t.id === 'good_candidate');
    expect(goodTest).toBeDefined();
  });

  test('returns empty array for unknown topic', () => {
    const tests = promptLabService.listTestScripts('fake_nonexistent_topic');
    expect(Array.isArray(tests)).toBe(true);
    expect(tests.length).toBe(0);
  });

  test('returns empty array for null input', () => {
    const tests = promptLabService.listTestScripts(null);
    expect(tests).toEqual([]);
  });

  test('returns empty array for empty string', () => {
    const tests = promptLabService.listTestScripts('');
    expect(tests).toEqual([]);
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

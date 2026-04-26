/**
 * Prompt Assembler Tests
 * Tests modular prompt assembly.
 */

const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-key';

const {
  buildInterviewPrompt,
  buildFeedbackPrompt,
  extractDomain,
  validateInputs,
  resolveScenarioPath,
  PROMPTS_DIR,
  VALID_DOMAINS,
  VALID_DIFFICULTIES
} = require('../src/utils/promptAssembler');

describe('extractDomain', () => {
  test('extracts clinical domain', () => {
    expect(extractDomain('clinical/emergencies/necrotising_fasciitis')).toBe('clinical');
  });

  test('extracts call_the_boss domain', () => {
    expect(extractDomain('call_the_boss/scenarios/major_burn')).toBe('call_the_boss');
  });

  test('extracts consent domain', () => {
    expect(extractDomain('consent/hand_surgery/carpal_tunnel_release_consent')).toBe('consent');
  });

  test('extracts structured_interview domain', () => {
    expect(extractDomain('structured_interview/audit/focused_interview')).toBe(
      'structured_interview'
    );
  });

  test('defaults to clinical for unknown domain', () => {
    expect(extractDomain('unknown/something/else')).toBe('clinical');
  });

  test('handles single segment path', () => {
    expect(extractDomain('clinical')).toBe('clinical');
  });
});

describe('validateInputs', () => {
  test('accepts valid difficulty and topicFolder', () => {
    expect(() => validateInputs('easy', 'clinical/emergencies/nec_fasc')).not.toThrow();
    expect(() => validateInputs('medium', 'consent/hand/carpal')).not.toThrow();
    expect(() => validateInputs('strict', 'structured_interview/audit/focused')).not.toThrow();
  });

  test('rejects invalid difficulty', () => {
    expect(() => validateInputs('hard', 'clinical/test')).toThrow('Invalid difficulty');
    expect(() => validateInputs('', 'clinical/test')).toThrow('Invalid difficulty');
  });

  test('rejects empty topicFolder', () => {
    expect(() => validateInputs('easy', '')).toThrow('topicFolder is required');
    expect(() => validateInputs('easy', null)).toThrow('topicFolder is required');
    expect(() => validateInputs('easy', undefined)).toThrow('topicFolder is required');
  });

  test('rejects path traversal', () => {
    expect(() => validateInputs('easy', '../../../etc/passwd')).toThrow('Invalid topicFolder path');
    expect(() => validateInputs('easy', 'clinical/../../etc/passwd')).toThrow(
      'Invalid topicFolder path'
    );
  });

  test('rejects absolute paths', () => {
    expect(() => validateInputs('easy', '/etc/passwd')).toThrow('Invalid topicFolder path');
  });
});

describe('resolveScenarioPath', () => {
  test('resolves to scenarios/{topicFolder}/{topicName}_1.txt by default', () => {
    const result = resolveScenarioPath('clinical/emergencies/necrotising_fasciitis');
    expect(result).toBe(
      path.join(
        PROMPTS_DIR,
        'scenarios/clinical/emergencies/necrotising_fasciitis/necrotising_fasciitis_1.txt'
      )
    );
  });

  test('resolves with explicit variant number', () => {
    const result = resolveScenarioPath('clinical/emergencies/necrotising_fasciitis', 2);
    expect(result).toBe(
      path.join(
        PROMPTS_DIR,
        'scenarios/clinical/emergencies/necrotising_fasciitis/necrotising_fasciitis_2.txt'
      )
    );
  });
});

describe('buildInterviewPrompt - modular assembly', () => {
  const sharedInterviewDir = path.join(PROMPTS_DIR, 'shared/interview');
  const scenarioDir = path.join(
    PROMPTS_DIR,
    'scenarios/clinical/emergencies/necrotising_fasciitis'
  );

  test('assembles modular prompt when all 3 files exist', () => {
    // Skip if modular files not yet created
    const coreFile = path.join(sharedInterviewDir, 'core_clinical_interview.txt');
    const personalityFile = path.join(sharedInterviewDir, 'easy_interview_personality.txt');
    const clinicalFile = path.join(scenarioDir, 'necrotising_fasciitis_1.txt');

    if (
      !fs.existsSync(coreFile) ||
      !fs.existsSync(personalityFile) ||
      !fs.existsSync(clinicalFile)
    ) {
      console.log('Skipping modular assembly test - files not yet created');
      return;
    }

    const prompt = buildInterviewPrompt('easy', 'clinical/emergencies/necrotising_fasciitis');
    expect(prompt.length).toBeGreaterThan(100);
    // Should contain content from all 3 files
    expect(prompt).toContain('CORE SPEAKING RULES');
    expect(prompt).toContain('John');
    expect(prompt).toContain('Necrotising Fasciitis');
  });

  test('falls back to legacy when modular files missing', () => {
    // Use a non-existent topic to trigger legacy fallback path
    const prompt = buildInterviewPrompt('easy', 'clinical/nonexistent/fake_topic');
    expect(prompt).toContain('Plastic Surgery');
  });

  test('rejects invalid difficulty', () => {
    expect(() => buildInterviewPrompt('hard', 'clinical/emergencies/nec_fasc')).toThrow(
      'Invalid difficulty'
    );
  });

  test('rejects path traversal', () => {
    expect(() => buildInterviewPrompt('easy', '../../etc/passwd')).toThrow(
      'Invalid topicFolder path'
    );
  });
});

describe('buildFeedbackPrompt - modular assembly', () => {
  const sharedFeedbackDir = path.join(PROMPTS_DIR, 'shared/feedback');
  const scenarioDir = path.join(
    PROMPTS_DIR,
    'scenarios/clinical/emergencies/necrotising_fasciitis'
  );

  test('assembles modular feedback when all 3 files exist', () => {
    const coreFile = path.join(sharedFeedbackDir, 'core_clinical_feedback.txt');
    const personalityFile = path.join(sharedFeedbackDir, 'easy_feedback_personality.txt');
    const clinicalFile = path.join(scenarioDir, 'necrotising_fasciitis_1.txt');

    if (
      !fs.existsSync(coreFile) ||
      !fs.existsSync(personalityFile) ||
      !fs.existsSync(clinicalFile)
    ) {
      console.log('Skipping modular feedback test - files not yet created');
      return;
    }

    const prompt = buildFeedbackPrompt('easy', 'clinical/emergencies/necrotising_fasciitis');
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('plastic surgery');
    expect(prompt).toContain('Necrotising Fasciitis');
  });

  test('falls back to legacy feedback file', () => {
    // Use a non-existent topic to trigger legacy fallback path
    const prompt = buildFeedbackPrompt('easy', 'clinical/nonexistent/fake_topic');
    expect(prompt).toContain('plastic surgery');
    expect(prompt.length).toBeGreaterThan(50);
  });
});

describe('Constants', () => {
  test('VALID_DOMAINS contains all 4 domains', () => {
    expect(VALID_DOMAINS).toEqual(['clinical', 'call_the_boss', 'consent', 'structured_interview']);
  });

  test('VALID_DIFFICULTIES contains all 3 difficulties', () => {
    expect(VALID_DIFFICULTIES).toEqual(['easy', 'medium', 'strict']);
  });

  test('PROMPTS_DIR points to backend/prompts', () => {
    expect(PROMPTS_DIR).toContain('prompts');
    expect(fs.existsSync(PROMPTS_DIR)).toBe(true);
  });
});

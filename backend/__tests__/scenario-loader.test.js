/**
 * Scenario Loader Tests
 * Tests loadScenarioPrompt with real file system operations
 * and validates the prompts directory structure
 */

const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key';

const { loadScenarioPrompt } = require('../src/utils/scenarioLoader');

const promptsDir = path.join(__dirname, '..', 'prompts');

describe('loadScenarioPrompt - real file loading', () => {
  test('loads a valid scenario file and returns non-empty content', () => {
    const prompt = loadScenarioPrompt(
      'prompts/clinical/emergencies/necrotising_fasciitis/easy_clinical_necrotising_fasciitis_1.txt'
    );
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('SECTION');
  });

  test('blocks path traversal attack (../../etc/passwd)', () => {
    const prompt = loadScenarioPrompt('../../../etc/passwd');
    // Path traversal is caught; fallback template returned
    expect(prompt).toContain('Plastic Surgery');
  });

  test('blocks path traversal with Windows-style separators', () => {
    const prompt = loadScenarioPrompt('..\\..\\..\\windows\\system32\\config');
    expect(prompt).toContain('Plastic Surgery');
  });

  test('returns fallback for non-existent scenario file', () => {
    const prompt = loadScenarioPrompt('prompts/nonexistent/fake_scenario.txt');
    expect(prompt).toContain('Plastic Surgery');
  });

  test('loads scenario from deeply nested path', () => {
    const prompt = loadScenarioPrompt(
      'prompts/consent/hand_surgery/carpal_tunnel_release_consent/easy_consent_carpal_tunnel_release_consent_1.txt'
    );
    expect(prompt.length).toBeGreaterThan(50);
  });
});

describe('Prompts directory structure', () => {
  test('prompts directory exists', () => {
    expect(fs.existsSync(promptsDir)).toBe(true);
  });

  test('main category folders exist', () => {
    expect(fs.existsSync(path.join(promptsDir, 'clinical'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'call_the_boss'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'consent'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'structured_interview'))).toBe(true);
  });

  test('clinical subheadings exist', () => {
    const clinicalDir = path.join(promptsDir, 'clinical');
    const expectedSubheadings = [
      'breast_and_aesthetic',
      'burns',
      'elective_hand',
      'emergencies',
      'hand_trauma',
      'lower_limb',
      'skin_cancer',
      'head_and_neck',
      'congenital',
      'microsurgery'
    ];

    expectedSubheadings.forEach(subheading => {
      expect(fs.existsSync(path.join(clinicalDir, subheading))).toBe(true);
    });
  });

  test('prompt files contain content with expected structure', () => {
    const filePath = path.join(
      promptsDir,
      'clinical',
      'emergencies',
      'necrotising_fasciitis',
      'easy_clinical_necrotising_fasciitis_1.txt'
    );
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content.length).toBeGreaterThan(100);
    expect(content).toContain('SECTION 1');
  });

  test('clinical directory contains multiple prompt files', () => {
    const clinicalDir = path.join(promptsDir, 'clinical');
    let totalFiles = 0;

    const subheadings = fs.readdirSync(clinicalDir);
    subheadings.forEach(subheading => {
      const subheadingPath = path.join(clinicalDir, subheading);
      if (fs.statSync(subheadingPath).isDirectory()) {
        const topics = fs.readdirSync(subheadingPath);
        topics.forEach(topic => {
          const topicPath = path.join(subheadingPath, topic);
          if (fs.statSync(topicPath).isDirectory()) {
            const files = fs.readdirSync(topicPath).filter(f => f.endsWith('.txt'));
            totalFiles += files.length;
          }
        });
      }
    });

    expect(totalFiles).toBeGreaterThan(0);
  });
});

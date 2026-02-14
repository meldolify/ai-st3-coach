/**
 * Prompt Parser Tests
 * Tests parsePromptSections and combinePromptSections for the 3-section prompt format.
 */

const fs = require('fs');
const path = require('path');

const {
  parsePromptSections,
  combinePromptSections,
  SECTION_HEADERS
} = require('../src/utils/promptParser');

// Real prompt file for integration-style tests
const realPromptPath = path.join(
  __dirname,
  '..',
  'prompts',
  'test',
  'clinical',
  'emergencies',
  'necrotising_fasciitis',
  'easy_clinical_necrotising_fasciitis_1.txt'
);

// Helper: build a well-formed 3-section prompt string
function buildPrompt(core, difficulty, clinical) {
  return [
    'SECTION 1',
    'REALTIME CORE BEHAVIOURS',
    '',
    core,
    '',
    'SECTION 2',
    'DIFFICULTY AND PERSONALITY LAYER',
    '',
    difficulty,
    '',
    'SECTION 3',
    'CLINICAL SCENARIO BLOCK',
    '',
    clinical
  ].join('\n');
}

// ---------------------------------------------------------------------------
// parsePromptSections
// ---------------------------------------------------------------------------
describe('parsePromptSections', () => {
  test('parses a valid 3-section prompt into {core, difficulty, clinical}', () => {
    const text = buildPrompt('Core content here', 'Difficulty content', 'Clinical content');
    const result = parsePromptSections(text);

    expect(result).toHaveProperty('core');
    expect(result).toHaveProperty('difficulty');
    expect(result).toHaveProperty('clinical');
  });

  test('each section contains the correct trimmed content', () => {
    const text = buildPrompt('Core content here', 'Difficulty content', 'Clinical content');
    const result = parsePromptSections(text);

    expect(result.core).toBe('Core content here');
    expect(result.difficulty).toBe('Difficulty content');
    expect(result.clinical).toBe('Clinical content');
  });

  test('section headers (SECTION 1/2/3 + subheaders) are stripped from output', () => {
    const text = buildPrompt('Core body', 'Diff body', 'Clin body');
    const result = parsePromptSections(text);

    expect(result.core).not.toContain('SECTION 1');
    expect(result.core).not.toContain('REALTIME CORE BEHAVIOURS');
    expect(result.difficulty).not.toContain('SECTION 2');
    expect(result.difficulty).not.toContain('DIFFICULTY AND PERSONALITY LAYER');
    expect(result.clinical).not.toContain('SECTION 3');
    expect(result.clinical).not.toContain('CLINICAL SCENARIO BLOCK');
  });

  test('handles extra whitespace between sections', () => {
    const text = [
      'SECTION 1',
      'REALTIME CORE BEHAVIOURS',
      '',
      '',
      '  Core content  ',
      '',
      '',
      '',
      'SECTION 2',
      'DIFFICULTY AND PERSONALITY LAYER',
      '',
      '  Diff content  ',
      '',
      '',
      'SECTION 3',
      'CLINICAL SCENARIO BLOCK',
      '',
      '  Clin content  '
    ].join('\n');

    const result = parsePromptSections(text);
    expect(result.core).toBe('Core content');
    expect(result.difficulty).toBe('Diff content');
    expect(result.clinical).toBe('Clin content');
  });

  test('returns empty string for missing section 2', () => {
    const text = [
      'SECTION 1',
      'REALTIME CORE BEHAVIOURS',
      '',
      'Core only',
      '',
      'SECTION 3',
      'CLINICAL SCENARIO BLOCK',
      '',
      'Clinical only'
    ].join('\n');

    const result = parsePromptSections(text);
    expect(result.core).toBe('Core only');
    expect(result.difficulty).toBe('');
    expect(result.clinical).toBe('Clinical only');
  });

  test('returns empty string for missing section 3', () => {
    const text = [
      'SECTION 1',
      'REALTIME CORE BEHAVIOURS',
      '',
      'Core only',
      '',
      'SECTION 2',
      'DIFFICULTY AND PERSONALITY LAYER',
      '',
      'Diff only'
    ].join('\n');

    const result = parsePromptSections(text);
    expect(result.core).toBe('Core only');
    expect(result.difficulty).toBe('Diff only');
    expect(result.clinical).toBe('');
  });

  test('prompt with no section markers returns all empty sections', () => {
    const text = 'This is just plain text with no section markers at all.';
    const result = parsePromptSections(text);

    expect(result.core).toBe('');
    expect(result.difficulty).toBe('');
    expect(result.clinical).toBe('');
  });

  test('empty string input returns empty sections', () => {
    const result = parsePromptSections('');
    expect(result).toEqual({ core: '', difficulty: '', clinical: '' });
  });

  test('null input returns empty sections', () => {
    const result = parsePromptSections(null);
    expect(result).toEqual({ core: '', difficulty: '', clinical: '' });
  });

  test('undefined input returns empty sections', () => {
    const result = parsePromptSections(undefined);
    expect(result).toEqual({ core: '', difficulty: '', clinical: '' });
  });

  test('non-string input returns empty sections', () => {
    expect(parsePromptSections(42)).toEqual({ core: '', difficulty: '', clinical: '' });
    expect(parsePromptSections({})).toEqual({ core: '', difficulty: '', clinical: '' });
    expect(parsePromptSections([])).toEqual({ core: '', difficulty: '', clinical: '' });
  });

  test('word "SECTION" in content body does not cause mis-split when not at line start with number', () => {
    const text = buildPrompt(
      'The SECTION of the wound was examined carefully.',
      'This section discusses difficulty.',
      'Clinical section notes.'
    );
    const result = parsePromptSections(text);

    // "SECTION" without a number at line start should not split
    expect(result.core).toContain('SECTION of the wound');
    expect(result.difficulty).toContain('section discusses difficulty');
    expect(result.clinical).toContain('Clinical section notes');
  });

  test('handles very long prompt (10,000+ chars)', () => {
    const longText = 'A'.repeat(5000);
    const text = buildPrompt(longText, longText, longText);
    const result = parsePromptSections(text);

    expect(result.core.length).toBe(5000);
    expect(result.difficulty.length).toBe(5000);
    expect(result.clinical.length).toBe(5000);
  });

  test('handles unicode and special characters', () => {
    const text = buildPrompt(
      'Patient presented with 40°C fever — critical condition',
      'Examiner: "très sévère" approach, £50 cost',
      'Clinical: résumé of findings… emoji test'
    );
    const result = parsePromptSections(text);

    expect(result.core).toContain('40°C');
    expect(result.core).toContain('—');
    expect(result.difficulty).toContain('très sévère');
    expect(result.difficulty).toContain('£50');
    expect(result.clinical).toContain('résumé');
    expect(result.clinical).toContain('…');
  });

  test('handles Windows line endings (\\r\\n)', () => {
    const text = [
      'SECTION 1',
      'REALTIME CORE BEHAVIOURS',
      '',
      'Core with CRLF',
      '',
      'SECTION 2',
      'DIFFICULTY AND PERSONALITY LAYER',
      '',
      'Diff with CRLF',
      '',
      'SECTION 3',
      'CLINICAL SCENARIO BLOCK',
      '',
      'Clin with CRLF'
    ].join('\r\n');

    const result = parsePromptSections(text);
    expect(result.core).toContain('Core with CRLF');
    expect(result.difficulty).toContain('Diff with CRLF');
    expect(result.clinical).toContain('Clin with CRLF');
  });

  test('split regex is case-sensitive but per-section matching is case-insensitive', () => {
    // The split regex /^(?=SECTION\s+\d)/m only splits on uppercase "SECTION".
    // However, the per-section regex tests (/^SECTION\s+1\b/i) use the /i flag.
    // So "section 1" (lowercase) at the start of text will be in the first part,
    // and the /i match will still assign it to core.
    // But a mid-text lowercase "section 2" will NOT cause a split boundary.
    const text = [
      'section 1',
      'realtime core behaviours',
      '',
      'Core content',
      '',
      'SECTION 2',
      'DIFFICULTY AND PERSONALITY LAYER',
      '',
      'Diff content',
      '',
      'SECTION 3',
      'CLINICAL SCENARIO BLOCK',
      '',
      'Clin content'
    ].join('\n');

    const result = parsePromptSections(text);
    // "section 1" is the start of the text and goes into the first split part.
    // The /i regex matches it to core, and strips the header.
    expect(result.core).toBe('Core content');
    // SECTION 2 and 3 (uppercase) are correctly split and parsed
    expect(result.difficulty).toBe('Diff content');
    expect(result.clinical).toBe('Clin content');
  });

  // Integration test: parse a real prompt file
  test('parses a real scenario prompt file correctly', () => {
    const fileExists = fs.existsSync(realPromptPath);
    if (!fileExists) {
      // Skip gracefully if test prompt not present
      console.warn('Skipping real file test — prompt file not found at', realPromptPath);
      return;
    }

    const text = fs.readFileSync(realPromptPath, 'utf-8');
    const result = parsePromptSections(text);

    // Core section should contain interviewer rules
    expect(result.core).toContain('consultant plastic surgeon');
    expect(result.core).toContain('CORE SPEAKING RULES');

    // Difficulty section should name an examiner
    expect(result.difficulty).toContain('John');

    // Clinical section should contain the scenario
    expect(result.clinical).toContain('Necrotising Fasciitis');
    expect(result.clinical).toContain('ESSENTIAL MARKING POINTS');
  });
});

// ---------------------------------------------------------------------------
// combinePromptSections
// ---------------------------------------------------------------------------
describe('combinePromptSections', () => {
  test('combines 3 sections with correct headers', () => {
    const combined = combinePromptSections({
      core: 'Core text',
      difficulty: 'Diff text',
      clinical: 'Clin text'
    });

    expect(combined).toContain(SECTION_HEADERS.core);
    expect(combined).toContain(SECTION_HEADERS.difficulty);
    expect(combined).toContain(SECTION_HEADERS.clinical);
    expect(combined).toContain('Core text');
    expect(combined).toContain('Diff text');
    expect(combined).toContain('Clin text');
  });

  test('sections appear in order: core, difficulty, clinical', () => {
    const combined = combinePromptSections({
      core: 'AAA',
      difficulty: 'BBB',
      clinical: 'CCC'
    });

    const coreIdx = combined.indexOf('AAA');
    const diffIdx = combined.indexOf('BBB');
    const clinIdx = combined.indexOf('CCC');

    expect(coreIdx).toBeLessThan(diffIdx);
    expect(diffIdx).toBeLessThan(clinIdx);
  });

  test('roundtrip: parse -> combine -> parse produces same sections', () => {
    const original = buildPrompt(
      'Core content for roundtrip',
      'Difficulty content for roundtrip',
      'Clinical content for roundtrip'
    );

    const parsed = parsePromptSections(original);
    const combined = combinePromptSections(parsed);
    const reparsed = parsePromptSections(combined);

    expect(reparsed.core).toBe(parsed.core);
    expect(reparsed.difficulty).toBe(parsed.difficulty);
    expect(reparsed.clinical).toBe(parsed.clinical);
  });

  test('handles empty sections', () => {
    const combined = combinePromptSections({
      core: '',
      difficulty: '',
      clinical: ''
    });

    expect(combined).toContain(SECTION_HEADERS.core);
    expect(combined).toContain(SECTION_HEADERS.difficulty);
    expect(combined).toContain(SECTION_HEADERS.clinical);
  });

  test('handles null/undefined section values with defaults', () => {
    const combined = combinePromptSections({
      core: null,
      difficulty: undefined
    });

    // Should not throw; missing keys default to ''
    expect(combined).toContain(SECTION_HEADERS.core);
    expect(combined).toContain(SECTION_HEADERS.difficulty);
    expect(combined).toContain(SECTION_HEADERS.clinical);
  });

  test('handles empty object input', () => {
    const combined = combinePromptSections({});
    expect(combined).toContain(SECTION_HEADERS.core);
    expect(combined).toContain(SECTION_HEADERS.difficulty);
    expect(combined).toContain(SECTION_HEADERS.clinical);
  });

  test('preserves section content exactly (no trimming of internal whitespace)', () => {
    const coreContent = '  Leading spaces\n  and indentation preserved  ';
    const combined = combinePromptSections({
      core: coreContent,
      difficulty: 'diff',
      clinical: 'clin'
    });

    expect(combined).toContain(coreContent);
  });

  // Integration: roundtrip with real file
  test('roundtrip with real scenario file preserves content', () => {
    const fileExists = fs.existsSync(realPromptPath);
    if (!fileExists) {
      console.warn('Skipping real file roundtrip — prompt file not found');
      return;
    }

    const text = fs.readFileSync(realPromptPath, 'utf-8');
    const parsed = parsePromptSections(text);
    const combined = combinePromptSections(parsed);
    const reparsed = parsePromptSections(combined);

    expect(reparsed.core).toBe(parsed.core);
    expect(reparsed.difficulty).toBe(parsed.difficulty);
    expect(reparsed.clinical).toBe(parsed.clinical);
  });
});

// ---------------------------------------------------------------------------
// SECTION_HEADERS constant
// ---------------------------------------------------------------------------
describe('SECTION_HEADERS', () => {
  test('exports correct header strings', () => {
    expect(SECTION_HEADERS.core).toBe('SECTION 1\nREALTIME CORE BEHAVIOURS');
    expect(SECTION_HEADERS.difficulty).toBe('SECTION 2\nDIFFICULTY AND PERSONALITY LAYER');
    expect(SECTION_HEADERS.clinical).toBe('SECTION 3\nCLINICAL SCENARIO BLOCK');
  });
});

/**
 * VAD (Voice Activity Detection) Logic Tests
 * Tests isNoiseTranscript edge cases not covered by audioHelpers.test.js
 * Focuses on boundary cases, mixed content, and unusual inputs
 */

process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';

const { isNoiseTranscript, buildNaturalSSML } = require('../src/utils/audioHelpers');

describe('isNoiseTranscript - boundary cases', () => {
  test('returns true for exactly 1 character (below 2-char threshold)', () => {
    expect(isNoiseTranscript('x')).toBe(true);
  });

  test('returns false for exactly 2 meaningful characters', () => {
    // "hi" is 2 chars but doesn't match any noise pattern
    expect(isNoiseTranscript('hi')).toBe(false);
  });

  test('returns true for filler sounds with trailing period', () => {
    expect(isNoiseTranscript('um.')).toBe(true);
    expect(isNoiseTranscript('uh.')).toBe(true);
    expect(isNoiseTranscript('er.')).toBe(true);
  });

  test('returns true for case-insensitive filler sounds', () => {
    expect(isNoiseTranscript('UM')).toBe(true);
    expect(isNoiseTranscript('Uh')).toBe(true);
    expect(isNoiseTranscript('ER')).toBe(true);
    expect(isNoiseTranscript('AH')).toBe(true);
  });

  test('returns true for extended filler sounds', () => {
    expect(isNoiseTranscript('ummm')).toBe(true);
    expect(isNoiseTranscript('uhhh')).toBe(true);
    expect(isNoiseTranscript('errr')).toBe(true);
  });

  test('returns true for text with no letters at all', () => {
    expect(isNoiseTranscript('123')).toBe(true);
    expect(isNoiseTranscript('!@#$')).toBe(true);
    expect(isNoiseTranscript('   ')).toBe(true);
  });

  test('returns false for text mixing numbers and letters', () => {
    expect(isNoiseTranscript('The patient is 45 years old')).toBe(false);
    expect(isNoiseTranscript('Give 2mg of morphine')).toBe(false);
  });

  test('returns true for repeated single letter patterns', () => {
    expect(isNoiseTranscript('aaa')).toBe(true);
    expect(isNoiseTranscript('bbb')).toBe(true);
    expect(isNoiseTranscript('zzz')).toBe(true);
  });

  test('returns true for spaced single letter patterns', () => {
    expect(isNoiseTranscript('a b c')).toBe(true);
    expect(isNoiseTranscript('s s s')).toBe(true);
  });

  test('returns false for legitimate multi-word text', () => {
    expect(isNoiseTranscript('I would examine the wound')).toBe(false);
    expect(isNoiseTranscript('Can you tell me more about the history')).toBe(false);
    expect(isNoiseTranscript('The flap is well perfused')).toBe(false);
  });

  test('returns true for Thanks and Thank you (echo pickup)', () => {
    expect(isNoiseTranscript('thanks')).toBe(true);
    expect(isNoiseTranscript('Thank you')).toBe(true);
    expect(isNoiseTranscript('Thanks.')).toBe(true);
    expect(isNoiseTranscript('THANK YOU')).toBe(true);
  });

  test('returns false for longer sentences containing noise words', () => {
    expect(isNoiseTranscript('Yes, I would manage this with antibiotics')).toBe(false);
    expect(isNoiseTranscript('Thank you for explaining, now let me')).toBe(false);
    expect(isNoiseTranscript('Okay so the patient has presented with')).toBe(false);
  });

  test('handles non-string input types', () => {
    expect(isNoiseTranscript(42)).toBe(true);
    expect(isNoiseTranscript(true)).toBe(true);
    expect(isNoiseTranscript({})).toBe(true);
    expect(isNoiseTranscript([])).toBe(true);
  });

  test('returns true for whitespace-padded noise', () => {
    expect(isNoiseTranscript('  um  ')).toBe(true);
    expect(isNoiseTranscript('  ok  ')).toBe(true);
    expect(isNoiseTranscript('  yes  ')).toBe(true);
  });
});

describe('buildNaturalSSML - additional patterns', () => {
  test('handles text with multiple consecutive periods', () => {
    const result = buildNaturalSSML('First. Second. Third.');
    // Two internal ". " should get breaks, trailing period has no space after it
    const breakCount = (result.match(/break strength="medium"/g) || []).length;
    expect(breakCount).toBe(2);
  });

  test('handles text with only commas', () => {
    const result = buildNaturalSSML('one, two, three');
    expect(result).toContain('<speak>');
    expect(result).toContain(',<break strength="weak"/>');
  });

  test('preserves text content inside speak tags', () => {
    const result = buildNaturalSSML('Important medical text');
    expect(result).toBe('<speak>Important medical text</speak>');
  });
});

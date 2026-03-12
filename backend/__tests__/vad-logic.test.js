/**
 * VAD (Voice Activity Detection) Logic Tests
 * Tests isNoiseTranscript filtering and buildNaturalSSML
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-api-key';

const { isNoiseTranscript, buildNaturalSSML } = require('../src/utils/audioHelpers');

describe('isNoiseTranscript', () => {
  test('returns true for empty, null, and non-string inputs', () => {
    expect(isNoiseTranscript('')).toBe(true);
    expect(isNoiseTranscript(null)).toBe(true);
    expect(isNoiseTranscript(undefined)).toBe(true);
    expect(isNoiseTranscript(42)).toBe(true);
    expect(isNoiseTranscript({})).toBe(true);
  });

  test('returns true for text below 2-char threshold', () => {
    expect(isNoiseTranscript('x')).toBe(true);
  });

  test('returns true for whitespace-only and no-letter text', () => {
    expect(isNoiseTranscript('   ')).toBe(true);
    expect(isNoiseTranscript('!@#$')).toBe(true);
    expect(isNoiseTranscript('123')).toBe(true);
  });

  test('returns true for filler sounds (case-insensitive, with punctuation)', () => {
    expect(isNoiseTranscript('um')).toBe(true);
    expect(isNoiseTranscript('UM')).toBe(true);
    expect(isNoiseTranscript('uh.')).toBe(true);
    expect(isNoiseTranscript('ER')).toBe(true);
    expect(isNoiseTranscript('ummm')).toBe(true);
    expect(isNoiseTranscript('  um  ')).toBe(true);
  });

  test('returns true for repeated single-character patterns', () => {
    expect(isNoiseTranscript('aaa')).toBe(true);
    expect(isNoiseTranscript('zzz')).toBe(true);
    expect(isNoiseTranscript('a b c')).toBe(true);
  });

  test('returns false for legitimate short responses', () => {
    expect(isNoiseTranscript('hi')).toBe(false);
    expect(isNoiseTranscript('thanks')).toBe(false);
    expect(isNoiseTranscript('Thank you')).toBe(false);
    expect(isNoiseTranscript('  ok  ')).toBe(false);
    expect(isNoiseTranscript('  yes  ')).toBe(false);
  });

  test('returns false for medical speech and full sentences', () => {
    expect(isNoiseTranscript('I would examine the wound')).toBe(false);
    expect(isNoiseTranscript('The patient is 45 years old')).toBe(false);
    expect(isNoiseTranscript('Give 2mg of morphine')).toBe(false);
    expect(isNoiseTranscript('The flap is well perfused')).toBe(false);
  });

  test('returns false for longer sentences containing noise words', () => {
    expect(isNoiseTranscript('Yes, I would manage this with antibiotics')).toBe(false);
    expect(isNoiseTranscript('Okay so the patient has presented with')).toBe(false);
  });
});

describe('buildNaturalSSML', () => {
  test('adds medium breaks after periods and weak breaks after commas', () => {
    const result = buildNaturalSSML('First. Second. Third.');
    const mediumBreaks = (result.match(/break strength="medium"/g) || []).length;
    expect(mediumBreaks).toBe(2);

    const commaResult = buildNaturalSSML('one, two, three');
    expect(commaResult).toContain(',<break strength="weak"/>');
  });

  test('preserves plain text inside speak tags', () => {
    const result = buildNaturalSSML('Important medical text');
    expect(result).toBe('<speak>Important medical text</speak>');
  });
});

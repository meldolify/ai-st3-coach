/**
 * Tests for audio helper utilities
 */

const { isNoiseTranscript, buildNaturalSSML } = require('../src/utils/audioHelpers');

describe('isNoiseTranscript', () => {
  test('returns true for null input', () => {
    expect(isNoiseTranscript(null)).toBe(true);
  });

  test('returns true for undefined input', () => {
    expect(isNoiseTranscript(undefined)).toBe(true);
  });

  test('returns true for empty string', () => {
    expect(isNoiseTranscript('')).toBe(true);
  });

  test('returns true for whitespace only', () => {
    expect(isNoiseTranscript('   ')).toBe(true);
  });

  test('returns true for single character', () => {
    expect(isNoiseTranscript('a')).toBe(true);
  });

  test('returns true for repeated s sounds', () => {
    expect(isNoiseTranscript('sss')).toBe(true);
    expect(isNoiseTranscript('SSSS')).toBe(true);
  });

  test('returns true for filler sounds', () => {
    expect(isNoiseTranscript('um')).toBe(true);
    expect(isNoiseTranscript('uh')).toBe(true);
    expect(isNoiseTranscript('er')).toBe(true);
    expect(isNoiseTranscript('ah')).toBe(true);
  });

  test('returns true for just okay', () => {
    expect(isNoiseTranscript('okay')).toBe(true);
    expect(isNoiseTranscript('ok')).toBe(true);
    expect(isNoiseTranscript('OK.')).toBe(true);
  });

  test('returns true for single word responses', () => {
    expect(isNoiseTranscript('yes')).toBe(true);
    expect(isNoiseTranscript('no')).toBe(true);
    expect(isNoiseTranscript('yeah')).toBe(true);
  });

  test('returns true for common AI echo patterns', () => {
    expect(isNoiseTranscript('thank you')).toBe(true);
    expect(isNoiseTranscript("that's fine")).toBe(true);
  });

  test('returns true for punctuation only', () => {
    expect(isNoiseTranscript('...')).toBe(true);
    expect(isNoiseTranscript('!?!')).toBe(true);
  });

  test('returns true for repeated characters with spaces', () => {
    expect(isNoiseTranscript('s s s s')).toBe(true);
  });

  test('returns false for legitimate speech', () => {
    expect(isNoiseTranscript('Hello, how are you?')).toBe(false);
    expect(isNoiseTranscript('The patient presented with symptoms')).toBe(false);
    expect(isNoiseTranscript('I would manage this by')).toBe(false);
  });

  test('returns false for medical terminology', () => {
    expect(isNoiseTranscript('necrotising fasciitis')).toBe(false);
    expect(isNoiseTranscript('I would perform debridement')).toBe(false);
  });
});

describe('buildNaturalSSML', () => {
  test('wraps text in speak tags', () => {
    const result = buildNaturalSSML('Hello');
    expect(result).toMatch(/^<speak>.*<\/speak>$/);
  });

  test('adds break after periods', () => {
    const result = buildNaturalSSML('First sentence. Second sentence.');
    expect(result).toContain('.<break strength="medium"/>');
  });

  test('adds break after question marks', () => {
    const result = buildNaturalSSML('How are you? I am fine.');
    expect(result).toContain('?<break strength="medium"/>');
  });

  test('adds weak break after commas', () => {
    const result = buildNaturalSSML('First, second, third.');
    expect(result).toContain(',<break strength="weak"/>');
  });

  test('handles text without punctuation', () => {
    const result = buildNaturalSSML('Hello world');
    expect(result).toBe('<speak>Hello world</speak>');
  });

  test('handles empty string', () => {
    const result = buildNaturalSSML('');
    expect(result).toBe('<speak></speak>');
  });
});

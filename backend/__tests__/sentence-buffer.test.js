/**
 * SentenceBuffer Tests
 * Tests token accumulation and sentence-boundary detection for the GPT streaming → TTS pipeline.
 */

const SentenceBuffer = require('../src/utils/sentenceBuffer');

describe('SentenceBuffer', () => {
  let buffer;

  beforeEach(() => {
    // batchSize=1 preserves legacy 1:1 sentence emission for existing tests
    buffer = new SentenceBuffer(1);
  });

  // -------------------------------------------------------------------------
  // Basic sentence detection
  // -------------------------------------------------------------------------
  describe('basic sentence detection', () => {
    test('period ends a sentence', () => {
      const sentences = buffer.addToken('Hello world. ');
      expect(sentences).toContain('Hello world.');
    });

    test('question mark ends a sentence', () => {
      const sentences = buffer.addToken('How are you? ');
      expect(sentences).toContain('How are you?');
    });

    test('exclamation mark ends a sentence', () => {
      const sentences = buffer.addToken('Watch out! ');
      expect(sentences).toContain('Watch out!');
    });

    test('comma, colon, semicolon do NOT end a sentence', () => {
      expect(buffer.addToken('Hello, world')).toHaveLength(0);
      expect(buffer.addToken(': important; also')).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Streaming token accumulation
  // -------------------------------------------------------------------------
  describe('streaming token accumulation', () => {
    test('multiple tokens accumulate then emit on period', () => {
      expect(buffer.addToken('Hello')).toHaveLength(0);
      expect(buffer.addToken(' world')).toHaveLength(0);
      const sentences = buffer.addToken('.');
      expect(sentences).toEqual(['Hello world.']);
    });

    test('tokens arrive one character at a time', () => {
      const chars = 'Hi. Bye. ';
      let allSentences = [];
      for (const ch of chars) {
        allSentences = allSentences.concat(buffer.addToken(ch));
      }
      expect(allSentences).toContain('Hi.');
      expect(allSentences).toContain('Bye.');
    });

    test('multiple sentences in rapid succession', () => {
      const sentences = buffer.addToken('One. Two. Three. ');
      expect(sentences).toEqual(['One.', 'Two.', 'Three.']);
    });
  });

  // -------------------------------------------------------------------------
  // flush()
  // -------------------------------------------------------------------------
  describe('flush', () => {
    test('flush returns remaining buffered text and clears buffer', () => {
      buffer.addToken('Incomplete sentence without ending');
      expect(buffer.flush()).toBe('Incomplete sentence without ending');
      expect(buffer.flush()).toBe('');
    });

    test('flush returns trimmed text', () => {
      buffer.addToken('  spaces around  ');
      expect(buffer.flush()).toBe('spaces around');
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    test('abbreviation "Dr." without trailing space does not split', () => {
      buffer.addToken('Dr.Smith');
      const sentences = buffer.addToken(' is here');
      expect(sentences).toHaveLength(0);
      expect(buffer.flush()).toBe('Dr.Smith is here');
    });

    test('empty token is ignored', () => {
      buffer.addToken('Hello');
      const sentences = buffer.addToken('');
      expect(sentences).toHaveLength(0);
      expect(buffer.flush()).toBe('Hello');
    });

    test('ellipsis "..." is treated as sentence-ending punctuation', () => {
      const sentences = buffer.addToken('Well... ');
      expect(sentences.length).toBeGreaterThanOrEqual(1);
    });

    test('numbers with periods like "3.5" do not split when not followed by space', () => {
      buffer.addToken('The value is 3.5ml');
      const sentences = buffer.addToken(' and rising');
      expect(sentences).toHaveLength(0);
      expect(buffer.flush()).toBe('The value is 3.5ml and rising');
    });
  });

  // -------------------------------------------------------------------------
  // Sentence batching (batchSize=2)
  // -------------------------------------------------------------------------
  describe('batching (batchSize=2)', () => {
    let batchBuffer;

    beforeEach(() => {
      batchBuffer = new SentenceBuffer(2);
    });

    test('first sentence emits immediately, subsequent sentences batch in pairs', () => {
      const s1 = batchBuffer.addToken('One. ');
      expect(s1).toEqual(['One.']);

      batchBuffer.addToken('Two. '); // held
      const s3 = batchBuffer.addToken('Three. ');
      expect(s3).toEqual(['Two. Three.']);
    });

    test('three sentences in one token: first solo, pair of 2', () => {
      const result = batchBuffer.addToken('One. Two. Three. ');
      expect(result).toEqual(['One.', 'Two. Three.']);
    });

    test('flush drains pending sentences and buffer remainder', () => {
      batchBuffer.addToken('First. '); // emits solo
      batchBuffer.addToken('Second. '); // held
      batchBuffer.addToken('trailing text');
      expect(batchBuffer.flush()).toBe('Second. trailing text');
    });

    test('flush resets batching state — next call emits first sentence solo again', () => {
      batchBuffer.addToken('First. ');
      batchBuffer.flush();
      const result = batchBuffer.addToken('New first. ');
      expect(result).toEqual(['New first.']);
    });
  });

  // -------------------------------------------------------------------------
  // minFirstLength batching
  // -------------------------------------------------------------------------
  describe('minFirstLength batching', () => {
    let mflBuffer;

    beforeEach(() => {
      mflBuffer = new SentenceBuffer(1, 20);
    });

    test('short first sentence is held and batches with second', () => {
      const s1 = mflBuffer.addToken('Okay. ');
      expect(s1).toEqual([]); // held — "Okay." is 5 chars < 20

      const s2 = mflBuffer.addToken('What blood tests would you send? ');
      expect(s2).toEqual(['Okay. What blood tests would you send?']);
    });

    test('long first sentence emits immediately', () => {
      const s1 = mflBuffer.addToken('What blood tests would you send? ');
      expect(s1).toEqual(['What blood tests would you send?']);
    });

    test('flush returns held short sentence if stream ends early', () => {
      mflBuffer.addToken('Alright.');
      expect(mflBuffer.flush()).toBe('Alright.');
    });
  });
});

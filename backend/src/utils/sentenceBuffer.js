/**
 * SentenceBuffer — accumulates streamed GPT tokens and emits complete sentences.
 * Used by the streaming GPT→TTS pipeline to send each sentence to TTS as soon as it's ready.
 *
 * Supports batching: groups multiple sentences per emission for better TTS prosody.
 * First sentence always emits immediately (low latency), then batches by batchSize.
 *
 * @param {number} batchSize - Number of sentences to group per emission (default 2).
 *   Use batchSize=1 to disable batching (each sentence emits individually).
 */

class SentenceBuffer {
  constructor(batchSize = 2) {
    this.buffer = '';
    this.pendingSentences = [];
    this.batchSize = batchSize;
    this.emittedFirst = false;
  }

  /**
   * Add a token from the GPT stream.
   * @param {string} token - A streamed token string
   * @returns {string[]} Array of sentence batches ready for TTS (may be empty)
   */
  addToken(token) {
    this.buffer += token;

    // Split on sentence-ending punctuation followed by a space or end of string.
    // Handles: "Hello. How are you?" → ["Hello.", "How are you?"]
    // Preserves abbreviations like "Dr." by requiring space after period.
    const regex = /([^.!?]*[.!?])(?:\s+|$)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(this.buffer)) !== null) {
      const sentence = match[1].trim();
      if (sentence) {
        this.pendingSentences.push(sentence);
      }
      lastIndex = regex.lastIndex;
    }

    // Keep the unmatched remainder in the buffer
    if (lastIndex > 0) {
      this.buffer = this.buffer.slice(lastIndex);
    }

    // Emit batches: first sentence solo (low latency), then groups of batchSize
    const batches = [];
    const threshold = this.emittedFirst ? this.batchSize : 1;

    while (this.pendingSentences.length >= threshold) {
      const count = this.emittedFirst ? this.batchSize : 1;
      const batch = this.pendingSentences.splice(0, count);
      batches.push(batch.join(' '));
      this.emittedFirst = true;
    }

    return batches;
  }

  /**
   * Flush any remaining text (called when the stream ends).
   * @returns {string} Remaining pending sentences + buffer text, or empty string
   */
  flush() {
    const parts = [...this.pendingSentences];
    const remaining = this.buffer.trim();
    if (remaining) {
      parts.push(remaining);
    }

    this.pendingSentences = [];
    this.buffer = '';
    this.emittedFirst = false;

    return parts.join(' ');
  }
}

module.exports = SentenceBuffer;

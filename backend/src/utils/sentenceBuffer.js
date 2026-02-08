/**
 * SentenceBuffer — accumulates streamed GPT tokens and emits complete sentences.
 * Used by the streaming GPT→TTS pipeline to send each sentence to TTS as soon as it's ready.
 */

class SentenceBuffer {
  constructor() {
    this.buffer = '';
  }

  /**
   * Add a token from the GPT stream.
   * @param {string} token - A streamed token string
   * @returns {string[]} Array of complete sentences (may be empty)
   */
  addToken(token) {
    this.buffer += token;
    const sentences = [];

    // Split on sentence-ending punctuation followed by a space or end of string.
    // Handles: "Hello. How are you?" → ["Hello.", "How are you?"]
    // Preserves abbreviations like "Dr." by requiring space after period.
    const regex = /([^.!?]*[.!?])(?:\s+|$)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(this.buffer)) !== null) {
      const sentence = match[1].trim();
      if (sentence) {
        sentences.push(sentence);
      }
      lastIndex = regex.lastIndex;
    }

    // Keep the unmatched remainder in the buffer
    if (lastIndex > 0) {
      this.buffer = this.buffer.slice(lastIndex);
    }

    return sentences;
  }

  /**
   * Flush any remaining text (called when the stream ends).
   * @returns {string} Remaining text, or empty string
   */
  flush() {
    const remaining = this.buffer.trim();
    this.buffer = '';
    return remaining;
  }
}

module.exports = SentenceBuffer;

/**
 * Feedback Section Buffer
 * Detects ===SECTION_N=== and ===JSON_SUMMARY=== delimiters in a streaming
 * token stream, emitting complete section texts as they are detected.
 *
 * Similar to SentenceBuffer but splits on section delimiters instead of
 * sentence-ending punctuation.
 */

class FeedbackSectionBuffer {
  constructor() {
    this.buffer = '';
    this.sectionStarted = false;
  }

  /**
   * Add a token to the buffer. Returns an array of completed section texts
   * (may be empty if no section boundary was crossed).
   *
   * @param {string} token - A token string from the LLM stream
   * @returns {string[]} - Array of completed section texts (0 or more)
   */
  addToken(token) {
    this.buffer += token;
    const results = [];

    let match = this._findNextDelimiter();
    while (match) {
      // Text before this delimiter is the previous section's content
      const before = this.buffer.slice(0, match.index).trim();
      this.buffer = this.buffer.slice(match.index + match[0].length);

      if (before && this.sectionStarted) {
        results.push(before);
      }

      // Track whether we're inside a speakable section (not JSON)
      this.sectionStarted = match[0].startsWith('===SECTION');
      match = this._findNextDelimiter();
    }

    return results;
  }

  /**
   * Find the next section or JSON delimiter in the buffer.
   * @returns {RegExpMatchArray|null} - Match object or null if no delimiter found
   */
  _findNextDelimiter() {
    const sectionMatch = this.buffer.match(/===SECTION_\d+===/);
    const jsonMatch = this.buffer.match(/===JSON_SUMMARY===/);
    const candidates = [sectionMatch, jsonMatch].filter(Boolean);
    if (candidates.length === 0) {
      return null;
    }
    return candidates.sort((a, b) => a.index - b.index)[0];
  }

  /**
   * Flush any remaining buffer content (e.g. JSON summary text after
   * ===JSON_SUMMARY=== with no further delimiter).
   *
   * @returns {string|null} - Remaining text or null if empty
   */
  flush() {
    const remaining = this.buffer.trim();
    this.buffer = '';
    return remaining || null;
  }
}

module.exports = { FeedbackSectionBuffer };

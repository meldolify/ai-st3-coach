/**
 * Info Sheet Parser
 * Parses candidate information sheet files (key-value format)
 * used for Call-the-Boss and Consent station preparation phases.
 *
 * These files are displayed to the candidate — NOT sent to the LLM.
 */

/**
 * Parse info sheet file content into structured fields and images.
 *
 * @param {string} content - Raw text content of an info sheet file
 * @returns {{ fields: Array<{key: string, value: string}>, images: string[] } | null}
 *   Returns null if content is empty, or contains placeholder/author note markers.
 */
function parseInfoSheet(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return null;
  }

  // Skip placeholder/template files
  if (trimmed.includes('[PLACEHOLDER') || trimmed.includes('[AUTHOR NOTE')) {
    return null;
  }

  const fields = [];
  const images = [];

  // Parse key-value lines.
  // A key line starts with a capitalised word (or abbreviation) followed by a colon.
  // Multi-line values are supported: lines that don't match a new key pattern
  // are appended to the previous field's value.
  const lines = trimmed.split('\n');
  const keyPattern = /^([A-Z][A-Za-z\s/&]+?)\s*:\s*(.*)$/;

  let currentKey = null;
  let currentValue = '';

  for (const line of lines) {
    const match = line.match(keyPattern);
    if (match) {
      // Save previous field
      if (currentKey !== null) {
        pushField(fields, images, currentKey, currentValue);
      }
      currentKey = match[1].trim();
      currentValue = match[2].trim();
    } else if (currentKey !== null) {
      // Continuation of previous value
      const trimmedLine = line.trim();
      if (trimmedLine) {
        currentValue += ' ' + trimmedLine;
      }
    }
    // Lines before the first key are ignored (e.g. blank lines, comments)
  }

  // Save last field
  if (currentKey !== null) {
    pushField(fields, images, currentKey, currentValue);
  }

  if (fields.length === 0 && images.length === 0) {
    return null;
  }

  return { fields, images };
}

/**
 * Push a parsed field, extracting Images separately.
 */
function pushField(fields, images, key, value) {
  if (key.toLowerCase() === 'images') {
    const parsed = value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    images.push(...parsed);
  } else {
    fields.push({ key, value });
  }
}

module.exports = { parseInfoSheet };

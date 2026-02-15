/**
 * Feedback Parser Utility
 * Parses a single LLM response containing all 6 feedback sections + JSON summary.
 * Uses ===SECTION_N=== and ===JSON_SUMMARY=== delimiters.
 */

/**
 * Parse a feedback response with section delimiters into structured data.
 *
 * Expected format:
 * ===SECTION_1===
 * Overall Impression text...
 * ===SECTION_2===
 * Diagnosis & Assessment text...
 * ...
 * ===SECTION_6===
 * Closing Summary text...
 * ===JSON_SUMMARY===
 * {"score": 3, ...}
 *
 * @param {string} text - Raw LLM response
 * @returns {{ sections: string[], json: object|null, raw: string }}
 */
function parseFeedbackResponse(text) {
  if (!text || typeof text !== 'string') {
    return { sections: [], json: null, raw: text || '' };
  }

  const raw = text;

  // Extract JSON summary first (before splitting sections)
  let jsonSummary = null;
  let textWithoutJson = text;

  const jsonDelimiterIdx = text.indexOf('===JSON_SUMMARY===');
  if (jsonDelimiterIdx !== -1) {
    const jsonText = text.slice(jsonDelimiterIdx + '===JSON_SUMMARY==='.length).trim();
    textWithoutJson = text.slice(0, jsonDelimiterIdx).trim();

    try {
      jsonSummary = JSON.parse(jsonText);
    } catch {
      // Try to extract JSON object from the text (LLM might add extra text)
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonSummary = JSON.parse(jsonMatch[0]);
        } catch {
          console.warn('[FEEDBACK_PARSER] Could not parse JSON summary');
        }
      }
    }
  }

  // Split on ===SECTION_N=== delimiters
  const sectionPattern = /===SECTION_\d+===/g;
  const parts = textWithoutJson.split(sectionPattern);

  // First element is text before the first delimiter (usually empty)
  // Rest are the actual sections
  const sections = parts
    .slice(1) // skip pre-delimiter text
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // If no delimiters found, treat the whole text as one section
  if (sections.length === 0 && textWithoutJson.trim().length > 0) {
    console.warn('[FEEDBACK_PARSER] No section delimiters found, treating as single section');
    return { sections: [textWithoutJson.trim()], json: jsonSummary, raw };
  }

  return { sections, json: jsonSummary, raw };
}

module.exports = { parseFeedbackResponse };

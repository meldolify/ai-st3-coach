/**
 * Prompt Parser
 * Parse and combine the 3-section prompt format used by scenario files.
 *
 * Format:
 *   SECTION 1\nREALTIME CORE BEHAVIOURS\n...
 *   SECTION 2\nDIFFICULTY AND PERSONALITY LAYER\n...
 *   SECTION 3\nCLINICAL SCENARIO BLOCK\n...
 */

const SECTION_HEADERS = {
  core: 'SECTION 1\nREALTIME CORE BEHAVIOURS',
  difficulty: 'SECTION 2\nDIFFICULTY AND PERSONALITY LAYER',
  clinical: 'SECTION 3\nCLINICAL SCENARIO BLOCK'
};

/**
 * Parse a prompt file into its 3 sections.
 * @param {string} text - Full prompt file content
 * @returns {{ core: string, difficulty: string, clinical: string }}
 */
function parsePromptSections(text) {
  const sections = { core: '', difficulty: '', clinical: '' };
  if (!text || typeof text !== 'string') {
    return sections;
  }

  // Split on "SECTION N" at the start of a line
  const parts = text.split(/^(?=SECTION\s+\d)/m);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }

    if (/^SECTION\s+1\b/i.test(trimmed)) {
      // Strip the "SECTION 1\nREALTIME CORE BEHAVIOURS" header
      sections.core = trimmed
        .replace(/^SECTION\s+1\s*\n\s*REALTIME CORE BEHAVIOURS\s*/i, '')
        .trim();
    } else if (/^SECTION\s+2\b/i.test(trimmed)) {
      sections.difficulty = trimmed
        .replace(/^SECTION\s+2\s*\n\s*DIFFICULTY AND PERSONALITY LAYER\s*/i, '')
        .trim();
    } else if (/^SECTION\s+3\b/i.test(trimmed)) {
      sections.clinical = trimmed
        .replace(/^SECTION\s+3\s*\n\s*CLINICAL SCENARIO BLOCK\s*/i, '')
        .trim();
    }
  }

  return sections;
}

/**
 * Combine 3 sections back into a single prompt string.
 * @param {{ core: string, difficulty: string, clinical: string }} sections
 * @returns {string}
 */
function combinePromptSections(sections) {
  const { core = '', difficulty = '', clinical = '' } = sections;

  return [
    SECTION_HEADERS.core,
    '',
    core,
    '',
    SECTION_HEADERS.difficulty,
    '',
    difficulty,
    '',
    SECTION_HEADERS.clinical,
    '',
    clinical
  ].join('\n');
}

module.exports = { parsePromptSections, combinePromptSections, SECTION_HEADERS };

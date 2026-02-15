/**
 * Prompt Assembler Utility
 * Assembles modular prompt files into complete system prompts.
 * Tries modular (shared core + personality + clinical) first,
 * falls back to legacy monolithic files for non-migrated scenarios.
 */

const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '../../');
const PROMPTS_DIR = path.join(BACKEND_DIR, 'prompts');

const VALID_DOMAINS = ['clinical', 'call_the_boss', 'consent', 'structured_interview'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'strict'];

/**
 * Extract the domain from a topicFolder path.
 * @param {string} topicFolder - e.g. "clinical/emergencies/necrotising_fasciitis"
 * @returns {string} - e.g. "clinical"
 */
function extractDomain(topicFolder) {
  const firstSegment = topicFolder.split('/')[0];
  return VALID_DOMAINS.includes(firstSegment) ? firstSegment : 'clinical';
}

/**
 * Validate inputs against path traversal and invalid values.
 * @param {string} difficulty
 * @param {string} topicFolder
 * @throws {Error} if inputs are invalid
 */
function validateInputs(difficulty, topicFolder) {
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }
  if (!topicFolder || typeof topicFolder !== 'string') {
    throw new Error('topicFolder is required');
  }
  // Path traversal protection
  const normalized = path.normalize(topicFolder);
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new Error('Invalid topicFolder path');
  }
}

/**
 * Check if all given file paths exist.
 * @param {...string} files
 * @returns {boolean}
 */
function allExist(...files) {
  return files.every(f => fs.existsSync(f));
}

/**
 * Read a file's contents as UTF-8 text.
 * @param {string} filePath
 * @returns {string}
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Resolve the modular clinical scenario file path.
 * @param {string} topicFolder - e.g. "clinical/emergencies/necrotising_fasciitis"
 * @param {number} variant - Scenario variant number (default 1)
 * @returns {string} - Absolute path to scenarios/.../topic_name_variant.txt
 */
function resolveScenarioPath(topicFolder, variant = 1) {
  const topicName = topicFolder.split('/').pop();
  return path.join(PROMPTS_DIR, 'scenarios', topicFolder, `${topicName}_${variant}.txt`);
}

/**
 * Build a complete interview system prompt from modular files.
 * Concatenates: core domain behaviours + difficulty personality + clinical scenario.
 * Falls back to legacy monolithic file if modular files don't exist.
 *
 * @param {string} difficulty - "easy", "medium", or "strict"
 * @param {string} topicFolder - e.g. "clinical/emergencies/necrotising_fasciitis"
 * @returns {string} - Complete system prompt
 */
function buildInterviewPrompt(difficulty, topicFolder, variant = 1) {
  validateInputs(difficulty, topicFolder);
  const domain = extractDomain(topicFolder);

  const coreFile = path.join(PROMPTS_DIR, 'shared/interview', `core_${domain}_interview.txt`);
  const personalityFile = path.join(
    PROMPTS_DIR,
    'shared/interview',
    `${difficulty}_interview_personality.txt`
  );
  const clinicalFile = resolveScenarioPath(topicFolder, variant);

  if (allExist(coreFile, personalityFile, clinicalFile)) {
    console.log(`[PROMPT] Assembled modular interview: ${domain}/${difficulty}/${topicFolder}`);
    return [readFile(coreFile), readFile(personalityFile), readFile(clinicalFile)].join('\n\n');
  }

  // Fallback: legacy monolithic file
  console.log(`[PROMPT] Falling back to legacy for: ${topicFolder}/${difficulty}`);
  return loadLegacyInterviewPrompt(topicFolder, difficulty);
}

/**
 * Build a complete feedback system prompt from modular files.
 * Concatenates: core feedback behaviours + difficulty personality + clinical scenario.
 * Falls back to legacy feedback file if modular files don't exist.
 *
 * @param {string} difficulty - "easy", "medium", or "strict"
 * @param {string} topicFolder - e.g. "clinical/emergencies/necrotising_fasciitis"
 * @returns {string} - Complete feedback prompt
 */
function buildFeedbackPrompt(difficulty, topicFolder, variant = 1) {
  validateInputs(difficulty, topicFolder);
  const domain = extractDomain(topicFolder);

  const coreFile = path.join(PROMPTS_DIR, 'shared/feedback', `core_${domain}_feedback.txt`);
  const personalityFile = path.join(
    PROMPTS_DIR,
    'shared/feedback',
    `${difficulty}_feedback_personality.txt`
  );
  const clinicalFile = resolveScenarioPath(topicFolder, variant);

  if (allExist(coreFile, personalityFile, clinicalFile)) {
    console.log(`[PROMPT] Assembled modular feedback: ${domain}/${difficulty}/${topicFolder}`);
    return [readFile(coreFile), readFile(personalityFile), readFile(clinicalFile)].join('\n\n');
  }

  // Fallback: legacy feedback file
  console.log(`[PROMPT] Falling back to legacy feedback for: ${topicFolder}/${difficulty}`);
  return loadLegacyFeedbackPrompt(topicFolder, difficulty);
}

/**
 * Load legacy monolithic interview prompt file.
 * Reconstructs old file path: prompts/{topicFolder}/{difficulty}_{heading}_{folderName}_1.txt
 *
 * @param {string} topicFolder - e.g. "clinical/emergencies/necrotising_fasciitis"
 * @param {string} difficulty - "easy", "medium", or "strict"
 * @returns {string} - Prompt text or fallback
 */
function loadLegacyInterviewPrompt(topicFolder, difficulty) {
  try {
    const folderName = topicFolder.split('/').pop();
    const heading = topicFolder.split('/')[0];
    const fileName = `${difficulty}_${heading}_${folderName}_1.txt`;
    const filePath = path.join(PROMPTS_DIR, topicFolder, fileName);

    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.normalize(PROMPTS_DIR))) {
      throw new Error('Invalid scenario file path');
    }

    if (fs.existsSync(filePath)) {
      console.log(`[PROMPT] Legacy loaded: ${fileName}`);
      return readFile(filePath);
    }

    console.warn(`[PROMPT] Legacy file not found: ${fileName}`);
  } catch (err) {
    console.error(`[PROMPT] Legacy load error: ${err.message}`);
  }

  return 'You are a Plastic Surgery ST3 interview examiner. Conduct a professional interview.';
}

/**
 * Load legacy feedback prompt file.
 * Tries difficulty-prefixed first, then generic clinical_ prefix, then generic fallback.
 *
 * @param {string} topicFolder - e.g. "clinical/emergencies/necrotising_fasciitis"
 * @param {string} difficulty - "easy", "medium", or "strict"
 * @returns {string} - Feedback prompt text or fallback
 */
function loadLegacyFeedbackPrompt(topicFolder, difficulty) {
  const scenarioDir = topicFolder.split('/').pop();

  // Try difficulty-prefixed feedback file first
  const difficultyFileName = `${difficulty}_clinical_${scenarioDir}_feedback.txt`;
  const difficultyPath = path.join(PROMPTS_DIR, 'feedback', difficultyFileName);
  if (fs.existsSync(difficultyPath)) {
    console.log(`[PROMPT] Legacy feedback loaded: ${difficultyFileName}`);
    return readFile(difficultyPath);
  }

  // Try generic (no difficulty prefix) - matches old loadFeedbackPrompt() behaviour
  const genericFileName = `clinical_${scenarioDir}_feedback.txt`;
  const genericPath = path.join(PROMPTS_DIR, 'feedback', genericFileName);
  if (fs.existsSync(genericPath)) {
    console.log(`[PROMPT] Legacy feedback loaded (generic): ${genericFileName}`);
    return readFile(genericPath);
  }

  // Last resort
  const fallbackPath = path.join(PROMPTS_DIR, 'feedback', 'generic_feedback.txt');
  if (fs.existsSync(fallbackPath)) {
    console.log('[PROMPT] Using generic feedback prompt');
    return readFile(fallbackPath);
  }

  console.warn('[PROMPT] No feedback prompt files found, using inline fallback');
  return 'You are an expert plastic surgery examiner. Review the interview transcript and provide detailed feedback with a score from 0 to 5.';
}

module.exports = {
  buildInterviewPrompt,
  buildFeedbackPrompt,
  extractDomain,
  validateInputs,
  resolveScenarioPath,
  loadLegacyInterviewPrompt,
  loadLegacyFeedbackPrompt,
  // Exposed for testing
  PROMPTS_DIR,
  VALID_DOMAINS,
  VALID_DIFFICULTIES
};

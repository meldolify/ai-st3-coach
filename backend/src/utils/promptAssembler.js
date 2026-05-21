/**
 * Prompt Assembler Utility
 * Assembles modular prompt files into complete system prompts.
 * Tries modular (shared core + personality + clinical) first,
 * falls back to legacy monolithic files for non-migrated scenarios.
 */

const fs = require('fs');
const path = require('path');
const { sanitizeForLog } = require('../middleware/websocketSecurity');

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
 * Resolve a path under a fixed root and refuse anything that escapes the
 * root. Replaces ad-hoc `path.join + normalize + startsWith` checks that
 * CodeQL can't see through.
 *
 * @param {string} root - Absolute base directory the result must stay inside
 * @param  {...string} segments - Path segments to join under root
 * @returns {string} Absolute resolved path, guaranteed to be under root
 */
function safeResolveIn(root, ...segments) {
  const baseAbs = path.resolve(root);
  const resolved = path.resolve(baseAbs, ...segments);
  const baseWithSep = baseAbs.endsWith(path.sep) ? baseAbs : baseAbs + path.sep;
  if (resolved !== baseAbs && !resolved.startsWith(baseWithSep)) {
    throw new Error('Path escapes allowed directory');
  }
  return resolved;
}

/**
 * Resolve a path under PROMPTS_DIR. Curried form of safeResolveIn for the
 * most common caller. Use this for any path built from scenario / topic /
 * difficulty inputs.
 *
 * @param  {...string} segments - Path segments under PROMPTS_DIR
 * @returns {string} Absolute resolved path inside PROMPTS_DIR
 */
function safeResolveInPromptsDir(...segments) {
  return safeResolveIn(PROMPTS_DIR, ...segments);
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
  return safeResolveInPromptsDir('scenarios', topicFolder, `${topicName}_${variant}.txt`);
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

  const coreFile = safeResolveInPromptsDir('shared/interview', `core_${domain}_interview.txt`);
  const personalityFile = safeResolveInPromptsDir(
    'shared/interview',
    `${difficulty}_interview_personality.txt`
  );
  const clinicalFile = resolveScenarioPath(topicFolder, variant);

  if (allExist(coreFile, personalityFile, clinicalFile)) {
    console.log(
      `[PROMPT] Assembled modular interview: ${sanitizeForLog(domain)}/${sanitizeForLog(difficulty)}/${sanitizeForLog(topicFolder)}`
    );
    return [readFile(coreFile), readFile(personalityFile), readFile(clinicalFile)].join('\n\n');
  }

  // Fallback: legacy monolithic file
  console.log(
    `[PROMPT] Falling back to legacy for: ${sanitizeForLog(topicFolder)}/${sanitizeForLog(difficulty)}`
  );
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

  const coreFile = safeResolveInPromptsDir('shared/feedback', `core_${domain}_feedback.txt`);
  const personalityFile = safeResolveInPromptsDir(
    'shared/feedback',
    `${difficulty}_feedback_personality.txt`
  );
  const clinicalFile = resolveScenarioPath(topicFolder, variant);

  if (allExist(coreFile, personalityFile, clinicalFile)) {
    console.log(
      `[PROMPT] Assembled modular feedback: ${sanitizeForLog(domain)}/${sanitizeForLog(difficulty)}/${sanitizeForLog(topicFolder)}`
    );
    return [readFile(coreFile), readFile(personalityFile), readFile(clinicalFile)].join('\n\n');
  }

  // Fallback: legacy feedback file
  console.log(
    `[PROMPT] Falling back to legacy feedback for: ${sanitizeForLog(topicFolder)}/${sanitizeForLog(difficulty)}`
  );
  return loadLegacyFeedbackPrompt(topicFolder, difficulty);
}

/**
 * Load legacy monolithic interview prompt file.
 * Reconstructs old file path: prompts/_legacy/{topicFolder}/{difficulty}_{heading}_{folderName}_1.txt
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
    const filePath = safeResolveInPromptsDir('_legacy', topicFolder, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`[PROMPT] Legacy loaded: ${sanitizeForLog(fileName)}`);
      return readFile(filePath);
    }

    console.warn(`[PROMPT] Legacy file not found: ${sanitizeForLog(fileName)}`);
  } catch (err) {
    console.error(`[PROMPT] Legacy load error: ${sanitizeForLog(err.message)}`);
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
  const difficultyPath = safeResolveInPromptsDir('_legacy/feedback', difficultyFileName);
  if (fs.existsSync(difficultyPath)) {
    console.log(`[PROMPT] Legacy feedback loaded: ${sanitizeForLog(difficultyFileName)}`);
    return readFile(difficultyPath);
  }

  // Try generic (no difficulty prefix) - matches old loadFeedbackPrompt() behaviour
  const genericFileName = `clinical_${scenarioDir}_feedback.txt`;
  const genericPath = safeResolveInPromptsDir('_legacy/feedback', genericFileName);
  if (fs.existsSync(genericPath)) {
    console.log(`[PROMPT] Legacy feedback loaded (generic): ${sanitizeForLog(genericFileName)}`);
    return readFile(genericPath);
  }

  // Last resort
  const fallbackPath = safeResolveInPromptsDir('_legacy/feedback', 'generic_feedback.txt');
  if (fs.existsSync(fallbackPath)) {
    console.log('[PROMPT] Using generic feedback prompt');
    return readFile(fallbackPath);
  }

  console.warn('[PROMPT] No feedback prompt files found, using inline fallback');
  return 'You are an expert plastic surgery examiner. Review the interview transcript and provide detailed feedback with a score from 0 to 5.';
}

/**
 * Load the candidate information sheet for a scenario.
 * Info sheets live in prompts/info-sheets/{domain}/ and are displayed
 * to the candidate during preparation time — NOT sent to the LLM.
 *
 * @param {string} topicFolder - e.g. "call_the_boss/scenarios/major_burn"
 * @returns {{ fields: Array<{key: string, value: string}>, images: string[] } | null}
 */
function loadInfoSheet(topicFolder) {
  if (!topicFolder || typeof topicFolder !== 'string') {
    return null;
  }

  const domain = extractDomain(topicFolder);
  if (domain !== 'call_the_boss' && domain !== 'consent') {
    return null;
  }

  const scenarioName = topicFolder.split('/').pop();
  const infoSheetPath = safeResolveInPromptsDir('info-sheets', domain, `${scenarioName}.txt`);

  if (!fs.existsSync(infoSheetPath)) {
    return null;
  }

  const { parseInfoSheet } = require('./infoSheetParser');
  return parseInfoSheet(readFile(infoSheetPath));
}

module.exports = {
  buildInterviewPrompt,
  buildFeedbackPrompt,
  extractDomain,
  validateInputs,
  resolveScenarioPath,
  safeResolveIn,
  safeResolveInPromptsDir,
  loadInfoSheet,
  loadLegacyInterviewPrompt,
  loadLegacyFeedbackPrompt,
  // Exposed for testing
  PROMPTS_DIR,
  VALID_DOMAINS,
  VALID_DIFFICULTIES
};

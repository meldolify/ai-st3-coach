/**
 * Scenario loading utility
 * Loads scenario prompt files with path traversal protection
 */

const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '../../');

/**
 * Load a scenario prompt file with security validation
 * @param {string} scenarioFile - Relative path from backend dir, e.g. "prompts/clinical/emergencies/..."
 * @returns {string} - The scenario prompt text
 */
function loadScenarioPrompt(scenarioFile) {
  try {
    let filePath = path.join(BACKEND_DIR, scenarioFile);

    // Security check: ensure the file is within the backend directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.normalize(BACKEND_DIR))) {
      throw new Error('Invalid scenario file path');
    }

    // Try _legacy/ path if original not found (legacy folders moved)
    if (!fs.existsSync(filePath)) {
      const legacyFile = scenarioFile.replace(/^prompts\//, 'prompts/_legacy/');
      const legacyPath = path.join(BACKEND_DIR, legacyFile);
      if (fs.existsSync(legacyPath)) {
        filePath = legacyPath;
      }
    }

    if (!fs.existsSync(filePath)) {
      console.warn('[SCENARIO] File not found: ' + scenarioFile);
      throw new Error('Scenario file not found and no fallback available');
    }

    const prompt = fs.readFileSync(filePath, 'utf8');
    console.log('[SCENARIO] Loaded prompt from: ' + scenarioFile);
    return prompt;
  } catch (error) {
    console.error('[SCENARIO] Error loading prompt: ' + error.message);
    return 'You are a Plastic Surgery ST3 interview examiner. Conduct a professional interview.';
  }
}

module.exports = { loadScenarioPrompt, BACKEND_DIR };

/**
 * Prompt Lab Service
 * Manages text-only prompt testing sessions: chat, feedback, test execution, transcripts.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const openaiService = require('./OpenAIService');
const { parsePromptSections, combinePromptSections } = require('../utils/promptParser');

const BACKEND_DIR = path.join(__dirname, '..', '..');
const TEST_PROMPTS_DIR = path.join(BACKEND_DIR, 'prompts', 'test');
const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
const TEST_RESULTS_DIR = path.join(BACKEND_DIR, 'test-results');
const FEEDBACK_JSON_TEMPLATE_PATH = path.join(BACKEND_DIR, 'prompts', 'system', 'feedback_json_template.txt');

// In-memory session store (separate from production sessions)
const sessions = new Map();

// ──────────────────────────────────────────
// SESSION MANAGEMENT
// ──────────────────────────────────────────

/**
 * Create a new prompt lab session.
 * @param {{ core: string, difficulty: string, clinical: string }} promptSections
 * @param {{ difficulty: string }} metadata
 * @returns {{ sessionId: string }}
 */
function createSession(promptSections, metadata = {}) {
  const sessionId = `pl_${crypto.randomUUID()}`;
  const combinedPrompt = combinePromptSections(promptSections);

  sessions.set(sessionId, {
    history: [{ role: 'system', content: combinedPrompt }],
    promptSections,
    difficulty: metadata.difficulty || 'easy',
    createdAt: new Date().toISOString(),
    turnNumber: 0,
  });

  return { sessionId };
}

/**
 * Send a user message and get GPT response.
 * @param {string} sessionId
 * @param {string} message
 * @returns {Promise<{ response: string, turnNumber: number }>}
 */
async function chat(sessionId, message) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);

  session.turnNumber++;
  session.history.push({ role: 'user', content: message });

  const response = await openaiService.generateResponse(session.history, {
    max_tokens: 150,
    temperature: 0.7,
  });

  session.history.push({ role: 'assistant', content: response });

  return { response, turnNumber: session.turnNumber };
}

/**
 * Get session info (for debugging / transcript).
 */
function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

/**
 * Delete a session.
 */
function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

// ──────────────────────────────────────────
// FEEDBACK
// ──────────────────────────────────────────

/**
 * Serialize history into transcript (same format as server.js).
 */
function serializeTranscript(history) {
  return history
    .filter(msg => msg.role !== 'system')
    .map(msg => {
      const label = msg.role === 'assistant' ? '[Examiner]' : '[Candidate]';
      return `${label}: ${msg.content}`;
    })
    .join('\n');
}

/**
 * Load feedback prompt from test folder, with difficulty-specific variant.
 * Falls back to generic feedback prompt.
 * @param {string} difficulty - easy|medium|strict
 * @returns {string}
 */
function loadTestFeedbackPrompt(difficulty) {
  // Try difficulty-specific feedback prompt in test folder
  const difficultyFile = path.join(
    TEST_PROMPTS_DIR, 'feedback',
    `${difficulty}_clinical_necrotising_fasciitis_feedback.txt`
  );
  if (fs.existsSync(difficultyFile)) {
    return fs.readFileSync(difficultyFile, 'utf8');
  }

  // Try generic nec fasc feedback in test folder
  const genericTestFile = path.join(
    TEST_PROMPTS_DIR, 'feedback',
    'clinical_necrotising_fasciitis_feedback.txt'
  );
  if (fs.existsSync(genericTestFile)) {
    return fs.readFileSync(genericTestFile, 'utf8');
  }

  // Fall back to production feedback prompt
  const prodFile = path.join(BACKEND_DIR, 'prompts', 'feedback', 'clinical_necrotising_fasciitis_feedback.txt');
  if (fs.existsSync(prodFile)) {
    return fs.readFileSync(prodFile, 'utf8');
  }

  // Last resort
  const genericProd = path.join(BACKEND_DIR, 'prompts', 'feedback', 'generic_feedback.txt');
  if (fs.existsSync(genericProd)) {
    return fs.readFileSync(genericProd, 'utf8');
  }

  return 'You are an expert plastic surgery examiner. Review the interview transcript and provide feedback in 6 sections. Begin with Section 1 now.';
}

/**
 * Generate full feedback (all 6 sections + JSON summary) for a session.
 * Returns everything at once (no streaming/TTS).
 * @param {string} sessionId
 * @param {string} [feedbackPromptOverride] - Optional custom feedback prompt text
 * @returns {Promise<{ sections: string[], summary: object }>}
 */
async function generateFeedback(sessionId, feedbackPromptOverride) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);

  const transcript = serializeTranscript(session.history);
  const feedbackPrompt = feedbackPromptOverride || loadTestFeedbackPrompt(session.difficulty);

  // Create separate feedback conversation
  const feedbackHistory = [
    { role: 'system', content: feedbackPrompt },
    { role: 'user', content: 'Here is the interview transcript:\n\n' + transcript },
  ];

  const sections = [];

  // Generate 6 feedback sections
  for (let i = 0; i < 6; i++) {
    if (i > 0) {
      feedbackHistory.push({ role: 'user', content: 'continue' });
    }

    const sectionText = await openaiService.generateResponse(feedbackHistory, {
      max_tokens: 200,
      temperature: 0.7,
    });

    feedbackHistory.push({ role: 'assistant', content: sectionText });
    sections.push(sectionText);
  }

  // Generate JSON summary
  let summary;
  try {
    const jsonTemplate = fs.readFileSync(FEEDBACK_JSON_TEMPLATE_PATH, 'utf8');
    feedbackHistory.push({ role: 'user', content: jsonTemplate });

    const jsonText = await openaiService.generateResponse(feedbackHistory, {
      max_tokens: 500,
      temperature: 0.3,
    });

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      summary = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (err) {
    console.warn('[PROMPT LAB] Feedback JSON parse failed:', err.message);
    summary = {
      score: -1,
      overallImpression: 'Unable to parse structured feedback',
      clinicalKnowledge: { diagnosis: 'See spoken feedback', management: 'See spoken feedback' },
      strengths: ['See spoken feedback above'],
      improvements: ['JSON parsing failed'],
      summary: sections[0] || 'Feedback generation issue',
    };
  }

  return { sections, summary };
}

// ──────────────────────────────────────────
// PROMPT FILE MANAGEMENT
// ──────────────────────────────────────────

/**
 * Build the test prompt file path for a given difficulty.
 */
function getTestPromptPath(difficulty) {
  return path.join(
    TEST_PROMPTS_DIR,
    'clinical', 'emergencies', 'necrotising_fasciitis',
    `${difficulty}_clinical_necrotising_fasciitis_1.txt`
  );
}

/**
 * Load a test prompt file, parsed into sections.
 * @param {string} difficulty - easy|medium|strict
 * @returns {{ raw: string, sections: { core, difficulty, clinical }, path: string }}
 */
function loadTestPrompt(difficulty) {
  const filePath = getTestPromptPath(difficulty);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test prompt not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return {
    raw,
    sections: parsePromptSections(raw),
    path: path.relative(BACKEND_DIR, filePath),
  };
}

/**
 * Save edited prompt sections to the test prompt file.
 * @param {string} difficulty
 * @param {{ core: string, difficulty: string, clinical: string }} sections
 */
function saveTestPrompt(difficulty, sections) {
  const filePath = getTestPromptPath(difficulty);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const combined = combinePromptSections(sections);
  fs.writeFileSync(filePath, combined, 'utf8');
  return { path: path.relative(BACKEND_DIR, filePath), savedAt: new Date().toISOString() };
}

/**
 * Load feedback prompt for editing.
 */
function loadTestFeedbackPromptFile(difficulty) {
  const filePath = path.join(
    TEST_PROMPTS_DIR, 'feedback',
    `${difficulty}_clinical_necrotising_fasciitis_feedback.txt`
  );
  if (!fs.existsSync(filePath)) {
    // Fall back to the shared feedback file
    const sharedPath = path.join(
      TEST_PROMPTS_DIR, 'feedback',
      'clinical_necrotising_fasciitis_feedback.txt'
    );
    if (fs.existsSync(sharedPath)) {
      return { content: fs.readFileSync(sharedPath, 'utf8'), path: path.relative(BACKEND_DIR, sharedPath) };
    }
    // Fall back to production
    const prodPath = path.join(BACKEND_DIR, 'prompts', 'feedback', 'clinical_necrotising_fasciitis_feedback.txt');
    if (fs.existsSync(prodPath)) {
      return { content: fs.readFileSync(prodPath, 'utf8'), path: path.relative(BACKEND_DIR, prodPath) };
    }
    throw new Error('No feedback prompt found');
  }
  return { content: fs.readFileSync(filePath, 'utf8'), path: path.relative(BACKEND_DIR, filePath) };
}

/**
 * Save feedback prompt.
 */
function saveTestFeedbackPrompt(difficulty, content) {
  const filePath = path.join(
    TEST_PROMPTS_DIR, 'feedback',
    `${difficulty}_clinical_necrotising_fasciitis_feedback.txt`
  );
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return { path: path.relative(BACKEND_DIR, filePath), savedAt: new Date().toISOString() };
}

// ──────────────────────────────────────────
// AUTOMATED TEST EXECUTION
// ──────────────────────────────────────────

/**
 * List available test scripts.
 */
function listTestScripts() {
  const dir = path.join(TEST_SCRIPTS_DIR, 'necrotising_fasciitis');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      return {
        id: f.replace('.json', ''),
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        inputCount: data.inputs?.length || 0,
        triggerFeedback: data.triggerFeedback || false,
      };
    });
}

/**
 * Load a test script by ID.
 */
function loadTestScript(testId) {
  const filePath = path.join(TEST_SCRIPTS_DIR, 'necrotising_fasciitis', `${testId}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Test script not found: ${testId}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Evaluate assertions against conversation history and feedback.
 */
function evaluateAssertions(assertions, history, feedback) {
  if (!assertions || assertions.length === 0) return { passed: 0, failed: 0, total: 0, details: [] };

  // Extract assistant-only responses indexed by turn
  const assistantTurns = [];
  let turn = 0;
  for (const msg of history) {
    if (msg.role === 'system') continue;
    if (msg.role === 'user') turn++;
    if (msg.role === 'assistant') {
      assistantTurns.push({ turn, content: msg.content });
    }
  }

  const details = [];

  for (const assertion of assertions) {
    const result = evaluateSingleAssertion(assertion, assistantTurns, feedback);
    details.push(result);
  }

  const passed = details.filter(d => d.passed).length;
  return { passed, failed: details.length - passed, total: details.length, details };
}

function evaluateSingleAssertion(assertion, assistantTurns, feedback) {
  const base = { desc: assertion.desc || assertion.description || '', type: assertion.type, passed: false };

  switch (assertion.type) {
    case 'contains': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) return { ...base, actual: '[no response at turn]' };
      const passed = turnResp.content.toLowerCase().includes(assertion.value.toLowerCase());
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }

    case 'contains_any': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) return { ...base, actual: '[no response at turn]' };
      const lower = turnResp.content.toLowerCase();
      const passed = assertion.values.some(v => lower.includes(v.toLowerCase()));
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }

    case 'not_contains': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) return { ...base, passed: true, actual: '[no response at turn]' };
      const passed = !turnResp.content.toLowerCase().includes(assertion.value.toLowerCase());
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }

    case 'never_contains': {
      const allContent = assistantTurns.map(t => t.content).join(' ').toLowerCase();
      const passed = !allContent.includes(assertion.value.toLowerCase());
      return { ...base, passed, actual: passed ? '[clean]' : `Found: "${assertion.value}"` };
    }

    case 'regex': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) return { ...base, actual: '[no response at turn]' };
      const re = new RegExp(assertion.pattern, 'i');
      const passed = re.test(turnResp.content);
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }

    case 'avg_word_count': {
      if (assistantTurns.length === 0) return { ...base, actual: '0 turns' };
      const totalWords = assistantTurns.reduce((sum, t) => sum + t.content.split(/\s+/).length, 0);
      const avg = Math.round(totalWords / assistantTurns.length);
      const passed = (!assertion.min || avg >= assertion.min) && (!assertion.max || avg <= assertion.max);
      return { ...base, passed, actual: `avg ${avg} words/response` };
    }

    case 'turn_count': {
      const count = assistantTurns.length;
      const passed = (!assertion.min || count >= assertion.min) && (!assertion.max || count <= assertion.max);
      return { ...base, passed, actual: `${count} turns` };
    }

    case 'score_range': {
      if (!feedback?.summary?.score && feedback?.summary?.score !== 0) {
        return { ...base, actual: '[no score]' };
      }
      const score = feedback.summary.score;
      const passed = score >= assertion.min && score <= assertion.max;
      return { ...base, passed, actual: `score: ${score}` };
    }

    case 'section_count': {
      const count = feedback?.sections?.length || 0;
      const passed = count === assertion.expected;
      return { ...base, passed, actual: `${count} sections` };
    }

    case 'feedback_contains': {
      const allFeedback = (feedback?.sections || []).join(' ').toLowerCase();
      const passed = allFeedback.includes(assertion.value.toLowerCase());
      return { ...base, passed, actual: passed ? '[found]' : `[not found: "${assertion.value}"]` };
    }

    default:
      return { ...base, actual: `[unknown assertion type: ${assertion.type}]` };
  }
}

/**
 * Run an automated test script.
 * @param {string} testId
 * @param {{ core: string, difficulty: string, clinical: string }} [promptOverride] - Use custom prompt sections
 * @param {string} [feedbackPromptOverride] - Use custom feedback prompt text
 * @returns {Promise<object>} - Full test results
 */
async function runTest(testId, promptOverride, feedbackPromptOverride) {
  const script = loadTestScript(testId);
  const difficulty = script.difficulty || 'easy';

  // Load prompt sections (use override or load from test files)
  let promptSections;
  if (promptOverride) {
    promptSections = promptOverride;
  } else {
    const loaded = loadTestPrompt(difficulty);
    promptSections = loaded.sections;
  }

  // Create session
  const { sessionId } = createSession(promptSections, { difficulty });
  const session = sessions.get(sessionId);
  const startTime = Date.now();

  // Run through all inputs
  for (const input of script.inputs) {
    const text = typeof input === 'string' ? input : input.text;
    await chat(sessionId, text);
  }

  // Generate feedback if requested
  let feedback = null;
  if (script.triggerFeedback) {
    feedback = await generateFeedback(sessionId, feedbackPromptOverride);
  }

  // Evaluate assertions
  const allAssertions = [
    ...(script.assertions || []),
    ...(script.feedbackAssertions || []),
  ];
  const assertionResults = evaluateAssertions(allAssertions, session.history, feedback);

  const duration = (Date.now() - startTime) / 1000;

  // Build transcript result
  const result = {
    id: generateTranscriptId(testId),
    type: 'automated',
    metadata: {
      testName: script.name,
      testId,
      difficulty,
      timestamp: new Date().toISOString(),
      duration,
      promptHash: hashPrompt(promptSections),
    },
    promptContent: promptSections,
    history: session.history.map((msg, i) => ({
      ...msg,
      turn: msg.role === 'system' ? 0 : Math.ceil(i / 2),
    })),
    assertions: assertionResults,
    feedback,
  };

  // Save transcript
  saveTranscript(result);

  // Clean up session
  sessions.delete(sessionId);

  return result;
}

// ──────────────────────────────────────────
// TRANSCRIPT STORAGE
// ──────────────────────────────────────────

function generateTranscriptId(label) {
  const now = new Date();
  const date = now.toISOString().replace(/[-:T]/g, '').substring(0, 8);
  const time = now.toISOString().replace(/[-:T]/g, '').substring(8, 14);
  return `${date}_${time}_${label || 'manual'}`;
}

function hashPrompt(sections) {
  const combined = combinePromptSections(sections);
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 8);
}

function ensureTestResultsDir() {
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  }
}

function saveTranscript(result) {
  ensureTestResultsDir();
  const filePath = path.join(TEST_RESULTS_DIR, `${result.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
  return result.id;
}

/**
 * Save a manual chat session as a transcript.
 */
function saveManualTranscript(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);

  const result = {
    id: generateTranscriptId('manual'),
    type: 'manual',
    metadata: {
      testName: 'Manual Chat',
      difficulty: session.difficulty,
      timestamp: new Date().toISOString(),
      promptHash: hashPrompt(session.promptSections),
    },
    promptContent: session.promptSections,
    history: session.history,
    assertions: null,
    feedback: null,
  };

  saveTranscript(result);
  return result.id;
}

/**
 * List saved transcripts.
 */
function listTranscripts() {
  ensureTestResultsDir();
  const files = fs.readdirSync(TEST_RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse(); // newest first

  return files.map(f => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(TEST_RESULTS_DIR, f), 'utf8'));
      return {
        id: data.id,
        type: data.type,
        testName: data.metadata?.testName,
        difficulty: data.metadata?.difficulty,
        timestamp: data.metadata?.timestamp,
        assertionsPassed: data.assertions?.passed,
        assertionsFailed: data.assertions?.failed,
        feedbackScore: data.feedback?.summary?.score,
      };
    } catch {
      return { id: f.replace('.json', ''), type: 'unknown', error: 'parse error' };
    }
  });
}

/**
 * Load a specific transcript.
 */
function loadTranscript(id) {
  const filePath = path.join(TEST_RESULTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Transcript not found: ${id}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Delete a transcript.
 */
function deleteTranscript(id) {
  const filePath = path.join(TEST_RESULTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Transcript not found: ${id}`);
  fs.unlinkSync(filePath);
}

module.exports = {
  createSession,
  chat,
  getSession,
  deleteSession,
  generateFeedback,
  loadTestPrompt,
  saveTestPrompt,
  loadTestFeedbackPromptFile,
  saveTestFeedbackPrompt,
  listTestScripts,
  runTest,
  saveManualTranscript,
  listTranscripts,
  loadTranscript,
  deleteTranscript,
  serializeTranscript,
};

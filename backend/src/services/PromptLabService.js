/**
 * Prompt Lab Service
 * Manages text-only prompt testing sessions: chat, feedback, test execution, transcripts.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const openaiService = require('./OpenAIService');
const { parsePromptSections, combinePromptSections } = require('../utils/promptParser');
const testScriptGenerator = require('./TestScriptGenerator');

const BACKEND_DIR = path.join(__dirname, '..', '..');
const PROMPTS_DIR = path.join(BACKEND_DIR, 'prompts');
const FEEDBACK_DIR = path.join(PROMPTS_DIR, 'feedback');
const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
const TEST_RESULTS_DIR = path.join(BACKEND_DIR, 'test-results');
const FEEDBACK_JSON_TEMPLATE_PATH = path.join(PROMPTS_DIR, 'system', 'feedback_json_template.txt');

// Folders to exclude when scanning for topics
const EXCLUDED_DIRS = new Set(['feedback', 'system', 'test']);

// In-memory session store (separate from production sessions)
const sessions = new Map();

// Track files modified since server start (for GitHub PR creation)
const modifiedFiles = new Set();

// ──────────────────────────────────────────
// PATH HELPERS
// ──────────────────────────────────────────

/**
 * Validate a topic path to prevent path traversal.
 * @param {string} topicPath - e.g., "clinical/emergencies/necrotising_fasciitis"
 */
function validateTopicPath(topicPath) {
  if (
    !topicPath ||
    topicPath.includes('..') ||
    topicPath.startsWith('/') ||
    !/^[a-z0-9_/]+$/.test(topicPath)
  ) {
    throw new Error('Invalid topic path: ' + topicPath);
  }
}

/**
 * Build the prompt file path for a given topic and difficulty.
 * @param {string} topicPath - e.g., "clinical/emergencies/necrotising_fasciitis"
 * @param {string} difficulty - easy|medium|strict
 * @returns {string} absolute file path
 */
function getPromptPath(topicPath, difficulty) {
  validateTopicPath(topicPath);
  const parts = topicPath.split('/');
  const category = parts[0];
  const folderName = parts[parts.length - 1];
  const filename = `${difficulty}_${category}_${folderName}_1.txt`;
  return path.join(PROMPTS_DIR, topicPath, filename);
}

/**
 * Build feedback prompt path components from topic path.
 */
function getFeedbackParts(topicPath) {
  const parts = topicPath.split('/');
  const category = parts[0];
  const folderName = parts[parts.length - 1];
  return { category, folderName };
}

// ──────────────────────────────────────────
// TOPIC DISCOVERY
// ──────────────────────────────────────────

/**
 * Convert a folder name to Title Case.
 * e.g., "necrotising_fasciitis" → "Necrotising Fasciitis"
 */
function toTitleCase(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * List all available topics by scanning the prompts directory.
 * Returns a flat list grouped by category > subcategory.
 */
function listTopics() {
  const topics = [];

  // Read top-level categories
  const categories = fs.readdirSync(PROMPTS_DIR).filter(d => {
    if (EXCLUDED_DIRS.has(d)) {
      return false;
    }
    return fs.statSync(path.join(PROMPTS_DIR, d)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(PROMPTS_DIR, category);
    const subcategories = fs
      .readdirSync(categoryPath)
      .filter(d => fs.statSync(path.join(categoryPath, d)).isDirectory());

    for (const subcategory of subcategories) {
      const subcategoryPath = path.join(categoryPath, subcategory);
      const topicDirs = fs
        .readdirSync(subcategoryPath)
        .filter(d => fs.statSync(path.join(subcategoryPath, d)).isDirectory());

      for (const topicDir of topicDirs) {
        const topicFullPath = path.join(subcategoryPath, topicDir);
        // Only include directories that contain .txt files
        const hasPrompts = fs.readdirSync(topicFullPath).some(f => f.endsWith('.txt'));
        if (!hasPrompts) {
          continue;
        }

        topics.push({
          path: `${category}/${subcategory}/${topicDir}`,
          label: toTitleCase(topicDir),
          group: `${toTitleCase(category)} > ${toTitleCase(subcategory)}`
        });
      }
    }
  }

  // Sort by group then label
  topics.sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
  return topics;
}

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
    turnNumber: 0
  });

  return { sessionId };
}

/**
 * Send a user message and get GPT response.
 */
async function chat(sessionId, message) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  session.turnNumber++;
  session.history.push({ role: 'user', content: message });

  const response = await openaiService.generateResponse(session.history, {
    max_tokens: 150,
    temperature: 0.7
  });

  session.history.push({ role: 'assistant', content: response });

  return { response, turnNumber: session.turnNumber };
}

function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

// ──────────────────────────────────────────
// FEEDBACK
// ──────────────────────────────────────────

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
 * Load feedback prompt for a topic, with difficulty-specific fallback chain.
 */
function loadFeedbackPrompt(topicPath, difficulty) {
  validateTopicPath(topicPath);
  const { category, folderName } = getFeedbackParts(topicPath);

  // Try difficulty-specific feedback prompt
  const difficultyFile = path.join(
    FEEDBACK_DIR,
    `${difficulty}_${category}_${folderName}_feedback.txt`
  );
  if (fs.existsSync(difficultyFile)) {
    return fs.readFileSync(difficultyFile, 'utf8');
  }

  // Try generic topic feedback prompt (no difficulty prefix)
  const genericTopicFile = path.join(FEEDBACK_DIR, `${category}_${folderName}_feedback.txt`);
  if (fs.existsSync(genericTopicFile)) {
    return fs.readFileSync(genericTopicFile, 'utf8');
  }

  // Fall back to generic feedback
  const genericFile = path.join(FEEDBACK_DIR, 'generic_feedback.txt');
  if (fs.existsSync(genericFile)) {
    return fs.readFileSync(genericFile, 'utf8');
  }

  return 'You are an expert plastic surgery examiner. Review the interview transcript and provide feedback in 6 sections. Begin with Section 1 now.';
}

/**
 * Generate full feedback (all 6 sections + JSON summary) for a session.
 */
async function generateFeedback(sessionId, feedbackPromptOverride, topicPath) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const transcript = serializeTranscript(session.history);
  const feedbackPrompt =
    feedbackPromptOverride ||
    loadFeedbackPrompt(
      topicPath || 'clinical/emergencies/necrotising_fasciitis',
      session.difficulty
    );

  const feedbackHistory = [
    { role: 'system', content: feedbackPrompt },
    { role: 'user', content: 'Here is the interview transcript:\n\n' + transcript }
  ];

  const sections = [];

  for (let i = 0; i < 6; i++) {
    if (i > 0) {
      feedbackHistory.push({ role: 'user', content: 'continue' });
    }

    const sectionText = await openaiService.generateResponse(feedbackHistory, {
      max_tokens: 200,
      temperature: 0.7
    });

    feedbackHistory.push({ role: 'assistant', content: sectionText });
    sections.push(sectionText);
  }

  let summary;
  try {
    const jsonTemplate = fs.readFileSync(FEEDBACK_JSON_TEMPLATE_PATH, 'utf8');
    feedbackHistory.push({ role: 'user', content: jsonTemplate });

    const jsonText = await openaiService.generateResponse(feedbackHistory, {
      max_tokens: 500,
      temperature: 0.3
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
      summary: sections[0] || 'Feedback generation issue'
    };
  }

  return { sections, summary };
}

// ──────────────────────────────────────────
// PROMPT FILE MANAGEMENT
// ──────────────────────────────────────────

/**
 * Load a prompt file, parsed into sections.
 */
function loadPrompt(topicPath, difficulty) {
  const filePath = getPromptPath(topicPath, difficulty);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt not found: ${path.relative(BACKEND_DIR, filePath)}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return {
    raw,
    sections: parsePromptSections(raw),
    path: path.relative(BACKEND_DIR, filePath)
  };
}

/**
 * Save edited prompt sections.
 */
function savePrompt(topicPath, difficulty, sections) {
  const filePath = getPromptPath(topicPath, difficulty);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const combined = combinePromptSections(sections);
  fs.writeFileSync(filePath, combined, 'utf8');

  // Track modification for GitHub PR
  modifiedFiles.add(path.relative(BACKEND_DIR, filePath));

  return { path: path.relative(BACKEND_DIR, filePath), savedAt: new Date().toISOString() };
}

/**
 * Load feedback prompt file for editing (returns content + path).
 */
function loadFeedbackPromptFile(topicPath, difficulty) {
  validateTopicPath(topicPath);
  const { category, folderName } = getFeedbackParts(topicPath);

  const diffFile = path.join(FEEDBACK_DIR, `${difficulty}_${category}_${folderName}_feedback.txt`);
  if (fs.existsSync(diffFile)) {
    return {
      content: fs.readFileSync(diffFile, 'utf8'),
      path: path.relative(BACKEND_DIR, diffFile)
    };
  }

  const genericFile = path.join(FEEDBACK_DIR, `${category}_${folderName}_feedback.txt`);
  if (fs.existsSync(genericFile)) {
    return {
      content: fs.readFileSync(genericFile, 'utf8'),
      path: path.relative(BACKEND_DIR, genericFile)
    };
  }

  const fallbackFile = path.join(FEEDBACK_DIR, 'generic_feedback.txt');
  if (fs.existsSync(fallbackFile)) {
    return {
      content: fs.readFileSync(fallbackFile, 'utf8'),
      path: path.relative(BACKEND_DIR, fallbackFile)
    };
  }

  throw new Error('No feedback prompt found for ' + topicPath);
}

/**
 * Save feedback prompt.
 */
function saveFeedbackPrompt(topicPath, difficulty, content) {
  validateTopicPath(topicPath);
  const { category, folderName } = getFeedbackParts(topicPath);
  const filePath = path.join(FEEDBACK_DIR, `${difficulty}_${category}_${folderName}_feedback.txt`);

  if (!fs.existsSync(FEEDBACK_DIR)) {
    fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');

  modifiedFiles.add(path.relative(BACKEND_DIR, filePath));

  return { path: path.relative(BACKEND_DIR, filePath), savedAt: new Date().toISOString() };
}

// ──────────────────────────────────────────
// MODIFIED FILES TRACKING
// ──────────────────────────────────────────

function getModifiedFiles() {
  return [...modifiedFiles];
}

function clearModifiedFiles() {
  modifiedFiles.clear();
}

// ──────────────────────────────────────────
// AUTOMATED TEST EXECUTION
// ──────────────────────────────────────────

function listTestScripts(topicFolderName, topicPath) {
  const results = [];
  const existingIds = new Set();

  // 1. Pre-made topic-specific scripts (gold standard)
  const topicDir = path.join(TEST_SCRIPTS_DIR, topicFolderName || '');
  if (topicFolderName && fs.existsSync(topicDir)) {
    const files = fs.readdirSync(topicDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(topicDir, f), 'utf8'));
        const id = f.replace('.json', '');
        existingIds.add(id);
        results.push({
          id,
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          inputCount: data.inputs?.length || 0,
          triggerFeedback: data.triggerFeedback || false,
          source: 'premade'
        });
      } catch {
        /* skip malformed files */
      }
    }
  }

  // 2. Generic behavioral scripts
  const genericDir = path.join(TEST_SCRIPTS_DIR, '_generic');
  if (fs.existsSync(genericDir)) {
    const files = fs.readdirSync(genericDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const id = f.replace('.json', '');
      if (existingIds.has(id)) {
        continue;
      }
      try {
        const data = JSON.parse(fs.readFileSync(path.join(genericDir, f), 'utf8'));
        existingIds.add(id);
        results.push({
          id,
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          inputCount: data.inputs?.length || 0,
          triggerFeedback: data.triggerFeedback || false,
          source: 'generic'
        });
      } catch {
        /* skip malformed files */
      }
    }
  }

  // 3. Cached GPT-generated scripts
  if (topicFolderName) {
    const generatedDir = path.join(TEST_SCRIPTS_DIR, '_generated', topicFolderName);
    if (fs.existsSync(generatedDir)) {
      const files = fs.readdirSync(generatedDir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        const id = f.replace('.json', '');
        if (existingIds.has(id)) {
          continue;
        }
        try {
          const data = JSON.parse(fs.readFileSync(path.join(generatedDir, f), 'utf8'));
          // Check cache TTL
          if (data._cachedAt) {
            const age = Date.now() - new Date(data._cachedAt).getTime();
            if (age > 24 * 60 * 60 * 1000) {
              continue;
            } // Expired
          }
          existingIds.add(id);
          results.push({
            id,
            name: data.name,
            description: data.description,
            difficulty: data.difficulty || 'easy',
            inputCount: data.inputs?.length || 0,
            triggerFeedback: data.triggerFeedback || false,
            source: 'generated'
          });
        } catch {
          /* skip malformed files */
        }
      }
    }
  }

  // 4. Generatable placeholders (if Section 3 has real content)
  if (topicPath && testScriptGenerator.hasRealContent(topicPath)) {
    for (const testType of testScriptGenerator.GENERATABLE_TEST_TYPES) {
      if (!existingIds.has(testType)) {
        results.push({
          id: testType,
          name: toTitleCase(testType),
          description: 'GPT-generated test (will be created on first run)',
          difficulty: 'easy',
          inputCount: 0,
          triggerFeedback: [
            'excellent_candidate',
            'good_candidate',
            'poor_candidate',
            'feedback_interrupt'
          ].includes(testType),
          source: 'generatable'
        });
      }
    }
  }

  return results;
}

async function loadTestScript(topicFolderName, testId, topicPath) {
  // 1. Pre-made topic-specific
  const premadePath = path.join(TEST_SCRIPTS_DIR, topicFolderName, `${testId}.json`);
  if (fs.existsSync(premadePath)) {
    return JSON.parse(fs.readFileSync(premadePath, 'utf8'));
  }

  // 2. Generic behavioral
  const genericPath = path.join(TEST_SCRIPTS_DIR, '_generic', `${testId}.json`);
  if (fs.existsSync(genericPath)) {
    return JSON.parse(fs.readFileSync(genericPath, 'utf8'));
  }

  // 3. Cached generated
  if (topicPath) {
    const cached = testScriptGenerator.getCachedScript(topicPath, testId);
    if (cached) {
      return cached;
    }
  }

  // 4. Generate on-demand
  if (topicPath && testScriptGenerator.GENERATABLE_TEST_TYPES.includes(testId)) {
    const script = await testScriptGenerator.generateTestScript(testId, topicPath);
    testScriptGenerator.cacheScript(topicPath, testId, script);
    return script;
  }

  throw new Error(`Test script not found: ${testId}`);
}

function evaluateAssertions(assertions, history, feedback) {
  if (!assertions || assertions.length === 0) {
    return { passed: 0, failed: 0, total: 0, details: [] };
  }

  const assistantTurns = [];
  let turn = 0;
  for (const msg of history) {
    if (msg.role === 'system') {
      continue;
    }
    if (msg.role === 'user') {
      turn++;
    }
    if (msg.role === 'assistant') {
      assistantTurns.push({ turn, content: msg.content });
    }
  }

  const details = [];
  for (const assertion of assertions) {
    details.push(evaluateSingleAssertion(assertion, assistantTurns, feedback));
  }

  const passed = details.filter(d => d.passed).length;
  return { passed, failed: details.length - passed, total: details.length, details };
}

function evaluateSingleAssertion(assertion, assistantTurns, feedback) {
  const base = {
    desc: assertion.desc || assertion.description || '',
    type: assertion.type,
    passed: false
  };

  switch (assertion.type) {
    case 'contains': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) {
        return { ...base, actual: '[no response at turn]' };
      }
      const passed = turnResp.content.toLowerCase().includes(assertion.value.toLowerCase());
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }
    case 'contains_any': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) {
        return { ...base, actual: '[no response at turn]' };
      }
      const lower = turnResp.content.toLowerCase();
      const passed = assertion.values.some(v => lower.includes(v.toLowerCase()));
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }
    case 'not_contains': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) {
        return { ...base, passed: true, actual: '[no response at turn]' };
      }
      const passed = !turnResp.content.toLowerCase().includes(assertion.value.toLowerCase());
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }
    case 'never_contains': {
      const allContent = assistantTurns
        .map(t => t.content)
        .join(' ')
        .toLowerCase();
      const passed = !allContent.includes(assertion.value.toLowerCase());
      return { ...base, passed, actual: passed ? '[clean]' : `Found: "${assertion.value}"` };
    }
    case 'regex': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) {
        return { ...base, actual: '[no response at turn]' };
      }
      const re = new RegExp(assertion.pattern, 'i');
      const passed = re.test(turnResp.content);
      return { ...base, passed, actual: turnResp.content.substring(0, 200) };
    }
    case 'avg_word_count': {
      if (assistantTurns.length === 0) {
        return { ...base, actual: '0 turns' };
      }
      const totalWords = assistantTurns.reduce((sum, t) => sum + t.content.split(/\s+/).length, 0);
      const avg = Math.round(totalWords / assistantTurns.length);
      const passed =
        (!assertion.min || avg >= assertion.min) && (!assertion.max || avg <= assertion.max);
      return { ...base, passed, actual: `avg ${avg} words/response` };
    }
    case 'turn_count': {
      const count = assistantTurns.length;
      const passed =
        (!assertion.min || count >= assertion.min) && (!assertion.max || count <= assertion.max);
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

async function runTest(testId, topicPath, promptOverride, feedbackPromptOverride) {
  const topicFolderName = topicPath ? topicPath.split('/').pop() : 'necrotising_fasciitis';
  const script = await loadTestScript(topicFolderName, testId, topicPath);
  const difficulty = script.difficulty || 'easy';

  let promptSections;
  if (promptOverride) {
    promptSections = promptOverride;
  } else {
    const loaded = loadPrompt(
      topicPath || 'clinical/emergencies/necrotising_fasciitis',
      difficulty
    );
    promptSections = loaded.sections;
  }

  const { sessionId } = createSession(promptSections, { difficulty });
  const session = sessions.get(sessionId);
  const startTime = Date.now();

  for (const input of script.inputs) {
    const text = typeof input === 'string' ? input : input.text;
    await chat(sessionId, text);
  }

  let feedback = null;
  if (script.triggerFeedback) {
    feedback = await generateFeedback(sessionId, feedbackPromptOverride, topicPath);
  }

  const allAssertions = [...(script.assertions || []), ...(script.feedbackAssertions || [])];
  const assertionResults = evaluateAssertions(allAssertions, session.history, feedback);
  const duration = (Date.now() - startTime) / 1000;

  const result = {
    id: generateTranscriptId(testId),
    type: 'automated',
    metadata: {
      testName: script.name,
      testId,
      difficulty,
      timestamp: new Date().toISOString(),
      duration,
      promptHash: hashPrompt(promptSections)
    },
    promptContent: promptSections,
    history: session.history.map((msg, i) => ({
      ...msg,
      turn: msg.role === 'system' ? 0 : Math.ceil(i / 2)
    })),
    assertions: assertionResults,
    feedback
  };

  saveTranscript(result);
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

function saveManualTranscript(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const result = {
    id: generateTranscriptId('manual'),
    type: 'manual',
    metadata: {
      testName: 'Manual Chat',
      difficulty: session.difficulty,
      timestamp: new Date().toISOString(),
      promptHash: hashPrompt(session.promptSections)
    },
    promptContent: session.promptSections,
    history: session.history,
    assertions: null,
    feedback: null
  };

  saveTranscript(result);
  return result.id;
}

function listTranscripts() {
  ensureTestResultsDir();
  const files = fs
    .readdirSync(TEST_RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

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
        feedbackScore: data.feedback?.summary?.score
      };
    } catch {
      return { id: f.replace('.json', ''), type: 'unknown', error: 'parse error' };
    }
  });
}

function loadTranscript(id) {
  const filePath = path.join(TEST_RESULTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Transcript not found: ${id}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function deleteTranscript(id) {
  const filePath = path.join(TEST_RESULTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Transcript not found: ${id}`);
  }
  fs.unlinkSync(filePath);
}

module.exports = {
  createSession,
  chat,
  getSession,
  deleteSession,
  generateFeedback,
  listTopics,
  loadPrompt,
  savePrompt,
  loadFeedbackPromptFile,
  saveFeedbackPrompt,
  listTestScripts,
  runTest,
  saveManualTranscript,
  listTranscripts,
  loadTranscript,
  deleteTranscript,
  serializeTranscript,
  getModifiedFiles,
  clearModifiedFiles
};

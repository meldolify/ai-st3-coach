/**
 * Prompt Lab Service
 * Manages text-only prompt testing sessions: chat, feedback, test execution, transcripts.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const openaiService = require('./OpenAIService');
const { parsePromptSections } = require('../utils/promptParser');
const {
  buildFeedbackPrompt,
  extractDomain,
  resolveScenarioPath,
  safeResolveIn,
  safeResolveInPromptsDir
} = require('../utils/promptAssembler');
const { parseFeedbackResponse } = require('../utils/feedbackParser');
const testScriptGenerator = require('./TestScriptGenerator');

const BACKEND_DIR = path.join(__dirname, '..', '..');
const PROMPTS_DIR = path.join(BACKEND_DIR, 'prompts');
const SCENARIOS_DIR = path.join(PROMPTS_DIR, 'scenarios');
const LEGACY_DIR = path.join(PROMPTS_DIR, '_legacy');
const FEEDBACK_DIR = path.join(LEGACY_DIR, 'feedback');
const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
const TEST_RESULTS_DIR = path.join(BACKEND_DIR, 'test-results');

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
  // Type guard first — Array.prototype.includes('..') and .startsWith on
  // an array have different semantics than the string versions, so the
  // ad-hoc traversal checks below would be silently bypassed if an
  // attacker supplied an array (e.g. via ?topic=a&topic=b).
  if (typeof topicPath !== 'string') {
    throw new Error('Invalid topic path: must be a string');
  }
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
 * Validate a transcript id to prevent path traversal in /transcripts/:id.
 * Transcript ids are produced by generateTranscriptId() and look like
 * "20260512_134523_excellent_candidate" — strictly [A-Za-z0-9_-].
 */
function validateTranscriptId(id) {
  if (!id || typeof id !== 'string' || id.length > 200 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error('Invalid transcript id');
  }
}

/**
 * Get the 3 modular file paths for a topic + difficulty.
 * Uses the same path resolution as production (promptAssembler.js).
 * @param {string} topicPath - e.g., "clinical/emergencies/necrotising_fasciitis"
 * @param {string} difficulty - easy|medium|strict
 * @returns {{ core: string, difficulty: string, clinical: string }}
 */
function getModularPaths(topicPath, difficulty) {
  const domain = extractDomain(topicPath);
  return {
    core: safeResolveInPromptsDir('shared/interview', `core_${domain}_interview.txt`),
    difficulty: safeResolveInPromptsDir(
      'shared/interview',
      `${difficulty}_interview_personality.txt`
    ),
    clinical: resolveScenarioPath(topicPath)
  };
}

/**
 * Get modular feedback file paths.
 * @param {string} topicPath
 * @param {string} difficulty
 * @returns {{ core: string, personality: string, clinical: string }}
 */
function getModularFeedbackPaths(topicPath, difficulty) {
  const domain = extractDomain(topicPath);
  return {
    core: safeResolveInPromptsDir('shared/feedback', `core_${domain}_feedback.txt`),
    personality: safeResolveInPromptsDir(
      'shared/feedback',
      `${difficulty}_feedback_personality.txt`
    ),
    clinical: resolveScenarioPath(topicPath)
  };
}

/**
 * Build the legacy prompt file path (fallback).
 */
function getLegacyPromptPath(topicPath, difficulty) {
  validateTopicPath(topicPath);
  const parts = topicPath.split('/');
  const category = parts[0];
  const folderName = parts[parts.length - 1];
  const filename = `${difficulty}_${category}_${folderName}_1.txt`;
  return safeResolveInPromptsDir('_legacy', topicPath, filename);
}

/**
 * Build feedback prompt path components from topic path (legacy).
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
 * List all available topics by scanning prompts/scenarios/ (production source of truth).
 * Falls back to prompts/_legacy/ if scenarios directory is empty.
 * Returns a flat list grouped by category > subcategory.
 */
function listTopics() {
  const topics = [];
  const scanDir = fs.existsSync(SCENARIOS_DIR) ? SCENARIOS_DIR : LEGACY_DIR;

  const categories = fs.readdirSync(scanDir).filter(d => {
    if (EXCLUDED_DIRS.has(d)) {
      return false;
    }
    return fs.statSync(path.join(scanDir, d)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(scanDir, category);
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
 * Concatenates sections with \n\n — same assembly pattern as production's buildInterviewPrompt().
 * @param {{ core: string, difficulty: string, clinical: string }} promptSections
 * @param {{ difficulty: string }} metadata
 * @returns {{ sessionId: string }}
 */
function createSession(promptSections, metadata = {}) {
  const sessionId = `pl_${crypto.randomUUID()}`;
  // Same join pattern as promptAssembler.buildInterviewPrompt() line 99
  const combinedPrompt = [promptSections.core, promptSections.difficulty, promptSections.clinical]
    .filter(Boolean)
    .join('\n\n');

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
 * Send a user message and get LLM response.
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
 * Load feedback prompt using production's buildFeedbackPrompt() (modular assembly).
 * Falls back to legacy feedback files if modular files don't exist.
 */
function loadFeedbackPromptAssembled(topicPath, difficulty) {
  validateTopicPath(topicPath);
  try {
    // Use production assembler — same prompt as production feedback
    return buildFeedbackPrompt(difficulty, topicPath);
  } catch {
    // Fallback: legacy feedback files
    const { category, folderName } = getFeedbackParts(topicPath);

    const difficultyFile = safeResolveInPromptsDir(
      '_legacy/feedback',
      `${difficulty}_${category}_${folderName}_feedback.txt`
    );
    if (fs.existsSync(difficultyFile)) {
      return fs.readFileSync(difficultyFile, 'utf8');
    }

    const genericTopicFile = safeResolveInPromptsDir(
      '_legacy/feedback',
      `${category}_${folderName}_feedback.txt`
    );
    if (fs.existsSync(genericTopicFile)) {
      return fs.readFileSync(genericTopicFile, 'utf8');
    }

    const genericFile = safeResolveInPromptsDir('_legacy/feedback', 'generic_feedback.txt');
    if (fs.existsSync(genericFile)) {
      return fs.readFileSync(genericFile, 'utf8');
    }

    return 'You are an expert plastic surgery examiner. Review the interview transcript and provide feedback in 6 sections using ===SECTION_N=== delimiters, followed by ===JSON_SUMMARY=== with a JSON score object.';
  }
}

/**
 * Generate full feedback using production-identical single-call pattern.
 * Uses ===SECTION_N=== delimiters, parsed by feedbackParser.js.
 */
async function generateFeedback(sessionId, feedbackPromptOverride, topicPath) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const transcript = serializeTranscript(session.history);
  const feedbackPrompt =
    feedbackPromptOverride ||
    loadFeedbackPromptAssembled(
      topicPath || 'clinical/emergencies/necrotising_fasciitis',
      session.difficulty
    );

  const feedbackMessages = [
    { role: 'system', content: feedbackPrompt },
    { role: 'user', content: 'Here is the interview transcript:\n\n' + transcript }
  ];

  // Single API call — same pattern as production
  const fullResponse = await openaiService.generateResponse(feedbackMessages, {
    max_tokens: 4000,
    temperature: 0.7
  });

  // Parse with production's feedbackParser
  const parsed = parseFeedbackResponse(fullResponse);

  const sections = parsed.sections.length > 0 ? parsed.sections : [fullResponse]; // Fallback: treat whole response as one section

  const summary = parsed.json || buildFallbackSummary(sections, fullResponse);

  return { sections, summary };
}

/**
 * Build a fallback summary when JSON parsing fails.
 */
function buildFallbackSummary(sections, fullText) {
  let score = -1;
  const scoreMatch = fullText.match(/\bscore\b[^.]*?\b([0-5])\b/i);
  if (scoreMatch) {
    score = parseInt(scoreMatch[1], 10);
  }

  return {
    score,
    overallImpression: sections[0] || 'Unable to parse structured feedback',
    clinicalKnowledge: { diagnosis: 'See spoken feedback', management: 'See spoken feedback' },
    strengths: ['See spoken feedback above'],
    improvements: ['JSON parsing failed'],
    summary: sections[0] || 'Feedback generation issue'
  };
}

// ──────────────────────────────────────────
// PROMPT FILE MANAGEMENT
// ──────────────────────────────────────────

/**
 * Load prompt from modular 3-file system (production source of truth).
 * Falls back to legacy monolithic file if modular files don't exist.
 */
function loadPrompt(topicPath, difficulty) {
  validateTopicPath(topicPath);
  const paths = getModularPaths(topicPath, difficulty);

  // Try modular files first (same files production uses)
  if (
    fs.existsSync(paths.core) &&
    fs.existsSync(paths.difficulty) &&
    fs.existsSync(paths.clinical)
  ) {
    return {
      sections: {
        core: fs.readFileSync(paths.core, 'utf8'),
        difficulty: fs.readFileSync(paths.difficulty, 'utf8'),
        clinical: fs.readFileSync(paths.clinical, 'utf8')
      },
      paths: {
        core: path.relative(BACKEND_DIR, paths.core),
        difficulty: path.relative(BACKEND_DIR, paths.difficulty),
        clinical: path.relative(BACKEND_DIR, paths.clinical)
      },
      source: 'modular'
    };
  }

  // Fallback: legacy monolithic file
  const legacyPath = getLegacyPromptPath(topicPath, difficulty);
  if (!fs.existsSync(legacyPath)) {
    throw new Error(`Prompt not found (modular or legacy): ${topicPath}/${difficulty}`);
  }
  const raw = fs.readFileSync(legacyPath, 'utf8');
  return {
    sections: parsePromptSections(raw),
    paths: { legacy: path.relative(BACKEND_DIR, legacyPath) },
    source: 'legacy'
  };
}

/**
 * Save edited prompt sections to modular files.
 * Core and difficulty files are shared across scenarios — tracked separately.
 */
function savePrompt(topicPath, difficulty, sections) {
  validateTopicPath(topicPath);
  const paths = getModularPaths(topicPath, difficulty);
  const savedPaths = [];

  // Save each section to its modular file
  const filesToSave = [
    { content: sections.core, filePath: paths.core, label: 'core' },
    { content: sections.difficulty, filePath: paths.difficulty, label: 'difficulty' },
    { content: sections.clinical, filePath: paths.clinical, label: 'clinical' }
  ];

  for (const { content, filePath, label } of filesToSave) {
    if (content === undefined) {
      continue;
    }
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    const relPath = path.relative(BACKEND_DIR, filePath);
    modifiedFiles.add(relPath);
    savedPaths.push({ label, path: relPath });
  }

  return { paths: savedPaths, savedAt: new Date().toISOString() };
}

/**
 * Load feedback prompt files for editing (core + personality).
 * Reads from modular feedback files first, falls back to legacy.
 */
function loadFeedbackPromptFile(topicPath, difficulty) {
  validateTopicPath(topicPath);
  const feedbackPaths = getModularFeedbackPaths(topicPath, difficulty);

  // Try modular core feedback file
  if (fs.existsSync(feedbackPaths.core)) {
    const result = {
      content: fs.readFileSync(feedbackPaths.core, 'utf8'),
      path: path.relative(BACKEND_DIR, feedbackPaths.core),
      source: 'modular'
    };

    // Also load difficulty-specific feedback personality if it exists
    if (fs.existsSync(feedbackPaths.personality)) {
      result.personalityContent = fs.readFileSync(feedbackPaths.personality, 'utf8');
      result.personalityPath = path.relative(BACKEND_DIR, feedbackPaths.personality);
    }

    return result;
  }

  // Fallback: legacy feedback files
  const { category, folderName } = getFeedbackParts(topicPath);

  const diffFile = path.join(FEEDBACK_DIR, `${difficulty}_${category}_${folderName}_feedback.txt`);
  if (fs.existsSync(diffFile)) {
    return {
      content: fs.readFileSync(diffFile, 'utf8'),
      path: path.relative(BACKEND_DIR, diffFile),
      source: 'legacy'
    };
  }

  const genericFile = path.join(FEEDBACK_DIR, `${category}_${folderName}_feedback.txt`);
  if (fs.existsSync(genericFile)) {
    return {
      content: fs.readFileSync(genericFile, 'utf8'),
      path: path.relative(BACKEND_DIR, genericFile),
      source: 'legacy'
    };
  }

  const fallbackFile = path.join(FEEDBACK_DIR, 'generic_feedback.txt');
  if (fs.existsSync(fallbackFile)) {
    return {
      content: fs.readFileSync(fallbackFile, 'utf8'),
      path: path.relative(BACKEND_DIR, fallbackFile),
      source: 'legacy'
    };
  }

  throw new Error('No feedback prompt found for ' + topicPath);
}

/**
 * Save feedback prompt to modular file (same file production reads).
 * Falls back to legacy path if modular feedback directory doesn't exist.
 */
function saveFeedbackPrompt(topicPath, difficulty, content, personalityContent) {
  validateTopicPath(topicPath);
  const feedbackPaths = getModularFeedbackPaths(topicPath, difficulty);
  const savedPaths = [];

  // Save core feedback file if provided
  if (content !== undefined) {
    const filePath = feedbackPaths.core;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles.add(path.relative(BACKEND_DIR, filePath));
    savedPaths.push(path.relative(BACKEND_DIR, filePath));
  }

  // Save feedback personality file if provided
  if (personalityContent !== undefined) {
    const filePath = feedbackPaths.personality;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, personalityContent, 'utf8');
    modifiedFiles.add(path.relative(BACKEND_DIR, filePath));
    savedPaths.push(path.relative(BACKEND_DIR, filePath));
  }

  return { paths: savedPaths, savedAt: new Date().toISOString() };
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

  // Defense-in-depth: the route handler validates topic, but reject anything
  // that would let us escape TEST_SCRIPTS_DIR here too.
  if (
    topicFolderName &&
    (topicFolderName.includes('..') ||
      topicFolderName.includes('/') ||
      topicFolderName.includes('\\'))
  ) {
    throw new Error('Invalid topic folder name');
  }

  // 1. Pre-made topic-specific scripts (gold standard)
  const topicDir = topicFolderName
    ? safeResolveIn(TEST_SCRIPTS_DIR, topicFolderName)
    : TEST_SCRIPTS_DIR;
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

  // 3. Cached LLM-generated scripts
  if (topicFolderName) {
    const generatedDir = safeResolveIn(TEST_SCRIPTS_DIR, '_generated', topicFolderName);
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
          description: 'LLM-generated test (will be created on first run)',
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
  const premadePath = safeResolveIn(TEST_SCRIPTS_DIR, topicFolderName, `${testId}.json`);
  if (fs.existsSync(premadePath)) {
    return JSON.parse(fs.readFileSync(premadePath, 'utf8'));
  }

  // 2. Generic behavioral
  const genericPath = safeResolveIn(TEST_SCRIPTS_DIR, '_generic', `${testId}.json`);
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

    // ── Structural assertions (6-state interview machine) ──

    case 'stage_covered': {
      const stageKeywords = {
        assessment: ['examination', 'assess', 'a b c d e', 'history', 'findings', 'diagnosis'],
        investigations: [
          'blood test',
          'imaging',
          'scoring system',
          'investigate',
          'lab',
          'x-ray',
          'ct',
          'mri',
          'bloods'
        ],
        initial_management: [
          'stabilise',
          'resuscit',
          'antibiotic',
          'fluid',
          'initial management',
          'involve'
        ],
        definitive_management: [
          'surgery',
          'operat',
          'surgical',
          'debrid',
          'post-operative',
          'post operative'
        ]
      };
      const keywords = stageKeywords[assertion.stage] || [];
      const allContent = assistantTurns
        .map(t => t.content)
        .join(' ')
        .toLowerCase();
      const found = keywords.filter(kw => allContent.includes(kw));
      const minKw = assertion.minKeywords || 1;
      const passed = found.length >= minKw;
      return {
        ...base,
        passed,
        actual: `Found ${found.length}/${minKw} keywords: ${found.join(', ') || 'none'}`
      };
    }

    case 'no_stage_announcement': {
      const stageNames = [
        'assessment',
        'investigations',
        'initial management',
        'definitive management'
      ];
      const allContent = assistantTurns.map(t => t.content).join(' ');
      const announcementPatterns = stageNames.map(
        name =>
          new RegExp(
            `(moving on to|let'?s? (?:discuss|talk about|move to)|now (?:let'?s?|we will)|we are now in)\\s+(?:the\\s+)?${name}`,
            'i'
          )
      );
      const violations = announcementPatterns.filter(p => p.test(allContent));
      const passed = violations.length === 0;
      return {
        ...base,
        passed,
        actual: passed ? '[no announcements]' : `Found ${violations.length} announcement(s)`
      };
    }

    case 'redirect_on_skip': {
      const turnResp = assistantTurns.find(t => t.turn === assertion.turn);
      if (!turnResp) {
        return { ...base, actual: '[no response at turn]' };
      }
      const lower = turnResp.content.toLowerCase();
      const redirectKws = assertion.redirectKeywords || [];
      const found = redirectKws.some(kw => lower.includes(kw.toLowerCase()));
      return { ...base, passed: found, actual: turnResp.content.substring(0, 200) };
    }

    case 'prompt_depth': {
      const postIntroTurns = assistantTurns.filter(t => t.turn >= 3);
      const questionTurns = postIntroTurns.filter(t => t.content.includes('?'));
      const specificPatterns = [
        /what.*would you expect/i,
        /can you describe/i,
        /what.*blood test/i,
        /scoring system/i,
        /what.*antibiotic/i,
        /what.*surgical/i,
        /walk.*through/i,
        /post.?operative/i,
        /what.*examination/i,
        /a b c d e/i,
        /what.*imaging/i,
        /what.*teams/i
      ];
      const specificCount = questionTurns.filter(t =>
        specificPatterns.some(p => p.test(t.content))
      ).length;

      let passed = false;
      const diff = assertion.expectedDifficulty;
      if (diff === 'easy') {
        passed = specificCount >= (assertion.minSpecificQuestions || 3);
      } else if (diff === 'medium') {
        passed =
          questionTurns.length >= 2 && specificCount <= (assertion.maxSpecificQuestions || 2);
      } else if (diff === 'strict') {
        passed = specificCount <= (assertion.maxSpecificQuestions || 1);
      }
      return {
        ...base,
        passed,
        actual: `${questionTurns.length} questions, ${specificCount} specific`
      };
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
  const combined = [sections.core, sections.difficulty, sections.clinical]
    .filter(Boolean)
    .join('\n\n');
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 8);
}

function ensureTestResultsDir() {
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  }
}

function saveTranscript(result) {
  ensureTestResultsDir();
  const filePath = safeResolveIn(TEST_RESULTS_DIR, `${result.id}.json`);
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
  validateTranscriptId(id);
  const filePath = safeResolveIn(TEST_RESULTS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Transcript not found: ${id}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function deleteTranscript(id) {
  validateTranscriptId(id);
  const filePath = safeResolveIn(TEST_RESULTS_DIR, `${id}.json`);
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
  clearModifiedFiles,
  // Exposed for testing
  getModularPaths,
  getModularFeedbackPaths,
  evaluateAssertions,
  evaluateSingleAssertion
};

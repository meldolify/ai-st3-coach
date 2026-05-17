/**
 * Prompt Lab REST API Routes
 * All endpoints for the text-only prompt testing environment.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const promptLabService = require('../services/PromptLabService');
const testScriptGenerator = require('../services/TestScriptGenerator');
const gitHubService = require('../services/GitHubService');
const { RateLimitError } = require('openai');

const DEFAULT_TOPIC = 'clinical/emergencies/necrotising_fasciitis';
const BACKEND_DIR = path.join(__dirname, '..', '..');

// Topic paths look like "clinical/emergencies/necrotising_fasciitis" — strictly
// lowercase letters, digits, underscores, and forward slashes. Anything outside
// this set (including `..`, leading `/`, or backslashes) is rejected.
const TOPIC_REGEX = /^[a-z0-9_/]+$/;
function isValidTopic(topic) {
  return (
    typeof topic === 'string' &&
    topic.length > 0 &&
    topic.length <= 200 &&
    !topic.includes('..') &&
    !topic.startsWith('/') &&
    TOPIC_REGEX.test(topic)
  );
}

// Transcript ids are produced by PromptLabService.generateTranscriptId() —
// "20260512_134523_label" style. Reject anything with path-traversal characters.
const TRANSCRIPT_ID_REGEX = /^[A-Za-z0-9_-]+$/;
function isValidTranscriptId(id) {
  return (
    typeof id === 'string' && id.length > 0 && id.length <= 200 && TRANSCRIPT_ID_REGEX.test(id)
  );
}

// Session ids are produced by PromptLabService.createSession() as
// `pl_${crypto.randomUUID()}`. Match that exact shape to reject anything
// that looks like a forged or path-traversing id.
const SESSION_ID_REGEX = /^pl_[A-Za-z0-9-]+$/;
function isValidSessionId(id) {
  return typeof id === 'string' && id.length > 3 && id.length <= 100 && SESSION_ID_REGEX.test(id);
}

const MAX_CHAT_MESSAGE_LENGTH = 10_000;

/**
 * Commit saved files to GitHub main branch (if configured).
 * Non-blocking — returns result but doesn't throw on failure.
 * @param {Array<{label: string, path: string}>} savedPaths - Paths relative to backend/
 * @returns {Promise<{committed: boolean, commitError?: string, commitUrl?: string}>}
 */
async function autoCommitToGitHub(savedPaths) {
  if (!gitHubService.isConfigured()) {
    return { committed: false };
  }
  try {
    const files = savedPaths.map(({ path: relPath }) => ({
      // Prepend 'backend/' since paths are relative to backend dir, but repo root is one level up
      path: 'backend/' + relPath.replace(/\\/g, '/'),
      content: fs.readFileSync(path.join(BACKEND_DIR, relPath), 'utf8')
    }));
    const result = await gitHubService.commitToMain(files);
    return { committed: true, commitUrl: result.commitUrl };
  } catch (err) {
    console.error('[PROMPT LAB] GitHub auto-commit failed:', err.message);
    return { committed: false, commitError: err.message };
  }
}

// ──────────────────────────────────────────
// TOPIC ENDPOINTS
// ──────────────────────────────────────────

/**
 * GET /topics — List all available topics
 */
router.get('/topics', (req, res) => {
  try {
    const topics = promptLabService.listTopics();
    res.json({ topics });
  } catch (err) {
    console.error('[PROMPT LAB] List topics error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
// SESSION ENDPOINTS
// ──────────────────────────────────────────

/**
 * POST /session — Create a new chat session
 * Body: { promptSections: { core, difficulty, clinical }, metadata: { difficulty } }
 */
router.post('/session', (req, res) => {
  try {
    const { promptSections, metadata } = req.body;
    if (!promptSections?.core && !promptSections?.difficulty && !promptSections?.clinical) {
      return res
        .status(400)
        .json({ error: 'promptSections required (core, difficulty, clinical)' });
    }
    const result = promptLabService.createSession(promptSections, metadata);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Session create error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /chat — Send user message, get GPT response
 * Body: { sessionId, message }
 */
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message required' });
    }
    if (!isValidSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid sessionId' });
    }
    if (typeof message !== 'string' || message.length > MAX_CHAT_MESSAGE_LENGTH) {
      return res
        .status(400)
        .json({ error: `message must be a string ≤ ${MAX_CHAT_MESSAGE_LENGTH} chars` });
    }
    const result = await promptLabService.chat(sessionId, message);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Chat error:', err.message);
    if (err instanceof RateLimitError || err.isRateLimit) {
      return res.status(429).json({
        error: 'API rate limit reached. Please wait a moment and try again.',
        code: 'RATE_LIMITED'
      });
    }
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * POST /feedback — Generate full feedback for a session
 * Body: { sessionId, feedbackPrompt?, topic? }
 */
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, feedbackPrompt, topic } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }
    const result = await promptLabService.generateFeedback(
      sessionId,
      feedbackPrompt || undefined,
      topic || DEFAULT_TOPIC
    );
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Feedback error:', err.message);
    if (err instanceof RateLimitError || err.isRateLimit) {
      return res.status(429).json({
        error:
          'API rate limit reached. Feedback requires multiple API calls — please wait 30 seconds and try again.',
        code: 'RATE_LIMITED'
      });
    }
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * POST /save-manual — Save current manual session as transcript
 * Body: { sessionId }
 */
router.post('/save-manual', (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }
    const transcriptId = promptLabService.saveManualTranscript(sessionId);
    res.json({ transcriptId });
  } catch (err) {
    console.error('[PROMPT LAB] Save manual error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
// PROMPT FILE ENDPOINTS
// ──────────────────────────────────────────

/**
 * GET /prompts/:difficulty — Load prompt parsed into sections
 * Query: ?topic=clinical/emergencies/necrotising_fasciitis
 */
router.get('/prompts/:difficulty', (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const topic = req.query.topic || DEFAULT_TOPIC;
    const result = promptLabService.loadPrompt(topic, difficulty);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Load prompt error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * PUT /prompts/:difficulty — Save edited prompt sections
 * Query: ?topic=...
 * Body: { sections: { core, difficulty, clinical } }
 */
router.put('/prompts/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const { sections } = req.body;
    if (!sections) {
      return res.status(400).json({ error: 'sections object required' });
    }
    const topic = req.query.topic || DEFAULT_TOPIC;
    const result = promptLabService.savePrompt(topic, difficulty, sections);

    // Auto-commit to GitHub if configured
    const commitResult = await autoCommitToGitHub(result.paths);
    res.json({ ...result, ...commitResult });
  } catch (err) {
    console.error('[PROMPT LAB] Save prompt error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /feedback-prompt/:difficulty — Load feedback prompt for editing
 * Query: ?topic=...
 */
router.get('/feedback-prompt/:difficulty', (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const topic = req.query.topic || DEFAULT_TOPIC;
    const result = promptLabService.loadFeedbackPromptFile(topic, difficulty);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Load feedback prompt error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * PUT /feedback-prompt/:difficulty — Save edited feedback prompt
 * Query: ?topic=...
 * Body: { content?: "...", personalityContent?: "..." }
 */
router.put('/feedback-prompt/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const { content, personalityContent } = req.body;
    if (content === undefined && personalityContent === undefined) {
      return res.status(400).json({ error: 'content or personalityContent required' });
    }
    const topic = req.query.topic || DEFAULT_TOPIC;
    const result = promptLabService.saveFeedbackPrompt(
      topic,
      difficulty,
      content,
      personalityContent
    );

    // Auto-commit to GitHub if configured
    const commitResult = await autoCommitToGitHub(
      result.paths.map(p => ({ label: 'feedback', path: p }))
    );
    res.json({ ...result, ...commitResult });
  } catch (err) {
    console.error('[PROMPT LAB] Save feedback prompt error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
// TEST SCRIPT ENDPOINTS
// ──────────────────────────────────────────

/**
 * GET /tests — List available test scripts
 * Query: ?topic=...
 */
router.get('/tests', (req, res) => {
  try {
    const topic = req.query.topic || DEFAULT_TOPIC;
    if (!isValidTopic(topic)) {
      return res.status(400).json({ error: 'Invalid topic' });
    }
    const topicFolderName = topic.split('/').pop();
    const tests = promptLabService.listTestScripts(topicFolderName, topic);
    res.json({ tests });
  } catch (err) {
    console.error('[PROMPT LAB] List tests error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /generate-test — Pre-generate a test script for a topic
 * Body: { testType, topic }
 */
router.post('/generate-test', async (req, res) => {
  try {
    const { testType, topic } = req.body;
    if (!testType || !topic) {
      return res.status(400).json({ error: 'testType and topic required' });
    }
    if (!isValidTopic(topic)) {
      return res.status(400).json({ error: 'Invalid topic' });
    }
    if (!testScriptGenerator.GENERATABLE_TEST_TYPES.includes(testType)) {
      return res.status(400).json({ error: 'Invalid testType' });
    }
    const script = await testScriptGenerator.generateTestScript(testType, topic);
    testScriptGenerator.cacheScript(topic, testType, script);
    res.json({ script, cached: true });
  } catch (err) {
    console.error('[PROMPT LAB] Generate test error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /generated-tests — Clear cached generated test scripts for a topic
 * Query: ?topic=...
 */
router.delete('/generated-tests', (req, res) => {
  try {
    const topic = req.query.topic;
    if (!topic) {
      return res.status(400).json({ error: 'topic query param required' });
    }
    if (!isValidTopic(topic)) {
      return res.status(400).json({ error: 'Invalid topic' });
    }
    testScriptGenerator.clearCache(topic);
    res.json({ success: true });
  } catch (err) {
    console.error('[PROMPT LAB] Clear generated tests error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /run-test — Execute an automated test
 * Body: { testId, topic?, promptSections?, feedbackPrompt? }
 */
router.post('/run-test', async (req, res) => {
  try {
    const { testId, topic, promptSections, feedbackPrompt } = req.body;
    if (!testId) {
      return res.status(400).json({ error: 'testId required' });
    }
    const result = await promptLabService.runTest(
      testId,
      topic || DEFAULT_TOPIC,
      promptSections || undefined,
      feedbackPrompt || undefined
    );
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Run test error:', err.message);
    if (err instanceof RateLimitError || err.isRateLimit) {
      return res.status(429).json({
        error:
          'API rate limit reached. Tests require multiple API calls — please wait and try again.',
        code: 'RATE_LIMITED'
      });
    }
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * POST /run-difficulty-comparison — Run same test across multiple difficulties
 * Body: { testId, topic?, difficulties?: ['easy','medium','strict'] }
 */
router.post('/run-difficulty-comparison', async (req, res) => {
  try {
    const { testId, topic, difficulties } = req.body;
    if (!testId) {
      return res.status(400).json({ error: 'testId required' });
    }
    const diffs = difficulties || ['easy', 'medium', 'strict'];
    const results = [];
    for (const difficulty of diffs) {
      const loaded = promptLabService.loadPrompt(topic || DEFAULT_TOPIC, difficulty);
      const result = await promptLabService.runTest(
        testId,
        topic || DEFAULT_TOPIC,
        loaded.sections,
        undefined
      );
      results.push({ difficulty, ...result });
    }
    res.json({ results });
  } catch (err) {
    console.error('[PROMPT LAB] Difficulty comparison error:', err.message);
    if (err instanceof RateLimitError || err.isRateLimit) {
      return res.status(429).json({ error: 'API rate limit reached.', code: 'RATE_LIMITED' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
// TRANSCRIPT ENDPOINTS
// ──────────────────────────────────────────

/**
 * GET /transcripts — List saved transcripts
 */
router.get('/transcripts', (req, res) => {
  try {
    const transcripts = promptLabService.listTranscripts();
    res.json({ transcripts });
  } catch (err) {
    console.error('[PROMPT LAB] List transcripts error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /transcripts/:id — Load specific transcript
 */
router.get('/transcripts/:id', (req, res) => {
  try {
    if (!isValidTranscriptId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid transcript id' });
    }
    const transcript = promptLabService.loadTranscript(req.params.id);
    res.json(transcript);
  } catch (err) {
    console.error('[PROMPT LAB] Load transcript error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * DELETE /transcripts/:id — Delete a transcript
 */
router.delete('/transcripts/:id', (req, res) => {
  try {
    if (!isValidTranscriptId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid transcript id' });
    }
    promptLabService.deleteTranscript(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[PROMPT LAB] Delete transcript error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
// GITHUB PR ENDPOINTS
// ──────────────────────────────────────────

/**
 * GET /changes — List files modified since server start
 */
router.get('/changes', (req, res) => {
  try {
    const files = promptLabService.getModifiedFiles();
    res.json({ files, count: files.length });
  } catch (err) {
    console.error('[PROMPT LAB] List changes error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /config — Return feature flags for the frontend
 */
router.get('/config', (req, res) => {
  res.json({
    githubEnabled: !!(
      process.env.GITHUB_TOKEN &&
      process.env.GITHUB_OWNER &&
      process.env.GITHUB_REPO
    )
  });
});

/**
 * POST /create-pr — Create a GitHub PR with all modified prompt files
 */
router.post('/create-pr', async (req, res) => {
  try {
    const files = promptLabService.getModifiedFiles();
    if (files.length === 0) {
      return res.status(400).json({ error: 'No modified files to commit' });
    }

    let gitHubService;
    try {
      gitHubService = require('../services/GitHubService');
    } catch (e) {
      return res.status(500).json({ error: 'GitHub service not available' });
    }

    // Read current content of each modified file
    const BACKEND_DIR = path.join(__dirname, '..', '..');
    const fileContents = files.map(relPath => ({
      path: relPath,
      content: fs.readFileSync(path.join(BACKEND_DIR, relPath), 'utf8')
    }));

    const result = await gitHubService.createPR(fileContents);
    promptLabService.clearModifiedFiles();
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Create PR error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

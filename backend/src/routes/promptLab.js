/**
 * Prompt Lab REST API Routes
 * All endpoints for the text-only prompt testing environment.
 */

const express = require('express');
const router = express.Router();
const promptLabService = require('../services/PromptLabService');

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
      return res.status(400).json({ error: 'promptSections required (core, difficulty, clinical)' });
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
    const result = await promptLabService.chat(sessionId, message);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Chat error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * POST /feedback — Generate full feedback for a session
 * Body: { sessionId, feedbackPrompt? }
 */
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, feedbackPrompt } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }
    const result = await promptLabService.generateFeedback(sessionId, feedbackPrompt || undefined);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Feedback error:', err.message);
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
 * GET /prompts/:difficulty — Load test prompt parsed into sections
 */
router.get('/prompts/:difficulty', (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const result = promptLabService.loadTestPrompt(difficulty);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Load prompt error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * PUT /prompts/:difficulty — Save edited prompt sections
 * Body: { sections: { core, difficulty, clinical } }
 */
router.put('/prompts/:difficulty', (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const { sections } = req.body;
    if (!sections) {
      return res.status(400).json({ error: 'sections object required' });
    }
    const result = promptLabService.saveTestPrompt(difficulty, sections);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Save prompt error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /feedback-prompt/:difficulty — Load feedback prompt for editing
 */
router.get('/feedback-prompt/:difficulty', (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const result = promptLabService.loadTestFeedbackPromptFile(difficulty);
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Load feedback prompt error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * PUT /feedback-prompt/:difficulty — Save edited feedback prompt
 * Body: { content: "..." }
 */
router.put('/feedback-prompt/:difficulty', (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['easy', 'medium', 'strict'].includes(difficulty)) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or strict' });
    }
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content required' });
    }
    const result = promptLabService.saveTestFeedbackPrompt(difficulty, content);
    res.json(result);
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
 */
router.get('/tests', (req, res) => {
  try {
    const tests = promptLabService.listTestScripts();
    res.json({ tests });
  } catch (err) {
    console.error('[PROMPT LAB] List tests error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /run-test — Execute an automated test
 * Body: { testId, promptSections?, feedbackPrompt? }
 */
router.post('/run-test', async (req, res) => {
  try {
    const { testId, promptSections, feedbackPrompt } = req.body;
    if (!testId) {
      return res.status(400).json({ error: 'testId required' });
    }
    const result = await promptLabService.runTest(
      testId,
      promptSections || undefined,
      feedbackPrompt || undefined
    );
    res.json(result);
  } catch (err) {
    console.error('[PROMPT LAB] Run test error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
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
    promptLabService.deleteTranscript(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[PROMPT LAB] Delete transcript error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;

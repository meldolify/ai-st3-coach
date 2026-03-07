/**
 * Test Script Generator
 * Generates scenario-specific test scripts by reading the clinical scenario
 * file and using the LLM to create appropriate candidate inputs and assertions.
 */

const fs = require('fs');
const path = require('path');
const openaiService = require('./OpenAIService');
const { resolveScenarioPath } = require('../utils/promptAssembler');
const { parsePromptSections } = require('../utils/promptParser');

const BACKEND_DIR = path.join(__dirname, '..', '..');
const PROMPTS_DIR = path.join(BACKEND_DIR, 'prompts');
const LEGACY_DIR = path.join(PROMPTS_DIR, '_legacy');
const TEST_SCRIPTS_DIR = path.join(BACKEND_DIR, 'test-scripts');
const GENERATED_CACHE_DIR = path.join(TEST_SCRIPTS_DIR, '_generated');

// 24-hour cache TTL
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Test types that can be generated
const GENERATABLE_TEST_TYPES = [
  'excellent_candidate',
  'good_candidate',
  'poor_candidate',
  'derailing',
  'disruptive',
  'questioning',
  'feedback_interrupt'
];

// Universal assertions injected into every generated script
const UNIVERSAL_ASSERTIONS = {
  interview: [
    {
      turn: 1,
      type: 'contains_any',
      values: ['hello', 'good morning', 'good afternoon', 'welcome', 'ready'],
      desc: 'AI greets the candidate'
    },
    { type: 'never_contains', value: "I'm an AI", desc: 'AI never breaks character' },
    { type: 'avg_word_count', min: 5, max: 60, desc: 'AI keeps responses brief' }
  ],
  clinical: [
    { type: 'never_contains', value: 'correct', desc: 'AI never confirms correctness' },
    { type: 'no_stage_announcement', desc: 'AI never announces stage transitions' }
  ],
  feedback: [{ type: 'section_count', expected: 6, desc: 'All 6 feedback sections are generated' }]
};

// ──────────────────────────────────────────
// PATH HELPERS
// ──────────────────────────────────────────

function getPromptPath(topicPath, difficulty) {
  const parts = topicPath.split('/');
  const category = parts[0];
  const folderName = parts[parts.length - 1];
  const filename = `${difficulty}_${category}_${folderName}_1.txt`;
  return path.join(LEGACY_DIR, topicPath, filename);
}

function getCachePath(topicPath, testType) {
  const folderName = topicPath.split('/').pop();
  return path.join(GENERATED_CACHE_DIR, folderName, `${testType}.json`);
}

// ──────────────────────────────────────────
// CACHING
// ──────────────────────────────────────────

function getCachedScript(topicPath, testType) {
  const cachePath = getCachePath(topicPath, testType);
  if (!fs.existsSync(cachePath)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (data._cachedAt) {
      const age = Date.now() - new Date(data._cachedAt).getTime();
      if (age > CACHE_TTL_MS) {
        return null;
      }
    }
    return data;
  } catch {
    return null;
  }
}

function cacheScript(topicPath, testType, script) {
  const cachePath = getCachePath(topicPath, testType);
  const dir = path.dirname(cachePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const cached = { ...script, _cachedAt: new Date().toISOString(), _generatedFor: topicPath };
  fs.writeFileSync(cachePath, JSON.stringify(cached, null, 2), 'utf8');
}

function clearCache(topicPath) {
  const folderName = topicPath.split('/').pop();
  const dir = path.join(GENERATED_CACHE_DIR, folderName);
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => fs.unlinkSync(path.join(dir, f)));
    fs.rmdirSync(dir);
  }
}

// ──────────────────────────────────────────
// PROMPT FILE ANALYSIS
// ──────────────────────────────────────────

function extractScenarioTitle(clinicalSection) {
  const match = clinicalSection.match(/SCENARIO TITLE\s*\n+\s*(.+)/i);
  return match ? match[1].trim() : null;
}

function hasRealContent(topicPath) {
  try {
    // Try modular scenario file first (production source of truth)
    const scenarioPath = resolveScenarioPath(topicPath);
    if (fs.existsSync(scenarioPath)) {
      const content = fs.readFileSync(scenarioPath, 'utf8');
      return !!(
        content &&
        !content.includes('[PLACEHOLDER') &&
        !content.includes('[AUTHOR NOTE') &&
        content.trim().length > 100
      );
    }

    // Fallback: legacy monolithic file
    const promptPath = getPromptPath(topicPath, 'easy');
    if (!fs.existsSync(promptPath)) {
      return false;
    }
    const raw = fs.readFileSync(promptPath, 'utf8');
    const sections = parsePromptSections(raw);
    return !!(
      sections.clinical &&
      !sections.clinical.includes('[PLACEHOLDER') &&
      sections.clinical.trim().length > 100
    );
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────
// META-PROMPTS
// ──────────────────────────────────────────

function buildGenerationPrompt(testType, clinicalSection, scenarioTitle) {
  const baseInstructions = `You are a test script generator for an AI-powered ST3 plastic surgery interview trainer.

You will receive the CLINICAL SCENARIO BLOCK (Section 3) from a prompt file. This contains the scenario title, case introduction, clinical domains, essential marking points, and bonus marking points.

Your task: generate a JSON test script that simulates a candidate responding to this scenario.

The test script JSON format is:
{
  "name": "<Test Name> - <Scenario Title>",
  "description": "<What this test validates>",
  "difficulty": "easy",
  "inputs": ["<candidate utterance 1>", "<candidate utterance 2>", ...],
  "assertions": [<assertion objects>],
  "triggerFeedback": true/false,
  "feedbackAssertions": [<assertion objects>]
}

RULES FOR INPUTS:
- Each input is a single candidate spoken response (1-5 sentences)
- First input: greeting/confirmation of readiness (e.g., "Good morning. Yes, I'm ready.")
- Sound like natural spoken English from a real surgical trainee
- Spell out abbreviations with spaces as spoken: "A B C D E", "I T U", "M R S A", "L R I N E C"
- Do NOT include examiner questions — only candidate responses

ASSERTION TYPES:
- { turn: N, type: "contains", value: "text", desc: "..." } — response at turn N contains text (case-insensitive)
- { turn: N, type: "contains_any", values: ["a","b"], desc: "..." } — response at turn N contains any value
- { turn: N, type: "not_contains", value: "text", desc: "..." } — response at turn N does NOT contain text
- { type: "never_contains", value: "text", desc: "..." } — no response ever contains text
- { type: "avg_word_count", min: N, max: N, desc: "..." } — average words per response
- { type: "score_range", min: N, max: N, desc: "..." } — feedback score 0-5
- { type: "section_count", expected: N, desc: "..." } — number of feedback sections
- { type: "feedback_contains", value: "text", desc: "..." } — feedback text contains value

Turn numbers: Turn 1 = AI greeting. Turn 2 = AI reads case + opening question. Candidate's clinical responses start from turn 3+.`;

  const typePrompts = {
    excellent_candidate: `Generate an EXCELLENT candidate test (expected score 4-5).

INPUTS (6-8 total):
- Candidate covers ALL essential marking points systematically
- Also covers MOST bonus marking points
- Uses structured approach (e.g., "A B C D E" assessment)
- Demonstrates advanced knowledge (specific drug names, scoring systems, surgical details)
- Professional, confident, well-organized

ASSERTIONS:
- never_contains: "you should" (AI must not teach)
- triggerFeedback: true
- feedbackAssertions: score_range 4-5, plus 2-3 feedback_contains for specific bonus points the candidate covered`,

    good_candidate: `Generate a GOOD candidate test (expected score 3-4).

INPUTS (6-7 total):
- Candidate covers MOST essential marking points
- May miss 1-2 less critical essential points
- Does NOT cover bonus marking points
- Uses a structured approach but less detailed
- Competent but not exceptional

ASSERTIONS:
- never_contains: "well done" (AI must not validate)
- triggerFeedback: true
- feedbackAssertions: score_range 3-4`,

    poor_candidate: `Generate a POOR candidate test (expected score 0-1).

INPUTS (5-6 total):
- Candidate misses the diagnosis or fails to recognise urgency
- Gives generic/vague answers ("some blood tests", "antibiotics")
- Does NOT use a structured approach
- Misses key management steps
- May suggest inappropriate management

ASSERTIONS:
- never_contains: "the answer is" (AI must not reveal answers)
- triggerFeedback: true
- feedbackAssertions: score_range 0-1, plus feedback_contains for the key missed critical management step`,

    questioning: `Generate a QUESTIONING candidate test (candidate reverses roles and asks the examiner).

INPUTS (5-6 total):
- Candidate asks the examiner to explain concepts instead of answering
- Asks about the diagnosis, assessment approach, treatments, scoring systems
- References scenario-specific terminology when asking
- Does NOT include any clinical answers — purely question-asking

ASSERTIONS:
- For turns 3-6: not_contains assertions checking AI does NOT explain or teach specific answers
- triggerFeedback: false
- feedbackAssertions: []`,

    feedback_interrupt: `Generate a FEEDBACK INTERRUPT test (candidate tries to re-engage after feedback).

INPUTS (8 total):
- First 4: brief but correct clinical answers covering main domains
- Last 4: attempts to restart scenario, ask new questions, or request re-examination. Final input should be polite acceptance.

ASSERTIONS:
- Turns 5-7: not_contains checking AI does not restart scenario or answer new clinical questions
- triggerFeedback: true
- feedbackAssertions: score_range 2-4`
  };

  return `${baseInstructions}

${typePrompts[testType]}

CLINICAL SCENARIO (Section 3):
---
${clinicalSection}
---

Scenario Title: ${scenarioTitle}

Generate ONLY the JSON object. No markdown code fences, no explanation, just valid JSON.`;
}

// ──────────────────────────────────────────
// GENERATION
// ──────────────────────────────────────────

function validateGeneratedScript(script) {
  if (!script.name) {
    throw new Error('Generated script missing name');
  }
  if (!script.inputs || !Array.isArray(script.inputs) || script.inputs.length < 3) {
    throw new Error('Generated script has too few inputs (need at least 3)');
  }
  if (!script.assertions || !Array.isArray(script.assertions)) {
    throw new Error('Generated script has no assertions array');
  }
  for (const a of [...(script.assertions || []), ...(script.feedbackAssertions || [])]) {
    if (!a.type) {
      throw new Error('Assertion missing type field');
    }
    if (!a.desc) {
      throw new Error('Assertion missing desc field');
    }
  }
}

async function generateTestScript(testType, topicPath, difficulty) {
  difficulty = difficulty || 'easy';

  // 1. Load the clinical scenario (modular file first, legacy fallback)
  let clinicalContent;
  const scenarioPath = resolveScenarioPath(topicPath);
  if (fs.existsSync(scenarioPath)) {
    clinicalContent = fs.readFileSync(scenarioPath, 'utf8');
  } else {
    // Fallback: legacy monolithic file
    const promptPath = getPromptPath(topicPath, difficulty);
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file not found for ${topicPath} (${difficulty})`);
    }
    const raw = fs.readFileSync(promptPath, 'utf8');
    const sections = parsePromptSections(raw);
    clinicalContent = sections.clinical;
  }

  if (
    !clinicalContent ||
    clinicalContent.includes('[PLACEHOLDER') ||
    clinicalContent.includes('[AUTHOR NOTE')
  ) {
    throw new Error(`Scenario ${topicPath} has placeholder content — cannot generate test scripts`);
  }

  // 2. Extract scenario title
  const scenarioTitle =
    extractScenarioTitle(clinicalContent) || topicPath.split('/').pop().replace(/_/g, ' ');

  // 3. Build the meta-prompt
  const metaPrompt = buildGenerationPrompt(testType, clinicalContent, scenarioTitle);

  // 4. Call LLM
  const response = await openaiService.generateResponse([{ role: 'user', content: metaPrompt }], {
    temperature: 0.7,
    max_tokens: 2500
  });

  // 5. Parse JSON from response (handle possible markdown fences)
  let jsonStr = response.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }
  // Always try brace extraction as fallback (covers partial fences, extra text around JSON)
  if (!jsonStr.startsWith('{')) {
    const braceStart = jsonStr.indexOf('{');
    const braceEnd = jsonStr.lastIndexOf('}');
    if (braceStart !== -1 && braceEnd > braceStart) {
      jsonStr = jsonStr.substring(braceStart, braceEnd + 1);
    }
  }

  let script;
  try {
    script = JSON.parse(jsonStr);
  } catch (parseErr) {
    throw new Error('LLM returned invalid JSON for test script: ' + parseErr.message);
  }

  // 6. Inject universal assertions (prepend so they come first)
  const universalAsserts = [
    ...UNIVERSAL_ASSERTIONS.interview,
    ...(testType !== 'derailing' && testType !== 'disruptive' ? UNIVERSAL_ASSERTIONS.clinical : [])
  ];
  script.assertions = [...universalAsserts, ...(script.assertions || [])];

  if (script.triggerFeedback) {
    script.feedbackAssertions = [
      ...UNIVERSAL_ASSERTIONS.feedback,
      ...(script.feedbackAssertions || [])
    ];
  }

  // 7. Ensure difficulty is set
  script.difficulty = script.difficulty || difficulty;

  // 8. Validate
  validateGeneratedScript(script);

  return script;
}

module.exports = {
  generateTestScript,
  getCachedScript,
  cacheScript,
  clearCache,
  hasRealContent,
  GENERATABLE_TEST_TYPES,
  // Exported for testing
  validateGeneratedScript,
  buildGenerationPrompt,
  extractScenarioTitle
};

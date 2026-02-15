/**
 * Feedback Parser Tests
 * Tests parsing of LLM feedback response with section delimiters.
 */

const { parseFeedbackResponse } = require('../src/utils/feedbackParser');

describe('parseFeedbackResponse', () => {
  test('parses well-formed response with 6 sections and JSON', () => {
    const input = `===SECTION_1===
Overall, this was a satisfactory performance. I would give you a score of 3 out of 5.
===SECTION_2===
You correctly identified necrotising fasciitis as a clinical emergency. Your A B C D E approach was thorough.
===SECTION_3===
Your initial management was appropriate with I V fluids and antibiotics. You mentioned urgent surgical debridement.
===SECTION_4===
You showed good clinical knowledge. Your systematic approach was commendable.
===SECTION_5===
You could improve by mentioning the L R I N E C score. Consider discussing post-operative I T U care in more detail.
===SECTION_6===
Overall a solid performance. Keep working on the areas we discussed. That concludes the feedback.
===JSON_SUMMARY===
{"score": 3, "overallImpression": "Satisfactory performance", "clinicalKnowledge": {"diagnosis": "Good recognition", "management": "Appropriate initial management"}, "strengths": ["Systematic approach", "Good clinical knowledge"], "improvements": ["LRINEC score", "Post-op ITU care"], "summary": "Solid performance at ST3 level."}`;

    const result = parseFeedbackResponse(input);

    expect(result.sections).toHaveLength(6);
    expect(result.sections[0]).toContain('satisfactory performance');
    expect(result.sections[1]).toContain('necrotising fasciitis');
    expect(result.sections[2]).toContain('surgical debridement');
    expect(result.sections[3]).toContain('clinical knowledge');
    expect(result.sections[4]).toContain('L R I N E C');
    expect(result.sections[5]).toContain('concludes the feedback');

    expect(result.json).not.toBeNull();
    expect(result.json.score).toBe(3);
    expect(result.json.strengths).toHaveLength(2);
    expect(result.json.improvements).toHaveLength(2);

    expect(result.raw).toBe(input);
  });

  test('handles response with fewer than 6 sections', () => {
    const input = `===SECTION_1===
Good performance overall. Score of 4.
===SECTION_2===
Excellent diagnosis recognition.
===SECTION_3===
Strong management plan.
===JSON_SUMMARY===
{"score": 4}`;

    const result = parseFeedbackResponse(input);
    expect(result.sections).toHaveLength(3);
    expect(result.json.score).toBe(4);
  });

  test('handles response without JSON summary', () => {
    const input = `===SECTION_1===
Overall impression text.
===SECTION_2===
Diagnosis feedback.
===SECTION_3===
Management feedback.`;

    const result = parseFeedbackResponse(input);
    expect(result.sections).toHaveLength(3);
    expect(result.json).toBeNull();
  });

  test('handles malformed JSON after delimiter', () => {
    const input = `===SECTION_1===
Good performance.
===JSON_SUMMARY===
{this is not valid json at all}`;

    const result = parseFeedbackResponse(input);
    expect(result.sections).toHaveLength(1);
    expect(result.json).toBeNull();
  });

  test('extracts JSON even with surrounding text', () => {
    const input = `===SECTION_1===
Good performance.
===JSON_SUMMARY===
Here is the JSON:
{"score": 2, "overallImpression": "Below average"}
That was the summary.`;

    const result = parseFeedbackResponse(input);
    expect(result.sections).toHaveLength(1);
    expect(result.json).not.toBeNull();
    expect(result.json.score).toBe(2);
  });

  test('handles no delimiters - treats as single section', () => {
    const input = 'This is feedback without any delimiters. Just plain text from the LLM.';

    const result = parseFeedbackResponse(input);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0]).toBe(input);
    expect(result.json).toBeNull();
  });

  test('handles empty string', () => {
    const result = parseFeedbackResponse('');
    expect(result.sections).toEqual([]);
    expect(result.json).toBeNull();
    expect(result.raw).toBe('');
  });

  test('handles null input', () => {
    const result = parseFeedbackResponse(null);
    expect(result.sections).toEqual([]);
    expect(result.json).toBeNull();
    expect(result.raw).toBe('');
  });

  test('handles undefined input', () => {
    const result = parseFeedbackResponse(undefined);
    expect(result.sections).toEqual([]);
    expect(result.json).toBeNull();
    expect(result.raw).toBe('');
  });

  test('trims whitespace from sections', () => {
    const input = `===SECTION_1===

  Section one with whitespace.

===SECTION_2===
  Section two.
`;

    const result = parseFeedbackResponse(input);
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]).toBe('Section one with whitespace.');
    expect(result.sections[1]).toBe('Section two.');
  });

  test('skips empty sections', () => {
    const input = `===SECTION_1===
Content here.
===SECTION_2===

===SECTION_3===
More content.`;

    const result = parseFeedbackResponse(input);
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]).toBe('Content here.');
    expect(result.sections[1]).toBe('More content.');
  });

  test('preserves raw text', () => {
    const input = `===SECTION_1===
Test content.
===JSON_SUMMARY===
{"score": 1}`;

    const result = parseFeedbackResponse(input);
    expect(result.raw).toBe(input);
  });

  test('handles JSON-only response (no sections)', () => {
    const input = `===JSON_SUMMARY===
{"score": 3, "summary": "Good"}`;

    const result = parseFeedbackResponse(input);
    expect(result.sections).toEqual([]);
    expect(result.json).not.toBeNull();
    expect(result.json.score).toBe(3);
  });
});

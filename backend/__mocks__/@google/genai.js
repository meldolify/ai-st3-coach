/**
 * Manual mock for @google/genai (prevents ESM parse errors in Jest)
 * Tests that need specific mock behavior should use jest.mock('@google/genai', ...) to override.
 */

const GoogleGenAI = jest.fn(() => ({
  models: {
    generateContent: jest.fn()
  }
}));

module.exports = { GoogleGenAI };

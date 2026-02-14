/**
 * AI Service
 * Handles Gemini 2.5 Flash chat completions (via OpenAI-compatible API)
 * and OpenAI Whisper transcription
 */

const OpenAI = require('openai');
const { toFile } = require('openai');
const config = require('../config');

class OpenAIService {
  constructor() {
    this.llmClient = null;
    this.whisperClient = null;
  }

  /**
   * Initialize the LLM client (Gemini via OpenAI-compatible endpoint)
   */
  _ensureLLMClient() {
    if (!this.llmClient) {
      this.llmClient = new OpenAI({
        apiKey: config.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
      });
    }
    return this.llmClient;
  }

  /**
   * Initialize the Whisper client (OpenAI)
   */
  _ensureWhisperClient() {
    if (!this.whisperClient) {
      this.whisperClient = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    }
    return this.whisperClient;
  }

  /**
   * Generate a response using Gemini 2.5 Flash
   * @param {Array} history - Conversation history array of {role, content}
   * @param {Object} options - Optional parameters
   * @param {string} options.model - Model to use (default: gemini-2.5-flash)
   * @param {number} options.temperature - Temperature (default: 0.7)
   * @param {number} options.max_tokens - Max tokens (default: 150)
   * @returns {Promise<string>} - The generated response text
   */
  async generateResponse(history, options = {}) {
    const client = this._ensureLLMClient();

    try {
      const completion = await client.chat.completions.create({
        model: options.model || config.LLM_MODEL,
        messages: history,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens || 150
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error(`[${config.LLM_MODEL}] Error:`, error.message);
      throw error;
    }
  }

  /**
   * Transcribe audio using Whisper API (in-memory, no temp files)
   * @param {Buffer} audioBuffer - Audio data as Buffer
   * @param {string} sessionId - Session ID (unused, kept for API compat)
   * @param {string} format - Audio format: 'wav' or 'webm' (default: 'webm')
   * @returns {Promise<string>} - The transcribed text
   */
  async transcribeAudio(audioBuffer, sessionId, format = 'webm') {
    const client = this._ensureWhisperClient();

    const isWav = audioBuffer.length >= 4 && audioBuffer.slice(0, 4).toString() === 'RIFF';
    const extension = isWav || format === 'wav' ? 'wav' : 'webm';

    try {
      console.log(`[WHISPER] Processing ${extension} audio, size: ${audioBuffer.length} bytes`);

      const file = await toFile(audioBuffer, `audio.${extension}`);
      const transcription = await client.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: 'en'
      });

      return transcription.text;
    } catch (error) {
      console.error('[WHISPER] Error:', error.message);
      throw error;
    }
  }

  /**
   * Stream a response using Gemini 2.5 Flash (async generator)
   * Yields token strings as they arrive.
   * @param {Array} history - Conversation history array of {role, content}
   * @param {Object} options - Optional parameters (same as generateResponse)
   * @yields {string} - Individual token strings
   */
  async *generateResponseStream(history, options = {}) {
    const client = this._ensureLLMClient();

    const stream = await client.chat.completions.create({
      model: options.model || config.LLM_MODEL,
      messages: history,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens || 150,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

// Export singleton instance
module.exports = new OpenAIService();

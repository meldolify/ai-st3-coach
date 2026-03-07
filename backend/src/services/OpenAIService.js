/**
 * AI Service
 * Handles Gemini 2.5 Flash chat completions (via OpenAI-compatible API)
 * and OpenAI Whisper transcription
 */

const OpenAI = require('openai');
const { toFile } = require('openai');
const { RateLimitError } = require('openai');
const config = require('../config');

const RETRY_DEFAULTS = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 15000
};

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

  _isRetryableError(error) {
    if (error instanceof RateLimitError) {
      return true;
    }
    if ([408, 429, 500, 502, 503].includes(error.status)) {
      return true;
    }
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return true;
    }
    if (error.name === 'AbortError') {
      return false;
    } // Don't retry intentional aborts
    return false;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _retryWithBackoff(fn, label = 'LLM') {
    const { maxRetries, initialDelayMs, maxDelayMs } = RETRY_DEFAULTS;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (!this._isRetryableError(error) || attempt === maxRetries) {
          if (this._isRetryableError(error)) {
            error.isRateLimit = true;
            error.message = `API rate limit exceeded after ${maxRetries + 1} attempts. ${error.message}`;
          }
          throw error;
        }

        const delay = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs);
        const jitter = Math.round(delay * 0.2 * Math.random());
        const totalDelay = delay + jitter;
        console.warn(
          `[${label}] Rate limited (attempt ${attempt + 1}/${maxRetries + 1}), ` +
            `retrying in ${totalDelay}ms...`
        );
        await this._sleep(totalDelay);
      }
    }
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
      return await this._retryWithBackoff(async () => {
        const params = {
          model: options.model || config.LLM_MODEL,
          messages: history,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens || 300
        };
        if (options.response_format) {
          params.response_format = options.response_format;
        }
        const completion = await client.chat.completions.create(params);
        return completion.choices[0].message.content;
      }, config.LLM_MODEL);
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      console.log(`[WHISPER] Processing ${extension} audio, size: ${audioBuffer.length} bytes`);

      const file = await toFile(audioBuffer, `audio.${extension}`);
      const transcription = await client.audio.transcriptions.create(
        { file, model: 'whisper-1', language: 'en' },
        { signal: controller.signal }
      );

      return transcription.text;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('[WHISPER] Timed out after 30s');
        throw new Error('Whisper transcription timed out');
      }
      console.error('[WHISPER] Error:', error.message);
      throw error;
    } finally {
      clearTimeout(timeout);
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

    const stream = await this._retryWithBackoff(async () => {
      return client.chat.completions.create({
        model: options.model || config.LLM_MODEL,
        messages: history,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens || 300,
        stream: true
      });
    }, `${config.LLM_MODEL}-stream`);

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

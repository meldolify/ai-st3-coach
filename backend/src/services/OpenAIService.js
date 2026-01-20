/**
 * OpenAI Service
 * Handles GPT-4o-mini chat completions and Whisper transcription
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const config = require('../config');

class OpenAIService {
  constructor() {
    this.client = null;
  }

  /**
   * Initialize the OpenAI client
   * Called lazily to allow for test mocking
   */
  _ensureClient() {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    }
    return this.client;
  }

  /**
   * Generate a response using GPT-4o-mini
   * @param {Array} history - Conversation history array of {role, content}
   * @param {Object} options - Optional parameters
   * @param {string} options.model - Model to use (default: gpt-4o-mini)
   * @param {number} options.temperature - Temperature (default: 0.7)
   * @param {number} options.max_tokens - Max tokens (default: 150)
   * @returns {Promise<string>} - The generated response text
   */
  async generateResponse(history, options = {}) {
    const client = this._ensureClient();

    try {
      const completion = await client.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages: history,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens || 150
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('[GPT-4o-mini] Error:', error.message);
      throw error;
    }
  }

  /**
   * Transcribe audio using Whisper API
   * @param {Buffer} audioBuffer - Audio data as Buffer
   * @param {string} sessionId - Session ID for temp file naming
   * @returns {Promise<string>} - The transcribed text
   */
  async transcribeAudio(audioBuffer, sessionId) {
    const client = this._ensureClient();
    const tempFilePath = path.join(__dirname, '../../', `temp_audio_${sessionId}.webm`);

    try {
      // Write audio to temporary file for Whisper API
      fs.writeFileSync(tempFilePath, audioBuffer);

      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en'
      });

      return transcription.text;
    } catch (error) {
      console.error('[WHISPER] Error:', error.message);
      throw error;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}

// Export singleton instance
module.exports = new OpenAIService();

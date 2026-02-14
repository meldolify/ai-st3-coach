/**
 * Text-to-Speech Service
 * Handles Google Cloud TTS synthesis
 */

const textToSpeech = require('@google-cloud/text-to-speech');
const config = require('../config');

class TTSService {
  constructor() {
    this.client = null;
  }

  /**
   * Initialize the TTS client
   * Called lazily to allow for test mocking
   */
  _ensureClient() {
    if (!this.client) {
      this.client = new textToSpeech.TextToSpeechClient();
    }
    return this.client;
  }

  /**
   * Synthesize speech from text
   * @param {string} text - Text to synthesize (plain text if stylePrompt provided, SSML otherwise)
   * @param {string} voiceName - Voice name (default: from config)
   * @param {Object} options - Optional parameters
   * @param {string} options.stylePrompt - Style prompt for Gemini TTS (enables context-aware delivery)
   * @param {number} options.speakingRate - Speaking rate (default: 1.0)
   * @param {number} options.volumeGainDb - Volume gain in dB (default: 0.0)
   * @returns {Promise<Buffer>} - MP3 audio data as Buffer
   */
  async synthesize(text, voiceName = null, options = {}) {
    const client = this._ensureClient();
    voiceName = voiceName || config.TTS_VOICE;
    const stylePrompt = options.stylePrompt || null;

    console.log('[TTS] Using voice:', voiceName, stylePrompt ? '(styled)' : '(ssml)');

    // Determine gender based on voice name
    // Female voices: Aoede, Kore, Leda, Zephyr, or names ending with -F
    const femaleVoices = ['Aoede', 'Kore', 'Leda', 'Zephyr', '-F'];
    const gender = femaleVoices.some(v => voiceName.includes(v)) ? 'FEMALE' : 'MALE';

    try {
      const request = {
        voice: {
          languageCode: 'en-GB',
          name: voiceName,
          ssmlGender: gender
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.speakingRate ?? 1.0,
          volumeGainDb: options.volumeGainDb ?? 0.0
        }
      };

      if (stylePrompt) {
        // Gemini TTS: plain text + style prompt for context-aware delivery
        request.input = { text: text, prompt: stylePrompt };
        request.voice.modelName = config.TTS_MODEL_NAME;
      } else {
        // Legacy: SSML input
        request.input = { ssml: text };
      }

      const [response] = await client.synthesizeSpeech(request);
      return response.audioContent;
    } catch (error) {
      console.error('[Google TTS] Error:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new TTSService();

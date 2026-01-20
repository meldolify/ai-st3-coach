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
   * Synthesize speech from SSML text
   * @param {string} ssmlText - SSML-formatted text to synthesize
   * @param {string} voiceName - Voice name (default: from config)
   * @param {Object} options - Optional parameters
   * @param {number} options.speakingRate - Speaking rate (default: 1.0)
   * @param {number} options.volumeGainDb - Volume gain in dB (default: 0.0)
   * @returns {Promise<Buffer>} - MP3 audio data as Buffer
   */
  async synthesize(ssmlText, voiceName = null, options = {}) {
    const client = this._ensureClient();
    voiceName = voiceName || config.TTS_VOICE;

    console.log('[TTS] Using voice:', voiceName);

    // Determine gender based on voice name
    // Female voices: Aoede, Kore, Leda, Zephyr, or names ending with -F
    const femaleVoices = ['Aoede', 'Kore', 'Leda', 'Zephyr', '-F'];
    const gender = femaleVoices.some(v => voiceName.includes(v)) ? 'FEMALE' : 'MALE';

    try {
      const request = {
        input: { ssml: ssmlText },
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

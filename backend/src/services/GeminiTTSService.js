/**
 * Gemini TTS Service
 * Uses the @google/genai SDK for context-aware, style-prompted text-to-speech.
 * Returns WAV audio (PCM 24kHz mono 16-bit with 44-byte header).
 */

const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

class GeminiTTSService {
  constructor() {
    this.client = null;
  }

  _ensureClient() {
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    }
    return this.client;
  }

  /**
   * Synthesize speech from text using Gemini TTS.
   * @param {string} text - Plain text to speak
   * @param {string} voiceName - Gemini voice name (e.g. 'Fenrir', 'Kore', 'Charon')
   * @param {Object} options - Optional parameters
   * @param {string} options.stylePrompt - Style instruction for tone/emotion control
   * @returns {Promise<Buffer>} - WAV audio data as Buffer
   */
  async synthesize(text, voiceName, options = {}) {
    const client = this._ensureClient();

    console.log('[Gemini TTS] Voice:', voiceName, options.stylePrompt ? '(styled)' : '');

    // Style prompts must be embedded in the text content (systemInstruction not supported for TTS)
    const styledText = options.stylePrompt
      ? `${options.stylePrompt}\n\nNow say the following:\n${text}`
      : text;

    try {
      const response = await client.models.generateContent({
        model: config.TTS_MODEL_NAME,
        contents: [{ parts: [{ text: styledText }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) {
        throw new Error('No audio data in Gemini TTS response');
      }
      const pcmBuffer = Buffer.from(audioData, 'base64');

      return this._pcmToWav(pcmBuffer, 24000, 1, 16);
    } catch (error) {
      console.error('[Gemini TTS] Error:', error.message);
      throw error;
    }
  }

  /**
   * Wrap raw PCM data in a WAV header.
   * @param {Buffer} pcmBuffer - Raw PCM audio data
   * @param {number} sampleRate - Sample rate in Hz
   * @param {number} channels - Number of audio channels
   * @param {number} bitsPerSample - Bits per sample
   * @returns {Buffer} - Complete WAV file buffer
   */
  _pcmToWav(pcmBuffer, sampleRate, channels, bitsPerSample) {
    const header = Buffer.alloc(44);
    const bytesPerSample = bitsPerSample / 8;

    // Add 150ms of silence padding to prevent audio cutoff between streaming chunks
    const silenceBytes = Math.round(sampleRate * (150 / 1000) * channels * bytesPerSample);
    const silence = Buffer.alloc(silenceBytes, 0);
    const paddedPcm = Buffer.concat([pcmBuffer, silence]);
    const dataLength = paddedPcm.length;

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
    header.writeUInt16LE(channels * bytesPerSample, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);

    return Buffer.concat([header, paddedPcm]);
  }
}

module.exports = new GeminiTTSService();

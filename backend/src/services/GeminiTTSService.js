/**
 * Gemini TTS Service
 * Uses the @google/genai SDK with Gemini 3.1 Flash TTS for tag-controlled
 * text-to-speech. Returns WAV audio (PCM 24kHz mono 16-bit with 44-byte header).
 *
 * Style is controlled via inline audio tags (e.g. "[British accent, firm]")
 * prepended to the spoken text.
 *
 * Two paths:
 *   synthesize()        — one-shot, used by feedback flow (discrete sections).
 *   synthesizeStream()  — async generator yielding WAV chunks as they arrive.
 *                         Used by the live interview path so first audio
 *                         reaches the client ~500-1000ms after the call,
 *                         instead of waiting 4-9s for the whole turn.
 */

const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

const TTS_SAMPLE_RATE = 24000;
const TTS_CHANNELS = 1;
const TTS_BITS_PER_SAMPLE = 16;

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

  _buildRequest(text, voiceName, options = {}) {
    const styledText = options.stylePrompt ? `${options.stylePrompt} ${text}` : text;
    return {
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
    };
  }

  /**
   * One-shot synthesis. Awaits the full response and returns one WAV buffer.
   * @param {string} text
   * @param {string} voiceName
   * @param {Object} [options]
   * @param {string} [options.stylePrompt]
   * @returns {Promise<Buffer>}
   */
  async synthesize(text, voiceName, options = {}) {
    const client = this._ensureClient();
    console.log(
      `[Gemini TTS] (one-shot) ${config.TTS_MODEL_NAME} voice=${voiceName}`,
      options.stylePrompt ? `tags=${options.stylePrompt}` : ''
    );

    try {
      const response = await client.models.generateContent(
        this._buildRequest(text, voiceName, options)
      );

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) {
        throw new Error('No audio data in Gemini TTS response');
      }
      const pcmBuffer = Buffer.from(audioData, 'base64');

      return this._pcmToWav(pcmBuffer, TTS_SAMPLE_RATE, TTS_CHANNELS, TTS_BITS_PER_SAMPLE);
    } catch (error) {
      console.error('[Gemini TTS] Error:', error.message);
      throw error;
    }
  }

  /**
   * Streaming synthesis. Yields WAV-wrapped audio chunks as they arrive from
   * the model. Each yielded buffer is a self-contained playable WAV — the
   * client's AudioPlayer queue plays them sequentially.
   * @param {string} text
   * @param {string} voiceName
   * @param {Object} [options]
   * @param {string} [options.stylePrompt]
   * @yields {Buffer} WAV chunk
   */
  async *synthesizeStream(text, voiceName, options = {}) {
    const client = this._ensureClient();
    console.log(
      `[Gemini TTS] (stream) ${config.TTS_MODEL_NAME} voice=${voiceName}`,
      options.stylePrompt ? `tags=${options.stylePrompt}` : ''
    );

    let stream;
    try {
      stream = await client.models.generateContentStream(
        this._buildRequest(text, voiceName, options)
      );
    } catch (error) {
      console.error('[Gemini TTS] Stream open failed:', error.message);
      throw error;
    }

    let chunkCount = 0;
    let totalBytes = 0;
    let pending = null;
    try {
      for await (const part of stream) {
        const audioData = part.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) {
          continue;
        }
        let pcm = Buffer.from(audioData, 'base64');
        if (pending) {
          pcm = Buffer.concat([pending, pcm]);
          pending = null;
        }
        // Sample-align: PCM frames are 2 bytes (16-bit). Carry odd trailing byte.
        if (pcm.length % 2 !== 0) {
          pending = pcm.slice(pcm.length - 1);
          pcm = pcm.slice(0, pcm.length - 1);
        }
        if (pcm.length === 0) {
          continue;
        }
        chunkCount++;
        totalBytes += pcm.length;
        yield this._pcmToWav(pcm, TTS_SAMPLE_RATE, TTS_CHANNELS, TTS_BITS_PER_SAMPLE);
      }
    } catch (error) {
      console.error('[Gemini TTS] Stream read failed:', error.message);
      throw error;
    }

    console.log(`[Gemini TTS] Stream complete: ${chunkCount} chunks, ${totalBytes} PCM bytes`);
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

    const dataLength = pcmBuffer.length;

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

    return Buffer.concat([header, pcmBuffer]);
  }
}

module.exports = new GeminiTTSService();

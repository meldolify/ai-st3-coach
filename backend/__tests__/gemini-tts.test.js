/**
 * GeminiTTSService Unit Tests
 * Tests the Gemini TTS service using the @google/genai SDK.
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-api-key';

// Mock @google/genai to prevent real API calls
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: { generateContent: jest.fn() }
  }))
}));

describe('GeminiTTSService', () => {
  let geminiTTSService;
  let mockGenerateContent;

  beforeEach(() => {
    geminiTTSService = require('../src/services/GeminiTTSService');

    // Create a fresh mock for generateContent each test
    mockGenerateContent = jest.fn();

    // Inject a mock client with models.generateContent
    geminiTTSService.client = {
      models: { generateContent: mockGenerateContent }
    };
  });

  // Helper: create a mock Gemini API response with base64 PCM audio
  function mockAudioResponse(pcmBase64) {
    return {
      candidates: [
        {
          content: {
            parts: [
              {
                inlineData: { data: pcmBase64 }
              }
            ]
          }
        }
      ]
    };
  }

  describe('synthesize', () => {
    test('calls generateContent with correct request structure', async () => {
      const fakePCM = Buffer.from([0, 0, 1, 0]).toString('base64');
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM));

      await geminiTTSService.synthesize('Hello world', 'Fenrir');

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: expect.any(String),
        contents: [{ parts: [{ text: 'Hello world' }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }
            }
          }
        }
      });
    });

    test('embeds stylePrompt in text content when provided', async () => {
      const fakePCM = Buffer.from([0, 0]).toString('base64');
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM));

      await geminiTTSService.synthesize('Test', 'Kore', {
        stylePrompt: 'Speak warmly'
      });

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents[0].parts[0].text).toContain('Speak warmly');
      expect(call.contents[0].parts[0].text).toContain('Test');
    });

    test('does not embed style when no stylePrompt', async () => {
      const fakePCM = Buffer.from([0, 0]).toString('base64');
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM));

      await geminiTTSService.synthesize('Test', 'Charon');

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.contents[0].parts[0].text).toBe('Test');
    });

    test('returns a valid WAV buffer', async () => {
      const fakePCM = Buffer.from([0x01, 0x02, 0x03, 0x04]);
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM.toString('base64')));

      const result = await geminiTTSService.synthesize('Hello', 'Fenrir');

      expect(Buffer.isBuffer(result)).toBe(true);
      // WAV header (44 bytes) + PCM data (4 bytes) = 48 bytes
      expect(result.length).toBe(48);
      expect(result.toString('ascii', 0, 4)).toBe('RIFF');
      expect(result.toString('ascii', 8, 12)).toBe('WAVE');
      expect(result.toString('ascii', 12, 16)).toBe('fmt ');
      expect(result.toString('ascii', 36, 40)).toBe('data');
    });

    test('throws when response has no audio data', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [{ content: { parts: [{}] } }]
      });

      await expect(geminiTTSService.synthesize('Test', 'Fenrir')).rejects.toThrow(
        'No audio data in Gemini TTS response'
      );
    });

    test('propagates errors from Gemini API', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'));

      await expect(geminiTTSService.synthesize('Test', 'Fenrir')).rejects.toThrow(
        'API quota exceeded'
      );
    });

    test('works with different voice names', async () => {
      const fakePCM = Buffer.from([0, 0]).toString('base64');
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM));

      await geminiTTSService.synthesize('Test', 'Charon');

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Charon' }
              }
            }
          })
        })
      );
    });
  });

  describe('_pcmToWav', () => {
    test('creates correct WAV header for 24kHz mono 16-bit', () => {
      const pcm = Buffer.from([0x01, 0x02, 0x03, 0x04]);
      const wav = geminiTTSService._pcmToWav(pcm, 24000, 1, 16);

      expect(wav.length).toBe(48);
      expect(wav.readUInt32LE(4)).toBe(36 + 4);
      expect(wav.readUInt16LE(20)).toBe(1); // PCM format
      expect(wav.readUInt16LE(22)).toBe(1); // mono
      expect(wav.readUInt32LE(24)).toBe(24000); // sample rate
      expect(wav.readUInt32LE(28)).toBe(48000); // byte rate
      expect(wav.readUInt16LE(32)).toBe(2); // block align
      expect(wav.readUInt16LE(34)).toBe(16); // bits per sample
      expect(wav.readUInt32LE(40)).toBe(4); // data length
      expect(wav[44]).toBe(0x01);
      expect(wav[47]).toBe(0x04);
    });

    test('handles empty PCM data', () => {
      const wav = geminiTTSService._pcmToWav(Buffer.alloc(0), 24000, 1, 16);
      expect(wav.length).toBe(44);
      expect(wav.readUInt32LE(40)).toBe(0);
    });

    test('handles large PCM data', () => {
      const pcm = Buffer.alloc(48000);
      const wav = geminiTTSService._pcmToWav(pcm, 24000, 1, 16);
      expect(wav.length).toBe(44 + 48000);
      expect(wav.readUInt32LE(40)).toBe(48000);
    });
  });

  describe('_ensureClient', () => {
    test('creates client on first call', () => {
      const { GoogleGenAI } = require('@google/genai');
      geminiTTSService.client = null;

      geminiTTSService._ensureClient();

      expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-gemini-key' });
      expect(geminiTTSService.client).toBeTruthy();
    });

    test('reuses existing client on subsequent calls', () => {
      const existingClient = { models: { generateContent: jest.fn() } };
      geminiTTSService.client = existingClient;

      const result = geminiTTSService._ensureClient();

      expect(result).toBe(existingClient);
    });
  });
});

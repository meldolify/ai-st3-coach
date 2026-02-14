/**
 * GeminiTTSService Unit Tests
 * Tests the Gemini TTS service by mocking the client directly on the singleton.
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-api-key';

// Mock @google/generative-ai to prevent real API calls
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn()
  }))
}));

describe('GeminiTTSService', () => {
  let geminiTTSService;
  let mockGenerateContent;

  beforeEach(() => {
    geminiTTSService = require('../src/services/GeminiTTSService');

    // Create a fresh mock for generateContent each test
    mockGenerateContent = jest.fn();

    // Inject a mock client with getGenerativeModel that returns our mock
    geminiTTSService.client = {
      getGenerativeModel: jest.fn(() => ({
        generateContent: mockGenerateContent
      }))
    };
  });

  // Helper: create a mock Gemini API response with base64 PCM audio
  function mockAudioResponse(pcmBase64) {
    return {
      response: {
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
      }
    };
  }

  describe('synthesize', () => {
    test('calls generateContent with correct request structure', async () => {
      const fakePCM = Buffer.from([0, 0, 1, 0]).toString('base64');
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM));

      await geminiTTSService.synthesize('Hello world', 'Fenrir');

      expect(geminiTTSService.client.getGenerativeModel).toHaveBeenCalledWith({
        model: expect.any(String)
      });
      expect(mockGenerateContent).toHaveBeenCalledWith({
        contents: [{ parts: [{ text: 'Hello world' }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }
            }
          }
        }
      });
    });

    test('includes systemInstruction when stylePrompt is provided', async () => {
      const fakePCM = Buffer.from([0, 0]).toString('base64');
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM));

      await geminiTTSService.synthesize('Test', 'Kore', {
        stylePrompt: 'Speak warmly'
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          systemInstruction: { parts: [{ text: 'Speak warmly' }] }
        })
      );
    });

    test('does not include systemInstruction when no stylePrompt', async () => {
      const fakePCM = Buffer.from([0, 0]).toString('base64');
      mockGenerateContent.mockResolvedValue(mockAudioResponse(fakePCM));

      await geminiTTSService.synthesize('Test', 'Charon');

      const call = mockGenerateContent.mock.calls[0][0];
      expect(call.systemInstruction).toBeUndefined();
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
          generationConfig: expect.objectContaining({
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
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      geminiTTSService.client = null;

      geminiTTSService._ensureClient();

      expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-gemini-key');
      expect(geminiTTSService.client).toBeTruthy();
    });

    test('reuses existing client on subsequent calls', () => {
      const existingClient = { getGenerativeModel: jest.fn() };
      geminiTTSService.client = existingClient;

      const result = geminiTTSService._ensureClient();

      expect(result).toBe(existingClient);
    });
  });
});

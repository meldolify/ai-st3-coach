/**
 * GeminiTTSService unit tests
 * Verifies tag injection, voice config shaping, and PCM → WAV wrapping.
 * The Gemini SDK client is mocked; no real API calls are made.
 */

const geminiTTSService = require('../src/services/GeminiTTSService');

describe('GeminiTTSService', () => {
  let mockGenerateContent;

  beforeEach(() => {
    mockGenerateContent = jest.fn();
    // Stub the Gemini SDK client used by synthesize()
    geminiTTSService.client = {
      models: { generateContent: mockGenerateContent }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockSdkResponseWithSilence(samples = 16) {
    const pcm = Buffer.alloc(samples * 2); // 16-bit silence
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [
        {
          content: {
            parts: [{ inlineData: { data: pcm.toString('base64') } }]
          }
        }
      ]
    });
    return pcm;
  }

  test('returns a buffer with a valid 44-byte WAV header', async () => {
    mockSdkResponseWithSilence();

    const result = await geminiTTSService.synthesize('Hello world.', 'Fenrir');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.slice(0, 4).toString()).toBe('RIFF');
    expect(result.slice(8, 12).toString()).toBe('WAVE');
    expect(result.slice(12, 16).toString()).toBe('fmt ');
    // 44 bytes header + payload
    expect(result.length).toBeGreaterThanOrEqual(44);
  });

  test('injects style tag inline as a prefix to the spoken text', async () => {
    mockSdkResponseWithSilence();

    await geminiTTSService.synthesize('How are you?', 'Kore', {
      stylePrompt: '[firm, brisk]'
    });

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const sentText = callArgs.contents[0].parts[0].text;
    expect(sentText).toBe('[firm, brisk] How are you?');
  });

  test('passes through plain text when no stylePrompt is provided', async () => {
    mockSdkResponseWithSilence();

    await geminiTTSService.synthesize('Plain text.', 'Charon');

    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents[0].parts[0].text).toBe('Plain text.');
  });

  test('configures the voice via prebuiltVoiceConfig', async () => {
    mockSdkResponseWithSilence();

    await geminiTTSService.synthesize('Test.', 'Charon');

    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.config.responseModalities).toEqual(['AUDIO']);
    expect(callArgs.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Charon');
  });

  test('throws when the SDK response contains no audio data', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [{ content: { parts: [{}] } }]
    });

    await expect(geminiTTSService.synthesize('Test.', 'Fenrir')).rejects.toThrow(/No audio data/);
  });

  test('propagates errors from the SDK', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded'));

    await expect(geminiTTSService.synthesize('Test.', 'Fenrir')).rejects.toThrow(/Quota exceeded/);
  });
});

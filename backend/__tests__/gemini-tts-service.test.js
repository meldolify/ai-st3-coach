/**
 * GeminiTTSService unit tests
 * Verifies tag injection, voice config shaping, and PCM → WAV wrapping.
 * The Gemini SDK client is mocked; no real API calls are made.
 */

const geminiTTSService = require('../src/services/GeminiTTSService');

describe('GeminiTTSService', () => {
  let mockGenerateContent;
  let mockGenerateContentStream;

  beforeEach(() => {
    mockGenerateContent = jest.fn();
    mockGenerateContentStream = jest.fn();
    geminiTTSService.client = {
      models: {
        generateContent: mockGenerateContent,
        generateContentStream: mockGenerateContentStream
      }
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

describe('GeminiTTSService.synthesizeStream', () => {
  let mockGenerateContentStream;

  beforeEach(() => {
    mockGenerateContentStream = jest.fn();
    geminiTTSService.client = {
      models: {
        generateContent: jest.fn(),
        generateContentStream: mockGenerateContentStream
      }
    };
  });

  function makeMockStream(pcmChunks) {
    return (async function* () {
      for (const pcm of pcmChunks) {
        yield {
          candidates: [
            {
              content: {
                parts: [{ inlineData: { data: pcm.toString('base64') } }]
              }
            }
          ]
        };
      }
    })();
  }

  test('yields one WAV chunk per PCM frame from the SDK stream', async () => {
    const pcm1 = Buffer.alloc(16);
    const pcm2 = Buffer.alloc(32);
    mockGenerateContentStream.mockResolvedValueOnce(makeMockStream([pcm1, pcm2]));

    const chunks = [];
    for await (const wav of geminiTTSService.synthesizeStream('Hi.', 'Fenrir')) {
      chunks.push(wav);
    }

    expect(chunks).toHaveLength(2);
    chunks.forEach(c => {
      expect(c.slice(0, 4).toString()).toBe('RIFF');
      expect(c.slice(8, 12).toString()).toBe('WAVE');
    });
  });

  test('injects style tag inline as a prefix to the spoken text', async () => {
    mockGenerateContentStream.mockResolvedValueOnce(makeMockStream([Buffer.alloc(16)]));

    // eslint-disable-next-line no-unused-vars
    for await (const _ of geminiTTSService.synthesizeStream('Question?', 'Charon', {
      stylePrompt: '[British accent, firm]'
    })) {
      // consume
    }

    const callArgs = mockGenerateContentStream.mock.calls[0][0];
    expect(callArgs.contents[0].parts[0].text).toBe('[British accent, firm] Question?');
  });

  test('skips chunks that contain no audio data', async () => {
    const stream = (async function* () {
      yield { candidates: [{ content: { parts: [{}] } }] }; // no inlineData
      yield {
        candidates: [
          { content: { parts: [{ inlineData: { data: Buffer.alloc(8).toString('base64') } }] } }
        ]
      };
    })();
    mockGenerateContentStream.mockResolvedValueOnce(stream);

    const chunks = [];
    for await (const wav of geminiTTSService.synthesizeStream('Test.', 'Kore')) {
      chunks.push(wav);
    }
    expect(chunks).toHaveLength(1);
  });

  test('carries odd trailing PCM byte across chunks for sample alignment', async () => {
    // First chunk has odd byte length; should defer the trailing byte to the next chunk.
    const pcmA = Buffer.from([0x10, 0x00, 0x20, 0x00, 0x33]); // 5 bytes (last carried)
    const pcmB = Buffer.from([0x44, 0x55, 0x00]); // 3 bytes (combined with carry → 4)
    mockGenerateContentStream.mockResolvedValueOnce(makeMockStream([pcmA, pcmB]));

    const chunks = [];
    for await (const wav of geminiTTSService.synthesizeStream('Hi.', 'Fenrir')) {
      chunks.push(wav);
    }
    // First yields 4 PCM bytes, second yields 4 PCM bytes (3 + 1 carry)
    expect(chunks).toHaveLength(2);
    expect(chunks[0].length).toBe(44 + 4);
    expect(chunks[1].length).toBe(44 + 4);
  });

  test('throws when the stream itself fails to open', async () => {
    mockGenerateContentStream.mockRejectedValueOnce(new Error('Auth failed'));
    const gen = geminiTTSService.synthesizeStream('Test.', 'Fenrir');
    await expect(gen.next()).rejects.toThrow(/Auth failed/);
  });
});

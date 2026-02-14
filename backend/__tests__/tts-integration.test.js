/**
 * Google Cloud TTS Integration Tests
 * Tests the TTSService synthesize method with mocked Google TTS client
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-api-key';

describe('TTSService - synthesize', () => {
  let ttsService;

  beforeEach(() => {
    jest.resetModules();
    ttsService = require('../src/services/TTSService');
  });

  test('sends correct request structure to Google TTS', async () => {
    const mockAudio = Buffer.from('fake-mp3-data');
    const mockSynthesize = jest.fn().mockResolvedValue([{ audioContent: mockAudio }]);
    ttsService.client = { synthesizeSpeech: mockSynthesize };

    const ssml = '<speak>Hello, how are you?</speak>';
    await ttsService.synthesize(ssml, 'en-GB-Neural2-D');

    expect(mockSynthesize).toHaveBeenCalledWith({
      input: { ssml },
      voice: {
        languageCode: 'en-GB',
        name: 'en-GB-Neural2-D',
        ssmlGender: 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        volumeGainDb: 0.0
      }
    });
  });

  test('returns audio content buffer', async () => {
    const mockAudio = Buffer.from('audio-content-here');
    ttsService.client = {
      synthesizeSpeech: jest.fn().mockResolvedValue([{ audioContent: mockAudio }])
    };

    const result = await ttsService.synthesize('<speak>Test</speak>', 'en-GB-Neural2-D');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(mockAudio);
  });

  test('detects female voice for Aoede', async () => {
    const mockAudio = Buffer.from('audio');
    const mockSynthesize = jest.fn().mockResolvedValue([{ audioContent: mockAudio }]);
    ttsService.client = { synthesizeSpeech: mockSynthesize };

    await ttsService.synthesize('<speak>Test</speak>', 'en-GB-Aoede');

    expect(mockSynthesize).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({ ssmlGender: 'FEMALE' })
      })
    );
  });

  test('detects female voice for Kore', async () => {
    const mockAudio = Buffer.from('audio');
    const mockSynthesize = jest.fn().mockResolvedValue([{ audioContent: mockAudio }]);
    ttsService.client = { synthesizeSpeech: mockSynthesize };

    await ttsService.synthesize('<speak>Test</speak>', 'en-GB-Kore');

    expect(mockSynthesize).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({ ssmlGender: 'FEMALE' })
      })
    );
  });

  test('detects male voice for Neural2-D', async () => {
    const mockAudio = Buffer.from('audio');
    const mockSynthesize = jest.fn().mockResolvedValue([{ audioContent: mockAudio }]);
    ttsService.client = { synthesizeSpeech: mockSynthesize };

    await ttsService.synthesize('<speak>Test</speak>', 'en-GB-Neural2-D');

    expect(mockSynthesize).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({ ssmlGender: 'MALE' })
      })
    );
  });

  test('accepts custom speaking rate and volume', async () => {
    const mockAudio = Buffer.from('audio');
    const mockSynthesize = jest.fn().mockResolvedValue([{ audioContent: mockAudio }]);
    ttsService.client = { synthesizeSpeech: mockSynthesize };

    await ttsService.synthesize('<speak>Test</speak>', 'en-GB-Neural2-D', {
      speakingRate: 0.85,
      volumeGainDb: 2.0
    });

    expect(mockSynthesize).toHaveBeenCalledWith(
      expect.objectContaining({
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.85,
          volumeGainDb: 2.0
        }
      })
    );
  });

  test('propagates errors from Google TTS client', async () => {
    ttsService.client = {
      synthesizeSpeech: jest.fn().mockRejectedValue(new Error('TTS quota exceeded'))
    };

    await expect(ttsService.synthesize('<speak>Test</speak>', 'en-GB-Neural2-D')).rejects.toThrow(
      'TTS quota exceeded'
    );
  });

  test('uses default voice from config when voiceName is null', async () => {
    const mockAudio = Buffer.from('audio');
    const mockSynthesize = jest.fn().mockResolvedValue([{ audioContent: mockAudio }]);
    ttsService.client = { synthesizeSpeech: mockSynthesize };

    await ttsService.synthesize('<speak>Test</speak>');

    expect(mockSynthesize).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({
          name: 'Fenrir'
        })
      })
    );
  });
});

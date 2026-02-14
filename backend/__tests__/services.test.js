/**
 * Tests for service modules
 * These tests verify the service interfaces without making actual API calls
 */

describe('OpenAIService', () => {
  let openaiService;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.OPENAI_API_KEY = 'test-api-key';
    openaiService = require('../src/services/OpenAIService');
  });

  test('is a singleton instance', () => {
    const instance1 = require('../src/services/OpenAIService');
    const instance2 = require('../src/services/OpenAIService');
    expect(instance1).toBe(instance2);
  });

  test('has generateResponse method', () => {
    expect(typeof openaiService.generateResponse).toBe('function');
  });

  test('has transcribeAudio method', () => {
    expect(typeof openaiService.transcribeAudio).toBe('function');
  });

  test('generateResponse accepts history array', async () => {
    // Mock the client
    openaiService.llmClient = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Test response' } }]
          })
        }
      }
    };

    const history = [{ role: 'user', content: 'Hello' }];
    const result = await openaiService.generateResponse(history);

    expect(result).toBe('Test response');
    expect(openaiService.llmClient.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        messages: history,
        temperature: 0.7,
        max_tokens: 150
      })
    );
  });

  test('generateResponse accepts custom options', async () => {
    openaiService.llmClient = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Test response' } }]
          })
        }
      }
    };

    const history = [{ role: 'user', content: 'Hello' }];
    await openaiService.generateResponse(history, {
      temperature: 0.5,
      max_tokens: 200
    });

    expect(openaiService.llmClient.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.5,
        max_tokens: 200
      })
    );
  });
});

describe('TTSService', () => {
  let ttsService;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.OPENAI_API_KEY = 'test-api-key';
    ttsService = require('../src/services/TTSService');
  });

  test('is a singleton instance', () => {
    const instance1 = require('../src/services/TTSService');
    const instance2 = require('../src/services/TTSService');
    expect(instance1).toBe(instance2);
  });

  test('has synthesize method', () => {
    expect(typeof ttsService.synthesize).toBe('function');
  });

  test('synthesize accepts ssmlText and optional voiceName', async () => {
    // Mock the client
    const mockAudioContent = Buffer.from('test audio');
    ttsService.client = {
      synthesizeSpeech: jest.fn().mockResolvedValue([{ audioContent: mockAudioContent }])
    };

    const ssmlText = '<speak>Hello world</speak>';
    const result = await ttsService.synthesize(ssmlText, 'en-GB-Neural2-D');

    expect(result).toEqual(mockAudioContent);
    expect(ttsService.client.synthesizeSpeech).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { ssml: ssmlText },
        voice: expect.objectContaining({
          languageCode: 'en-GB',
          name: 'en-GB-Neural2-D'
        }),
        audioConfig: expect.objectContaining({
          audioEncoding: 'MP3'
        })
      })
    );
  });

  test('synthesize uses default voice from config when not specified', async () => {
    const mockAudioContent = Buffer.from('test audio');
    ttsService.client = {
      synthesizeSpeech: jest.fn().mockResolvedValue([{ audioContent: mockAudioContent }])
    };

    await ttsService.synthesize('<speak>Test</speak>');

    expect(ttsService.client.synthesizeSpeech).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({
          name: 'Fenrir' // Default from config
        })
      })
    );
  });

  test('synthesize detects female voices correctly', async () => {
    const mockAudioContent = Buffer.from('test audio');
    ttsService.client = {
      synthesizeSpeech: jest.fn().mockResolvedValue([{ audioContent: mockAudioContent }])
    };

    await ttsService.synthesize('<speak>Test</speak>', 'en-GB-Neural2-F');

    expect(ttsService.client.synthesizeSpeech).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: expect.objectContaining({
          ssmlGender: 'FEMALE'
        })
      })
    );
  });
});

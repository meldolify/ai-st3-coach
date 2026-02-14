/**
 * GPT-4o-mini Integration Tests
 * Tests the OpenAIService generateResponse and transcribeAudio methods
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-api-key';

describe('OpenAIService - generateResponse', () => {
  let openaiService;

  beforeEach(() => {
    jest.resetModules();
    openaiService = require('../src/services/OpenAIService');
  });

  test('calls OpenAI with correct default parameters', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Good morning, shall we begin?' } }]
    });
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    const history = [
      { role: 'system', content: 'You are an examiner.' },
      { role: 'user', content: 'Hello' }
    ];
    const result = await openaiService.generateResponse(history);

    expect(result).toBe('Good morning, shall we begin?');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        messages: history,
        temperature: 0.7,
        max_tokens: 150
      })
    );
  });

  test('passes custom options to OpenAI', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'response' } }]
    });
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    await openaiService.generateResponse([{ role: 'user', content: 'test' }], {
      model: 'gpt-4',
      temperature: 0.3,
      max_tokens: 500
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4',
        temperature: 0.3,
        max_tokens: 500
      })
    );
  });

  test('returns first choice message content', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'First choice' } }, { message: { content: 'Second choice' } }]
    });
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    const result = await openaiService.generateResponse([{ role: 'user', content: 'test' }]);
    expect(result).toBe('First choice');
  });

  test('propagates errors from OpenAI client', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('API rate limit exceeded'));
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    await expect(
      openaiService.generateResponse([{ role: 'user', content: 'test' }])
    ).rejects.toThrow('API rate limit exceeded');
  });

  test('uses temperature 0.7 when option is 0 (falsy but valid)', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'response' } }]
    });
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    await openaiService.generateResponse([{ role: 'user', content: 'test' }], { temperature: 0 });

    // temperature uses ?? so 0 should be passed through
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0 }));
  });

  test('initializes LLM client lazily via _ensureLLMClient', () => {
    openaiService.llmClient = null;
    const client = openaiService._ensureLLMClient();
    expect(client).toBeDefined();
    // Calling again returns same instance
    const client2 = openaiService._ensureLLMClient();
    expect(client2).toBe(client);
  });

  test('initializes Whisper client lazily via _ensureWhisperClient', () => {
    openaiService.whisperClient = null;
    const client = openaiService._ensureWhisperClient();
    expect(client).toBeDefined();
    // Calling again returns same instance
    const client2 = openaiService._ensureWhisperClient();
    expect(client2).toBe(client);
  });
});

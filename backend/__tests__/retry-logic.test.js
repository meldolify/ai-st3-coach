/**
 * Retry Logic Tests
 * Tests exponential backoff retry for 429 rate limit errors in OpenAIService
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENAI_API_KEY = 'test-api-key';

const { RateLimitError } = require('openai');

describe('OpenAIService - Retry Logic', () => {
  let openaiService;

  beforeEach(() => {
    jest.resetModules();
    openaiService = require('../src/services/OpenAIService');
    // Suppress console output during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Speed up retries for tests
    openaiService._sleep = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns result on first successful call', async () => {
    const mockCreate = jest.fn().mockResolvedValueOnce({
      choices: [{ message: { content: 'Hello world' } }]
    });
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    const result = await openaiService.generateResponse([{ role: 'user', content: 'test' }]);
    expect(result).toBe('Hello world');
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(openaiService._sleep).not.toHaveBeenCalled();
  });

  test('retries on RateLimitError and succeeds', async () => {
    const mockCreate = jest
      .fn()
      .mockRejectedValueOnce(new RateLimitError(429, undefined, '429 rate limited', {}))
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Success after retry' } }]
      });
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    const result = await openaiService.generateResponse([{ role: 'user', content: 'test' }]);
    expect(result).toBe('Success after retry');
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(openaiService._sleep).toHaveBeenCalledTimes(1);
  });

  test('throws after exhausting all retries with isRateLimit flag', async () => {
    const rateLimitError = new RateLimitError(429, undefined, '429 rate limited', {});
    const mockCreate = jest.fn().mockRejectedValue(rateLimitError);
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    await expect(
      openaiService.generateResponse([{ role: 'user', content: 'test' }])
    ).rejects.toThrow('API rate limit exceeded after 4 attempts');

    // Initial attempt + 3 retries = 4 calls
    expect(mockCreate).toHaveBeenCalledTimes(4);
    expect(openaiService._sleep).toHaveBeenCalledTimes(3);
  });

  test('sets isRateLimit flag on final error after retries exhausted', async () => {
    expect.assertions(1);
    const rateLimitError = new RateLimitError(429, undefined, '429 rate limited', {});
    const mockCreate = jest.fn().mockRejectedValue(rateLimitError);
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    await expect(
      openaiService.generateResponse([{ role: 'user', content: 'test' }])
    ).rejects.toHaveProperty('isRateLimit', true);
  });

  test('does not retry non-retryable errors', async () => {
    const badRequestError = new Error('400 Bad Request');
    badRequestError.status = 400;
    const mockCreate = jest.fn().mockRejectedValue(badRequestError);
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    await expect(
      openaiService.generateResponse([{ role: 'user', content: 'test' }])
    ).rejects.toThrow('400 Bad Request');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(openaiService._sleep).not.toHaveBeenCalled();
  });

  test('retries on 503 Service Unavailable', async () => {
    const serverError = new Error('503 Service Unavailable');
    serverError.status = 503;
    const mockCreate = jest
      .fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({
        choices: [{ message: { content: 'Recovered from 503' } }]
      });
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    const result = await openaiService.generateResponse([{ role: 'user', content: 'test' }]);
    expect(result).toBe('Recovered from 503');
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  test('retries stream creation on 429', async () => {
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: { content: 'streamed' } }] };
      }
    };
    const mockCreate = jest
      .fn()
      .mockRejectedValueOnce(new RateLimitError(429, undefined, '429 rate limited', {}))
      .mockResolvedValueOnce(mockStream);
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    const chunks = [];
    for await (const chunk of openaiService.generateResponseStream([
      { role: 'user', content: 'test' }
    ])) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['streamed']);
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(openaiService._sleep).toHaveBeenCalledTimes(1);
  });

  test('uses exponential backoff delays', async () => {
    // Restore real _sleep to check delay values, but still mock setTimeout
    openaiService._sleep = jest.fn().mockResolvedValue(undefined);

    const rateLimitError = new RateLimitError(429, undefined, '429 rate limited', {});
    const mockCreate = jest.fn().mockRejectedValue(rateLimitError);
    openaiService.llmClient = { chat: { completions: { create: mockCreate } } };

    try {
      await openaiService.generateResponse([{ role: 'user', content: 'test' }]);
    } catch {
      // Expected to throw
    }

    // 3 retries with delays: ~1000ms, ~2000ms, ~4000ms (plus jitter)
    expect(openaiService._sleep).toHaveBeenCalledTimes(3);
    const delays = openaiService._sleep.mock.calls.map(call => call[0]);
    // First delay: 1000 + 0-200 jitter
    expect(delays[0]).toBeGreaterThanOrEqual(1000);
    expect(delays[0]).toBeLessThanOrEqual(1200);
    // Second delay: 2000 + 0-400 jitter
    expect(delays[1]).toBeGreaterThanOrEqual(2000);
    expect(delays[1]).toBeLessThanOrEqual(2400);
    // Third delay: 4000 + 0-800 jitter
    expect(delays[2]).toBeGreaterThanOrEqual(4000);
    expect(delays[2]).toBeLessThanOrEqual(4800);
  });
});

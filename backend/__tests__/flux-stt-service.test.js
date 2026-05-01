/**
 * FluxSTTService unit tests
 * Verifies turn-event mapping, audio forwarding, and lifecycle.
 * The @deepgram/sdk client is mocked; no real network calls.
 */

// Capture handlers attached to the mock connection so tests can fire events
let mockConnection;
let mockHandlers;

jest.mock('@deepgram/sdk', () => ({
  DeepgramClient: jest.fn()
}));

// Provide a minimal config with the API key set
jest.mock('../src/config', () => ({
  DEEPGRAM_API_KEY: 'test-key',
  USE_FLUX_STT: true,
  DEBUG_VAD: false
}));

const { DeepgramClient } = require('@deepgram/sdk');
const { FluxSTTService } = require('../src/services/FluxSTTService');

beforeEach(() => {
  // resetMocks:true wipes mockImplementation between tests, so re-establish here.
  mockHandlers = {};
  mockConnection = {
    on: jest.fn((event, handler) => {
      mockHandlers[event] = handler;
    }),
    sendMedia: jest.fn(),
    sendCloseStream: jest.fn()
  };
  DeepgramClient.mockImplementation(() => ({
    listen: {
      v2: {
        connect: jest.fn().mockResolvedValue(mockConnection)
      }
    }
  }));
});

describe('FluxSTTService', () => {
  test('initialize() opens a connection and attaches message + error listeners', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    expect(mockConnection.on).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('processChunk forwards the buffer via sendMedia', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    const buf = Buffer.from([0, 1, 2, 3, 4, 5]);
    flux.processChunk(buf);
    expect(mockConnection.sendMedia).toHaveBeenCalledWith(buf);
  });

  test('processChunk is a no-op after destroy', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    flux.destroy();
    flux.processChunk(Buffer.from([1, 2, 3]));
    expect(mockConnection.sendMedia).not.toHaveBeenCalled();
  });

  test('StartOfTurn fires onSpeechStart', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    const onSpeechStart = jest.fn();
    flux.onSpeechStart = onSpeechStart;

    mockHandlers.message({ type: 'TurnInfo', event: 'StartOfTurn' });

    expect(onSpeechStart).toHaveBeenCalledTimes(1);
  });

  test('EndOfTurn fires onTranscript with trimmed text and an endOfTurnAt timestamp', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    const onTranscript = jest.fn();
    flux.onTranscript = onTranscript;

    const before = Date.now();
    mockHandlers.message({
      type: 'TurnInfo',
      event: 'EndOfTurn',
      transcript: '  Hello there.  '
    });
    const after = Date.now();

    expect(onTranscript).toHaveBeenCalledTimes(1);
    const [text, endOfTurnAt] = onTranscript.mock.calls[0];
    expect(text).toBe('Hello there.');
    expect(typeof endOfTurnAt).toBe('number');
    expect(endOfTurnAt).toBeGreaterThanOrEqual(before);
    expect(endOfTurnAt).toBeLessThanOrEqual(after);
  });

  test('EndOfTurn with empty transcript does not fire onTranscript', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    const onTranscript = jest.fn();
    flux.onTranscript = onTranscript;

    mockHandlers.message({ type: 'TurnInfo', event: 'EndOfTurn', transcript: '   ' });

    expect(onTranscript).not.toHaveBeenCalled();
  });

  test('EagerEndOfTurn and TurnResumed do not fire any callback', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    const onSpeechStart = jest.fn();
    const onTranscript = jest.fn();
    flux.onSpeechStart = onSpeechStart;
    flux.onTranscript = onTranscript;

    mockHandlers.message({ type: 'TurnInfo', event: 'EagerEndOfTurn', transcript: 'tentative' });
    mockHandlers.message({ type: 'TurnInfo', event: 'TurnResumed' });

    expect(onSpeechStart).not.toHaveBeenCalled();
    expect(onTranscript).not.toHaveBeenCalled();
  });

  test('non-TurnInfo messages are ignored', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    const onTranscript = jest.fn();
    flux.onTranscript = onTranscript;

    mockHandlers.message({ type: 'Metadata' });
    mockHandlers.message(null);

    expect(onTranscript).not.toHaveBeenCalled();
  });

  test('connection error fires onError callback', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    const onError = jest.fn();
    flux.onError = onError;

    const err = new Error('boom');
    mockHandlers.error(err);

    expect(onError).toHaveBeenCalledWith(err);
  });

  test('destroy() closes the stream and clears callbacks', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    flux.onSpeechStart = jest.fn();
    flux.onTranscript = jest.fn();
    flux.onError = jest.fn();

    flux.destroy();

    expect(mockConnection.sendCloseStream).toHaveBeenCalledWith({ type: 'CloseStream' });
    expect(flux.onSpeechStart).toBeNull();
    expect(flux.onTranscript).toBeNull();
    expect(flux.onError).toBeNull();
  });

  test('reset() is a no-op (Flux holds turn state server-side)', async () => {
    const flux = new FluxSTTService();
    await flux.initialize();
    expect(() => flux.reset()).not.toThrow();
    expect(mockConnection.sendCloseStream).not.toHaveBeenCalled();
  });
});

describe('FluxSTTService — missing API key', () => {
  test('initialize() throws when DEEPGRAM_API_KEY is not set', async () => {
    jest.resetModules();
    jest.doMock('../src/config', () => ({
      DEEPGRAM_API_KEY: undefined,
      USE_FLUX_STT: true,
      DEBUG_VAD: false
    }));
    const { FluxSTTService: FluxSTTServiceNoKey } = require('../src/services/FluxSTTService');
    const flux = new FluxSTTServiceNoKey();
    await expect(flux.initialize()).rejects.toThrow(/DEEPGRAM_API_KEY/);
  });
});

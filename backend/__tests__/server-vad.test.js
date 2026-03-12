/**
 * ServerVAD Unit Tests
 * Tests server-side Voice Activity Detection using Silero VAD v4
 * Covers: initialization, audio processing, gain normalization,
 * speech state machine, pre-speech buffer, WAV conversion, cleanup.
 */

process.env.NODE_ENV = 'test';

// --- Mock onnxruntime-node ---
// jest.mock is hoisted above all variable declarations, so everything must be
// defined inside the factory. We export mock internals via __mockInternals.
jest.mock('onnxruntime-node', () => {
  const _mockState = {
    runResult: {
      output: { data: new Float32Array([0.05]) },
      hn: { data: new Float32Array(128).fill(0) },
      cn: { data: new Float32Array(128).fill(0) }
    }
  };

  const _mockRun = jest.fn(async () => _mockState.runResult);

  const _mockSession = {
    run: _mockRun,
    inputNames: ['input', 'h', 'c', 'sr'],
    outputNames: ['output', 'hn', 'cn']
  };

  return {
    InferenceSession: {
      create: jest.fn().mockResolvedValue(_mockSession)
    },
    Tensor: jest.fn((type, data, dims) => ({ type, data, dims })),
    // Expose internals for test code to control
    __mockInternals: { mockState: _mockState, mockRun: _mockRun, mockSession: _mockSession }
  };
});

// Access mock internals after jest.mock is set up
const ort = require('onnxruntime-node');
const { mockState, mockRun, mockSession } = ort.__mockInternals;

const { ServerVAD, float32ToWavBuffer, loadModel } = require('../src/services/ServerVAD');

// --- Test audio helpers ---
const FRAME_SIZE = 1536;

function createSilenceChunk(samples = FRAME_SIZE) {
  return new Int16Array(samples); // all zeros
}

function createSpeechChunk(samples = FRAME_SIZE) {
  const arr = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    arr[i] = Math.floor(Math.sin(i * 0.1) * 16000);
  }
  return arr;
}

// --- Reset shared state before each test ---
// jest.config.js has resetMocks: true, which clears all mock implementations
// before each test. We must re-apply them here so the mocks work correctly.
beforeEach(() => {
  // Re-apply mock implementations cleared by resetMocks: true
  ort.InferenceSession.create.mockResolvedValue(mockSession);
  mockRun.mockImplementation(async () => mockState.runResult);
  ort.Tensor.mockImplementation((type, data, dims) => {
    if (data === null || data === undefined) {
      throw new TypeError('Tensor data cannot be null or undefined');
    }
    return { type, data, dims };
  });

  mockState.runResult = {
    output: { data: new Float32Array([0.05]) },
    hn: { data: new Float32Array(128).fill(0) },
    cn: { data: new Float32Array(128).fill(0) }
  };
});

// Suppress console.log/warn during tests
let logSpy, warnSpy;
beforeAll(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
});

// =====================================================================
// Initialization
// =====================================================================
describe('ServerVAD - initialization', () => {
  test('initialize() sets up LSTM state arrays', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    expect(vad.session).toBeDefined();
    expect(vad.session.run).toBeDefined();
    expect(vad.h).toBeInstanceOf(Float32Array);
    expect(vad.h.length).toBe(128); // 2 * 1 * 64
    expect(vad.c).toBeInstanceOf(Float32Array);
    expect(vad.c.length).toBe(128);
  });

  test('constructor accepts custom thresholds', () => {
    const vad = new ServerVAD({
      posThreshold: 0.5,
      negThreshold: 0.35,
      redemptionFrames: 15,
      minSpeechFrames: 4
    });
    expect(vad.posThreshold).toBe(0.5);
    expect(vad.negThreshold).toBe(0.35);
    expect(vad.redemptionFrames).toBe(15);
    expect(vad.minSpeechFrames).toBe(4);
  });
});

// =====================================================================
// Audio chunk processing — processChunk()
// =====================================================================
describe('ServerVAD - processChunk()', () => {
  let vad;

  beforeEach(async () => {
    vad = new ServerVAD();
    await vad.initialize();
    mockRun.mockClear();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('handles chunks smaller than frame size (stores in residual buffer)', async () => {
    const smallChunk = createSilenceChunk(500);
    await vad.processChunk(smallChunk);
    expect(mockRun).not.toHaveBeenCalled();
    expect(vad._residualBuffer).not.toBeNull();
    expect(vad._residualBuffer.length).toBe(500);
  });

  test('handles chunks larger than frame size (processes multiple frames)', async () => {
    const largeChunk = createSilenceChunk(FRAME_SIZE * 3);
    await vad.processChunk(largeChunk);
    expect(mockRun).toHaveBeenCalledTimes(3);
  });

  test('residual buffer correctly assembles frames across chunks', async () => {
    await vad.processChunk(createSilenceChunk(1000));
    expect(mockRun).not.toHaveBeenCalled();

    // Second chunk: 1000 samples → total 2000 → one frame (1536), residual 464
    await vad.processChunk(createSilenceChunk(1000));
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(vad._residualBuffer.length).toBe(464);
  });

  test('sequential browser-size chunks build up residual correctly', async () => {
    // Simulate typical browser chunks of ~1365 samples
    await vad.processChunk(createSilenceChunk(1365));
    expect(mockRun).not.toHaveBeenCalled();
    expect(vad._residualBuffer.length).toBe(1365);

    await vad.processChunk(createSilenceChunk(1365));
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(vad._residualBuffer.length).toBe(1194);

    await vad.processChunk(createSilenceChunk(1365));
    expect(mockRun).toHaveBeenCalledTimes(2);
    expect(vad._residualBuffer.length).toBe(1023);
  });
});

// =====================================================================
// Gain normalization — _applyGain()
// =====================================================================
describe('ServerVAD - _applyGain()', () => {
  let vad;

  beforeEach(() => {
    vad = new ServerVAD();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('quiet audio (peak between 0.001 and 0.1) gets boosted', () => {
    const frame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < FRAME_SIZE; i++) {
      frame[i] = Math.sin(i * 0.1) * 0.015;
    }
    const gained = vad._applyGain(frame);
    const peakOriginal = Math.max(...Array.from(frame).map(Math.abs));
    const peakGained = Math.max(...Array.from(gained).map(Math.abs));
    expect(peakGained).toBeGreaterThan(peakOriginal);
  });

  test('normal audio (peak >= 0.1) passes through unchanged', () => {
    const frame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < FRAME_SIZE; i++) {
      frame[i] = Math.sin(i * 0.1) * 0.5;
    }
    const result = vad._applyGain(frame);
    expect(result).toBe(frame);
  });

  test('gain factor is capped at 50x and output clamped to [-1, 1]', () => {
    const frame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < FRAME_SIZE; i++) {
      frame[i] = Math.sin(i * 0.1) * 0.002;
    }
    const gained = vad._applyGain(frame);
    const peakGained = Math.max(...Array.from(gained).map(Math.abs));
    expect(peakGained).toBeLessThanOrEqual(0.102);
    expect(peakGained).toBeGreaterThan(0.05);
    for (let i = 0; i < gained.length; i++) {
      expect(gained[i]).toBeGreaterThanOrEqual(-1);
      expect(gained[i]).toBeLessThanOrEqual(1);
    }
  });
});

// =====================================================================
// Pre-speech buffer
// =====================================================================
describe('ServerVAD - pre-speech buffer', () => {
  let vad;

  beforeEach(async () => {
    vad = new ServerVAD();
    await vad.initialize();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('when speech starts, pre-speech audio is prepended to audioBuffer', () => {
    const frame = new Float32Array(FRAME_SIZE).fill(0.01);

    // Build up 3 frames of pre-speech buffer
    for (let i = 0; i < 3; i++) {
      vad._updateState(0.05, frame);
    }
    expect(vad.preSpeechBuffer.length).toBe(3);

    // Trigger speech (2 frames above threshold)
    vad._updateState(0.5, frame);
    vad._updateState(0.5, frame);

    expect(vad.isSpeaking).toBe(true);
    expect(vad.preSpeechBuffer.length).toBe(0);
    expect(vad.audioBuffer.length).toBe(5); // 3 silence + 2 speech-trigger frames
  });

  test('buffer does not grow beyond preSpeechBufferSize (10 frames)', () => {
    const frame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < 15; i++) {
      vad._updateState(0.05, frame);
    }
    expect(vad.preSpeechBuffer.length).toBe(10);
  });
});

// =====================================================================
// float32ToWavBuffer utility — WAV header correctness
// =====================================================================
describe('float32ToWavBuffer', () => {
  test('WAV header has correct RIFF/WAVE markers and fmt chunk', () => {
    const audio = new Float32Array([0.1, 0.2]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE');
    expect(wav.toString('ascii', 12, 16)).toBe('fmt ');
    expect(wav.readUInt32LE(16)).toBe(16); // fmt chunk size
    expect(wav.readUInt16LE(20)).toBe(1); // PCM format
    expect(wav.readUInt16LE(22)).toBe(1); // mono
    expect(wav.readUInt32LE(24)).toBe(16000); // sample rate
    expect(wav.readUInt32LE(28)).toBe(32000); // byte rate = 16000 * 1 * 2
    expect(wav.readUInt16LE(32)).toBe(2); // block align
    expect(wav.readUInt16LE(34)).toBe(16); // bits per sample
  });

  test('data chunk size and total buffer size are correct', () => {
    const audio = new Float32Array(100);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.toString('ascii', 36, 40)).toBe('data');
    expect(wav.readUInt32LE(40)).toBe(200); // 100 samples * 2 bytes
    expect(wav.length).toBe(44 + 100 * 2);
    expect(wav.readUInt32LE(4)).toBe(36 + 100 * 2); // RIFF size
  });

  test('samples are correctly converted from Float32 to Int16 with clamping', () => {
    const audio = new Float32Array([1.0, -1.0, 2.0, -2.0]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.readInt16LE(44)).toBe(32767);
    expect(wav.readInt16LE(46)).toBe(-32768);
    expect(wav.readInt16LE(48)).toBe(32767); // clamped
    expect(wav.readInt16LE(50)).toBe(-32768); // clamped
  });

  test('empty array produces valid but empty WAV', () => {
    const audio = new Float32Array(0);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.length).toBe(44);
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.readUInt32LE(40)).toBe(0);
  });
});

// =====================================================================
// Destroy/cleanup
// =====================================================================
describe('ServerVAD - destroy and cleanup', () => {
  test('destroy() releases resources and nullifies state', async () => {
    const vad = new ServerVAD();
    await vad.initialize();

    vad.onSpeechStart = jest.fn();
    vad.onSpeechEnd = jest.fn();
    vad.onIncrementalAudio = jest.fn();

    vad.destroy();

    expect(vad.h).toBeNull();
    expect(vad.c).toBeNull();
    expect(vad.audioBuffer).toEqual([]);
    expect(vad.preSpeechBuffer).toEqual([]);
    expect(vad._residualBuffer).toBeNull();
    expect(vad.onSpeechStart).toBeNull();
    expect(vad.onSpeechEnd).toBeNull();
    expect(vad.onIncrementalAudio).toBeNull();
  });

  test('processChunk after destroy throws', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    vad.destroy();
    await expect(vad.processChunk(createSpeechChunk())).rejects.toThrow();
  });
});

// =====================================================================
// Reset
// =====================================================================
describe('ServerVAD - reset()', () => {
  test('reset() clears audio buffer, state, residual buffer, and LSTM state', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    const frame = new Float32Array(FRAME_SIZE);

    vad.isSpeaking = true;
    vad.speechFrameCount = 5;
    vad.silenceFrameCount = 3;
    vad.audioBuffer = [frame];
    vad.preSpeechBuffer = [frame];
    vad._residualBuffer = new Float32Array(100);

    vad.reset();

    expect(vad.isSpeaking).toBe(false);
    expect(vad.speechFrameCount).toBe(0);
    expect(vad.silenceFrameCount).toBe(0);
    expect(vad.audioBuffer).toEqual([]);
    expect(vad.preSpeechBuffer).toEqual([]);
    expect(vad._residualBuffer).toBeNull();
    expect(vad.h).toBeInstanceOf(Float32Array);
    expect(vad.h.every(v => v === 0)).toBe(true);

    vad.destroy();
  });
});

// =====================================================================
// End-to-end speech detection flow
// =====================================================================
describe('ServerVAD - end-to-end speech detection', () => {
  test('full cycle: silence → speech detection → speech end with callbacks', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    mockRun.mockClear();

    const onStart = jest.fn();
    const onEnd = jest.fn();
    vad.onSpeechStart = onStart;
    vad.onSpeechEnd = onEnd;

    // Phase 1: Silence (model returns low prob)
    mockState.runResult = {
      output: { data: new Float32Array([0.05]) },
      hn: { data: new Float32Array(128) },
      cn: { data: new Float32Array(128) }
    };
    await vad.processChunk(createSilenceChunk(FRAME_SIZE));
    expect(onStart).not.toHaveBeenCalled();

    // Phase 2: Speech (model returns high prob, need minSpeechFrames=2)
    mockState.runResult = {
      output: { data: new Float32Array([0.8]) },
      hn: { data: new Float32Array(128) },
      cn: { data: new Float32Array(128) }
    };
    await vad.processChunk(createSpeechChunk(FRAME_SIZE));
    expect(onStart).not.toHaveBeenCalled(); // Only 1 frame so far

    await vad.processChunk(createSpeechChunk(FRAME_SIZE));
    expect(onStart).toHaveBeenCalledTimes(1);

    // Phase 3: Continue speech for a few frames
    for (let i = 0; i < 3; i++) {
      await vad.processChunk(createSpeechChunk(FRAME_SIZE));
    }

    // Phase 4: Silence to end speech (need redemptionFrames=8 since speech < 5s)
    mockState.runResult = {
      output: { data: new Float32Array([0.05]) },
      hn: { data: new Float32Array(128) },
      cn: { data: new Float32Array(128) }
    };
    for (let i = 0; i < 8; i++) {
      await vad.processChunk(createSilenceChunk(FRAME_SIZE));
    }
    expect(onEnd).toHaveBeenCalledTimes(1);

    // Verify the audio returned on speech end
    const audio = onEnd.mock.calls[0][0];
    expect(audio).toBeInstanceOf(Float32Array);
    expect(audio.length).toBeGreaterThan(0);

    vad.destroy();
  });

  test('no callback fires when only silence is processed', async () => {
    const vad = new ServerVAD();
    await vad.initialize();

    const onStart = jest.fn();
    const onEnd = jest.fn();
    vad.onSpeechStart = onStart;
    vad.onSpeechEnd = onEnd;

    mockState.runResult = {
      output: { data: new Float32Array([0.05]) },
      hn: { data: new Float32Array(128) },
      cn: { data: new Float32Array(128) }
    };

    for (let i = 0; i < 20; i++) {
      await vad.processChunk(createSilenceChunk(FRAME_SIZE));
    }

    expect(onStart).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();

    vad.destroy();
  });
});

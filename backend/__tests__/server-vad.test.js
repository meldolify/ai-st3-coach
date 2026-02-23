/**
 * ServerVAD Unit Tests
 * Tests server-side Voice Activity Detection using Silero VAD v4
 * Covers: construction, initialization, audio processing, gain normalization,
 * speech state machine, pre-speech buffer, audio export, WAV conversion, cleanup.
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
// a) Construction and initialization
// =====================================================================
describe('ServerVAD - construction and initialization', () => {
  test('constructor sets default thresholds (pos=0.3, neg=0.2)', () => {
    const vad = new ServerVAD();
    expect(vad.posThreshold).toBe(0.3);
    expect(vad.negThreshold).toBe(0.2);
  });

  test('constructor sets default redemptionFrames=6 and minSpeechFrames=2', () => {
    const vad = new ServerVAD();
    expect(vad.redemptionFrames).toBe(6);
    expect(vad.minSpeechFrames).toBe(2);
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

  test('constructor initializes empty state (no LSTM state, no buffers)', () => {
    const vad = new ServerVAD();
    expect(vad.session).toBeNull();
    expect(vad.h).toBeNull();
    expect(vad.c).toBeNull();
    expect(vad.isSpeaking).toBe(false);
    expect(vad.speechFrameCount).toBe(0);
    expect(vad.silenceFrameCount).toBe(0);
    expect(vad.audioBuffer).toEqual([]);
    expect(vad.preSpeechBuffer).toEqual([]);
    expect(vad._residualBuffer).toBeNull();
  });

  test('constructor initializes callbacks as null', () => {
    const vad = new ServerVAD();
    expect(vad.onSpeechStart).toBeNull();
    expect(vad.onSpeechEnd).toBeNull();
    expect(vad.onIncrementalAudio).toBeNull();
  });

  test('initialize() completes without error and sets up LSTM state', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    expect(vad.session).toBeDefined();
    expect(vad.session.run).toBeDefined();
    expect(vad.h).toBeInstanceOf(Float32Array);
    expect(vad.h.length).toBe(128); // 2 * 1 * 64
    expect(vad.c).toBeInstanceOf(Float32Array);
    expect(vad.c.length).toBe(128);
  });

  test('initialize() runs self-test (calls model twice for silence and noise)', async () => {
    mockRun.mockClear();
    const vad = new ServerVAD();
    await vad.initialize();
    // Self-test runs model twice: once for silence, once for noise
    expect(mockRun).toHaveBeenCalledTimes(2);
  });

  test('initialize() resets state after self-test', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    expect(vad.isSpeaking).toBe(false);
    expect(vad.speechFrameCount).toBe(0);
    expect(vad.audioBuffer).toEqual([]);
  });
});

// =====================================================================
// b) Audio chunk processing — processChunk()
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

  test('accepts Int16 PCM array and processes it', async () => {
    const chunk = createSilenceChunk(FRAME_SIZE);
    await vad.processChunk(chunk);
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  test('handles chunks smaller than frame size (stores in residual buffer)', async () => {
    const smallChunk = createSilenceChunk(500);
    await vad.processChunk(smallChunk);
    // Not enough samples for a frame — model should not be called
    expect(mockRun).not.toHaveBeenCalled();
    // Residual buffer should hold the 500 samples
    expect(vad._residualBuffer).not.toBeNull();
    expect(vad._residualBuffer.length).toBe(500);
  });

  test('handles chunks larger than frame size (processes multiple frames)', async () => {
    const largeChunk = createSilenceChunk(FRAME_SIZE * 3);
    await vad.processChunk(largeChunk);
    expect(mockRun).toHaveBeenCalledTimes(3);
  });

  test('handles chunks exactly equal to frame size', async () => {
    const exactChunk = createSilenceChunk(FRAME_SIZE);
    await vad.processChunk(exactChunk);
    expect(mockRun).toHaveBeenCalledTimes(1);
    // No residual should remain
    expect(vad._residualBuffer).toBeNull();
  });

  test('residual buffer correctly assembles frames across chunks', async () => {
    // First chunk: 1000 samples (less than FRAME_SIZE=1536)
    await vad.processChunk(createSilenceChunk(1000));
    expect(mockRun).not.toHaveBeenCalled();

    // Second chunk: 1000 samples → total 2000 → one frame (1536), residual 464
    await vad.processChunk(createSilenceChunk(1000));
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(vad._residualBuffer.length).toBe(464);
  });

  test('sequential chunks build up residual correctly', async () => {
    // Simulate typical browser chunks of ~1365 samples
    await vad.processChunk(createSilenceChunk(1365));
    expect(mockRun).not.toHaveBeenCalled();
    expect(vad._residualBuffer.length).toBe(1365);

    await vad.processChunk(createSilenceChunk(1365));
    // Total: 2730 → one frame (1536), residual 1194
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(vad._residualBuffer.length).toBe(1194);

    await vad.processChunk(createSilenceChunk(1365));
    // Total: 1194 + 1365 = 2559 → one frame (1536), residual 1023
    expect(mockRun).toHaveBeenCalledTimes(2);
    expect(vad._residualBuffer.length).toBe(1023);
  });

  test('processes chunks sequentially via queue', async () => {
    // Submit multiple chunks simultaneously — they should still process in order
    const p1 = vad.processChunk(createSilenceChunk(FRAME_SIZE));
    const p2 = vad.processChunk(createSilenceChunk(FRAME_SIZE));
    await Promise.all([p1, p2]);
    expect(mockRun).toHaveBeenCalledTimes(2);
  });
});

// =====================================================================
// c) Gain normalization — _applyGain()
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
    // gain = min(0.3/0.015, 50) = 20
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
    // Should be the exact same array reference (no copy)
    expect(result).toBe(frame);
  });

  test('very quiet audio (peak < 0.001) passes through unchanged', () => {
    const frame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < FRAME_SIZE; i++) {
      frame[i] = Math.sin(i * 0.1) * 0.0005;
    }
    const result = vad._applyGain(frame);
    expect(result).toBe(frame);
  });

  test('zero amplitude audio returns original (no division by zero)', () => {
    const frame = new Float32Array(FRAME_SIZE); // all zeros
    const result = vad._applyGain(frame);
    // peak=0 < 0.001, returns original
    expect(result).toBe(frame);
  });

  test('gain factor is capped at 50x maximum', () => {
    // peak = 0.002 → gain = min(0.3/0.002, 50) = min(150, 50) = 50
    const frame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < FRAME_SIZE; i++) {
      frame[i] = Math.sin(i * 0.1) * 0.002;
    }
    const gained = vad._applyGain(frame);
    const peakGained = Math.max(...Array.from(gained).map(Math.abs));
    // With 50x gain on peak 0.002 → max ~0.1
    expect(peakGained).toBeLessThanOrEqual(0.102); // small float tolerance
    expect(peakGained).toBeGreaterThan(0.05);
  });

  test('gained audio is clamped to [-1, 1]', () => {
    // peak = 0.05 → gain = min(0.3/0.05, 50) = 6
    const frame = new Float32Array(FRAME_SIZE);
    for (let i = 0; i < FRAME_SIZE; i++) {
      frame[i] = Math.sin(i * 0.1) * 0.099; // just under threshold
    }
    const gained = vad._applyGain(frame);
    for (let i = 0; i < gained.length; i++) {
      expect(gained[i]).toBeGreaterThanOrEqual(-1);
      expect(gained[i]).toBeLessThanOrEqual(1);
    }
  });
});

// =====================================================================
// d) Speech state machine — _updateState()
// =====================================================================
describe('ServerVAD - speech state machine', () => {
  let vad;

  beforeEach(async () => {
    vad = new ServerVAD();
    await vad.initialize();
    mockRun.mockClear();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('probability above posThreshold triggers speech after minSpeechFrames', () => {
    const frame = new Float32Array(FRAME_SIZE);
    // Need minSpeechFrames (2) consecutive high-prob frames
    vad._updateState(0.5, frame); // speechFrameCount → 1
    expect(vad.isSpeaking).toBe(false);

    vad._updateState(0.5, frame); // speechFrameCount → 2 → isSpeaking=true
    expect(vad.isSpeaking).toBe(true);
  });

  test('probability below negThreshold during speech increments silence count', () => {
    const frame = new Float32Array(FRAME_SIZE);
    // Start speaking
    vad._updateState(0.5, frame);
    vad._updateState(0.5, frame);
    expect(vad.isSpeaking).toBe(true);

    vad._updateState(0.1, frame);
    expect(vad.silenceFrameCount).toBe(1);
    expect(vad.isSpeaking).toBe(true); // Not ended yet
  });

  test('probability between thresholds stays in current state (hysteresis)', () => {
    const frame = new Float32Array(FRAME_SIZE);
    // Not speaking: probability 0.25 (between 0.2 and 0.3) should not trigger speech
    vad._updateState(0.25, frame);
    expect(vad.isSpeaking).toBe(false);
    expect(vad.speechFrameCount).toBe(0);

    // Start speaking first
    vad._updateState(0.5, frame);
    vad._updateState(0.5, frame);
    expect(vad.isSpeaking).toBe(true);

    // In speech: probability 0.25 (between thresholds) should NOT increment silence
    vad._updateState(0.25, frame);
    expect(vad.isSpeaking).toBe(true);
    expect(vad.silenceFrameCount).toBe(0); // Reset because prob >= negThreshold
  });

  test('speech start fires onSpeechStart callback', () => {
    const onStart = jest.fn();
    vad.onSpeechStart = onStart;
    const frame = new Float32Array(FRAME_SIZE);

    vad._updateState(0.5, frame);
    expect(onStart).not.toHaveBeenCalled();
    vad._updateState(0.5, frame);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test('speech end fires onSpeechEnd callback with audio buffer', () => {
    const onEnd = jest.fn();
    vad.onSpeechEnd = onEnd;
    const frame = new Float32Array(FRAME_SIZE);

    // Start speech
    vad._updateState(0.5, frame);
    vad._updateState(0.5, frame);
    expect(vad.isSpeaking).toBe(true);

    // Force speechStartTime to make _getRedemptionFrames return base value (8)
    vad.speechStartTime = Date.now();

    // Send enough silence frames to trigger end (redemptionFrames = 8)
    for (let i = 0; i < 8; i++) {
      vad._updateState(0.1, frame);
    }

    expect(onEnd).toHaveBeenCalledTimes(1);
    // First argument is the concatenated audio Float32Array
    const audioArg = onEnd.mock.calls[0][0];
    expect(audioArg).toBeInstanceOf(Float32Array);
    expect(audioArg.length).toBeGreaterThan(0);
  });

  test('minimum speech duration (minSpeechFrames) prevents short triggers', () => {
    const onStart = jest.fn();
    vad.onSpeechStart = onStart;
    const frame = new Float32Array(FRAME_SIZE);

    // Single high-prob frame is not enough (minSpeechFrames=2)
    vad._updateState(0.5, frame);
    expect(vad.isSpeaking).toBe(false);
    expect(onStart).not.toHaveBeenCalled();

    // Silence resets the counter
    vad._updateState(0.1, frame);
    expect(vad.speechFrameCount).toBe(0);

    // Single frame again — still not enough
    vad._updateState(0.5, frame);
    expect(vad.isSpeaking).toBe(false);
  });

  test('speechFrameCount resets when a non-speech frame arrives before minSpeechFrames', () => {
    const frame = new Float32Array(FRAME_SIZE);

    vad._updateState(0.5, frame); // speechFrameCount=1
    expect(vad.speechFrameCount).toBe(1);

    vad._updateState(0.1, frame); // below posThreshold → reset
    expect(vad.speechFrameCount).toBe(0);
  });

  test('after speech ends, state resets for new detection', () => {
    const onEnd = jest.fn();
    vad.onSpeechEnd = onEnd;
    const frame = new Float32Array(FRAME_SIZE);

    // Start speech
    vad._updateState(0.5, frame);
    vad._updateState(0.5, frame);
    vad.speechStartTime = Date.now();

    // End speech
    for (let i = 0; i < 8; i++) {
      vad._updateState(0.1, frame);
    }

    expect(vad.isSpeaking).toBe(false);
    expect(vad.speechFrameCount).toBe(0);
    expect(vad.silenceFrameCount).toBe(0);
    expect(vad.audioBuffer).toEqual([]);
  });

  test('onSpeechEnd receives hadIncrementalExports=false when no incremental exports', () => {
    const onEnd = jest.fn();
    vad.onSpeechEnd = onEnd;
    const frame = new Float32Array(FRAME_SIZE);

    // Short speech — no incremental exports
    vad._updateState(0.5, frame);
    vad._updateState(0.5, frame);
    vad.speechStartTime = Date.now();

    for (let i = 0; i < 8; i++) {
      vad._updateState(0.1, frame);
    }

    const hadIncrementalExports = onEnd.mock.calls[0][1];
    expect(hadIncrementalExports).toBe(false);
  });
});

// =====================================================================
// d2) Adaptive redemption frames
// =====================================================================
describe('ServerVAD - adaptive redemption frames', () => {
  let vad;

  beforeEach(async () => {
    vad = new ServerVAD();
    await vad.initialize();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('short speech (<5s) uses base redemption frames', () => {
    vad.speechStartTime = Date.now(); // just started
    expect(vad._getRedemptionFrames()).toBe(6);
  });

  test('medium speech (5-15s) uses 2x redemption frames', () => {
    vad.speechStartTime = Date.now() - 7000; // 7 seconds ago
    expect(vad._getRedemptionFrames()).toBe(12);
  });

  test('long speech (>15s) uses 3.5x redemption frames', () => {
    vad.speechStartTime = Date.now() - 20000; // 20 seconds ago
    expect(vad._getRedemptionFrames()).toBe(21); // round(6 * 3.5) = 21
  });
});

// =====================================================================
// e) Pre-speech buffer
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

  test('buffer stores frames during silence (up to preSpeechBufferSize)', () => {
    const frame = new Float32Array(FRAME_SIZE);
    // Send 5 silence frames
    for (let i = 0; i < 5; i++) {
      vad._updateState(0.05, frame);
    }
    expect(vad.preSpeechBuffer.length).toBe(5);
  });

  test('buffer does not grow beyond preSpeechBufferSize (10 frames)', () => {
    const frame = new Float32Array(FRAME_SIZE);
    // Send 15 silence frames
    for (let i = 0; i < 15; i++) {
      vad._updateState(0.05, frame);
    }
    expect(vad.preSpeechBuffer.length).toBe(10);
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
    // audioBuffer should contain pre-speech frames (3 silence + 2 speech-trigger frames
    // that were added to preSpeechBuffer before minSpeechFrames was reached)
    // The pre-speech buffer is cleared on speech start
    expect(vad.preSpeechBuffer.length).toBe(0);
    expect(vad.audioBuffer.length).toBe(5); // 3 silence + 2 speech-trigger frames
  });

  test('pre-speech buffer frames are copies (Float32Array instances)', () => {
    const frame = new Float32Array(FRAME_SIZE).fill(0.01);
    vad._updateState(0.05, frame);
    expect(vad.preSpeechBuffer[0]).toBeInstanceOf(Float32Array);
    expect(vad.preSpeechBuffer[0].length).toBe(FRAME_SIZE);
  });
});

// =====================================================================
// f) Audio export and reset
// =====================================================================
describe('ServerVAD - audio export and reset', () => {
  let vad;

  beforeEach(async () => {
    vad = new ServerVAD();
    await vad.initialize();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('_concatenateBuffers() returns accumulated speech audio', () => {
    const frame1 = new Float32Array(FRAME_SIZE).fill(0.1);
    const frame2 = new Float32Array(FRAME_SIZE).fill(0.2);
    vad.audioBuffer = [frame1, frame2];

    const result = vad._concatenateBuffers();
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(FRAME_SIZE * 2);
    expect(result[0]).toBeCloseTo(0.1);
    expect(result[FRAME_SIZE]).toBeCloseTo(0.2);
  });

  test('_concatenateBuffers() returns empty array when no audio', () => {
    const result = vad._concatenateBuffers();
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(0);
  });

  test('getAudioSinceLastExport() returns all audio if no exports happened', () => {
    const frame = new Float32Array(FRAME_SIZE).fill(0.5);
    vad.audioBuffer = [frame];
    vad._lastExportIndex = 0;

    const result = vad.getAudioSinceLastExport();
    expect(result.length).toBe(FRAME_SIZE);
  });

  test('getAudioSinceLastExport() returns only audio after last export', () => {
    const frame1 = new Float32Array(FRAME_SIZE).fill(0.1);
    const frame2 = new Float32Array(FRAME_SIZE).fill(0.2);
    const frame3 = new Float32Array(FRAME_SIZE).fill(0.3);
    vad.audioBuffer = [frame1, frame2, frame3];
    vad._lastExportIndex = 2; // first 2 frames already exported

    const result = vad.getAudioSinceLastExport();
    expect(result.length).toBe(FRAME_SIZE);
    expect(result[0]).toBeCloseTo(0.3);
  });

  test('reset() clears audio buffer, state, and residual buffer', () => {
    const frame = new Float32Array(FRAME_SIZE);
    // Put the VAD into a non-default state
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
    // LSTM state should be reset to zeros
    expect(vad.h).toBeInstanceOf(Float32Array);
    expect(vad.h.every(v => v === 0)).toBe(true);
    expect(vad.c).toBeInstanceOf(Float32Array);
    expect(vad.c.every(v => v === 0)).toBe(true);
  });
});

// =====================================================================
// f2) Incremental audio export
// =====================================================================
describe('ServerVAD - incremental audio export', () => {
  let vad;

  beforeEach(async () => {
    vad = new ServerVAD();
    await vad.initialize();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('onIncrementalAudio fires after _incrementalIntervalFrames of speech', () => {
    const onIncremental = jest.fn();
    vad.onIncrementalAudio = onIncremental;
    const frame = new Float32Array(FRAME_SIZE).fill(0.1);

    // Start speech
    vad._updateState(0.5, frame);
    vad._updateState(0.5, frame);
    expect(vad.isSpeaking).toBe(true);

    // Simulate enough speech frames to trigger incremental export
    // _incrementalIntervalFrames = Math.round((15 * 16000) / 1536) ~= 156
    const intervalFrames = vad._incrementalIntervalFrames;
    for (let i = 0; i < intervalFrames; i++) {
      vad._updateState(0.5, frame);
    }

    expect(onIncremental).toHaveBeenCalledTimes(1);
    const audioSnapshot = onIncremental.mock.calls[0][0];
    expect(audioSnapshot).toBeInstanceOf(Float32Array);
  });
});

// =====================================================================
// g) float32ToWavBuffer utility
// =====================================================================
describe('float32ToWavBuffer', () => {
  test('converts Float32Array to valid WAV format', () => {
    const audio = new Float32Array([0.5, -0.5, 0.25, -0.25]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav).toBeInstanceOf(Buffer);
  });

  test('WAV header has correct RIFF marker', () => {
    const audio = new Float32Array([0.1, 0.2]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
  });

  test('WAV header has correct WAVE marker', () => {
    const audio = new Float32Array([0.1, 0.2]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE');
  });

  test('WAV header has correct fmt chunk', () => {
    const audio = new Float32Array([0.1, 0.2]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.toString('ascii', 12, 16)).toBe('fmt ');
    expect(wav.readUInt32LE(16)).toBe(16); // fmt chunk size
    expect(wav.readUInt16LE(20)).toBe(1); // PCM format
    expect(wav.readUInt16LE(22)).toBe(1); // mono
  });

  test('sample rate is embedded correctly', () => {
    const audio = new Float32Array([0.1]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.readUInt32LE(24)).toBe(16000);
  });

  test('WAV header has correct data chunk', () => {
    const audio = new Float32Array([0.1, 0.2]);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.toString('ascii', 36, 40)).toBe('data');
    expect(wav.readUInt32LE(40)).toBe(4); // 2 samples * 2 bytes/sample
  });

  test('output buffer size matches expected (44 header + data)', () => {
    const audio = new Float32Array(100);
    const wav = float32ToWavBuffer(audio, 16000);
    // 44 byte header + 100 samples * 2 bytes = 244 bytes
    expect(wav.length).toBe(44 + 100 * 2);
  });

  test('empty array produces valid but empty WAV', () => {
    const audio = new Float32Array(0);
    const wav = float32ToWavBuffer(audio, 16000);
    expect(wav.length).toBe(44); // header only
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.readUInt32LE(40)).toBe(0); // data size = 0
  });

  test('samples are correctly converted from Float32 to Int16', () => {
    // Full-scale positive
    const audio = new Float32Array([1.0]);
    const wav = float32ToWavBuffer(audio, 16000);
    const sample = wav.readInt16LE(44);
    expect(sample).toBe(32767); // max positive Int16

    // Full-scale negative
    const audio2 = new Float32Array([-1.0]);
    const wav2 = float32ToWavBuffer(audio2, 16000);
    const sample2 = wav2.readInt16LE(44);
    expect(sample2).toBe(-32768); // max negative Int16
  });

  test('values are clamped to [-1, 1] range', () => {
    // Values outside range should be clamped
    const audio = new Float32Array([2.0, -2.0]);
    const wav = float32ToWavBuffer(audio, 16000);
    const sample1 = wav.readInt16LE(44);
    const sample2 = wav.readInt16LE(46);
    expect(sample1).toBe(32767);
    expect(sample2).toBe(-32768);
  });

  test('different sample rate is embedded correctly', () => {
    const audio = new Float32Array([0.1]);
    const wav = float32ToWavBuffer(audio, 44100);
    expect(wav.readUInt32LE(24)).toBe(44100);
  });

  test('byte rate and block align are correct for 16-bit mono', () => {
    const audio = new Float32Array([0.1]);
    const wav = float32ToWavBuffer(audio, 16000);
    const byteRate = wav.readUInt32LE(28);
    const blockAlign = wav.readUInt16LE(32);
    const bitsPerSample = wav.readUInt16LE(34);
    expect(byteRate).toBe(32000); // 16000 * 1 * 2
    expect(blockAlign).toBe(2); // 1 channel * 2 bytes
    expect(bitsPerSample).toBe(16);
  });

  test('RIFF file size field is correct', () => {
    const audio = new Float32Array(10);
    const wav = float32ToWavBuffer(audio, 16000);
    const riffSize = wav.readUInt32LE(4);
    // RIFF size = total - 8 = (44 + 10*2) - 8 = 56
    expect(riffSize).toBe(36 + 10 * 2);
  });
});

// =====================================================================
// h) Destroy/cleanup
// =====================================================================
describe('ServerVAD - destroy and cleanup', () => {
  test('destroy() releases resources and nullifies state', async () => {
    const vad = new ServerVAD();
    await vad.initialize();

    // Set up callbacks
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

  test('processChunk after destroy throws (cannot read LSTM state)', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    vad.destroy();

    // After destroy, h and c are null, so _runModel will fail
    await expect(vad.processChunk(createSpeechChunk())).rejects.toThrow();
  });
});

// =====================================================================
// i) Int16 to Float32 conversion
// =====================================================================
describe('ServerVAD - _int16ToFloat32()', () => {
  let vad;

  beforeEach(() => {
    vad = new ServerVAD();
  });

  afterEach(() => {
    vad.destroy();
  });

  test('converts Int16 max to approximately 1.0', () => {
    const int16 = new Int16Array([32767]);
    const result = vad._int16ToFloat32(int16);
    expect(result[0]).toBeCloseTo(1.0, 2);
  });

  test('converts Int16 min to approximately -1.0', () => {
    const int16 = new Int16Array([-32768]);
    const result = vad._int16ToFloat32(int16);
    expect(result[0]).toBe(-1.0);
  });

  test('converts zero to zero', () => {
    const int16 = new Int16Array([0]);
    const result = vad._int16ToFloat32(int16);
    expect(result[0]).toBe(0);
  });

  test('output is Float32Array of same length', () => {
    const int16 = new Int16Array(100);
    const result = vad._int16ToFloat32(int16);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(100);
  });
});

// =====================================================================
// j) loadModel (shared session)
// =====================================================================
describe('loadModel', () => {
  test('returns a session object', async () => {
    const session = await loadModel();
    expect(session).toBeDefined();
    expect(session.run).toBeDefined();
  });
});

// =====================================================================
// k) End-to-end speech detection flow
// =====================================================================
describe('ServerVAD - end-to-end speech detection', () => {
  test('detects speech start and end with correct callbacks', async () => {
    const vad = new ServerVAD();
    await vad.initialize();
    mockRun.mockClear();

    const onStart = jest.fn();
    const onEnd = jest.fn();
    vad.onSpeechStart = onStart;
    vad.onSpeechEnd = onEnd;

    // Simulate: silence -> speech -> silence
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

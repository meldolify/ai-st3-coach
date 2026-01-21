// ============================================================================
// SPEECH.JS - Speech Recognition (Web Speech API + Whisper Fallback)
// ============================================================================
// Dependencies: config.js
// Classes: SpeechRecognitionManager, WhisperRecognitionManager
// Note: WhisperRecognitionManager uses VAD for voice activity detection
// ============================================================================

class SpeechRecognitionManager {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported. Please use Chrome or Edge.');
    }
    this.recognition = new SpeechRecognition();
    this.isListening = false;
    this.shouldBeListening = false;
    this.onTranscript = null;
    this.onStart = null;
    this.onEnd = null;
  }

  initialize() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true; // Enable interim results for faster response
    this.recognition.lang = 'en-GB';
    this.recognition.maxAlternatives = 1;

    // Medical terminology hints for better accuracy
    const medicalTerms = [
      'necrotising fasciitis', 'debridement', 'erythema', 'fascia',
      'anaesthetist', 'resuscitation', 'intravenous', 'antibiotics',
      'microbiology', 'histology', 'ABCDE', 'ITU', 'ICU',
      'diabetes', 'sepsis', 'hypotension', 'tachycardia',
      'compartment syndrome', 'amputation', 'flap', 'graft',
      'haemorrhage', 'oedema', 'necrosis', 'ischaemia'
    ];

    // Note: Web Speech API has limited support for custom grammars
    // This helps improve recognition but isn't guaranteed

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const result = event.results[last];

      // Only process final results to avoid duplicate sends
      if (result.isFinal) {
        const transcript = result[0].transcript.trim();
        if (this.onTranscript && transcript) {
          this.onTranscript(transcript);
        }
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
      if (this.shouldBeListening) {
        // Immediate restart - no delay at all
        try {
          this.recognition.start();
        } catch (e) {
          // If immediate restart fails, try once more after brief delay
          setTimeout(() => {
            try { this.recognition.start(); }
            catch (err) { console.error('Restart failed:', err); }
          }, 50);
        }
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        log('Speech recognition error: ' + event.error, 'warning');
      }
    };
  }

  start() {
    this.shouldBeListening = true;
    if (!this.isListening) {
      try {
        this.recognition.start();
        log('Speech recognition started', 'success');
      } catch (e) {
        if (e.name !== 'InvalidStateError') console.error('Start failed:', e);
      }
    }
  }

  stop() {
    this.shouldBeListening = false;
    if (this.isListening) {
      this.recognition.stop();
    }
  }
}

// ============================================================================
// WHISPER RECOGNITION MANAGER (for browsers without Web Speech API)
// ============================================================================

class WhisperRecognitionManager {
  constructor(websocket) {
    this.websocket = websocket;
    this.isListening = false;
    this.shouldBeListening = false;
    this.isRecording = false;
    this.onTranscript = null;
    this.onStart = null;
    this.onEnd = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.silenceTimer = null;
    this.audioContext = null;
    this.analyser = null;

    // VAD Configuration - based on OpenAI Realtime API parameters
    // Reference: https://platform.openai.com/docs/guides/realtime-vad
    this.silenceThreshold = CONFIG.SPEECH_RECOGNITION?.SILENCE_THRESHOLD ?? 0.025;
    this.interruptThreshold = CONFIG.SPEECH_RECOGNITION?.INTERRUPT_THRESHOLD ?? 0.08; // Higher threshold during AI speech
    this.silenceDuration = CONFIG.SPEECH_RECOGNITION?.SILENCE_DURATION_MS ?? 700; // Faster turn detection
    this.minRecordingDuration = CONFIG.SPEECH_RECOGNITION?.MIN_RECORDING_MS ?? 500;
    this.minAverageRMS = 0.015; // Lowered to allow quieter speech

    // Confirmation frame requirement - prevents false triggers from spikes
    this.consecutiveVoiceFrames = 0;
    this.requiredVoiceFrames = CONFIG.SPEECH_RECOGNITION?.REQUIRED_VOICE_FRAMES ?? 4; // ~67ms at 60fps
    this.interruptVoiceFrames = CONFIG.SPEECH_RECOGNITION?.INTERRUPT_VOICE_FRAMES ?? 8; // ~133ms - stricter during AI speech

    // Interrupt cooldown - prevents rapid re-interrupts
    this.lastInterruptTime = 0;
    this.interruptCooldownMs = 1500; // 1.5 second cooldown after interrupt

    // Continuous listening - track AI state but keep mic open
    this.aiIsSpeaking = false;
    this.recordingContaminated = false; // True if AI spoke during recording
    this.userInitiatedInterrupt = false; // True if user interrupted AI by speaking

    // Callback for requesting AI interrupt (set by V4Session)
    this.onInterruptRequest = null;

    // Energy tracking for audio validation
    this.rmsReadings = [];

    // =========================================================================
    // ENHANCED VAD: Adaptive Noise Floor & Spectral Analysis
    // =========================================================================

    // Adaptive noise floor calibration
    this.noiseFloor = 0.01;              // Initial noise floor estimate
    this.noiseFloorSamples = [];         // Recent ambient noise samples
    this.noiseFloorWindowSize = 60;      // ~1 second of samples at 60fps
    this.noiseFloorMultiplier = 2.5;     // Threshold = noiseFloor * multiplier
    this.isCalibrating = true;           // True during initial calibration
    this.calibrationFrames = 30;         // Frames to collect before calibration complete
    this.calibrationCount = 0;           // Current calibration frame count

    // Spectral analysis for voice detection
    this.voiceFrequencyLow = 85;         // Lower bound of human voice (Hz)
    this.voiceFrequencyHigh = 3000;      // Upper bound of human voice (Hz)
    this.spectralCentroidHistory = [];   // Track spectral centroid over time
    this.spectralHistorySize = 5;        // Frames to average
    this.minVoiceCentroid = 200;         // Min centroid for voice (Hz)
    this.maxVoiceCentroid = 2000;        // Max centroid for voice (Hz)

    // Combined detection confidence
    this.useSpectralAnalysis = CONFIG.SPEECH_RECOGNITION?.USE_SPECTRAL_ANALYSIS ?? true;
  }

  // Called externally to update AI speaking state (for continuous listening)
  setAISpeaking(isSpeaking) {
    const wasAISpeaking = this.aiIsSpeaking;
    this.aiIsSpeaking = isSpeaking;
    console.log(`[WHISPER] AI speaking state changed: ${isSpeaking}`);

    // If AI stopped speaking, reset the interrupt flag
    if (!isSpeaking && wasAISpeaking) {
      this.userInitiatedInterrupt = false;
    }

    // If AI just started speaking while we're recording, mark as contaminated
    // BUT NOT if the user initiated the interrupt (they're intentionally speaking over AI)
    if (isSpeaking && this.isRecording && !wasAISpeaking && !this.userInitiatedInterrupt) {
      this.recordingContaminated = true;
      console.log('[WHISPER] Recording marked contaminated - AI started speaking');
    }
  }

  async initialize() {
    try {
      // Enable browser's built-in echo cancellation and noise suppression
      // Critical for preventing AI audio from triggering VAD
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,    // Removes speaker audio from mic input
          noiseSuppression: true,    // Reduces background noise
          autoGainControl: true      // Normalizes mic levels
        }
      });

      // Set up audio analysis for voice activity detection
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const stopTime = Date.now();
        const recordDuration = stopTime - this.recordStartTime;
        console.log(`[WHISPER TIMING] Recording stopped. Duration: ${recordDuration}ms`);

        // Calculate average RMS from readings during this recording
        const avgRMS = this.rmsReadings.length > 0
          ? this.rmsReadings.reduce((a, b) => a + b, 0) / this.rmsReadings.length
          : 0;
        const maxRMS = this.rmsReadings.length > 0 ? Math.max(...this.rmsReadings) : 0;
        console.log(`[WHISPER VAD] Recording stats - Avg RMS: ${avgRMS.toFixed(4)}, Max RMS: ${maxRMS.toFixed(4)}, Samples: ${this.rmsReadings.length}`);

        // Reset RMS readings for next recording
        const wasContaminated = this.recordingContaminated;
        this.rmsReadings = [];
        this.recordingContaminated = false;

        // Validation checks before sending to Whisper
        let shouldDiscard = false;
        let discardReason = '';

        if (this.audioChunks.length === 0) {
          shouldDiscard = true;
          discardReason = 'No audio chunks';
        } else if (recordDuration < this.minRecordingDuration) {
          shouldDiscard = true;
          discardReason = `Too short (${recordDuration}ms < ${this.minRecordingDuration}ms)`;
        } else if (wasContaminated) {
          shouldDiscard = true;
          discardReason = 'Contaminated by AI speech';
        } else if (avgRMS < this.minAverageRMS) {
          shouldDiscard = true;
          discardReason = `Low energy (avg RMS ${avgRMS.toFixed(4)} < ${this.minAverageRMS})`;
        }

        if (shouldDiscard) {
          console.log(`[WHISPER] Discarded recording: ${discardReason}`);
          this.audioChunks = [];
        } else {
          // Valid recording - send to Whisper
          const t1 = Date.now();
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioChunks = [];
          const t2 = Date.now();
          console.log(`[WHISPER TIMING] Blob creation: ${t2 - t1}ms`);

          // Convert blob to base64 and send to backend
          const reader = new FileReader();
          reader.onloadend = () => {
            const t3 = Date.now();
            console.log(`[WHISPER TIMING] Base64 conversion: ${t3 - t2}ms`);

            const base64Audio = reader.result.split(',')[1];
            this.websocket.send(JSON.stringify({
              type: 'whisper_audio',
              sessionId: session.sessionId,
              audio: base64Audio
            }));

            const t4 = Date.now();
            console.log(`[WHISPER TIMING] WebSocket send: ${t4 - t3}ms`);
            console.log(`[WHISPER TIMING] Total frontend processing: ${t4 - t1}ms`);
          };
          reader.readAsDataURL(audioBlob);
        }

        this.isRecording = false;
        if (this.onEnd) this.onEnd();
      };

      log('Whisper recognition initialized', 'success');
    } catch (error) {
      log('Microphone access denied: ' + error.message, 'error');
      throw error;
    }
  }

  // =========================================================================
  // SPECTRAL ANALYSIS METHODS
  // =========================================================================

  /**
   * Calculate spectral centroid - the "center of mass" of the spectrum
   * Human voice typically has centroid between 200-2000 Hz
   * @param {Uint8Array} frequencyData - FFT frequency data
   * @returns {number} Spectral centroid in Hz
   */
  calculateSpectralCentroid(frequencyData) {
    const sampleRate = this.audioContext.sampleRate;
    const binWidth = sampleRate / (this.analyser.fftSize);

    let weightedSum = 0;
    let magnitudeSum = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      const frequency = i * binWidth;
      const magnitude = frequencyData[i];
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }

    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Calculate energy in voice frequency band (85-3000 Hz)
   * @param {Uint8Array} frequencyData - FFT frequency data
   * @returns {number} Ratio of voice band energy to total energy
   */
  calculateVoiceBandEnergy(frequencyData) {
    const sampleRate = this.audioContext.sampleRate;
    const binWidth = sampleRate / (this.analyser.fftSize);

    let voiceBandEnergy = 0;
    let totalEnergy = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      const frequency = i * binWidth;
      const energy = frequencyData[i] * frequencyData[i];
      totalEnergy += energy;

      if (frequency >= this.voiceFrequencyLow && frequency <= this.voiceFrequencyHigh) {
        voiceBandEnergy += energy;
      }
    }

    return totalEnergy > 0 ? voiceBandEnergy / totalEnergy : 0;
  }

  /**
   * Update adaptive noise floor based on ambient sound levels
   * @param {number} rms - Current RMS level
   */
  updateNoiseFloor(rms) {
    // During calibration, collect samples
    if (this.isCalibrating) {
      this.noiseFloorSamples.push(rms);
      this.calibrationCount++;

      if (this.calibrationCount >= this.calibrationFrames) {
        // Calculate initial noise floor from calibration samples
        this.noiseFloorSamples.sort((a, b) => a - b);
        // Use 25th percentile as noise floor estimate (robust to outliers)
        const p25Index = Math.floor(this.noiseFloorSamples.length * 0.25);
        this.noiseFloor = this.noiseFloorSamples[p25Index] || 0.01;
        this.isCalibrating = false;
        console.log(`[VAD] Noise floor calibrated: ${this.noiseFloor.toFixed(4)}`);
        this.noiseFloorSamples = [];
      }
      return;
    }

    // Only update noise floor when not recording and sound is quiet
    if (!this.isRecording && rms < this.noiseFloor * 1.5) {
      this.noiseFloorSamples.push(rms);

      // Keep window size limited
      if (this.noiseFloorSamples.length > this.noiseFloorWindowSize) {
        this.noiseFloorSamples.shift();
      }

      // Update noise floor estimate (slow adaptation)
      if (this.noiseFloorSamples.length >= 10) {
        const sorted = [...this.noiseFloorSamples].sort((a, b) => a - b);
        const p25Index = Math.floor(sorted.length * 0.25);
        const newFloor = sorted[p25Index];
        // Slow exponential moving average for stability
        this.noiseFloor = this.noiseFloor * 0.95 + newFloor * 0.05;
      }
    }
  }

  /**
   * Check if spectral characteristics indicate human voice
   * @param {number} centroid - Spectral centroid in Hz
   * @param {number} voiceBandRatio - Ratio of voice band energy
   * @returns {boolean} True if likely human voice
   */
  isLikelyVoice(centroid, voiceBandRatio) {
    // Voice typically has:
    // 1. Spectral centroid in speech range (200-2000 Hz)
    // 2. High proportion of energy in voice frequency band (>60%)

    const centroidInRange = centroid >= this.minVoiceCentroid && centroid <= this.maxVoiceCentroid;
    const highVoiceBandEnergy = voiceBandRatio > 0.5;

    return centroidInRange && highVoiceBandEnergy;
  }

  checkAudioLevel() {
    if (!this.analyser || !this.shouldBeListening) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (root mean square) to detect voice
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / bufferLength);

    // Update adaptive noise floor
    this.updateNoiseFloor(rms);

    // Track RMS readings while recording for energy validation
    if (this.isRecording) {
      this.rmsReadings.push(rms);
    }

    // =========================================================================
    // ENHANCED VOICE DETECTION
    // =========================================================================

    // Get frequency data for spectral analysis
    let isVoiceLikeSpectrum = true; // Default to true if spectral analysis disabled
    let spectralCentroid = 0;
    let voiceBandRatio = 0;

    if (this.useSpectralAnalysis) {
      const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(frequencyData);

      spectralCentroid = this.calculateSpectralCentroid(frequencyData);
      voiceBandRatio = this.calculateVoiceBandEnergy(frequencyData);

      // Track spectral centroid history for smoothing
      this.spectralCentroidHistory.push(spectralCentroid);
      if (this.spectralCentroidHistory.length > this.spectralHistorySize) {
        this.spectralCentroidHistory.shift();
      }

      // Use averaged centroid for stability
      const avgCentroid = this.spectralCentroidHistory.reduce((a, b) => a + b, 0) /
        this.spectralCentroidHistory.length;

      isVoiceLikeSpectrum = this.isLikelyVoice(avgCentroid, voiceBandRatio);
    }

    // Calculate adaptive threshold based on noise floor
    const adaptiveThreshold = Math.max(
      this.noiseFloor * this.noiseFloorMultiplier,
      this.silenceThreshold
    );

    // Dynamic threshold: higher when AI is speaking to filter out speaker bleed
    const activeThreshold = this.aiIsSpeaking
      ? Math.max(this.interruptThreshold, adaptiveThreshold * 1.5)  // Higher during AI speech
      : adaptiveThreshold;

    // Dynamic frame requirement: more frames needed during AI speech (stricter confirmation)
    const activeFrameRequirement = this.aiIsSpeaking
      ? this.interruptVoiceFrames  // 8 frames (~133ms) during AI speech
      : this.requiredVoiceFrames;  // 4 frames (~67ms) normally

    // Voice activity detection with confirmation frames AND spectral validation
    const isAboveThreshold = rms > activeThreshold;
    const passesSpectralCheck = !this.useSpectralAnalysis || isVoiceLikeSpectrum;

    // DIAGNOSTIC LOGGING: Log every 30 frames (~500ms at 60fps) to diagnose VAD issues
    this._diagFrameCount = (this._diagFrameCount || 0) + 1;
    if (this._diagFrameCount % 30 === 0) {
      console.log(`[VAD DIAG] RMS: ${rms.toFixed(4)} | Thresh: ${activeThreshold.toFixed(4)} | ` +
        `Above: ${isAboveThreshold} | Spectral: ${this.useSpectralAnalysis} | ` +
        `Centroid: ${spectralCentroid.toFixed(0)}Hz | VoiceBand: ${(voiceBandRatio * 100).toFixed(0)}% | ` +
        `PassesSpectral: ${passesSpectralCheck} | ConsecFrames: ${this.consecutiveVoiceFrames}/${activeFrameRequirement}`);
    }

    if (isAboveThreshold && passesSpectralCheck) {
      // Sound above threshold with voice-like spectrum - increment consecutive frame counter
      this.consecutiveVoiceFrames++;

      // Only trigger after required consecutive frames (prevents false positives from spikes)
      if (this.consecutiveVoiceFrames >= activeFrameRequirement && !this.isRecording) {
        console.log(`[VAD] Voice confirmed (RMS: ${rms.toFixed(4)}, threshold: ${activeThreshold.toFixed(4)}, centroid: ${spectralCentroid.toFixed(0)}Hz, voiceBand: ${(voiceBandRatio * 100).toFixed(0)}%)`);

        // If AI is speaking, check cooldown before interrupting
        if (this.aiIsSpeaking && this.onInterruptRequest) {
          const now = Date.now();
          if (now - this.lastInterruptTime >= this.interruptCooldownMs) {
            console.log('[VAD] User speaking during AI playback - requesting interrupt');
            this.userInitiatedInterrupt = true;
            this.lastInterruptTime = now;
            this.onInterruptRequest(); // This will stop AI audio
          } else {
            console.log(`[VAD] Interrupt cooldown active (${this.interruptCooldownMs - (now - this.lastInterruptTime)}ms remaining)`);
          }
        }

        // Start recording
        this.startRecording();
      }

      // Reset silence timer if we're recording
      if (this.isRecording) {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
        }
        this.silenceTimer = setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, this.silenceDuration);
      }
    } else {
      // Sound below threshold or not voice-like - reset consecutive frame counter
      this.consecutiveVoiceFrames = 0;
    }

    // Continue monitoring
    if (this.shouldBeListening) {
      requestAnimationFrame(() => this.checkAudioLevel());
    }
  }

  startRecording() {
    if (!this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.recordStartTime = Date.now();
      this.rmsReadings = []; // Reset RMS readings for new recording
      this.recordingContaminated = false; // Reset contamination flag
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log(`[WHISPER TIMING] Recording started at ${this.recordStartTime}`);
    }
  }

  stopRecording() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  start() {
    this.shouldBeListening = true;
    this.isListening = true;

    // Reset calibration state for fresh noise floor measurement
    this.isCalibrating = true;
    this.calibrationCount = 0;
    this.noiseFloorSamples = [];
    this.spectralCentroidHistory = [];

    if (this.onStart) this.onStart();
    console.log('[VAD] Starting with adaptive noise floor calibration...');

    // Start monitoring audio levels
    this.checkAudioLevel();
  }

  stop() {
    this.shouldBeListening = false;
    this.isListening = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.isRecording) {
      this.stopRecording();
    }
  }
}


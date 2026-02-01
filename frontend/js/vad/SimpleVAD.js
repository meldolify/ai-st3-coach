// ============================================================================
// SimpleVAD.js - Volume-Based Voice Activity Detection (Fallback for Safari/iOS)
// ============================================================================
// A lightweight VAD that uses Web Audio API's AnalyserNode for volume-based
// speech detection. Works on all browsers including Safari and iOS.
// Used as fallback when Silero VAD (WASM) is not available.
// ============================================================================

class SimpleVAD {
  constructor(websocket) {
    this.websocket = websocket;
    this.isInitialized = false;
    this.isListening = false;
    this.isAISpeaking = false;
    this.postTTSCooldown = false;

    // Audio components
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.sourceNode = null;

    // Recording state
    this.isRecording = false;
    this.audioChunks = [];
    this.recordingStartTime = null;

    // Voice detection state
    this.speechStartTime = null;
    this.silenceStartTime = null;
    this.animationFrameId = null;

    // Callbacks (set by V4Session)
    this.onTranscript = null;
    this.onRecordingStart = null;
    this.onRecordingEnd = null;
    this.onInterruptRequest = null;
    this.onError = null;

    // Configuration - tuned for speech detection
    this.config = {
      // Volume thresholds (0-255 scale from getByteFrequencyData)
      speechThreshold: 25,        // Volume level to detect speech start
      silenceThreshold: 15,       // Volume level to detect silence

      // Timing (in milliseconds)
      speechDebounceMs: 150,      // Ignore brief spikes
      silenceDebounceMs: 800,     // Wait before ending recording (allow pauses)
      minRecordingMs: 500,        // Minimum recording duration
      maxRecordingMs: 30000,      // Maximum recording duration (30s)

      // Analysis
      analyserFftSize: 256,       // FFT size for frequency analysis
      smoothingTimeConstant: 0.8, // Smoothing for volume readings

      // Post-TTS cooldown
      postTTSCooldownMs: 300      // Cooldown after TTS ends
    };
  }

  /**
   * Initialize the SimpleVAD - must be called after user gesture
   */
  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('[SimpleVAD] Initializing...');

      // Get microphone access with Safari-compatible constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
          // Note: sampleRate not included - Safari doesn't support it
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create AudioContext (with webkit prefix for older Safari)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Resume if suspended (iOS requires this after user gesture)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create analyser for volume detection
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.analyserFftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;

      // Connect microphone to analyser
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      this.isInitialized = true;
      console.log('[SimpleVAD] Initialized successfully');
      console.log(`[SimpleVAD] Config: speechThreshold=${this.config.speechThreshold}, silenceDebounce=${this.config.silenceDebounceMs}ms`);

      return true;

    } catch (error) {
      console.error('[SimpleVAD] Initialization failed:', error);

      if (error.name === 'NotAllowedError') {
        if (this.onError) this.onError('Microphone access denied. Please allow microphone access.');
      } else if (error.name === 'NotFoundError') {
        if (this.onError) this.onError('No microphone found. Please connect a microphone.');
      } else {
        if (this.onError) this.onError('Failed to initialize voice detection: ' + error.message);
      }

      return false;
    }
  }

  /**
   * Start listening for voice activity
   */
  start() {
    if (!this.isInitialized) {
      console.warn('[SimpleVAD] Not initialized');
      return;
    }

    if (this.isListening) {
      console.log('[SimpleVAD] Already listening');
      return;
    }

    this.isListening = true;
    this.startVolumeMonitoring();
    console.log('[SimpleVAD] Started listening (continuous mode)');
  }

  /**
   * Stop listening for voice activity
   */
  stop() {
    this.isListening = false;
    this.stopVolumeMonitoring();

    // Stop any active recording
    if (this.isRecording) {
      this.stopRecording(false); // Don't send partial recording
    }

    console.log('[SimpleVAD] Stopped listening');
  }

  /**
   * Start monitoring audio volume
   */
  startVolumeMonitoring() {
    if (this.animationFrameId) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.isListening) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average volume (focus on voice frequency range ~300-3000Hz)
      // With FFT size 256 and 48kHz sample rate, each bin is ~187Hz
      // Bins 2-16 roughly cover 374Hz - 3000Hz (voice range)
      const voiceBins = dataArray.slice(2, 16);
      const avgVolume = voiceBins.reduce((sum, val) => sum + val, 0) / voiceBins.length;

      this.processVolumeLevel(avgVolume);

      this.animationFrameId = requestAnimationFrame(checkVolume);
    };

    this.animationFrameId = requestAnimationFrame(checkVolume);
  }

  /**
   * Stop monitoring audio volume
   */
  stopVolumeMonitoring() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Process current volume level and detect speech/silence transitions
   */
  processVolumeLevel(volume) {
    const now = Date.now();

    // During AI speaking or cooldown, don't process
    if (this.isAISpeaking || this.postTTSCooldown) {
      return;
    }

    if (!this.isRecording) {
      // Not recording - check for speech start
      if (volume > this.config.speechThreshold) {
        if (!this.speechStartTime) {
          this.speechStartTime = now;
        } else if (now - this.speechStartTime >= this.config.speechDebounceMs) {
          // Speech detected for long enough, start recording
          this.startRecording();
          this.speechStartTime = null;
          this.silenceStartTime = null;
        }
      } else {
        // Reset speech detection
        this.speechStartTime = null;
      }
    } else {
      // Currently recording - check for silence (end of speech)
      if (volume < this.config.silenceThreshold) {
        if (!this.silenceStartTime) {
          this.silenceStartTime = now;
        } else if (now - this.silenceStartTime >= this.config.silenceDebounceMs) {
          // Silence detected for long enough, stop recording
          const recordingDuration = now - this.recordingStartTime;
          if (recordingDuration >= this.config.minRecordingMs) {
            this.stopRecording(true); // Send to Whisper
          } else {
            this.stopRecording(false); // Too short, discard
          }
          this.silenceStartTime = null;
        }
      } else {
        // Still speaking, reset silence detection
        this.silenceStartTime = null;
      }

      // Check for max recording duration
      const recordingDuration = now - this.recordingStartTime;
      if (recordingDuration >= this.config.maxRecordingMs) {
        console.log('[SimpleVAD] Max recording duration reached');
        this.stopRecording(true);
      }
    }
  }

  /**
   * Start recording audio
   */
  startRecording() {
    if (this.isRecording || !this.mediaStream) return;

    try {
      this.audioChunks = [];
      this.recordingStartTime = Date.now();

      // Detect supported MIME type (Safari needs MP4/AAC)
      const mimeType = this._getPreferredMimeType();
      console.log(`[SimpleVAD] Using MIME type: ${mimeType}`);

      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        // Processing handled in stopRecording()
      };

      this.mediaRecorder.onerror = (error) => {
        console.error('[SimpleVAD] MediaRecorder error:', error);
        this.isRecording = false;
        if (this.onRecordingEnd) this.onRecordingEnd();
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

      console.log('[SimpleVAD] Recording started');
      if (this.onRecordingStart) this.onRecordingStart();

    } catch (error) {
      console.error('[SimpleVAD] Failed to start recording:', error);
    }
  }

  /**
   * Stop recording and optionally send to Whisper
   */
  async stopRecording(sendToWhisper) {
    if (!this.isRecording || !this.mediaRecorder) return;

    const duration = Date.now() - this.recordingStartTime;
    console.log(`[SimpleVAD] Stopping recording (${duration}ms, send=${sendToWhisper})`);

    this.isRecording = false;

    // Stop MediaRecorder
    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.onRecordingEnd) this.onRecordingEnd();

    // Wait a moment for final data chunk
    await new Promise(resolve => setTimeout(resolve, 100));

    if (sendToWhisper && this.audioChunks.length > 0) {
      await this.sendAudioToWhisper();
    }
  }

  /**
   * Get preferred MIME type based on browser support
   */
  _getPreferredMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/ogg;codecs=opus'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    // Last resort - let browser choose
    return '';
  }

  /**
   * Send recorded audio to Whisper via WebSocket
   */
  async sendAudioToWhisper() {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('[SimpleVAD] WebSocket not ready');
      return;
    }

    if (this.audioChunks.length === 0) {
      console.warn('[SimpleVAD] No audio data to send');
      return;
    }

    try {
      const startTime = Date.now();

      // Create blob from recorded chunks
      const mimeType = this._getPreferredMimeType() || 'audio/webm';
      const audioBlob = new Blob(this.audioChunks, { type: mimeType });
      console.log(`[SimpleVAD] Audio blob: ${audioBlob.size} bytes, type: ${mimeType}`);

      // Convert to WAV for Whisper (ensures compatibility)
      const wavBlob = await this.convertToWav(audioBlob);
      console.log(`[SimpleVAD] WAV blob: ${wavBlob.size} bytes`);

      // Convert to base64
      const base64 = await this.blobToBase64(wavBlob);

      // Send to backend
      const sessionId = window.currentSessionId || 'unknown';
      this.websocket.send(JSON.stringify({
        type: 'whisper_audio',
        sessionId: sessionId,
        audio: base64,
        format: 'wav'
      }));

      console.log(`[SimpleVAD] Audio sent to Whisper (${Date.now() - startTime}ms)`);

    } catch (error) {
      console.error('[SimpleVAD] Error sending audio:', error);
      if (this.onError) this.onError('Failed to process audio');
    }
  }

  /**
   * Convert audio blob to WAV format
   */
  async convertToWav(audioBlob) {
    try {
      // Create a separate AudioContext for decoding
      const decodeContext = new (window.AudioContext || window.webkitAudioContext)();

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await decodeContext.decodeAudioData(arrayBuffer);

      // Get mono audio data
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      // Clean up decode context
      decodeContext.close();

      return this.float32ToWav(channelData, sampleRate);
    } catch (error) {
      console.error('[SimpleVAD] WAV conversion failed:', error);
      // Return original blob if conversion fails
      return audioBlob;
    }
  }

  /**
   * Convert Float32Array to WAV blob
   */
  float32ToWav(float32Array, sampleRate) {
    const buffer = new ArrayBuffer(44 + float32Array.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + float32Array.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, float32Array.length * 2, true);

    // Convert float32 [-1, 1] to int16 [-32768, 32767]
    let offset = 44;
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Convert blob to base64
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Set AI speaking state (pause/resume VAD)
   */
  setAISpeaking(isSpeaking) {
    const wasAISpeaking = this.isAISpeaking;
    this.isAISpeaking = isSpeaking;

    if (isSpeaking && !wasAISpeaking) {
      // AI starting to speak - pause monitoring
      console.log('[SimpleVAD] Paused during TTS');
      this.stopVolumeMonitoring();

      // Stop any active recording
      if (this.isRecording) {
        this.stopRecording(false);
      }
    } else if (!isSpeaking && wasAISpeaking) {
      // AI finished speaking - resume after cooldown
      this.postTTSCooldown = true;
      console.log(`[SimpleVAD] Post-TTS cooldown (${this.config.postTTSCooldownMs}ms)`);

      setTimeout(() => {
        this.postTTSCooldown = false;
        if (this.isListening && !this.isAISpeaking) {
          this.startVolumeMonitoring();
          console.log('[SimpleVAD] Resumed after TTS');
        }
      }, this.config.postTTSCooldownMs);
    }
  }

  /**
   * Destroy and clean up resources
   */
  destroy() {
    this.stop();

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
    console.log('[SimpleVAD] Destroyed');
  }

  // Compatibility methods for V4Session interface
  toggleRecording() {
    console.log('[SimpleVAD] toggleRecording called - SimpleVAD is always-on');
    return false;
  }

  startRecordingManual() {
    console.log('[SimpleVAD] Manual recording not supported - SimpleVAD is always-on');
    return false;
  }

  stopRecordingManual() {
    console.log('[SimpleVAD] Manual recording not supported - SimpleVAD is always-on');
    return false;
  }
}

// Make available globally
window.SimpleVAD = SimpleVAD;

// ============================================================================
// VADManager.js - Voice Activity Detection using @ricky0123/vad-web
// ============================================================================
// Replaces Push-to-Talk with continuous voice detection using Silero VAD
// Dependencies: @ricky0123/vad-web (loaded via CDN in index.html)
// ============================================================================

class VADManager {
  constructor(websocket) {
    this.websocket = websocket;
    this.myvad = null;
    this.isAISpeaking = false;
    this.isInitialized = false;
    this.speechStartTime = null;
    this.postTTSCooldown = false; // Prevents false positives after TTS ends

    // Callbacks (set by V4Session)
    this.onTranscript = null;
    this.onRecordingStart = null;
    this.onRecordingEnd = null;
    this.onInterruptRequest = null;
    this.onError = null;

    // Configuration (can be overridden from CONFIG)
    this.config = {
      positiveSpeechThreshold: 0.5,
      negativeSpeechThreshold: 0.35,
      preSpeechPadFrames: 10,    // ~300ms pre-roll
      redemptionFrames: 8,       // ~240ms hangover
      minSpeechFrames: 3,        // ~90ms minimum
      interruptMinMs: 200,       // Minimum duration for interrupt during TTS
      postTTSCooldownMs: 100     // Cooldown after TTS ends
    };
  }

  async initialize() {
    // Check if vad library is loaded
    if (typeof vad === 'undefined' || typeof vad.MicVAD === 'undefined') {
      console.error('[VAD] @ricky0123/vad-web library not loaded');
      if (this.onError) this.onError('VAD library not loaded. Please refresh the page.');
      return false;
    }

    try {
      console.log('[VAD] Initializing Silero VAD...');

      // Load config from global CONFIG if available
      if (typeof CONFIG !== 'undefined' && CONFIG.SPEECH_RECOGNITION?.VAD) {
        const vadConfig = CONFIG.SPEECH_RECOGNITION.VAD;
        this.config.positiveSpeechThreshold = vadConfig.POSITIVE_THRESHOLD || this.config.positiveSpeechThreshold;
        this.config.negativeSpeechThreshold = vadConfig.NEGATIVE_THRESHOLD || this.config.negativeSpeechThreshold;
        this.config.preSpeechPadFrames = vadConfig.PRE_SPEECH_FRAMES || this.config.preSpeechPadFrames;
        this.config.redemptionFrames = vadConfig.REDEMPTION_FRAMES || this.config.redemptionFrames;
        this.config.minSpeechFrames = vadConfig.MIN_SPEECH_FRAMES || this.config.minSpeechFrames;
        this.config.interruptMinMs = vadConfig.INTERRUPT_MIN_MS || this.config.interruptMinMs;
      }

      this.myvad = await vad.MicVAD.new({
        // Speech detection thresholds
        positiveSpeechThreshold: this.config.positiveSpeechThreshold,
        negativeSpeechThreshold: this.config.negativeSpeechThreshold,

        // Pre-roll buffer (captures word beginnings)
        preSpeechPadFrames: this.config.preSpeechPadFrames,

        // Hangover (prevents premature cutoff)
        redemptionFrames: this.config.redemptionFrames,

        // Minimum speech duration
        minSpeechFrames: this.config.minSpeechFrames,

        onSpeechStart: () => {
          this.speechStartTime = Date.now();

          // Don't trigger recording UI during TTS or cooldown
          if (!this.isAISpeaking && !this.postTTSCooldown) {
            console.log('[VAD] Speech started');
            if (this.onRecordingStart) this.onRecordingStart();
          }
        },

        onSpeechEnd: async (audio) => {
          const duration = Date.now() - this.speechStartTime;

          // During TTS playback: check for interrupt
          if (this.isAISpeaking) {
            if (duration >= this.config.interruptMinMs) {
              console.log(`[VAD] Interrupt detected (${duration}ms speech during TTS)`);
              if (this.onInterruptRequest) this.onInterruptRequest();
            } else {
              console.log(`[VAD] Ignoring short speech during TTS (${duration}ms, need ${this.config.interruptMinMs}ms)`);
            }
            return;
          }

          // During cooldown: ignore
          if (this.postTTSCooldown) {
            console.log(`[VAD] Ignoring speech during post-TTS cooldown (${duration}ms)`);
            return;
          }

          // Normal mode: send to Whisper
          console.log(`[VAD] Speech ended (${duration}ms)`);
          if (this.onRecordingEnd) this.onRecordingEnd();
          await this.sendAudioToWhisper(audio);
        },

        onVADMisfire: () => {
          console.log('[VAD] Misfire (speech too short)');
          // Reset UI if we showed recording state
          if (!this.isAISpeaking && !this.postTTSCooldown && this.onRecordingEnd) {
            this.onRecordingEnd();
          }
        }
      });

      this.isInitialized = true;
      console.log('[VAD] Initialized successfully');
      console.log(`[VAD] Config: threshold=${this.config.positiveSpeechThreshold}, preroll=${this.config.preSpeechPadFrames}, hangover=${this.config.redemptionFrames}`);
      return true;

    } catch (error) {
      console.error('[VAD] Initialization failed:', error);
      if (this.onError) {
        this.onError('VAD initialization failed: ' + error.message);
      }
      return false;
    }
  }

  async sendAudioToWhisper(float32Audio) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('[VAD] WebSocket not ready, cannot send audio');
      return;
    }

    try {
      const startTime = Date.now();

      // Convert Float32Array to WAV
      const wavBlob = this.float32ToWav(float32Audio, 16000);
      console.log(`[VAD] WAV blob: ${wavBlob.size} bytes`);

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

      console.log(`[VAD] Audio sent to Whisper (${Date.now() - startTime}ms)`);

    } catch (error) {
      console.error('[VAD] Error sending audio:', error);
    }
  }

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
    view.setUint32(16, 16, true);         // fmt chunk size
    view.setUint16(20, 1, true);          // PCM format
    view.setUint16(22, 1, true);          // mono
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true);          // block align
    view.setUint16(34, 16, true);         // bits per sample
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

  start() {
    if (this.myvad) {
      this.myvad.start();
      console.log('[VAD] Started listening (continuous mode)');
    }
  }

  stop() {
    if (this.myvad) {
      this.myvad.pause();
      console.log('[VAD] Stopped listening');
    }
  }

  setAISpeaking(isSpeaking) {
    const wasAISpeaking = this.isAISpeaking;
    this.isAISpeaking = isSpeaking;
    console.log(`[VAD] AI speaking: ${isSpeaking}`);

    if (!isSpeaking && wasAISpeaking) {
      // AI just finished speaking - enable cooldown
      this.postTTSCooldown = true;
      console.log(`[VAD] Post-TTS cooldown started (${this.config.postTTSCooldownMs}ms)`);

      setTimeout(() => {
        this.postTTSCooldown = false;
        console.log('[VAD] Post-TTS cooldown ended, ready for new speech');
      }, this.config.postTTSCooldownMs);
    }
  }

  destroy() {
    if (this.myvad) {
      this.myvad.destroy();
      this.myvad = null;
    }
    this.isInitialized = false;
    console.log('[VAD] Destroyed');
  }

  // Compatibility methods for V4Session interface
  toggleRecording() {
    // VAD is always-on, no toggle needed
    console.log('[VAD] toggleRecording called - VAD is always-on');
    return false;
  }

  startRecording() {
    // VAD is always-on, no manual start needed
    console.log('[VAD] startRecording called - VAD is always-on');
    return false;
  }

  stopRecording() {
    // VAD is always-on, no manual stop needed
    console.log('[VAD] stopRecording called - VAD is always-on');
    return false;
  }
}

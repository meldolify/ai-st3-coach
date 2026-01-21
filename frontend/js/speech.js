// ============================================================================
// SPEECH.JS - Speech Recognition (Silero VAD + Web Speech API Fallback)
// ============================================================================
// Dependencies: config.js, @ricky0123/vad-web (CDN)
// Classes: SpeechRecognitionManager (Web Speech API), SileroVADManager (primary)
// ============================================================================

// ============================================================================
// WEB SPEECH API MANAGER (Fallback for browsers without Silero VAD support)
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
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-GB';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const result = event.results[last];

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
        try {
          this.recognition.start();
        } catch (e) {
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

  setAISpeaking(isSpeaking) {
    // Web Speech API handles this internally
  }
}

// ============================================================================
// SILERO VAD MANAGER - Professional Voice Activity Detection
// Uses @ricky0123/vad-web with Silero VAD deep learning model
// ============================================================================

class SileroVADManager {
  constructor(websocket) {
    this.websocket = websocket;
    this.vad = null;
    this.isInitialized = false;

    // State tracking
    this.aiIsSpeaking = false;
    this.isSpeaking = false;
    this.shouldBeListening = false;
    this.speechStartTime = null;

    // Callbacks (set by V4Session)
    this.onTranscript = null;
    this.onStart = null;
    this.onEnd = null;
    this.onInterruptRequest = null;
  }

  async initialize() {
    if (this.isInitialized) return true;

    // Check if vad library is loaded
    if (typeof vad === 'undefined' || !vad.MicVAD) {
      console.error('[SILERO VAD] vad-web library not loaded');
      return false;
    }

    try {
      console.log('[SILERO VAD] Initializing...');

      this.vad = await vad.MicVAD.new({
        // Speech detection callbacks
        onSpeechStart: () => {
          console.log('[SILERO VAD] Speech started');
          this.isSpeaking = true;
          this.speechStartTime = Date.now();

          // Don't auto-interrupt during AI speech - causes echo false positives
          // The user can manually interrupt if needed
          // Only trigger UI callback
          if (this.onStart && !this.aiIsSpeaking) {
            this.onStart();
          }
        },

        onSpeechEnd: async (audio) => {
          const speechDuration = this.speechStartTime ? Date.now() - this.speechStartTime : 0;
          console.log(`[SILERO VAD] Speech ended, duration: ${speechDuration}ms, samples: ${audio.length}`);
          this.isSpeaking = false;
          this.speechStartTime = null;

          // Only trigger UI callback if not during AI speech
          if (this.onEnd && !this.aiIsSpeaking) {
            this.onEnd();
          }

          // Don't send audio captured during AI speech (contaminated with AI voice)
          if (this.aiIsSpeaking) {
            console.log('[SILERO VAD] Ignoring - captured during AI speech');
            return;
          }

          // Minimum speech duration check (filter out very short noises)
          const minDuration = 200; // 200ms minimum
          if (speechDuration < minDuration) {
            console.log(`[SILERO VAD] Ignoring - too short (${speechDuration}ms < ${minDuration}ms)`);
            return;
          }

          // Convert Float32Array (16kHz) to WAV and send to Whisper
          await this.sendAudioToWhisper(audio);
        },

        // CDN paths for ONNX model files
        onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
        baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/",

        // VAD parameters - tuned for voice agents with echo cancellation
        positiveSpeechThreshold: 0.6,   // Higher threshold to reduce false positives from speakers
        negativeSpeechThreshold: 0.4,   // Threshold to end speech
        redemptionFrames: 10,           // More frames to wait before ending (reduces premature cutoff)
        minSpeechFrames: 5,             // Minimum frames for valid speech (filters short noises)
        preSpeechPadFrames: 2           // Frames to include before speech
      });

      this.isInitialized = true;
      console.log('[SILERO VAD] Initialized successfully');
      return true;

    } catch (error) {
      console.error('[SILERO VAD] Initialization failed:', error);
      return false;
    }
  }

  async sendAudioToWhisper(audioFloat32) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('[SILERO VAD] WebSocket not ready');
      return;
    }

    try {
      const startTime = Date.now();

      // Convert Float32Array (16kHz mono) to WAV blob
      const wavBlob = this.float32ToWav(audioFloat32, 16000);
      console.log(`[SILERO VAD] WAV: ${wavBlob.size} bytes`);

      // Convert to base64
      const base64Audio = await this.blobToBase64(wavBlob);

      // Send to backend
      const sessionId = window.currentSessionId || 'unknown';
      this.websocket.send(JSON.stringify({
        type: 'whisper_audio',
        sessionId: sessionId,
        audio: base64Audio,
        format: 'wav'
      }));

      console.log(`[SILERO VAD] Audio sent to Whisper (${Date.now() - startTime}ms)`);

    } catch (error) {
      console.error('[SILERO VAD] Error sending audio:', error);
    }
  }

  float32ToWav(float32Array, sampleRate) {
    const buffer = new ArrayBuffer(44 + float32Array.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

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

  setAISpeaking(isSpeaking) {
    const wasAISpeaking = this.aiIsSpeaking;
    this.aiIsSpeaking = isSpeaking;
    console.log('[SILERO VAD] AI speaking:', isSpeaking);

    // When AI finishes speaking, any speech detected can now be processed
    if (wasAISpeaking && !isSpeaking) {
      console.log('[SILERO VAD] AI finished - ready to process user speech');
    }
  }

  start() {
    this.shouldBeListening = true;
    if (this.vad && this.isInitialized) {
      this.vad.start();
      console.log('[SILERO VAD] Started listening');
    }
  }

  stop() {
    this.shouldBeListening = false;
    if (this.vad) {
      this.vad.pause();
      console.log('[SILERO VAD] Stopped listening');
    }
  }

  destroy() {
    if (this.vad) {
      this.vad.destroy();
      this.vad = null;
      this.isInitialized = false;
      console.log('[SILERO VAD] Destroyed');
    }
  }
}

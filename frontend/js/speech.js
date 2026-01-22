// ============================================================================
// SPEECH.JS - Speech Recognition (Push-to-Talk + Web Speech API Fallback)
// ============================================================================
// Dependencies: config.js
// Classes: SpeechRecognitionManager (Web Speech API fallback), PushToTalkManager (primary)
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
// PUSH-TO-TALK MANAGER - Simple Click-to-Record Audio Capture
// User clicks to start recording, clicks again to stop and send to Whisper
// ============================================================================

class PushToTalkManager {
  constructor(websocket) {
    this.websocket = websocket;
    this.isInitialized = false;
    this.isRecording = false;

    // MediaRecorder for capturing audio
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;

    // Audio context for processing
    this.audioContext = null;

    // Recording timing for duration validation
    this.recordingStartTime = null;

    // Callbacks (set by V4Session)
    this.onTranscript = null;
    this.onRecordingStart = null;
    this.onRecordingEnd = null;
    this.onError = null; // Error callback for failed operations
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('[PTT] Initializing Push-to-Talk...');

      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      // Reuse existing AudioContext if still valid, or create new one
      if (this.audioContext && this.audioContext.state !== 'closed') {
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      } else {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        });
      }

      this.isInitialized = true;
      console.log('[PTT] Initialized successfully');
      return true;

    } catch (error) {
      console.error('[PTT] Initialization failed:', error);
      if (error.name === 'NotAllowedError') {
        log('Microphone access denied. Please allow microphone access.', 'error');
      } else if (error.name === 'NotFoundError') {
        log('No microphone found. Please connect a microphone.', 'error');
      }
      return false;
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
    return this.isRecording;
  }

  startRecording() {
    if (!this.isInitialized || !this.stream) {
      console.error('[PTT] Not initialized');
      return false;
    }

    if (this.isRecording) {
      console.warn('[PTT] Already recording');
      return false;
    }

    try {
      console.log('[PTT] Starting recording...');

      this.audioChunks = [];
      this.recordingStartTime = Date.now(); // Track recording start time

      // Use webm for MediaRecorder (widely supported)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      // Clean up previous MediaRecorder handlers to prevent memory leaks
      if (this.mediaRecorder) {
        this.mediaRecorder.ondataavailable = null;
        this.mediaRecorder.onstop = null;
        this.mediaRecorder.onerror = null;
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        console.log('[PTT] Recording stopped, processing audio...');
        try {
          await this.processAndSendAudio();
        } catch (error) {
          console.error('[PTT] Processing error:', error);
          if (this.onError) {
            this.onError('Failed to process audio. Please try again.');
          }
        }
      };

      this.mediaRecorder.onerror = (error) => {
        console.error('[PTT] MediaRecorder error:', error);
        this.isRecording = false;
        if (this.onRecordingEnd) this.onRecordingEnd();
        if (this.onError) {
          this.onError('Recording error occurred. Please try again.');
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      console.log('[PTT] Recording started');
      if (this.onRecordingStart) this.onRecordingStart();

      return true;

    } catch (error) {
      console.error('[PTT] Failed to start recording:', error);
      return false;
    }
  }

  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('[PTT] Not recording');
      return false;
    }

    try {
      console.log('[PTT] Stopping recording...');
      this.mediaRecorder.stop();
      this.isRecording = false;

      if (this.onRecordingEnd) this.onRecordingEnd();

      return true;

    } catch (error) {
      console.error('[PTT] Failed to stop recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  async processAndSendAudio() {
    if (this.audioChunks.length === 0) {
      console.warn('[PTT] No audio data to send');
      return;
    }

    // Check recording duration (more reliable than file size)
    const recordingDuration = Date.now() - this.recordingStartTime;
    if (recordingDuration < 300) {
      console.log(`[PTT] Recording too short (${recordingDuration}ms), skipping`);
      return;
    }

    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('[PTT] WebSocket not ready');
      if (this.onError) {
        this.onError('Connection lost. Please reconnect and try again.');
      }
      return;
    }

    try {
      const startTime = Date.now();

      // Create blob from chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      console.log(`[PTT] Audio blob: ${audioBlob.size} bytes (${recordingDuration}ms)`);

      // Convert WebM to WAV for Whisper (requires decoding)
      const wavBlob = await this.convertToWav(audioBlob);
      console.log(`[PTT] WAV: ${wavBlob.size} bytes`);

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

      console.log(`[PTT] Audio sent to Whisper (${Date.now() - startTime}ms)`);

    } catch (error) {
      console.error('[PTT] Error processing audio:', error);
    }
  }

  async convertToWav(webmBlob) {
    // Decode the WebM audio using AudioContext
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // Get audio data (mono, first channel)
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Create WAV file
    return this.float32ToWav(channelData, sampleRate);
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

  // Compatibility methods (for interface consistency with old VAD)
  start() {
    // PTT doesn't auto-start listening - it waits for button press
    console.log('[PTT] Ready - click Record button to speak');
  }

  stop() {
    // Stop any ongoing recording
    if (this.isRecording) {
      this.stopRecording();
    }
  }

  setAISpeaking(isSpeaking) {
    // PTT doesn't need to track AI speaking state
    // (user controls when to record)
  }

  destroy() {
    // Stop recording if active
    if (this.isRecording && this.mediaRecorder) {
      this.mediaRecorder.stop();
    }

    // Release microphone
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.isInitialized = false;
    console.log('[PTT] Destroyed');
  }
}


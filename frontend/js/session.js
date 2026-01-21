// ============================================================================
// SESSION.JS - WebSocket Session and Audio Playback
// ============================================================================
// Dependencies: state.js, config.js, speech.js, ui-helpers.js
// Classes: AudioPlayer, V4Session
// Handles: WebSocket connection, message handling, AI audio playback
// ============================================================================

class AudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.onStart = null;
    this.onEnd = null;
  }

  playBase64Audio(base64Audio) {
    const binaryString = atob(base64Audio);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    this.audio.src = url;
    this.audio.play();
    this.isPlaying = true;
    if (this.onStart) this.onStart();

    this.audio.onended = () => {
      this.isPlaying = false;
      URL.revokeObjectURL(url);
      // Call onEnd immediately to restart mic ASAP
      if (this.onEnd) this.onEnd();
    };

    this.audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      this.isPlaying = false;
      URL.revokeObjectURL(url);
      log('Audio playback error', 'error');
    };
  }

  interrupt() {
    if (this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
}

// ============================================================================
// V4 SESSION MANAGER
// ============================================================================

class V4Session {
  constructor(backendUrl, promptFile, difficulty) {
    this.ws = null;
    this.sessionId = null;

    // Hybrid STT: Silero VAD PRIMARY, WhisperRecognitionManager/Web Speech API FALLBACK
    // Silero VAD uses deep learning for reliable voice detection
    const useSileroVAD = CONFIG.SPEECH_RECOGNITION?.USE_SILERO_VAD ?? true;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (useSileroVAD && typeof vad !== 'undefined' && vad.MicVAD) {
      // Use Silero VAD as primary (recommended)
      this.speechRecognition = new SileroVADManager(null); // WebSocket set after connection
      this.usingWhisper = true; // Still sends to Whisper for transcription
      this.usingSileroVAD = true;
      this.fallbackAvailable = true;
      log('Using Silero VAD for STT (primary)', 'success');
    } else if (CONFIG.SPEECH_RECOGNITION?.WHISPER_PRIMARY ?? true) {
      // Fallback to WhisperRecognitionManager if Silero not available
      this.speechRecognition = new WhisperRecognitionManager(null);
      this.usingWhisper = true;
      this.usingSileroVAD = false;
      this.fallbackAvailable = !!SpeechRecognition;
      log('Using Whisper VAD for STT (Silero not available)', 'warning');
    } else {
      // Legacy mode: Web Speech API primary
      if (SpeechRecognition) {
        this.speechRecognition = new SpeechRecognitionManager();
        this.usingWhisper = false;
        this.usingSileroVAD = false;
        this.fallbackAvailable = true;
        log('Using Web Speech API for STT (legacy mode)', 'success');
      } else {
        this.speechRecognition = new WhisperRecognitionManager(null);
        this.usingWhisper = true;
        this.usingSileroVAD = false;
        this.fallbackAvailable = false;
        log('Using Whisper API for STT (no Web Speech support)', 'success');
      }
    }

    this.audioPlayer = new AudioPlayer();
    this.backendUrl = backendUrl;
    this.promptFile = promptFile;
    this.difficulty = difficulty || null;
    this.isConnected = false;
    this.inFeedbackMode = false; // Track if we're in feedback mode

    // Voice mapping for each difficulty level using Chirp 3 HD voices
    this.voiceMap = {
      'easy': 'en-GB-Chirp3-HD-Fenrir',      // John: Male voice
      'medium': 'en-GB-Chirp3-HD-Kore',      // Elliot: Female voice
      'strict': 'en-GB-Chirp3-HD-Charon'     // Perry: Male voice
    };
    this.voice = this.voiceMap[difficulty] || 'en-GB-Chirp3-HD-Fenrir';
  }

  async connect() {
    return new Promise((resolve, reject) => {
      let wsUrl = this.backendUrl + '?scenario=' + this.promptFile;
      if (this.difficulty) {
        wsUrl += '&difficulty=' + this.difficulty;
      }
      if (this.voice) {
        wsUrl += '&voice=' + this.voice;
      }
      log('Connecting to ' + wsUrl + '...', 'info');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;

        // If using Whisper, set the WebSocket reference
        if (this.usingWhisper) {
          this.speechRecognition.websocket = this.ws;
        }

        updateStatus('connectionStatus', 'Connected', 'connected');
        log('Connected to backend', 'success');
        resolve();
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        this.handleMessage(msg);
      };

      this.ws.onerror = (error) => {
        log('WebSocket error', 'error');
        this.isConnected = false;
        reject(error);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        updateStatus('connectionStatus', 'Disconnected', 'disconnected');
        log('WebSocket closed', 'warning');
      };
    });
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'scenario_loaded':
        this.sessionId = msg.sessionId;
        updateStatus('sessionStatus', 'Ready', 'connected');
        setOrbState('idle');
        log('Scenario loaded: ' + msg.scenario, 'success');
        break;

      case 'ai_response':
        log('AI: ' + msg.text, 'info');
        this.audioPlayer.playBase64Audio(msg.audio);
        // Show interrupt button and set speaking state
        document.getElementById('interruptBtn').style.display = 'block';
        document.getElementById('interruptBtn').disabled = false;
        syncMobileButtonStates(); // Sync mobile buttons
        updateStatus('aiStatus', 'Speaking', 'speaking'); // Hide bubble when speaking
        setOrbState('speaking');
        break;

      case 'whisper_transcript':
        // Handle Whisper API transcript (same as Web Speech API onTranscript)
        console.log('[WHISPER TIMING] Transcript received from backend');
        if (this.speechRecognition.onTranscript && msg.text) {
          this.speechRecognition.onTranscript(msg.text);
        }
        break;

      case 'feedback_processing':
        // Show random processing message during feedback transitions
        this.inFeedbackMode = true; // Set feedback mode flag
        updateStatus('micStatus', 'Paused', 'active');
        updateStatus('aiStatus', getRandomProcessingMessage(), 'processing');
        setOrbState('thinking');
        break;

      case 'interrupt':
        this.audioPlayer.interrupt();
        document.getElementById('interruptBtn').style.display = 'none';
        syncMobileButtonStates(); // Sync mobile buttons
        setOrbState('listening');
        break;

      case 'error':
        log('Error: ' + msg.message, 'error');
        setOrbState('idle');
        break;
    }
  }

  async startListening() {
    // Set up callbacks before initialization
    this.speechRecognition.onTranscript = (text) => {
      log('You: ' + text, 'info');

      if (this.isConnected && this.sessionId) {
        this.ws.send(JSON.stringify({
          type: 'user_transcript',
          sessionId: this.sessionId,
          text: text
        }));
        updateStatus('micStatus', 'Paused', 'active');
        updateStatus('aiStatus', getRandomProcessingMessage(), 'processing');
        setOrbState('thinking'); // Show thinking animation while AI processes
      }
    };

    this.speechRecognition.onStart = () => {
      updateStatus('micStatus', 'Listening', 'connected');
      updateStatus('aiStatus', 'Listening', 'connected'); // Hide bubble when listening
      setOrbState('listening'); // Show listening animation when mic starts
    };

    this.speechRecognition.onEnd = () => {
      if (this.speechRecognition.shouldBeListening) {
        updateStatus('micStatus', 'Restarting', 'processing');
      }
    };

    // Set up voice-triggered interrupt callback (Whisper only)
    if (this.usingWhisper && this.speechRecognition.onInterruptRequest !== undefined) {
      this.speechRecognition.onInterruptRequest = () => {
        log('Voice-triggered interrupt', 'info');
        this.audioPlayer.interrupt();
        // Notify backend of interrupt
        if (this.isConnected && this.sessionId) {
          this.ws.send(JSON.stringify({
            type: 'user_speaking',
            sessionId: this.sessionId
          }));
        }
        // Hide interrupt button since we've already interrupted
        document.getElementById('interruptBtn').style.display = 'none';
        syncMobileButtonStates();
        setOrbState('listening');
      };
    }

    this.audioPlayer.onStart = () => {
      // For Whisper: use continuous listening - just set AI speaking flag
      // For Web Speech API: must stop mic to prevent browser issues
      if (this.usingWhisper && this.speechRecognition.setAISpeaking) {
        this.speechRecognition.setAISpeaking(true);
        updateStatus('micStatus', 'Listening (AI speaking)', 'active');
      } else {
        // Web Speech API - stop mic to prevent feedback
        this.speechRecognition.stop();
        updateStatus('micStatus', 'Paused', 'active');
      }
      updateStatus('aiStatus', 'Speaking', 'speaking'); // Hide bubble when speaking
      // Orb state already set to 'speaking' in handleMessage
    };

    this.audioPlayer.onEnd = () => {
      // Hide interrupt button
      document.getElementById('interruptBtn').style.display = 'none';
      syncMobileButtonStates(); // Sync mobile buttons

      // For Whisper: clear AI speaking flag
      if (this.usingWhisper && this.speechRecognition.setAISpeaking) {
        this.speechRecognition.setAISpeaking(false);
      }

      // Send WebSocket message to notify backend
      if (this.isConnected && this.sessionId) {
        this.ws.send(JSON.stringify({
          type: 'ai_finished',
          sessionId: this.sessionId
        }));
      }

      // Wait to see if we're in feedback mode
      setTimeout(() => {
        // Only restart mic if NOT in feedback mode (for Web Speech API)
        // Whisper is already running continuously
        if (!this.inFeedbackMode && !this.audioPlayer.isPlaying) {
          if (!this.usingWhisper) {
            this.speechRecognition.start();
          }
          updateStatus('micStatus', '🎤 Listening', 'connected');
        } else {
          // Reset feedback mode flag after processing
          this.inFeedbackMode = false;
        }
      }, 500); // Reduced delay since Whisper handles continuous listening
    };

    // Initialize (async for Whisper, sync for Web Speech API)
    // With auto-fallback if primary fails
    try {
      await this.speechRecognition.initialize();
      this.speechRecognition.start();
    } catch (error) {
      log('Speech recognition initialization failed: ' + error.message, 'error');

      // Attempt fallback if Whisper failed and fallback is available
      if (this.usingWhisper && this.fallbackAvailable) {
        log('Attempting Web Speech API fallback...', 'warning');
        const fallbackSuccess = await this.switchToFallback();
        if (!fallbackSuccess) {
          throw new Error('Both Whisper and Web Speech API failed to initialize');
        }
      } else {
        throw error;
      }
    }
  }

  // Fallback to Web Speech API if Whisper fails
  async switchToFallback() {
    if (!this.fallbackAvailable || !this.usingWhisper) {
      log('No fallback available', 'warning');
      return false;
    }

    try {
      log('Switching to Web Speech API fallback...', 'warning');

      // Stop current Whisper recognition
      this.speechRecognition.stop();

      // Create Web Speech API manager
      this.speechRecognition = new SpeechRecognitionManager();
      this.usingWhisper = false;

      // Re-attach callbacks
      this.speechRecognition.onTranscript = (text) => {
        log('You: ' + text, 'info');
        if (this.isConnected && this.sessionId) {
          this.ws.send(JSON.stringify({
            type: 'user_transcript',
            sessionId: this.sessionId,
            text: text
          }));
          updateStatus('micStatus', 'Paused', 'active');
          updateStatus('aiStatus', getRandomProcessingMessage(), 'processing');
          setOrbState('thinking');
        }
      };

      this.speechRecognition.onStart = () => {
        updateStatus('micStatus', '🎤 Listening (Fallback)', 'connected');
        setOrbState('listening');
      };

      this.speechRecognition.onEnd = () => {
        if (this.speechRecognition.shouldBeListening) {
          updateStatus('micStatus', 'Restarting', 'processing');
        }
      };

      // Initialize and start
      this.speechRecognition.initialize();
      this.speechRecognition.start();

      log('Switched to Web Speech API fallback', 'success');
      return true;
    } catch (error) {
      log('Fallback failed: ' + error.message, 'error');
      return false;
    }
  }

  disconnect() {
    this.speechRecognition.stop();
    this.audioPlayer.interrupt();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.sessionId = null;
    setOrbState('idle'); // Reset orb to idle when disconnected
  }
}


// ============================================================================
// SESSION.JS - WebSocket Session and Audio Playback
// ============================================================================
// Dependencies: state.js, config.js, speech.js, vad/VADManager.js, ui-helpers.js
// Classes: AudioPlayer, V4Session
// Handles: WebSocket connection, message handling, AI audio playback
// ============================================================================

class AudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.onStart = null;
    this.onEnd = null;
    this.playbackTimeout = null; // Safety timeout for stuck playback
    this.useVisualizer = false; // Whether to use orb visualizer
    this.visualizerInitialized = false;
  }

  /**
   * Initialize orb visualizer for audio-reactive waveform
   * Must be called after a user gesture (click/tap)
   */
  async initVisualizer() {
    if (this.visualizerInitialized) return true;

    try {
      if (window.orbVisualizer) {
        await window.orbVisualizer.init();
        this.useVisualizer = true;
        this.visualizerInitialized = true;
        console.log('[AudioPlayer] Orb visualizer initialized');
        return true;
      }
    } catch (error) {
      console.warn('[AudioPlayer] Orb visualizer init failed, using fallback:', error);
    }
    return false;
  }

  playBase64Audio(base64Audio) {
    // Use orb visualizer if available and initialized
    if (this.useVisualizer && window.orbVisualizer) {
      this.isPlaying = true;
      if (this.onStart) this.onStart();

      // Connect visualizer callbacks
      window.orbVisualizer.onStart = null; // Already called above
      window.orbVisualizer.onEnd = () => {
        this.isPlaying = false;
        if (this.onEnd) this.onEnd();
      };

      // Play with visualization
      window.orbVisualizer.playWithVisualization(base64Audio);
      return;
    }

    // Fallback: standard Audio element playback
    const binaryString = atob(base64Audio);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    // Clear any existing timeout
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }

    this.audio.src = url;
    this.audio.play();
    this.isPlaying = true;
    if (this.onStart) this.onStart();

    // Safety timeout: estimate duration from byte size (rough MP3 estimate ~4KB/sec)
    // Add generous buffer (10 seconds) to avoid premature cutoff
    const estimatedDurationMs = (bytes.length / 4000) * 1000;
    this.playbackTimeout = setTimeout(() => {
      if (this.isPlaying) {
        console.warn('[AUDIO] Playback timeout - forcing end state');
        this.isPlaying = false;
        URL.revokeObjectURL(url);
        if (this.onEnd) this.onEnd();
      }
    }, estimatedDurationMs + 10000);

    this.audio.onended = () => {
      // Clear safety timeout
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }
      this.isPlaying = false;
      URL.revokeObjectURL(url);
      // Call onEnd immediately to restart mic ASAP
      if (this.onEnd) this.onEnd();
    };

    this.audio.onerror = (e) => {
      // Clear safety timeout
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }
      console.error('Audio playback error:', e);
      this.isPlaying = false;
      URL.revokeObjectURL(url);
      log('Audio playback error', 'error');
      if (this.onEnd) this.onEnd();
    };
  }

  interrupt() {
    // Interrupt visualizer if in use
    if (this.useVisualizer && window.orbVisualizer) {
      window.orbVisualizer.interrupt();
    }

    if (this.isPlaying) {
      // Clear safety timeout
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }
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

    // STT: Auto-detect best mode based on browser capabilities
    // 1. Silero VAD (Chrome/Edge/Firefox with WASM) - best accuracy
    // 2. SimpleVAD (Safari/iOS) - volume-based fallback
    // 3. Push-to-Talk (last resort)
    this._initializeSpeechRecognition();

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

  /**
   * Initialize speech recognition based on browser capabilities
   * Automatically selects the best available method
   */
  _initializeSpeechRecognition() {
    // Use BrowserDetect to determine best VAD method
    const browserInfo = window.BrowserDetect ? window.BrowserDetect.detect() : null;
    const recommendedVAD = browserInfo?.vad?.recommended;

    console.log('[V4Session] Browser detection:', browserInfo?.browser?.name, '- Recommended VAD:', recommendedVAD);

    // Try Silero VAD first (best accuracy)
    if (recommendedVAD === 'silero' && CONFIG.SPEECH_RECOGNITION.USE_VAD && typeof VADManager !== 'undefined') {
      this.speechRecognition = new VADManager(null);
      this.usingWhisper = true;
      this.usingVAD = true;
      this.usingSimpleVAD = false;
      this.usingPTT = false;
      log('Using Silero VAD for continuous voice input', 'success');
      return;
    }

    // Try SimpleVAD (Safari/iOS fallback)
    if ((recommendedVAD === 'simple' || !recommendedVAD) && typeof SimpleVAD !== 'undefined') {
      this.speechRecognition = new SimpleVAD(null);
      this.usingWhisper = true;
      this.usingVAD = false;
      this.usingSimpleVAD = true;
      this.usingPTT = false;
      log('Using SimpleVAD for voice input (Safari/iOS mode)', 'success');
      return;
    }

    // Fallback to PTT if neither VAD is available
    if (typeof PushToTalkManager !== 'undefined') {
      this.speechRecognition = new PushToTalkManager(null);
      this.usingWhisper = true;
      this.usingVAD = false;
      this.usingSimpleVAD = false;
      this.usingPTT = true;
      log('Using Push-to-Talk for voice input', 'warning');
      return;
    }

    // Last resort: no speech recognition available
    console.error('[V4Session] No speech recognition method available');
    this.speechRecognition = null;
    this.usingWhisper = false;
    this.usingVAD = false;
    this.usingSimpleVAD = false;
    this.usingPTT = false;
  }

  async connect() {
    // Initialize orb visualizer (requires user gesture - we're in a click handler)
    await this.audioPlayer.initVisualizer();

    // Build WebSocket URL with auth params for server-side validation
    let wsUrl = this.backendUrl + '?scenario=' + this.promptFile;
    if (this.difficulty) {
      wsUrl += '&difficulty=' + this.difficulty;
    }
    if (this.voice) {
      wsUrl += '&voice=' + this.voice;
    }

    // Add userId and auth token for server-side tier validation
    if (window.currentUser?.id) {
      wsUrl += '&userId=' + encodeURIComponent(window.currentUser.id);
    }

    // Get auth token from Supabase session
    if (window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient.auth.getSession();
        const token = data?.session?.access_token;
        if (token) {
          wsUrl += '&token=' + encodeURIComponent(token);
        }
      } catch (err) {
        console.warn('[Session] Could not get auth token:', err);
      }
    }

    return new Promise((resolve, reject) => {
      log('Connecting to ' + wsUrl.replace(/token=[^&]+/, 'token=***') + '...', 'info');
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
        // Store session ID globally for SileroVADManager
        window.currentSessionId = msg.sessionId;
        updateStatus('sessionStatus', 'Ready', 'connected');
        setOrbState('idle');
        log('Scenario loaded: ' + msg.scenario, 'success');
        break;

      case 'ai_response':
        // Set AI speaking state IMMEDIATELY when response arrives (before audio decode)
        // This eliminates the 100-200ms timing gap that caused incorrect contamination
        if ((this.usingVAD || this.usingSimpleVAD) && this.speechRecognition?.setAISpeaking) {
          this.speechRecognition.setAISpeaking(true);
        }
        log('AI: ' + msg.text, 'info');
        // Add AI message to transcript
        if (window.transcript) {
          window.transcript.addAIMessage(msg.text);
        }
        this.audioPlayer.playBase64Audio(msg.audio);
        // Show interrupt button with active styling
        const interruptBtn = document.getElementById('interruptBtn');
        if (interruptBtn) {
          interruptBtn.style.display = 'inline-block';
          interruptBtn.disabled = false;
          interruptBtn.classList.add('active');
        }
        const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
        if (mobileInterruptBtn) {
          mobileInterruptBtn.classList.add('active');
        }
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
        // Hide interrupt button and remove active styling
        const interruptBtnOnInterrupt = document.getElementById('interruptBtn');
        if (interruptBtnOnInterrupt) {
          interruptBtnOnInterrupt.style.display = 'none';
          interruptBtnOnInterrupt.disabled = true;
          interruptBtnOnInterrupt.classList.remove('active');
        }
        const mobileInterruptBtnOnInterrupt = document.getElementById('mobileInterruptBtn');
        if (mobileInterruptBtnOnInterrupt) {
          mobileInterruptBtnOnInterrupt.classList.remove('active');
        }
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
      // Add user message to transcript
      if (window.transcript) {
        window.transcript.addUserMessage(text);
      }

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

    // Set up PTT recording callbacks (centralized UI state management)
    this.speechRecognition.onRecordingStart = () => {
      updateStatus('micStatus', 'Recording', 'connected');
      setOrbState('listening');
    };

    this.speechRecognition.onRecordingEnd = () => {
      updateStatus('micStatus', 'Processing...', 'processing');
      setOrbState('processing');
    };

    // Set up error callback for PTT failures
    this.speechRecognition.onError = (message) => {
      log(message, 'error');
      setOrbState('idle');
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
        syncMobileButtonStates();
        setOrbState('listening');
      };
    }

    this.audioPlayer.onStart = () => {
      // For VAD/SimpleVAD: use continuous listening - just set AI speaking flag
      // For Web Speech API: must stop mic to prevent browser issues
      if ((this.usingVAD || this.usingSimpleVAD) && this.speechRecognition?.setAISpeaking) {
        this.speechRecognition.setAISpeaking(true);
        updateStatus('micStatus', 'Listening (AI speaking)', 'active');
      } else if (this.speechRecognition) {
        // Web Speech API or PTT - stop mic to prevent feedback
        this.speechRecognition.stop();
        updateStatus('micStatus', 'Paused', 'active');
      }
      updateStatus('aiStatus', 'Speaking', 'speaking'); // Hide bubble when speaking
      // Orb state already set to 'speaking' in handleMessage
    };

    this.audioPlayer.onEnd = () => {
      // Hide interrupt button and remove active styling
      const interruptBtnOnEnd = document.getElementById('interruptBtn');
      if (interruptBtnOnEnd) {
        interruptBtnOnEnd.style.display = 'none';
        interruptBtnOnEnd.disabled = true;
        interruptBtnOnEnd.classList.remove('active');
      }
      const mobileInterruptBtnOnEnd = document.getElementById('mobileInterruptBtn');
      if (mobileInterruptBtnOnEnd) {
        mobileInterruptBtnOnEnd.classList.remove('active');
      }
      syncMobileButtonStates(); // Sync mobile buttons

      // For VAD/SimpleVAD: clear AI speaking flag
      if ((this.usingVAD || this.usingSimpleVAD) && this.speechRecognition?.setAISpeaking) {
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
        // Only restart mic if NOT in feedback mode
        // VAD/SimpleVAD handle continuous listening internally
        if (!this.inFeedbackMode && !this.audioPlayer.isPlaying) {
          if (!this.usingVAD && !this.usingSimpleVAD && this.speechRecognition) {
            // Web Speech API or PTT needs manual restart
            this.speechRecognition.start();
          }
          updateStatus('micStatus', '🎤 Listening', 'connected');
        } else {
          // Reset feedback mode flag after processing
          this.inFeedbackMode = false;
        }
      }, 500); // Reduced delay since VAD/SimpleVAD handle continuous listening
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
    window.currentSessionId = null; // Clear global session ID
    setOrbState('idle'); // Reset orb to idle when disconnected
  }

  /**
   * Request feedback summary from AI before disconnecting
   * Returns a promise that resolves with feedback data or null on timeout
   */
  async requestFeedbackAndDisconnect() {
    if (!this.isConnected || !this.ws) {
      console.warn('[V4Session] Cannot request feedback - not connected');
      return null;
    }

    return new Promise((resolve) => {
      let timeoutId;

      // Set up one-time handler for feedback_summary
      const feedbackHandler = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'feedback_summary') {
            console.log('[V4Session] Received feedback summary');
            clearTimeout(timeoutId);
            this.ws.removeEventListener('message', feedbackHandler);
            this.disconnect();
            resolve(msg.feedback);
          }
        } catch (e) {
          console.error('[V4Session] Error parsing feedback message:', e);
        }
      };

      this.ws.addEventListener('message', feedbackHandler);

      // Send feedback request
      console.log('[V4Session] Requesting feedback summary...');
      this.ws.send(JSON.stringify({
        type: 'request_feedback',
        sessionId: this.sessionId
      }));

      // Timeout after 20 seconds
      timeoutId = setTimeout(() => {
        console.warn('[V4Session] Feedback request timed out');
        this.ws.removeEventListener('message', feedbackHandler);
        this.disconnect();
        resolve(null);
      }, 20000);
    });
  }
}


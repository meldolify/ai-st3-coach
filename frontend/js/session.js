// ============================================================================
// SESSION.JS - WebSocket Session and Audio Playback
// ============================================================================
// Dependencies: state.js, config.js, audio-streamer.js, ui-helpers.js
// Classes: AudioPlayer, V4Session
// Handles: WebSocket connection, message handling, AI audio playback
// Audio capture & VAD are handled server-side — browser just streams PCM.
// ============================================================================

class AudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.onStart = null;
    this.onEnd = null;
    this.playbackTimeout = null;
    this.useVisualizer = false;
    this.visualizerInitialized = false;

    // Audio queue for streamed sentence chunks
    this._queue = [];
    this._isPlayingChunk = false;
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

  /**
   * Queue a base64 audio chunk for sequential playback.
   * Starts playback immediately if nothing is currently playing.
   */
  queueBase64Audio(base64Audio) {
    this._queue.push(base64Audio);
    if (!this._isPlayingChunk) {
      this._playNextInQueue();
    }
  }

  /**
   * Play the next chunk in the queue. When queue empties, fire onEnd.
   */
  _playNextInQueue() {
    if (this._queue.length === 0) {
      this._isPlayingChunk = false;
      this.isPlaying = false;
      // Tell the orb visualizer it can go idle (no more chunks coming)
      if (this.useVisualizer && window.orbVisualizer) {
        window.orbVisualizer.suppressIdleOnEnd = false;
      }
      if (this.onEnd) this.onEnd();
      return;
    }

    this._isPlayingChunk = true;
    this.isPlaying = true;
    const base64Audio = this._queue.shift();
    const hasMore = this._queue.length > 0;

    // Suppress idle shimmer between chunks so orb doesn't flicker
    if (this.useVisualizer && window.orbVisualizer) {
      window.orbVisualizer.suppressIdleOnEnd = hasMore || true;
      // We always suppress between chunks; _playNextInQueue sets false when queue empties
    }

    this._playSingleChunk(base64Audio, () => {
      this._playNextInQueue();
    });
  }

  /**
   * Play a single audio chunk and call the callback when done.
   */
  _playSingleChunk(base64Audio, callback) {
    if (this.useVisualizer && window.orbVisualizer) {
      window.orbVisualizer.onEnd = () => {
        callback();
      };
      window.orbVisualizer.playWithVisualization(base64Audio);
      return;
    }

    // Fallback: standard Audio element
    const binaryString = atob(base64Audio);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }

    this.audio.src = url;
    this.audio.play();

    const estimatedDurationMs = (bytes.length / 4000) * 1000;
    this.playbackTimeout = setTimeout(() => {
      console.warn('[AUDIO] Chunk playback timeout');
      URL.revokeObjectURL(url);
      callback();
    }, estimatedDurationMs + 10000);

    this.audio.onended = () => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }
      URL.revokeObjectURL(url);
      callback();
    };

    this.audio.onerror = (e) => {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }
      console.error('Audio chunk playback error:', e);
      URL.revokeObjectURL(url);
      callback();
    };
  }

  /**
   * Play a single base64 audio (non-queued, for legacy ai_response and feedback).
   */
  playBase64Audio(base64Audio) {
    // Use orb visualizer if available and initialized
    if (this.useVisualizer && window.orbVisualizer) {
      this.isPlaying = true;
      if (this.onStart) this.onStart();

      window.orbVisualizer.suppressIdleOnEnd = false;
      window.orbVisualizer.onEnd = () => {
        this.isPlaying = false;
        if (this.onEnd) this.onEnd();
      };

      window.orbVisualizer.playWithVisualization(base64Audio);
      return;
    }

    // Fallback: standard Audio element playback
    const binaryString = atob(base64Audio);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }

    this.audio.src = url;
    this.audio.play();
    this.isPlaying = true;
    if (this.onStart) this.onStart();

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
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }
      this.isPlaying = false;
      URL.revokeObjectURL(url);
      if (this.onEnd) this.onEnd();
    };

    this.audio.onerror = (e) => {
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

  /**
   * Interrupt all playback — clears queue + stops current chunk.
   */
  interrupt() {
    // Clear the queue
    this._queue = [];
    this._isPlayingChunk = false;

    // Interrupt visualizer if in use
    if (this.useVisualizer && window.orbVisualizer) {
      window.orbVisualizer.suppressIdleOnEnd = false;
      window.orbVisualizer.interrupt();
    }

    if (this.isPlaying) {
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

    // Server-side VAD — browser only streams raw audio
    this.audioStreamer = new AudioStreamer();

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

    console.log('[V4Session] Using server-side VAD (audio streaming)');
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

        // Set the WebSocket reference for audio streaming
        this.audioStreamer.websocket = this.ws;

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
        window.currentSessionId = msg.sessionId;
        updateStatus('sessionStatus', 'Ready', 'connected');
        // Note: don't set orb to idle here — startListening() already manages orb state
        // and scenario_loaded arrives ~500ms later (after server VAD model load),
        // which would overwrite the 'listening' state
        log('Scenario loaded: ' + msg.scenario, 'success');
        break;

      case 'ai_response': {
        // Legacy single-response (used by feedback mode)
        this.audioStreamer.setAISpeaking(true);
        const aiRoundTrip = this._speechStartAt ? Math.round(performance.now() - this._speechStartAt) : '?';
        console.log(`[TIMING] AI response received, round-trip from speech start: ${aiRoundTrip}ms`);
        log('AI: ' + msg.text, 'info');
        if (window.transcript) {
          window.transcript.addAIMessage(msg.text);
        }
        this.audioPlayer.playBase64Audio(msg.audio);
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
        syncMobileButtonStates();
        updateStatus('aiStatus', 'Speaking', 'speaking');
        setOrbState('speaking');
        break;
      }

      case 'ai_response_start': {
        // Streaming response begins — pause mic, show interrupt, set orb
        this.audioStreamer.setAISpeaking(true);
        this._streamedFullText = '';
        const startInterruptBtn = document.getElementById('interruptBtn');
        if (startInterruptBtn) {
          startInterruptBtn.style.display = 'inline-block';
          startInterruptBtn.disabled = false;
          startInterruptBtn.classList.add('active');
        }
        const startMobileBtn = document.getElementById('mobileInterruptBtn');
        if (startMobileBtn) {
          startMobileBtn.classList.add('active');
        }
        syncMobileButtonStates();
        updateStatus('aiStatus', 'Speaking', 'speaking');
        setOrbState('speaking');
        break;
      }

      case 'ai_response_chunk': {
        // One sentence + its TTS audio — queue for sequential playback
        const chunkRoundTrip = this._speechStartAt ? Math.round(performance.now() - this._speechStartAt) : '?';
        if (msg.chunkIndex === 0) {
          console.log(`[TIMING] First audio chunk, round-trip from speech start: ${chunkRoundTrip}ms`);
          if (this.audioPlayer.onStart) this.audioPlayer.onStart();
        }
        this._streamedFullText = (this._streamedFullText || '') + ' ' + msg.text;
        log('AI: ' + msg.text, 'info');
        this.audioPlayer.queueBase64Audio(msg.audio);
        break;
      }

      case 'ai_response_end': {
        // Streaming done — add full text to transcript
        const fullText = msg.fullText || (this._streamedFullText || '').trim();
        if (window.transcript && fullText) {
          window.transcript.addAIMessage(fullText);
        }
        console.log(`[TIMING] Streaming response complete`);
        break;
      }

      case 'user_transcript_display':
        // Server transcribed user's speech via Whisper — display it
        this._transcriptReceivedAt = performance.now();
        console.log(`[TIMING] Transcript received (${msg.text.length} chars)`);
        log('You: ' + msg.text, 'info');
        if (window.transcript) {
          window.transcript.addUserMessage(msg.text);
        }
        updateStatus('aiStatus', getRandomProcessingMessage(), 'processing');
        setOrbState('thinking');
        break;

      case 'vad_speech_start':
        // Server detected speech start — update UI
        this._speechStartAt = performance.now();
        console.log('[TIMING] Server VAD: speech start');
        updateStatus('micStatus', 'Recording', 'connected');
        setOrbState('listening');
        break;

      case 'whisper_transcript':
        // Legacy: Handle Whisper API transcript from old client-side VAD flow
        console.log('[WHISPER] Transcript received from backend:', msg.text);
        break;

      case 'feedback_processing':
        this.inFeedbackMode = true;
        updateStatus('micStatus', 'Paused', 'active');
        updateStatus('aiStatus', getRandomProcessingMessage(), 'processing');
        setOrbState('thinking');
        break;

      case 'feedback_response':
        this.inFeedbackMode = true;
        this.audioStreamer.setAISpeaking(true);
        log('Feedback (' + msg.section + '/' + msg.totalSections + '): ' + msg.text, 'info');
        if (window.transcript) {
          window.transcript.addAIMessage('Feedback: ' + msg.text);
        }
        this.audioPlayer.playBase64Audio(msg.audio);
        updateStatus('aiStatus', 'Feedback (' + msg.section + '/' + msg.totalSections + ')', 'speaking');
        setOrbState('speaking');
        break;

      case 'interrupt':
        this.audioPlayer.interrupt();
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
        syncMobileButtonStates();
        setOrbState('listening');
        break;

      case 'error':
        log('Error: ' + msg.message, 'error');
        setOrbState('idle');
        break;
    }
  }

  async startListening() {
    // Set up audio playback callbacks
    this.audioPlayer.onStart = () => {
      updateStatus('micStatus', 'Paused (AI speaking)', 'active');
      updateStatus('aiStatus', 'Speaking', 'speaking');
    };

    this.audioPlayer.onEnd = () => {
      // Hide interrupt button
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
      syncMobileButtonStates();

      // Resume audio streaming
      this.audioStreamer.setAISpeaking(false);

      // Notify backend AI finished speaking
      if (this.isConnected && this.sessionId) {
        this.ws.send(JSON.stringify({
          type: 'ai_finished',
          sessionId: this.sessionId
        }));
      }

      // Update status after short delay (wait for feedback mode check)
      setTimeout(() => {
        if (!this.inFeedbackMode && !this.audioPlayer.isPlaying) {
          updateStatus('micStatus', 'Listening', 'connected');
          setOrbState('listening');
        }
      }, 500);
    };

    // Initialize and start audio streaming to server
    try {
      await this.audioStreamer.initialize();
      this.audioStreamer.start();
      log('Audio streaming active', 'success');
      updateStatus('micStatus', 'Listening', 'connected');
      setOrbState('listening');
    } catch (error) {
      log('Microphone access failed: ' + error.message, 'error');
      throw error;
    }
  }

  disconnect() {
    this.audioStreamer.destroy();
    this.audioPlayer.interrupt();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.sessionId = null;
    window.currentSessionId = null;
    setOrbState('idle');
  }

  /**
   * Request feedback from AI before disconnecting.
   * The server delivers 6 spoken feedback sections (feedback_response) then a final JSON summary (feedback_summary).
   * Returns a promise that resolves with feedback data or null on timeout.
   */
  async requestFeedbackAndDisconnect() {
    if (!this.isConnected || !this.ws) {
      console.warn('[V4Session] Cannot request feedback - not connected');
      return null;
    }

    return new Promise((resolve) => {
      let timeoutId;

      const feedbackHandler = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'feedback_summary') {
            console.log('[V4Session] Received feedback summary (final)');
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
      console.log('[V4Session] Requesting feedback (hybrid flow)...');
      this.ws.send(JSON.stringify({
        type: 'request_feedback',
        sessionId: this.sessionId
      }));

      // Timeout after 90 seconds (6 sections x ~10s each + JSON generation)
      timeoutId = setTimeout(() => {
        console.warn('[V4Session] Feedback request timed out');
        this.ws.removeEventListener('message', feedbackHandler);
        this.disconnect();
        resolve(null);
      }, 90000);
    });
  }
}

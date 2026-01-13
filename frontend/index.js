// ST3 PLASTIC SURGERY INTERVIEW TRAINER - V4
// Architecture: Web Speech API + GPT-4o-mini + Google Cloud TTS

let session = null;
let currentScenario = { category: '', title: '', promptFile: 'template.txt', imageFile: null };

// ============================================================================
// SPEECH RECOGNITION MANAGER (Web Speech API)
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

    // VAD Configuration - tuned to reduce false positives
    this.silenceThreshold = 0.025; // Raised from 0.01 to reduce noise triggers
    this.silenceDuration = 1500; // Stop recording after 1.5s of silence
    this.minRecordingDuration = 500; // Minimum recording length in ms
    this.minAverageRMS = 0.02; // Minimum average energy to consider valid speech

    // Continuous listening - track AI state but keep mic open
    this.aiIsSpeaking = false;
    this.recordingContaminated = false; // True if AI spoke during recording

    // Energy tracking for audio validation
    this.rmsReadings = [];
  }

  // Called externally to update AI speaking state (for continuous listening)
  setAISpeaking(isSpeaking) {
    const wasAISpeaking = this.aiIsSpeaking;
    this.aiIsSpeaking = isSpeaking;
    console.log(`[WHISPER] AI speaking state changed: ${isSpeaking}`);

    // If AI just started speaking while we're recording, mark as contaminated
    if (isSpeaking && this.isRecording && !wasAISpeaking) {
      this.recordingContaminated = true;
      console.log('[WHISPER] Recording marked contaminated - AI started speaking');
    }
  }

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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

    // Track RMS readings while recording for energy validation
    if (this.isRecording) {
      this.rmsReadings.push(rms);
    }

    // Only start new recordings when AI is NOT speaking (continuous listening protection)
    const canStartRecording = !this.aiIsSpeaking;

    if (rms > this.silenceThreshold) {
      // Voice/sound detected
      if (!this.isRecording && canStartRecording) {
        console.log(`[WHISPER VAD] Voice detected (RMS: ${rms.toFixed(4)}), AI speaking: ${this.aiIsSpeaking}`);
        this.startRecording();
      } else if (!this.isRecording && !canStartRecording) {
        // Sound detected but AI is speaking - ignore to prevent feedback
        // (Don't log every frame to avoid spam)
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
    if (this.onStart) this.onStart();
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

// ============================================================================
// AUDIO PLAYER
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

    // Hybrid STT: Detect browser capability and choose appropriate manager
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognitionManager();
      this.usingWhisper = false;
      log('Using Web Speech API for STT', 'success');
    } else {
      this.speechRecognition = new WhisperRecognitionManager(null); // WebSocket will be set after connection
      this.usingWhisper = true;
      log('Using Whisper API for STT', 'success');
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
    await this.speechRecognition.initialize();

    // Start listening after initialization completes
    this.speechRecognition.start();
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

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

// Random processing messages for more natural feel
const processingMessages = [
  'Thinking...',
  'Hold on a sec...',
  'Let me think...',
  'Processing...',
  'AI is cooking...',
  'Just a moment...',
  'Analyzing...',
  'Working on it...'
];

function getRandomProcessingMessage() {
  return processingMessages[Math.floor(Math.random() * processingMessages.length)];
}

function log(message, type) {
  // Keep old logging for debugging (not displayed)
  console.log('[' + type + '] ' + message);
}

// Transcript function removed - no longer needed without transcript panel

function updateStatus(elementId, text, status) {
  const element = document.getElementById(elementId);
  if (!element) return; // Element doesn't exist, skip silently

  element.textContent = text;

  // Handle AI status bubble specially
  if (elementId === 'aiStatus') {
    const bubble = document.getElementById('aiStatusBubble');
    const mobileBubble = document.getElementById('mobileAiStatusBubble');
    const mobileElement = document.getElementById('mobileAiStatus');

    if (mobileElement) mobileElement.textContent = text;

    if (bubble) {
      // Only show bubble when processing/thinking
      if (status === 'processing') {
        bubble.classList.add('visible', 'processing');
        if (mobileBubble) mobileBubble.classList.add('visible', 'processing');
      } else {
        // Hide bubble when not processing (speaking, idle, etc.)
        bubble.classList.remove('visible', 'processing');
        if (mobileBubble) mobileBubble.classList.remove('visible', 'processing');
      }
    }
    return;
  }

  // Handle regular status elements
  element.className = 'status-value';
  if (status === 'disconnected') {
    element.classList.add('status-disconnected');
  } else if (status === 'connected') {
    element.classList.add('status-connected');
  } else if (status === 'active') {
    element.classList.add('status-active');
  } else if (status === 'processing') {
    element.classList.add('status-processing');
  } else if (status === 'speaking') {
    element.classList.add('status-speaking');
  }

  // Sync with mobile element
  const mobileId = 'mobile' + elementId.charAt(0).toUpperCase() + elementId.slice(1);
  const mobileElement = document.getElementById(mobileId);
  if (mobileElement) {
    mobileElement.textContent = text;
    mobileElement.className = element.className;
  }
}

// ============================================================================
// VOICE ORB STATE MANAGER
// ============================================================================
// Controls the visual state of the voice orb based on interaction flow
// States: idle → listening → thinking → speaking → (loop back)

function setOrbState(state) {
  const orb = document.getElementById('voiceOrb');
  const mobileOrb = document.getElementById('mobileVoiceOrb');
  const waveform = document.getElementById('audioWaveform');
  const mobileWaveform = document.getElementById('mobileAudioWaveform');

  if (orb) {
    // Remove all state classes
    orb.classList.remove('idle', 'listening', 'thinking', 'speaking');
    // Add new state class
    orb.classList.add(state);
  }

  if (mobileOrb) {
    // Sync mobile orb
    mobileOrb.classList.remove('idle', 'listening', 'thinking', 'speaking');
    mobileOrb.classList.add(state);
  }

  // Control waveform visualizer - active when AI is speaking
  if (waveform) {
    if (state === 'speaking') {
      waveform.classList.add('active');
    } else {
      waveform.classList.remove('active');
    }
  }

  if (mobileWaveform) {
    if (state === 'speaking') {
      mobileWaveform.classList.add('active');
    } else {
      mobileWaveform.classList.remove('active');
    }
  }

  // Optional: Log state changes for debugging
  console.log('[Orb] State changed to:', state);
}

// ============================================================================
// NAVIGATION FUNCTIONS (from V3)
// ============================================================================

function toggleMenu(menuId) {
  const content = document.getElementById('content-' + menuId);
  const arrow = document.getElementById('arrow-' + menuId);
  const header = arrow.parentElement;
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    arrow.classList.remove('open');
    header.classList.remove('active');
  } else {
    content.classList.add('open');
    arrow.classList.add('open');
    header.classList.add('active');
  }
}

// Cascading Hover Panel System

// Timers for delaying panel opening
let subheadingsTimer = null;
let topicsTimer = null;

// Show subheadings panel when hovering over a heading
function showSubheadings(headingId) {
  // Clear any pending timer
  clearTimeout(subheadingsTimer);

  // Delay before opening panel
  subheadingsTimer = setTimeout(() => {
    const subheadingsPanel = document.getElementById('subheadings-panel');
    const topicsPanel = document.getElementById('topics-panel');

    // Hide all subheading groups
    document.querySelectorAll('.subheading-group').forEach(group => {
      group.style.display = 'none';
    });

    // Show the appropriate subheading group
    const subheadingGroup = document.getElementById('subheadings-' + headingId);
    if (subheadingGroup) {
      subheadingGroup.style.display = 'block';
      subheadingsPanel.classList.add('visible');
    }

    // Hide topics panel when switching headings
    topicsPanel.classList.remove('visible');
  }, 300); // 300ms delay before opening
}

// Cancel subheadings timer when mouse enters subheadings panel
function cancelSubheadingsTimer() {
  if (subheadingsTimer) {
    clearTimeout(subheadingsTimer);
    subheadingsTimer = null;
  }
}

// Cancel topics timer when mouse enters topics panel
function cancelTopicsTimer() {
  if (topicsTimer) {
    clearTimeout(topicsTimer);
    topicsTimer = null;
  }
}

// Show topics panel when hovering over a subheading
function showTopics(subheadingId) {
  // Clear any pending timer
  if (topicsTimer) {
    clearTimeout(topicsTimer);
  }

  // Always use delay, even if panel is already visible
  // This prevents accidental switching while moving mouse through subheadings
  topicsTimer = setTimeout(() => {
    updateTopicsContent(subheadingId);
  }, 300); // 300ms delay before switching topics
}

// Helper function to update topics panel content
function updateTopicsContent(subheadingId) {
  const topicsPanel = document.getElementById('topics-panel');

  // Define all topics for each subheading
  const topicsData = {
    'emergencies': {
      title: '1. Emergencies',
      topics: [
        ['clinical_stations/hand_trauma/digital_amputation', 'Digital Amputation'],
        ['clinical_stations/hand_trauma/macro_amputation', 'Macro Amputation'],
        ['clinical_stations/hand_trauma/degloving_devascularisation', 'Degloving / Devascularisation'],
        ['clinical_stations/hand_trauma/mangled_hand', 'Mangled Hand'],
        ['clinical_stations/emergencies/high_pressure_injection', 'High Pressure Injection Injury'],
        ['clinical_stations/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
        ['clinical_stations/miscellaneous/extravasation_injury', 'Extravasation Injury'],
        ['clinical_stations/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis', 'nec_fasc_1.jpg'],
        ['clinical_stations/hand_trauma/open_fracture', 'Open Fracture'],
        ['clinical_stations/emergencies/compartment_syndrome', 'Compartment Syndrome'],
        ['clinical_stations/miscellaneous/flap_at_risk', 'Flap at Risk']
      ]
    },
    'hand-trauma': {
      title: '2. Hand Trauma',
      topics: [
        ['clinical_stations/hand_trauma/fingertip_injury', 'Fingertip Injury'],
        ['clinical_stations/hand_trauma/closed_hand_fracture', 'Closed Hand Fracture'],
        ['clinical_stations/hand_trauma/tendon_injury', 'Tendon Injury'],
        ['clinical_stations/emergencies/fightbite_injury', 'Fightbite Injury'],
        ['clinical_stations/elective_hand/finger_deformities_ligamental', 'Finger Deformities and Ligamental Injuries']
      ]
    },
    'elective-hand': {
      title: '3. Elective Hand',
      topics: [
        ['clinical_stations/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
        ['clinical_stations/elective_hand/compression_neuropathies', 'Compression Neuropathies'],
        ['clinical_stations/elective_hand/hand_deformities', 'Hand Deformities']
      ]
    },
    'skin-cancer': {
      title: '4. Skin Cancer',
      topics: [
        ['clinical_stations/skin_cancer/bcc_basic', 'BCC Basic'],
        ['clinical_stations/skin_cancer/scc_basic', 'SCC Basic'],
        ['clinical_stations/skin_cancer/mm_basic', 'MM Basic'],
        ['clinical_stations/miscellaneous/scalp', 'Scalp'],
        ['clinical_stations/miscellaneous/forehead_temple', 'Forehead / Temple'],
        ['clinical_stations/miscellaneous/eyelid', 'Eyelid'],
        ['clinical_stations/miscellaneous/nose', 'Nose'],
        ['clinical_stations/miscellaneous/lip', 'Lip'],
        ['clinical_stations/miscellaneous/ear', 'Ear'],
        ['clinical_stations/skin_cancer/subungual', 'Subungual'],
        ['clinical_stations/skin_cancer/mucosal', 'Mucosal'],
        ['clinical_stations/miscellaneous/fungating_massive', 'Fungating / Massive'],
        ['clinical_stations/skin_cancer/lymph_node_management', 'Lymph Node Management']
      ]
    },
    'miscellaneous': {
      title: '5. Miscellaneous',
      topics: [
        ['clinical_stations/miscellaneous/sternal_wound_dehiscence', 'Sternal Wound Dehiscence'],
        ['clinical_stations/miscellaneous/pressure_ulcer', 'Pressure Ulcer'],
        ['clinical_stations/miscellaneous/pretibial_laceration', 'Pretibial Laceration'],
        ['clinical_stations/burns/haemangioma_vascular', 'Haemangioma / Vascular Malformation'],
        ['clinical_stations/miscellaneous/chronic_lower_limb_infections', 'Chronic Lower Limb Infections'],
        ['clinical_stations/burns/cleft_lip_palate', 'Cleft Lip and Palate'],
        ['clinical_stations/burns/hypospadias', 'Hypospadias']
      ]
    },
    'breast-aesthetic': {
      title: '6. Breast & Aesthetic',
      topics: [
        ['clinical_stations/breast_aesthetic/breast_cancer_reconstruction', 'Breast Cancer and Reconstruction'],
        ['clinical_stations/breast_aesthetic/breast_reduction', 'Breast Reduction'],
        ['clinical_stations/breast_aesthetic/mastopexy', 'Mastopexy'],
        ['clinical_stations/breast_aesthetic/breast_augmentation_implants', 'Breast Augmentation / Implants'],
        ['clinical_stations/breast_aesthetic/gynaecomastia', 'Gynaecomastia'],
        ['clinical_stations/breast_aesthetic/abdominoplasty', 'Abdominoplasty'],
        ['clinical_stations/breast_aesthetic/rhinoplasty', 'Rhinoplasty'],
        ['clinical_stations/breast_aesthetic/pinnaplasty', 'Pinnaplasty']
      ]
    },
    'burns': {
      title: '7. Burns',
      topics: [
        ['clinical_stations/emergencies/resus_burn', 'Resuscitation Burn'],
        ['clinical_stations/emergencies/electric_burn', 'Electric Burn'],
        ['clinical_stations/emergencies/chemical_burn', 'Chemical Burn'],
        ['clinical_stations/burns/major_paediatric_burn', 'Major Paediatric Burn'],
        ['clinical_stations/burns/minor_paediatric_burn', 'Minor Paediatric Burn / TSS'],
        ['clinical_stations/burns/burn_scars', 'Burn Scars'],
        ['clinical_stations/burns/burn_dressings_skin_substitutes', 'Burn Dressings and Skin Substitutes']
      ]
    },
    'call-the-boss': {
      title: 'Call-The-Boss',
      topics: [
        ['communication/call_boss/call_boss_resus_burn', 'Resus Burn'],
        ['communication/call_boss/call_boss_electric_burn', 'Electric Burn'],
        ['communication/call_boss/call_boss_chemical_hf', 'Chemical / HF Burn'],
        ['communication/call_boss/call_boss_toxic_shock', 'Toxic Shock Syndrome'],
        ['communication/call_boss/call_boss_open_fracture', 'Open Fracture'],
        ['communication/call_boss/call_boss_compartment_syndrome', 'Compartment Syndrome'],
        ['communication/call_boss/call_boss_compromised_flap', 'Compromised Flap'],
        ['communication/call_boss/call_boss_nec_fasc', 'Necrotising Fasciitis'],
        ['communication/call_boss/call_boss_finger_replant', 'Finger Replant / Revascularisation'],
        ['communication/call_boss/call_boss_macro_replant', 'Macro Replant']
      ]
    },
    'consent': {
      title: 'Consent',
      topics: [
        ['communication/consent/consent_breast_reduction', 'Breast Reduction'],
        ['communication/consent/consent_diep', 'DIEP'],
        ['communication/consent/consent_skin_lesion', 'Skin Lesion Excision +/- Reconstruction'],
        ['communication/consent/consent_pinnaplasty', 'Pinnaplasty'],
        ['communication/consent/consent_pretibial', 'Pretibial Laceration'],
        ['communication/consent/consent_tendon_nerve', 'Tendon / Digital Nerve Repair']
      ]
    },
    'structured-topics': {
      title: 'Structured Interview',
      topics: [
        ['structured_interview/structured_research', 'Research'],
        ['structured_interview/structured_audit', 'Audit'],
        ['structured_interview/structured_teaching', 'Teaching'],
        ['structured_interview/structured_ethics', 'Ethics'],
        ['structured_interview/structured_risk_management', 'Risk Management'],
        ['structured_interview/structured_consent', 'Consent']
      ]
    }
  };

    const data = topicsData[subheadingId];
    if (!data) return;

    // Build topics HTML
    let html = `<div class="topics-panel-title">${data.title}</div>`;
    data.topics.forEach(topic => {
      const [folder, title, image] = topic;
      const imageArg = image ? `, '${image}'` : '';
      html += `<div class="topic-item" onclick="selectScenario('${folder}', '${title.replace(/'/g, "\\'")}'${imageArg})">📋 ${title}</div>`;
    });

  topicsPanel.innerHTML = html;
  topicsPanel.classList.add('visible');
}

// Handle mouse leave events for panels
function handlePanelMouseLeave(panelType) {
  // Use setTimeout to allow mouse movement to next panel without closing
  setTimeout(() => {
    const headingsPanel = document.getElementById('headings-panel');
    const subheadingsPanel = document.getElementById('subheadings-panel');
    const topicsPanel = document.getElementById('topics-panel');

    // Check if mouse is still over specific panels
    const isOverHeadings = headingsPanel.matches(':hover');
    const isOverSubheadings = subheadingsPanel.matches(':hover');
    const isOverTopics = topicsPanel.matches(':hover');

    if (panelType === 'headings') {
      // If mouse left headings panel, hide subheadings and topics
      // unless hovering over subheadings or topics
      if (!isOverSubheadings && !isOverTopics) {
        subheadingsPanel.classList.remove('visible');
        topicsPanel.classList.remove('visible');
      }
    } else if (panelType === 'subheadings') {
      // If mouse left subheadings panel, hide topics
      // unless hovering over topics
      if (!isOverTopics) {
        topicsPanel.classList.remove('visible');
      }
      // Hide subheadings only if not hovering over headings, subheadings, OR topics
      if (!isOverHeadings && !isOverSubheadings && !isOverTopics) {
        subheadingsPanel.classList.remove('visible');
      }
    } else if (panelType === 'topics') {
      // If mouse left topics panel, hide topics only
      // unless still hovering over topics panel itself
      if (!isOverTopics) {
        topicsPanel.classList.remove('visible');
      }
    }
  }, 50); // Reduced delay for more responsive hiding
}

// Hide all panels when hovering over content area
function hideAllPanels() {
  const subheadingsPanel = document.getElementById('subheadings-panel');
  const topicsPanel = document.getElementById('topics-panel');

  subheadingsPanel.classList.remove('visible');
  topicsPanel.classList.remove('visible');
}

// Mobile progressive hierarchy navigation
let mobileCurrentLevel = 'headings'; // Track current navigation level
let mobileCurrentHeading = null;
let mobileCurrentSubheading = null;

function initMobilePanelNavigation() {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;

  if (isMobile) {
    console.log('[MOBILE] Initializing progressive hierarchy navigation');

    // Copy difficulty indicator to mobile version
    const desktopIndicator = document.getElementById('selectedDifficultyIndicator');
    const mobileIndicator = document.getElementById('selectedDifficultyIndicatorMobile');
    if (desktopIndicator && mobileIndicator) {
      mobileIndicator.textContent = desktopIndicator.textContent;
      mobileIndicator.style.color = desktopIndicator.style.color;
    }

    // Reset to headings level
    mobileShowHeadings();
  }
}

function mobileShowHeadings() {
  const headingsGrid = document.getElementById('mobileHeadingsGrid');
  const subheadingsGrid = document.getElementById('mobileSubheadingsGrid');
  const topicsGrid = document.getElementById('mobileTopicsGrid');
  const backButton = document.getElementById('mobileBackButton');

  // Show headings, hide others
  headingsGrid.style.display = 'grid';
  subheadingsGrid.style.display = 'none';
  topicsGrid.style.display = 'none';

  // Update back button
  backButton.textContent = '← Back to Difficulty';
  backButton.onclick = backToDifficulty;

  mobileCurrentLevel = 'headings';
  mobileCurrentHeading = null;

  // Populate headings
  headingsGrid.innerHTML = '';
  const headings = [
    { id: 'clinical', icon: '📋', name: 'Clinical Stations' },
    { id: 'communication', icon: '💬', name: 'Communication' },
    { id: 'structured', icon: '📝', name: 'Structured Interview' }
  ];

  headings.forEach(heading => {
    const card = document.createElement('div');
    card.className = 'mobile-scenario-card';
    card.onclick = () => mobileShowSubheadings(heading.id, heading.name);
    card.innerHTML = `
      <h3>${heading.icon} ${heading.name}</h3>
    `;
    headingsGrid.appendChild(card);
  });
}

function mobileShowSubheadings(headingId, headingName) {
  const headingsGrid = document.getElementById('mobileHeadingsGrid');
  const subheadingsGrid = document.getElementById('mobileSubheadingsGrid');
  const topicsGrid = document.getElementById('mobileTopicsGrid');
  const backButton = document.getElementById('mobileBackButton');

  // Show subheadings, hide others
  headingsGrid.style.display = 'none';
  subheadingsGrid.style.display = 'grid';
  topicsGrid.style.display = 'none';

  // Update back button
  backButton.textContent = '← Back to Categories';
  backButton.onclick = mobileShowHeadings;

  mobileCurrentLevel = 'subheadings';
  mobileCurrentHeading = headingId;

  // Populate subheadings based on heading
  subheadingsGrid.innerHTML = '';

  const subheadingsData = {
    clinical: [
      { id: 'emergencies', name: '🚨 Emergencies' },
      { id: 'hand-trauma', name: '✋ Hand Trauma' },
      { id: 'elective-hand', name: '🤚 Elective Hand' },
      { id: 'skin-cancer', name: '🔬 Skin Cancer' },
      { id: 'miscellaneous', name: '📦 Miscellaneous' },
      { id: 'breast-aesthetic', name: '💄 Breast & Aesthetic' },
      { id: 'burns', name: '🔥 Burns' }
    ],
    communication: [
      { id: 'call-the-boss', name: '📞 Call-The-Boss' },
      { id: 'consent', name: '✍️ Consent' }
    ],
    structured: [
      { id: 'structured-topics', name: '📝 Interview Topics' }
    ]
  };

  const subheadings = subheadingsData[headingId] || [];

  subheadings.forEach(subheading => {
    const card = document.createElement('div');
    card.className = 'mobile-scenario-card';
    card.onclick = () => mobileShowTopics(subheading.id, subheading.name);
    card.innerHTML = `<h3>${subheading.name}</h3>`;
    subheadingsGrid.appendChild(card);
  });
}

function mobileShowTopics(subheadingId, subheadingName) {
  const headingsGrid = document.getElementById('mobileHeadingsGrid');
  const subheadingsGrid = document.getElementById('mobileSubheadingsGrid');
  const topicsGrid = document.getElementById('mobileTopicsGrid');
  const backButton = document.getElementById('mobileBackButton');

  // Show topics, hide others
  headingsGrid.style.display = 'none';
  subheadingsGrid.style.display = 'none';
  topicsGrid.style.display = 'grid';

  // Update back button
  backButton.textContent = '← Back';
  backButton.onclick = () => mobileShowSubheadings(mobileCurrentHeading, '');

  mobileCurrentLevel = 'topics';
  mobileCurrentSubheading = subheadingId;

  // Populate topics - using the same data from topicsData
  topicsGrid.innerHTML = '';

  const topicsData = {
    'emergencies': [
      ['clinical_stations/hand_trauma/digital_amputation', 'Digital Amputation'],
      ['clinical_stations/hand_trauma/macro_amputation', 'Macro Amputation'],
      ['clinical_stations/hand_trauma/degloving_devascularisation', 'Degloving / Devascularisation'],
      ['clinical_stations/hand_trauma/mangled_hand', 'Mangled Hand'],
      ['clinical_stations/emergencies/high_pressure_injection', 'High Pressure Injection Injury'],
      ['clinical_stations/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
      ['clinical_stations/miscellaneous/extravasation_injury', 'Extravasation Injury'],
      ['clinical_stations/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis', 'nec_fasc_1.jpg'],
      ['clinical_stations/hand_trauma/open_fracture', 'Open Fracture'],
      ['clinical_stations/emergencies/compartment_syndrome', 'Compartment Syndrome'],
      ['clinical_stations/miscellaneous/flap_at_risk', 'Flap at Risk']
    ],
    'hand-trauma': [
      ['clinical_stations/hand_trauma/fingertip_injury', 'Fingertip Injury'],
      ['clinical_stations/hand_trauma/closed_hand_fracture', 'Closed Hand Fracture'],
      ['clinical_stations/hand_trauma/tendon_injury', 'Tendon Injury'],
      ['clinical_stations/emergencies/fightbite_injury', 'Fightbite Injury'],
      ['clinical_stations/elective_hand/finger_deformities_ligamental', 'Finger Deformities and Ligamental Injuries']
    ],
    'elective-hand': [
      ['clinical_stations/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
      ['clinical_stations/elective_hand/compression_neuropathies', 'Compression Neuropathies'],
      ['clinical_stations/elective_hand/hand_deformities', 'Hand Deformities']
    ],
    'skin-cancer': [
      ['clinical_stations/skin_cancer/bcc_basic', 'BCC Basic'],
      ['clinical_stations/skin_cancer/scc_basic', 'SCC Basic'],
      ['clinical_stations/skin_cancer/mm_basic', 'MM Basic'],
      ['clinical_stations/miscellaneous/scalp', 'Scalp'],
      ['clinical_stations/miscellaneous/forehead_temple', 'Forehead / Temple'],
      ['clinical_stations/miscellaneous/eyelid', 'Eyelid'],
      ['clinical_stations/miscellaneous/nose', 'Nose'],
      ['clinical_stations/miscellaneous/lip', 'Lip'],
      ['clinical_stations/miscellaneous/ear', 'Ear'],
      ['clinical_stations/skin_cancer/subungual', 'Subungual'],
      ['clinical_stations/skin_cancer/mucosal', 'Mucosal'],
      ['clinical_stations/miscellaneous/fungating_massive', 'Fungating / Massive'],
      ['clinical_stations/skin_cancer/lymph_node_management', 'Lymph Node Management']
    ],
    'miscellaneous': [
      ['clinical_stations/miscellaneous/sternal_wound_dehiscence', 'Sternal Wound Dehiscence'],
      ['clinical_stations/miscellaneous/pressure_ulcer', 'Pressure Ulcer'],
      ['clinical_stations/miscellaneous/pretibial_laceration', 'Pretibial Laceration'],
      ['clinical_stations/burns/haemangioma_vascular', 'Haemangioma / Vascular Malformation'],
      ['clinical_stations/miscellaneous/chronic_lower_limb_infections', 'Chronic Lower Limb Infections'],
      ['clinical_stations/burns/cleft_lip_palate', 'Cleft Lip and Palate'],
      ['clinical_stations/burns/hypospadias', 'Hypospadias']
    ],
    'breast-aesthetic': [
      ['clinical_stations/breast_aesthetic/breast_cancer_reconstruction', 'Breast Cancer and Reconstruction'],
      ['clinical_stations/breast_aesthetic/breast_reduction', 'Breast Reduction'],
      ['clinical_stations/breast_aesthetic/mastopexy', 'Mastopexy'],
      ['clinical_stations/breast_aesthetic/breast_augmentation_implants', 'Breast Augmentation / Implants'],
      ['clinical_stations/breast_aesthetic/gynaecomastia', 'Gynaecomastia'],
      ['clinical_stations/breast_aesthetic/abdominoplasty', 'Abdominoplasty'],
      ['clinical_stations/breast_aesthetic/rhinoplasty', 'Rhinoplasty'],
      ['clinical_stations/breast_aesthetic/pinnaplasty', 'Pinnaplasty']
    ],
    'burns': [
      ['clinical_stations/emergencies/resus_burn', 'Resuscitation Burn'],
      ['clinical_stations/emergencies/electric_burn', 'Electric Burn'],
      ['clinical_stations/emergencies/chemical_burn', 'Chemical Burn'],
      ['clinical_stations/burns/major_paediatric_burn', 'Major Paediatric Burn'],
      ['clinical_stations/burns/minor_paediatric_burn', 'Minor Paediatric Burn / TSS'],
      ['clinical_stations/burns/burn_scars', 'Burn Scars'],
      ['clinical_stations/burns/burn_dressings_skin_substitutes', 'Burn Dressings and Skin Substitutes']
    ],
    'call-the-boss': [
      ['communication/call_boss/call_boss_resus_burn', 'Resus Burn'],
      ['communication/call_boss/call_boss_electric_burn', 'Electric Burn'],
      ['communication/call_boss/call_boss_chemical_hf', 'Chemical / HF Burn'],
      ['communication/call_boss/call_boss_toxic_shock', 'Toxic Shock Syndrome'],
      ['communication/call_boss/call_boss_open_fracture', 'Open Fracture'],
      ['communication/call_boss/call_boss_compartment_syndrome', 'Compartment Syndrome'],
      ['communication/call_boss/call_boss_compromised_flap', 'Compromised Flap'],
      ['communication/call_boss/call_boss_nec_fasc', 'Necrotising Fasciitis'],
      ['communication/call_boss/call_boss_finger_replant', 'Finger Replant / Revascularisation'],
      ['communication/call_boss/call_boss_macro_replant', 'Macro Replant']
    ],
    'consent': [
      ['communication/consent/consent_breast_reduction', 'Breast Reduction'],
      ['communication/consent/consent_diep', 'DIEP'],
      ['communication/consent/consent_skin_lesion', 'Skin Lesion Excision +/- Reconstruction'],
      ['communication/consent/consent_pinnaplasty', 'Pinnaplasty'],
      ['communication/consent/consent_pretibial', 'Pretibial Laceration'],
      ['communication/consent/consent_tendon_nerve', 'Tendon / Digital Nerve Repair']
    ],
    'structured-topics': [
      ['structured_interview/structured_research', 'Research'],
      ['structured_interview/structured_audit', 'Audit'],
      ['structured_interview/structured_teaching', 'Teaching'],
      ['structured_interview/structured_leadership', 'Leadership'],
      ['structured_interview/structured_portfolio', 'Portfolio'],
      ['structured_interview/structured_hot_topics', 'Hot Topics']
    ]
  };

  const topics = topicsData[subheadingId] || [];

  topics.forEach(topic => {
    const [folder, title, image] = topic;
    const card = document.createElement('div');
    card.className = 'mobile-scenario-card';
    card.onclick = () => selectScenario(folder, title, image);
    card.innerHTML = `<h3>${title}</h3>`;
    topicsGrid.appendChild(card);
  });
}

// Called when user clicks a scenario - directly starts with pre-selected difficulty
function selectScenario(topicFolder, title, imageFile) {
  // Ensure we have a difficulty selected
  if (!selectedDifficulty) {
    log('Error: No difficulty selected', 'error');
    alert('Please select a difficulty level first');
    return;
  }

  // Construct the prompt file path using the pre-selected difficulty
  // Extract just the folder name (last part after final slash) for the filename
  const folderName = topicFolder.split('/').pop();
  // Format: prompts/{topicFolder}/{difficulty}_{folderName}_1.txt
  const promptFile = `prompts/${topicFolder}/${selectedDifficulty}_${folderName}_1.txt`;

  // Show "Entering Simulation Room" overlay
  const overlay = document.getElementById('simulationTransition');
  overlay.style.display = 'flex';

  // Trigger fade-in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
  });

  // Wait 1 second then fade out overlay
  setTimeout(() => {
    overlay.classList.remove('active');

    // After overlay fades out, hide it and start page transition
    setTimeout(() => {
      overlay.style.display = 'none';

      // Use the same transition pattern as other page transitions
      transitionToPage('scenarioSelection', 'simulationRoom', () => {
        // Load scenario content after page transition starts
        startScenario(title, title, promptFile, imageFile);
      });
    }, 800); // Wait for overlay fade-out
  }, 1000); // Display overlay for 1 second
}

function startScenario(category, title, promptFile, imageFile) {
  promptFile = promptFile || 'template.txt';
  currentScenario = { category: category, title: title, promptFile: promptFile, imageFile: imageFile };

  // Apply active class to simulation room to trigger grid layout
  const simulationRoom = document.getElementById('simulationRoom');
  simulationRoom.classList.add('active');

  // Set scenario information
  document.getElementById('currentScenarioTitle').textContent = title;
  document.getElementById('currentScenarioCategory').textContent = category;

  const imageSection = document.getElementById('imageSection');
  const clinicalImage = document.getElementById('clinicalImage');
  const noImagePlaceholder = document.getElementById('noImagePlaceholder');

  // Pre-load image but keep section hidden until session starts
  if (imageFile) {
    const imagePath = 'images/' + imageFile;
    clinicalImage.src = imagePath;
    clinicalImage.onload = () => {
      clinicalImage.style.display = 'block';
      noImagePlaceholder.style.display = 'none';
      log('Clinical image loaded: ' + imageFile, 'success');
    };
    clinicalImage.onerror = () => {
      clinicalImage.style.display = 'none';
      noImagePlaceholder.style.display = 'block';
      noImagePlaceholder.textContent = 'Image not found: ' + imageFile;
      log('Clinical image not found: ' + imageFile, 'warning');
    };
  }
  // Image section is always visible in the layout, but hidden with opacity
  // It will fade in when user clicks "Start Session"

  // Sync mobile elements with desktop elements
  syncMobileSimulationElements();

  log('Selected scenario: ' + title, 'info');
}

// Sync mobile simulation elements with desktop elements
function syncMobileSimulationElements() {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;

  if (!isMobile) return; // Only sync on mobile

  // Sync clinical image - use onload to ensure image is ready
  const desktopImage = document.getElementById('clinicalImage');
  const mobileImage = document.getElementById('mobileClinicalImage');
  const desktopPlaceholder = document.getElementById('noImagePlaceholder');
  const mobilePlaceholder = document.getElementById('mobileNoImagePlaceholder');

  if (desktopImage && mobileImage) {
    // Copy src first
    if (desktopImage.src) {
      mobileImage.src = desktopImage.src;
      mobileImage.onload = () => {
        mobileImage.style.display = 'block';
        if (mobilePlaceholder) mobilePlaceholder.style.display = 'none';
      };
      mobileImage.onerror = () => {
        mobileImage.style.display = 'none';
        if (mobilePlaceholder) {
          mobilePlaceholder.style.display = 'block';
          mobilePlaceholder.textContent = 'Image not found';
        }
      };
    } else {
      mobileImage.style.display = 'none';
      if (mobilePlaceholder) {
        mobilePlaceholder.style.display = 'block';
        mobilePlaceholder.textContent = desktopPlaceholder ? desktopPlaceholder.textContent : 'No clinical image available';
      }
    }
  }

  // Sync status values
  const sessionStatus = document.getElementById('sessionStatus');
  const mobileSessionStatus = document.getElementById('mobileSessionStatus');
  if (sessionStatus && mobileSessionStatus) {
    mobileSessionStatus.textContent = sessionStatus.textContent;
    mobileSessionStatus.className = sessionStatus.className;
  }

  const micStatus = document.getElementById('micStatus');
  const mobileMicStatus = document.getElementById('mobileMicStatus');
  if (micStatus && mobileMicStatus) {
    mobileMicStatus.textContent = micStatus.textContent;
    mobileMicStatus.className = micStatus.className;
  }

  // Sync AI status bubble
  const aiStatus = document.getElementById('aiStatus');
  const mobileAiStatus = document.getElementById('mobileAiStatus');
  if (aiStatus && mobileAiStatus) {
    mobileAiStatus.textContent = aiStatus.textContent;
  }

  // Sync voice orb
  const voiceOrb = document.getElementById('voiceOrb');
  const mobileVoiceOrb = document.getElementById('mobileVoiceOrb');
  if (voiceOrb && mobileVoiceOrb) {
    mobileVoiceOrb.className = voiceOrb.className;
  }

  // Sync button states
  syncMobileButtonStates();

  // Add event listeners to mobile buttons to trigger desktop buttons (only once)
  setupMobileButtonListeners();
}

// Separate function to sync mobile button states - call this whenever desktop button states change
function syncMobileButtonStates() {
  const connectBtn = document.getElementById('connectBtn');
  const mobileConnectBtn = document.getElementById('mobileConnectBtn');
  if (connectBtn && mobileConnectBtn) {
    mobileConnectBtn.disabled = connectBtn.disabled;
  }

  const interruptBtn = document.getElementById('interruptBtn');
  const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
  if (interruptBtn && mobileInterruptBtn) {
    mobileInterruptBtn.disabled = interruptBtn.disabled;
    mobileInterruptBtn.style.display = interruptBtn.style.display;
  }

  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');
  if (disconnectBtn && mobileDisconnectBtn) {
    mobileDisconnectBtn.disabled = disconnectBtn.disabled;
  }
}

// Setup mobile button click handlers (call once)
let mobileButtonListenersSetup = false;
function setupMobileButtonListeners() {
  if (mobileButtonListenersSetup) return;
  mobileButtonListenersSetup = true;

  const connectBtn = document.getElementById('connectBtn');
  const mobileConnectBtn = document.getElementById('mobileConnectBtn');
  const interruptBtn = document.getElementById('interruptBtn');
  const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');

  if (mobileConnectBtn && connectBtn) {
    mobileConnectBtn.onclick = () => {
      console.log('[Mobile] Connect button clicked');
      connectBtn.click();
    };
  }
  if (mobileInterruptBtn && interruptBtn) {
    mobileInterruptBtn.onclick = () => {
      console.log('[Mobile] Interrupt button clicked');
      interruptBtn.click();
    };
  }
  if (mobileDisconnectBtn && disconnectBtn) {
    mobileDisconnectBtn.onclick = () => {
      console.log('[Mobile] Disconnect button clicked');
      disconnectBtn.click();
    };
  }
}

function exitSimulation() {
  if (session) {
    session.disconnect();
    session = null;
  }

  const simulationRoom = document.getElementById('simulationRoom');
  simulationRoom.classList.add('fade-out');

  setTimeout(() => {
    simulationRoom.classList.remove('active', 'fade-out');

    // Show scenario selection with fade in
    const scenarioSelection = document.getElementById('scenarioSelection');
    scenarioSelection.style.display = 'block';
    scenarioSelection.classList.add('fade-in');

    setTimeout(() => {
      scenarioSelection.classList.remove('fade-in');
    }, 500);

    document.getElementById('connectBtn').disabled = false;
    document.getElementById('disconnectBtn').disabled = true;
    document.getElementById('interruptBtn').style.display = 'none';
    syncMobileButtonStates(); // Sync mobile buttons
    updateStatus('connectionStatus', 'Disconnected', 'disconnected');
    updateStatus('sessionStatus', 'No Session', 'disconnected');
    updateStatus('micStatus', 'Inactive', 'disconnected');
    updateStatus('aiStatus', 'Idle', 'disconnected');
    setOrbState('idle'); // Reset orb state when exiting

    // Reset image section (it will fade out via CSS)
    const imageSection = document.getElementById('imageSection');
    const mobileImageSection = document.getElementById('mobileImageSection');
    if (imageSection) {
      imageSection.classList.remove('visible');
    }
    if (mobileImageSection) {
      mobileImageSection.classList.remove('visible');
    }
  }, 500);
}

// ============================================================================
// NEW MULTI-PAGE NAVIGATION WITH FADE TRANSITIONS
// ============================================================================

let selectedSpecialty = null;
let selectedDifficulty = null;

// Helper function to transition between pages with fade effect
function transitionToPage(fromPageId, toPageId, callback) {
  const fromPage = document.getElementById(fromPageId);
  const toPage = document.getElementById(toPageId);

  // Fade out current page
  fromPage.classList.add('fade-out');

  setTimeout(() => {
    // Hide current page
    fromPage.style.display = 'none';
    fromPage.classList.remove('fade-out');

    // Show new page - for simulation room, don't set display (let CSS class handle it)
    if (toPageId !== 'simulationRoom') {
      toPage.style.display = 'block';
    }
    toPage.classList.add('fade-in');

    // Execute callback if provided
    if (callback) callback();

    // Remove fade-in class after animation
    setTimeout(() => {
      toPage.classList.remove('fade-in');
    }, 500);
  }, 500); // Match CSS transition duration
}

function selectSpecialty(specialty) {
  selectedSpecialty = specialty;
  transitionToPage('specialtySelection', 'difficultySelection');
  log('Selected specialty: ' + specialty, 'info');
}

function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;

  // Update the difficulty indicator on the scenario page
  const indicator = document.getElementById('selectedDifficultyIndicator');
  const difficultyEmoji = {
    'easy': '🟢',
    'medium': '🟡',
    'strict': '🔴'
  };
  const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  indicator.textContent = `${difficultyEmoji[difficulty]} Selected Difficulty: ${difficultyName}`;
  indicator.style.color = difficulty === 'easy' ? '#059669' : difficulty === 'medium' ? '#d97706' : '#dc2626';

  transitionToPage('difficultySelection', 'scenarioSelection', () => {
    // Initialize mobile-friendly panel navigation after page loads
    initMobilePanelNavigation();
  });
  log('Selected difficulty: ' + difficulty, 'info');
}

function backToSpecialties() {
  selectedSpecialty = null;
  transitionToPage('difficultySelection', 'specialtySelection');
}

function backToDifficulty() {
  selectedDifficulty = null;
  transitionToPage('scenarioSelection', 'difficultySelection');
}

function openImageModal() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const clinicalImage = document.getElementById('clinicalImage');
  if (clinicalImage.src) {
    modalImage.src = clinicalImage.src;
    modal.style.display = 'block';
  }
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
}

// ============================================================================
// BUTTON EVENT HANDLERS
// ============================================================================

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    log('Initializing session...', 'info');
    session = new V4Session(CONFIG.BACKEND_URL, currentScenario.promptFile, selectedDifficulty);
    await session.connect();
    session.startListening();
    document.getElementById('connectBtn').disabled = true;
    document.getElementById('disconnectBtn').disabled = false;
    syncMobileButtonStates(); // Sync mobile buttons
    log('Session ready! Start speaking to begin the interview.', 'success');

    // Show the clinical image with transition when session starts
    const imageSection = document.getElementById('imageSection');
    const mobileImageSection = document.getElementById('mobileImageSection');
    if (imageSection) {
      imageSection.classList.add('visible');
    }
    if (mobileImageSection) {
      mobileImageSection.classList.add('visible');
    }
  } catch (error) {
    log('Connection failed: ' + error.message, 'error');
  }
});

document.getElementById('disconnectBtn').addEventListener('click', () => {
  if (session) {
    session.disconnect();
    session = null;
    log('Session ended by user', 'info');
  }
  document.getElementById('connectBtn').disabled = false;
  document.getElementById('disconnectBtn').disabled = true;
  document.getElementById('interruptBtn').style.display = 'none';
  syncMobileButtonStates(); // Sync mobile buttons
  updateStatus('sessionStatus', 'No Session', 'disconnected');
  updateStatus('micStatus', 'Inactive', 'disconnected');
  setOrbState('idle'); // Reset orb when disconnecting

  // Hide image with transition
  const imageSection = document.getElementById('imageSection');
  const mobileImageSection = document.getElementById('mobileImageSection');
  if (imageSection) {
    imageSection.classList.remove('visible');
  }
  if (mobileImageSection) {
    mobileImageSection.classList.remove('visible');
  }
});

// Interrupt button - stops AI and activates microphone
document.getElementById('interruptBtn').addEventListener('click', () => {
  if (session && session.audioPlayer.isPlaying) {
    session.audioPlayer.interrupt();
    session.speechRecognition.start();
    updateStatus('micStatus', '🎤 Listening', 'connected');
    document.getElementById('interruptBtn').style.display = 'none';
    syncMobileButtonStates(); // Sync mobile buttons
    log('AI interrupted by user', 'info');
  }
});

// ============================================================================
// BROWSER COMPATIBILITY CHECK
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    // Whisper API fallback available - all browsers supported
    log('Using Whisper API for speech recognition (browser fallback)', 'info');
  } else {
    // Web Speech API available - optimal performance
    log('Using Web Speech API for speech recognition (native browser support)', 'success');
  }
});

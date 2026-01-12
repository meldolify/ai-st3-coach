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
    this.onTranscript = null;
    this.onStart = null;
    this.onEnd = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.silenceTimer = null;
  }

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioChunks = [];

          // Convert blob to base64 and send to backend
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1];
            this.websocket.send(JSON.stringify({
              type: 'whisper_audio',
              sessionId: session.sessionId,
              audio: base64Audio
            }));
          };
          reader.readAsDataURL(audioBlob);
        }

        this.isListening = false;
        if (this.onEnd) this.onEnd();

        // Auto-restart if should be listening
        if (this.shouldBeListening) {
          setTimeout(() => this.start(), 100);
        }
      };

      log('Whisper recognition initialized', 'success');
    } catch (error) {
      log('Microphone access denied: ' + error.message, 'error');
      throw error;
    }
  }

  start() {
    this.shouldBeListening = true;
    if (!this.isListening && this.mediaRecorder) {
      this.mediaRecorder.start();
      this.isListening = true;

      // Auto-stop after 10 seconds to send audio for transcription
      // This creates natural conversation chunks
      this.silenceTimer = setTimeout(() => {
        if (this.isListening) {
          this.mediaRecorder.stop();
        }
      }, 10000);

      if (this.onStart) this.onStart();
      log('Whisper recording started', 'success');
    }
  }

  stop() {
    this.shouldBeListening = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.isListening && this.mediaRecorder) {
      this.mediaRecorder.stop();
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
        updateStatus('aiStatus', 'Speaking', 'speaking'); // Hide bubble when speaking
        setOrbState('speaking');
        break;

      case 'whisper_transcript':
        // Handle Whisper API transcript (same as Web Speech API onTranscript)
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
      // Stop mic to prevent AI from hearing itself
      this.speechRecognition.stop();
      updateStatus('micStatus', 'Paused', 'active');
      updateStatus('aiStatus', 'Speaking', 'speaking'); // Hide bubble when speaking
      // Orb state already set to 'speaking' in handleMessage
    };

    this.audioPlayer.onEnd = () => {
      // Hide interrupt button
      document.getElementById('interruptBtn').style.display = 'none';
      // Send WebSocket message to notify backend
      if (this.isConnected && this.sessionId) {
        this.ws.send(JSON.stringify({
          type: 'ai_finished',
          sessionId: this.sessionId
        }));
      }
      // Wait longer to see if we're in feedback mode
      setTimeout(() => {
        // Only restart mic if NOT in feedback mode
        if (!this.inFeedbackMode && !this.audioPlayer.isPlaying) {
          this.speechRecognition.start();
        } else {
          // Reset feedback mode flag after processing
          this.inFeedbackMode = false;
        }
      }, 350); // Increased from 100ms to 350ms to wait for feedback_processing message
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
    if (bubble) {
      // Only show bubble when processing/thinking
      if (status === 'processing') {
        bubble.classList.add('visible', 'processing');
      } else {
        // Hide bubble when not processing (speaking, idle, etc.)
        bubble.classList.remove('visible', 'processing');
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
}

// ============================================================================
// VOICE ORB STATE MANAGER
// ============================================================================
// Controls the visual state of the voice orb based on interaction flow
// States: idle → listening → thinking → speaking → (loop back)

function setOrbState(state) {
  const orb = document.getElementById('voiceOrb');
  if (!orb) return;

  // Remove all state classes
  orb.classList.remove('idle', 'listening', 'thinking', 'speaking');

  // Add new state class
  orb.classList.add(state);

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

  log('Selected scenario: ' + title, 'info');
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
    updateStatus('connectionStatus', 'Disconnected', 'disconnected');
    updateStatus('sessionStatus', 'No Session', 'disconnected');
    updateStatus('micStatus', 'Inactive', 'disconnected');
    updateStatus('aiStatus', 'Idle', 'disconnected');
    setOrbState('idle'); // Reset orb state when exiting

    // Reset image section (it will fade out via CSS)
    const imageSection = document.getElementById('imageSection');
    if (imageSection) {
      imageSection.classList.remove('visible');
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

  transitionToPage('difficultySelection', 'scenarioSelection');
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
    log('Session ready! Start speaking to begin the interview.', 'success');

    // Show the clinical image with transition when session starts
    const imageSection = document.getElementById('imageSection');
    if (imageSection) {
      imageSection.classList.add('visible');
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
  updateStatus('sessionStatus', 'No Session', 'disconnected');
  updateStatus('micStatus', 'Inactive', 'disconnected');
  setOrbState('idle'); // Reset orb when disconnecting

  // Hide image with transition
  const imageSection = document.getElementById('imageSection');
  if (imageSection) {
    imageSection.classList.remove('visible');
  }
});

// Interrupt button - stops AI and activates microphone
document.getElementById('interruptBtn').addEventListener('click', () => {
  if (session && session.audioPlayer.isPlaying) {
    session.audioPlayer.interrupt();
    session.speechRecognition.start();
    updateStatus('micStatus', '🎤 Listening', 'connected');
    document.getElementById('interruptBtn').style.display = 'none';
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

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
    this.speechRecognition = new SpeechRecognitionManager();
    this.audioPlayer = new AudioPlayer();
    this.backendUrl = backendUrl;
    this.promptFile = promptFile;
    this.difficulty = difficulty || null;
    this.isConnected = false;
    this.inFeedbackMode = false; // Track if we're in feedback mode

    // Voice mapping for each difficulty level using Chirp 3 HD voices
    this.voiceMap = {
      'easy': 'en-GB-Chirp3-HD-Charon',      // John: Male voice
      'medium': 'en-GB-Chirp3-HD-Kore',      // Elliot: Female voice
      'strict': 'en-GB-Chirp3-HD-Fenrir'     // Perry: Male voice
    };
    this.voice = this.voiceMap[difficulty] || 'en-GB-Chirp3-HD-Charon';
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

  startListening() {
    this.speechRecognition.initialize();

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
        ['digital_amputation', 'Digital Amputation'],
        ['macro_amputation', 'Macro Amputation'],
        ['degloving_devascularisation', 'Degloving / Devascularisation'],
        ['mangled_hand', 'Mangled Hand'],
        ['high_pressure_injection', 'High Pressure Injection Injury'],
        ['flexor_sheath_infection', 'Flexor Sheath Infection'],
        ['extravasation_injury', 'Extravasation Injury'],
        ['necrotising_fasciitis', 'Necrotising Fasciitis', 'nec_fasc_1.jpg'],
        ['open_fracture', 'Open Fracture'],
        ['compartment_syndrome', 'Compartment Syndrome'],
        ['flap_at_risk', 'Flap at Risk']
      ]
    },
    'hand-trauma': {
      title: '2. Hand Trauma',
      topics: [
        ['fingertip_injury', 'Fingertip Injury'],
        ['closed_hand_fracture', 'Closed Hand Fracture'],
        ['tendon_injury', 'Tendon Injury'],
        ['fightbite_injury', 'Fightbite Injury'],
        ['finger_deformities_ligamental', 'Finger Deformities and Ligamental Injuries']
      ]
    },
    'elective-hand': {
      title: '3. Elective Hand',
      topics: [
        ['dupuytrens_disease', "Dupuytren's Disease"],
        ['compression_neuropathies', 'Compression Neuropathies'],
        ['hand_deformities', 'Hand Deformities']
      ]
    },
    'skin-cancer': {
      title: '4. Skin Cancer',
      topics: [
        ['bcc_basic', 'BCC Basic'],
        ['scc_basic', 'SCC Basic'],
        ['mm_basic', 'MM Basic'],
        ['scalp', 'Scalp'],
        ['forehead_temple', 'Forehead / Temple'],
        ['eyelid', 'Eyelid'],
        ['nose', 'Nose'],
        ['lip', 'Lip'],
        ['ear', 'Ear'],
        ['subungual', 'Subungual'],
        ['mucosal', 'Mucosal'],
        ['fungating_massive', 'Fungating / Massive'],
        ['lymph_node_management', 'Lymph Node Management']
      ]
    },
    'miscellaneous': {
      title: '5. Miscellaneous',
      topics: [
        ['sternal_wound_dehiscence', 'Sternal Wound Dehiscence'],
        ['pressure_ulcer', 'Pressure Ulcer'],
        ['pretibial_laceration', 'Pretibial Laceration'],
        ['haemangioma_vascular', 'Haemangioma / Vascular Malformation'],
        ['chronic_lower_limb_infections', 'Chronic Lower Limb Infections'],
        ['cleft_lip_palate', 'Cleft Lip and Palate'],
        ['hypospadias', 'Hypospadias']
      ]
    },
    'breast-aesthetic': {
      title: '6. Breast & Aesthetic',
      topics: [
        ['breast_cancer_reconstruction', 'Breast Cancer and Reconstruction'],
        ['breast_reduction', 'Breast Reduction'],
        ['mastopexy', 'Mastopexy'],
        ['breast_augmentation_implants', 'Breast Augmentation / Implants'],
        ['gynaecomastia', 'Gynaecomastia'],
        ['abdominoplasty', 'Abdominoplasty'],
        ['rhinoplasty', 'Rhinoplasty'],
        ['pinnaplasty', 'Pinnaplasty']
      ]
    },
    'burns': {
      title: '7. Burns',
      topics: [
        ['resus_burn', 'Resuscitation Burn'],
        ['electric_burn', 'Electric Burn'],
        ['chemical_burn', 'Chemical Burn'],
        ['major_paediatric_burn', 'Major Paediatric Burn'],
        ['minor_paediatric_burn', 'Minor Paediatric Burn / TSS'],
        ['burn_scars', 'Burn Scars'],
        ['burn_dressings_skin_substitutes', 'Burn Dressings and Skin Substitutes']
      ]
    },
    'call-the-boss': {
      title: 'Call-The-Boss',
      topics: [
        ['call_boss_resus_burn', 'Resus Burn'],
        ['call_boss_electric_burn', 'Electric Burn'],
        ['call_boss_chemical_hf', 'Chemical / HF Burn'],
        ['call_boss_toxic_shock', 'Toxic Shock Syndrome'],
        ['call_boss_open_fracture', 'Open Fracture'],
        ['call_boss_compartment_syndrome', 'Compartment Syndrome'],
        ['call_boss_compromised_flap', 'Compromised Flap'],
        ['call_boss_nec_fasc', 'Necrotising Fasciitis'],
        ['call_boss_finger_replant', 'Finger Replant / Revascularisation'],
        ['call_boss_macro_replant', 'Macro Replant']
      ]
    },
    'consent': {
      title: 'Consent',
      topics: [
        ['consent_breast_reduction', 'Breast Reduction'],
        ['consent_diep', 'DIEP'],
        ['consent_skin_lesion', 'Skin Lesion Excision +/- Reconstruction'],
        ['consent_pinnaplasty', 'Pinnaplasty'],
        ['consent_pretibial', 'Pretibial Laceration'],
        ['consent_tendon_nerve', 'Tendon / Digital Nerve Repair']
      ]
    },
    'structured-topics': {
      title: 'Structured Interview',
      topics: [
        ['structured_research', 'Research'],
        ['structured_audit', 'Audit'],
        ['structured_teaching', 'Teaching'],
        ['structured_ethics', 'Ethics'],
        ['structured_risk_management', 'Risk Management'],
        ['structured_consent', 'Consent']
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
  // Format: prompts/{topicFolder}/{difficulty}_{topicFolder}_1.txt
  const promptFile = `prompts/${topicFolder}/${selectedDifficulty}_${topicFolder}_1.txt`;

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
    alert('Speech Recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.');
    log('ERROR: Speech Recognition not supported', 'error');
  } else {
    log('Speech Recognition available', 'success');
  }
});

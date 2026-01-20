// ============================================================================
// UI-HELPERS.JS - UI Utilities, Status Updates, and Voice Orb Animation
// ============================================================================
// Dependencies: none
// Functions: getRandomProcessingMessage, log, updateStatus, setOrbState
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


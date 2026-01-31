// ============================================================================
// UI-HELPERS.JS - UI Utilities, Status Updates, and Voice Orb Animation
// ============================================================================
// Dependencies: none
// Functions: getRandomProcessingMessage, log, updateStatus, setOrbState,
//           setPersona, transcript, openModelAnswerDrawer, closeModelAnswerDrawer
// ============================================================================

// ============================================================================
// PERSONA CONFIGURATION
// ============================================================================
// Note: Persona images should be placed in frontend/images/ folder
// For now, all difficulties use the same placeholder image
const PERSONA_DEFAULT_IMAGE = 'images/interviewer_persona_elliot.png'; // Use a valid persona as default

const PERSONA_CONFIG = {
  easy: {
    name: 'Mr John',
    title: 'Consultant Plastic Surgeon',
    image: 'images/interviewer_persona_john.png',
    fallbackImage: PERSONA_DEFAULT_IMAGE,
    voice: 'en-GB-Chirp3-HD-Fenrir',
    accentColor: '#10B981' // Emerald
  },
  medium: {
    name: 'Miss Elliot',
    title: 'Senior Examiner',
    image: 'images/interviewer_persona_elliot.png',
    fallbackImage: PERSONA_DEFAULT_IMAGE,
    voice: 'en-GB-Chirp3-HD-Kore',
    accentColor: '#F59E0B' // Amber
  },
  strict: {
    name: 'Mr Perry',
    title: 'Chief Examiner',
    image: 'images/interviewer_persona_perry.png',
    fallbackImage: PERSONA_DEFAULT_IMAGE,
    voice: 'en-GB-Chirp3-HD-Charon',
    accentColor: '#EF4444' // Red
  }
};

// Current persona (set on scenario selection)
let currentPersona = PERSONA_CONFIG.medium;

function setPersona(difficulty) {
  currentPersona = PERSONA_CONFIG[difficulty] || PERSONA_CONFIG.medium;

  const nameEl = document.getElementById('personaName');
  const titleEl = document.getElementById('personaTitle');
  const imageEl = document.getElementById('personaImage');

  if (nameEl) nameEl.textContent = currentPersona.name;
  if (titleEl) titleEl.textContent = currentPersona.title;
  if (imageEl) {
    // Try to load persona image, fallback to default placeholder
    imageEl.onerror = () => {
      imageEl.onerror = null; // Prevent infinite loop
      imageEl.src = currentPersona.fallbackImage || PERSONA_DEFAULT_IMAGE;
    };
    imageEl.src = currentPersona.image;
  }

  console.log('[Persona] Set to:', currentPersona.name);
}

function getPersonaName() {
  return currentPersona ? currentPersona.name : 'Examiner';
}

// ============================================================================
// TRANSCRIPT MANAGER
// ============================================================================
const transcript = {
  messages: [],

  addMessage(role, text) {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    this.messages.push({ role, text, timestamp });
    this.render();
  },

  addUserMessage(text) {
    this.addMessage('user', text);
  },

  addAIMessage(text) {
    this.addMessage('ai', text);
  },

  clear() {
    this.messages = [];
    this.render();
  },

  render() {
    const container = document.getElementById('transcriptMessages');
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = `
        <div class="transcript-empty">
          Conversation will appear here...
        </div>`;
      return;
    }

    const personaName = getPersonaName();

    container.innerHTML = this.messages.map(msg => `
      <div class="transcript-message ${msg.role === 'user' ? 'message-user' : 'message-ai'}">
        <div class="message-header">
          <span class="message-role">${msg.role === 'user' ? 'You' : personaName}</span>
          <span class="message-time">${msg.timestamp}</span>
        </div>
        <div class="message-text">${escapeHtml(msg.text)}</div>
      </div>
    `).join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  }
};

// Helper to escape HTML in transcript text
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export transcript globally for session.js integration
window.transcript = transcript;

// ============================================================================
// MODEL ANSWER DRAWER
// ============================================================================
function openModelAnswerDrawer(content) {
  const drawer = document.getElementById('modelAnswerDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const contentEl = document.getElementById('modelAnswerContent');

  if (content && contentEl) {
    // Parse markdown-like content (basic)
    const formattedContent = content
      .split('\n\n')
      .map(para => `<p>${para}</p>`)
      .join('');
    contentEl.innerHTML = formattedContent;
  }

  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('visible');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeModelAnswerDrawer() {
  const drawer = document.getElementById('modelAnswerDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('visible');

  // Restore body scroll
  document.body.style.overflow = '';
}

// ============================================================================
// WAVEFORM STATUS
// ============================================================================
function setWaveformStatus(text, visible = true) {
  const statusEl = document.getElementById('waveformStatus');
  if (statusEl) {
    statusEl.textContent = text;
    if (visible) {
      statusEl.classList.add('visible');
    } else {
      statusEl.classList.remove('visible');
    }
  }
}

// ============================================================================
// PERSONA PANEL STATE
// ============================================================================
function setPersonaPanelState(state) {
  const panel = document.getElementById('personaPanel');
  if (!panel) return;

  // Remove all state classes
  panel.classList.remove('ai-speaking', 'ai-thinking', 'breathing');

  switch (state) {
    case 'speaking':
      panel.classList.add('ai-speaking');
      setWaveformStatus('AI is speaking...', true);
      break;
    case 'thinking':
      panel.classList.add('ai-thinking');
      setWaveformStatus('Processing...', false);
      break;
    case 'idle':
    default:
      panel.classList.add('breathing');
      setWaveformStatus('', false);
      break;
  }
}

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
      // Remove all state classes first
      bubble.classList.remove('state-idle', 'state-listening', 'state-thinking', 'state-speaking');
      if (mobileBubble) {
        mobileBubble.classList.remove('state-idle', 'state-listening', 'state-thinking', 'state-speaking');
      }

      // Only show bubble when processing/thinking
      if (status === 'processing') {
        bubble.classList.add('visible', 'processing', 'state-thinking');
        if (mobileBubble) mobileBubble.classList.add('visible', 'processing', 'state-thinking');
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
  const bubble = document.getElementById('aiStatusBubble');
  const mobileBubble = document.getElementById('mobileAiStatusBubble');

  // Update orb state classes
  if (orb) {
    orb.classList.remove('idle', 'listening', 'thinking', 'speaking', 'processing');
    orb.classList.add(state);
  }

  if (mobileOrb) {
    mobileOrb.classList.remove('idle', 'listening', 'thinking', 'speaking', 'processing');
    mobileOrb.classList.add(state);
  }

  // Update status bubble state classes for accent line color
  if (bubble) {
    bubble.classList.remove('state-idle', 'state-listening', 'state-thinking', 'state-speaking');
    bubble.classList.add('state-' + state);
  }

  if (mobileBubble) {
    mobileBubble.classList.remove('state-idle', 'state-listening', 'state-thinking', 'state-speaking');
    mobileBubble.classList.add('state-' + state);
  }

  // Update persona panel state to match orb
  setPersonaPanelState(state);

  // Log state changes for debugging
  console.log('[Orb] State changed to:', state);
}


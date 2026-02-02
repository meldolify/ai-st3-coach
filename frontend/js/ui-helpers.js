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
    image: 'images/interviewer_persona_john.png',           // Mobile (portrait)
    imageWide: 'images/interviewer_persona_john_wide.png',  // Desktop (landscape)
    fallbackImage: PERSONA_DEFAULT_IMAGE,
    voice: 'en-GB-Chirp3-HD-Fenrir',
    accentColor: '#10B981' // Emerald
  },
  medium: {
    name: 'Miss Elliot',
    title: 'Senior Examiner',
    image: 'images/interviewer_persona_elliot.png',           // Mobile (portrait)
    imageWide: 'images/interviewer_persona_elliot_wide.png',  // Desktop (landscape)
    fallbackImage: PERSONA_DEFAULT_IMAGE,
    voice: 'en-GB-Chirp3-HD-Kore',
    accentColor: '#F59E0B' // Amber
  },
  strict: {
    name: 'Mr Perry',
    title: 'Chief Examiner',
    image: 'images/interviewer_persona_perry.png',           // Mobile (portrait)
    imageWide: 'images/interviewer_persona_perry_wide.png',  // Desktop (landscape)
    fallbackImage: PERSONA_DEFAULT_IMAGE,
    voice: 'en-GB-Chirp3-HD-Charon',
    accentColor: '#EF4444' // Red
  }
};

// Current persona (set on scenario selection)
let currentPersona = PERSONA_CONFIG.medium;

// Breakpoint for responsive images (matches CSS media query)
const PERSONA_BREAKPOINT = 768;

/**
 * Get the appropriate image source based on viewport width
 * Desktop (>768px): use wide landscape image
 * Mobile (≤768px): use portrait image
 */
function getResponsivePersonaImage(persona) {
  const isDesktop = window.innerWidth > PERSONA_BREAKPOINT;
  return isDesktop && persona.imageWide ? persona.imageWide : persona.image;
}

/**
 * Update desktop persona image based on current viewport
 * Called on setPersona and on window resize
 */
function updateDesktopPersonaImage() {
  if (!currentPersona) return;

  const imageEl = document.getElementById('personaImage');
  if (!imageEl) return;

  const newSrc = getResponsivePersonaImage(currentPersona);

  // Only update if source changed
  if (imageEl.src !== newSrc && !imageEl.src.endsWith(newSrc)) {
    imageEl.onerror = () => {
      imageEl.onerror = null;
      imageEl.src = currentPersona.fallbackImage || PERSONA_DEFAULT_IMAGE;
    };
    imageEl.src = newSrc;
    console.log('[Persona] Image updated for viewport:', window.innerWidth > PERSONA_BREAKPOINT ? 'desktop' : 'mobile');
  }
}

// Listen for viewport changes to switch between portrait/landscape
let resizeTimeout;
window.addEventListener('resize', () => {
  // Debounce resize handler
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateDesktopPersonaImage, 150);
});

function setPersona(difficulty) {
  currentPersona = PERSONA_CONFIG[difficulty] || PERSONA_CONFIG.medium;

  // Desktop persona elements
  const nameEl = document.getElementById('personaName');
  const titleEl = document.getElementById('personaTitle');
  const imageEl = document.getElementById('personaImage');

  // Mobile persona elements
  const mobileNameEl = document.getElementById('mobilePersonaName');
  const mobileTitleEl = document.getElementById('mobilePersonaTitle');
  const mobileImageEl = document.getElementById('mobilePersonaImage');

  // Update desktop elements
  if (nameEl) nameEl.textContent = currentPersona.name;
  if (titleEl) titleEl.textContent = currentPersona.title;
  if (imageEl) {
    // Use responsive image based on viewport width
    const imageSrc = getResponsivePersonaImage(currentPersona);
    imageEl.onerror = () => {
      imageEl.onerror = null;
      imageEl.src = currentPersona.fallbackImage || PERSONA_DEFAULT_IMAGE;
    };
    imageEl.src = imageSrc;
  }

  // Update mobile elements (always use portrait image)
  if (mobileNameEl) mobileNameEl.textContent = currentPersona.name;
  if (mobileTitleEl) mobileTitleEl.textContent = currentPersona.title;
  if (mobileImageEl) {
    mobileImageEl.onerror = () => {
      mobileImageEl.onerror = null;
      mobileImageEl.src = currentPersona.fallbackImage || PERSONA_DEFAULT_IMAGE;
    };
    mobileImageEl.src = currentPersona.image; // Always portrait for mobile
  }

  console.log('[Persona] Set to:', currentPersona.name, '| Image:', getResponsivePersonaImage(currentPersona));
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
    const mobileContainer = document.getElementById('mobileTranscriptMessages');

    if (this.messages.length === 0) {
      const emptyText = 'Conversation will appear here...';
      if (container) {
        container.textContent = '';
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'transcript-empty';
        emptyDiv.textContent = emptyText;
        container.appendChild(emptyDiv);
      }
      if (mobileContainer) {
        mobileContainer.textContent = '';
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'transcript-empty';
        emptyDiv.textContent = emptyText;
        mobileContainer.appendChild(emptyDiv);
      }
      return;
    }

    const personaName = getPersonaName();

    // Reverse messages so newest appears at top
    const reversedMessages = [...this.messages].reverse();

    // Desktop transcript - build using DOM methods for security
    if (container) {
      container.textContent = '';
      reversedMessages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `transcript-message ${msg.role === 'user' ? 'message-user' : 'message-ai'}`;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';

        const roleSpan = document.createElement('span');
        roleSpan.className = 'message-role';
        roleSpan.textContent = msg.role === 'user' ? 'You' : personaName;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = msg.timestamp;

        headerDiv.appendChild(roleSpan);
        headerDiv.appendChild(timeSpan);

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = msg.text;

        msgDiv.appendChild(headerDiv);
        msgDiv.appendChild(textDiv);
        container.appendChild(msgDiv);
      });
      // Newest is at top, so scroll to top
      container.scrollTop = 0;
    }

    // Mobile transcript - use original order since CSS column-reverse handles display
    if (mobileContainer) {
      mobileContainer.textContent = '';
      this.messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${msg.role}`;
        msgDiv.textContent = msg.text;
        mobileContainer.appendChild(msgDiv);
      });
      // With column-reverse CSS, scroll to top shows newest
      mobileContainer.scrollTop = 0;
    }
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

  // Update mobile orb status text (new thumb-zone layout)
  const mobileOrbStatus = document.getElementById('mobileAiStatus');
  if (mobileOrbStatus) {
    const stateLabels = {
      'idle': 'Ready',
      'listening': 'Listening...',
      'thinking': 'Thinking...',
      'speaking': 'Speaking...',
      'processing': 'Processing...'
    };
    mobileOrbStatus.textContent = stateLabels[state] || 'Ready';
    mobileOrbStatus.classList.remove('listening', 'speaking', 'thinking');
    if (state === 'listening' || state === 'speaking' || state === 'thinking') {
      mobileOrbStatus.classList.add(state);
    }
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

// ============================================================================
// SESSION SUMMARY SCREEN
// ============================================================================

/**
 * Score labels for each score value
 */
const SCORE_LABELS = {
  1: 'Needs Improvement',
  2: 'Below Expected',
  3: 'Meets Standard',
  4: 'Above Expected',
  5: 'Exceptional'
};

/**
 * Show the session summary screen with feedback data
 * @param {Object} feedback - Feedback object from backend
 * @param {number} feedback.score - Score from 1-5
 * @param {string[]} feedback.strengths - Array of strength points
 * @param {string[]} feedback.improvements - Array of improvement points
 * @param {string} feedback.summary - Summary text
 * @param {Object} scenarioInfo - Current scenario information
 * @param {string} scenarioInfo.name - Scenario name
 * @param {string} scenarioInfo.difficulty - Difficulty level
 */
function showSummaryScreen(feedback, scenarioInfo) {
  console.log('[Summary] Showing summary screen with feedback:', feedback);

  // Get elements
  const summaryPage = document.getElementById('sessionSummary');
  const scoreCircle = document.getElementById('summaryScoreCircle');
  const scoreValue = document.getElementById('summaryScoreValue');
  const scoreLabel = document.getElementById('summaryScoreLabel');
  const scenarioNameEl = document.getElementById('summaryScenarioName');
  const strengthsList = document.getElementById('summaryStrengthsList');
  const improvementsList = document.getElementById('summaryImprovementsList');
  const summaryText = document.getElementById('summaryText');

  if (!summaryPage) {
    console.error('[Summary] Summary page not found');
    return;
  }

  // Set scenario name
  if (scenarioNameEl && scenarioInfo) {
    const difficultyLabel = scenarioInfo.difficulty ?
      scenarioInfo.difficulty.charAt(0).toUpperCase() + scenarioInfo.difficulty.slice(1) : '';
    scenarioNameEl.textContent = `${scenarioInfo.name || 'Interview Session'}${difficultyLabel ? ' (' + difficultyLabel + ')' : ''}`;
  }

  // Handle null feedback (timeout case)
  if (!feedback) {
    feedback = {
      score: 3,
      strengths: ['Session completed'],
      improvements: ['Feedback unavailable - please try again'],
      summary: 'Unable to generate detailed feedback. Your session was recorded successfully.'
    };
  }

  // Set score with color coding
  const score = Math.min(5, Math.max(1, feedback.score || 3));
  if (scoreValue) scoreValue.textContent = score;
  if (scoreLabel) scoreLabel.textContent = SCORE_LABELS[score] || 'Meets Standard';

  // Set score circle color class
  if (scoreCircle) {
    scoreCircle.classList.remove('summary-score-circle--low', 'summary-score-circle--medium', 'summary-score-circle--high');
    if (score <= 2) {
      scoreCircle.classList.add('summary-score-circle--low');
    } else if (score === 3) {
      scoreCircle.classList.add('summary-score-circle--medium');
    } else {
      scoreCircle.classList.add('summary-score-circle--high');
    }
  }

  // Populate strengths list (clear and rebuild safely)
  if (strengthsList) {
    while (strengthsList.firstChild) {
      strengthsList.removeChild(strengthsList.firstChild);
    }
    const strengths = feedback.strengths || ['Good effort'];
    strengths.forEach(strength => {
      const li = document.createElement('li');
      li.textContent = strength;
      strengthsList.appendChild(li);
    });
  }

  // Populate improvements list (clear and rebuild safely)
  if (improvementsList) {
    while (improvementsList.firstChild) {
      improvementsList.removeChild(improvementsList.firstChild);
    }
    const improvements = feedback.improvements || ['Continue practicing'];
    improvements.forEach(improvement => {
      const li = document.createElement('li');
      li.textContent = improvement;
      improvementsList.appendChild(li);
    });
  }

  // Set summary text
  if (summaryText) {
    summaryText.textContent = feedback.summary || 'Session completed successfully.';
  }

  // Hide all other pages and show summary
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    page.style.display = 'none';
  });

  summaryPage.style.display = 'flex';
  summaryPage.classList.add('active');

  // Wire up button handlers
  const retryBtn = document.getElementById('summaryRetryBtn');
  const newScenarioBtn = document.getElementById('summaryNewScenarioBtn');
  const exitBtn = document.getElementById('summaryExitBtn');

  if (retryBtn) {
    retryBtn.onclick = () => {
      hideSummaryScreen();
      // Re-enter simulation room with same scenario
      // currentScenario is a global variable from state.js
      if (typeof startScenario === 'function' && typeof currentScenario !== 'undefined' && currentScenario) {
        startScenario(currentScenario);
      } else {
        // Fallback to showing simulation room
        transitionToPage('sessionSummary', 'simulationRoom');
      }
    };
  }

  if (newScenarioBtn) {
    newScenarioBtn.onclick = () => {
      hideSummaryScreen();
      transitionToPage('sessionSummary', 'scenarioSelection');
    };
  }

  if (exitBtn) {
    exitBtn.onclick = () => {
      hideSummaryScreen();
      transitionToPage('sessionSummary', 'specialtySelection');
    };
  }

  console.log('[Summary] Summary screen displayed');
}

/**
 * Hide the summary screen
 */
function hideSummaryScreen() {
  const summaryPage = document.getElementById('sessionSummary');
  if (summaryPage) {
    summaryPage.classList.remove('active');
    summaryPage.style.display = 'none';
  }
}


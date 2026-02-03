// ============================================================================
// SIMULATION-APP.JS - Entry point for simulation.html
// ============================================================================
// This file initializes the simulation room as a standalone page.
// It loads simulation params from sessionStorage and sets up the session.
// ============================================================================

/**
 * Load simulation parameters from sessionStorage
 * @returns {Object|null} Simulation params or null if not found
 */
function loadSimulationParams() {
  const paramsJson = sessionStorage.getItem('simulationParams');
  if (!paramsJson) {
    return null;
  }
  try {
    return JSON.parse(paramsJson);
  } catch (e) {
    console.error('[SimulationApp] Error parsing simulation params:', e);
    return null;
  }
}

/**
 * Handle logo click in simulation page header
 * Shows exit modal if session is active, otherwise navigates to index
 */
function handleSimulationLogoClick() {
  if (window.session && window.session.isConnected) {
    // Show exit modal
    if (typeof showSessionExitModal === 'function') {
      showSessionExitModal();
    }
  } else {
    // No active session, navigate directly
    sessionStorage.removeItem('simulationParams');
    window.location.href = '/';
  }
}

/**
 * Navigate to profile page from simulation
 */
function navigateToProfile() {
  if (window.session && window.session.isConnected) {
    // Show exit modal first
    if (typeof showSessionExitModal === 'function') {
      showSessionExitModal();
    }
  } else {
    sessionStorage.removeItem('simulationParams');
    window.location.href = '/#profilePage';
  }
}

/**
 * Navigate to scenario selection page
 * Shows exit modal if session is active
 */
function navigateToScenarioSelection() {
  if (window.session && window.session.isConnected) {
    // Store pending navigation for after modal
    window.pendingNavigation = 'scenarioSelection';
    if (typeof showSessionExitModal === 'function') {
      showSessionExitModal();
    }
  } else {
    sessionStorage.removeItem('simulationParams');
    window.location.href = '/#scenarioSelection';
  }
}

/**
 * Navigate to difficulty selection page
 * Shows exit modal if session is active
 */
function navigateToDifficultySelection() {
  if (window.session && window.session.isConnected) {
    // Store pending navigation for after modal
    window.pendingNavigation = 'difficultySelection';
    if (typeof showSessionExitModal === 'function') {
      showSessionExitModal();
    }
  } else {
    sessionStorage.removeItem('simulationParams');
    window.location.href = '/#difficultySelection';
  }
}

/**
 * Exit simulation and return to index.html
 * This overrides the exitSimulation() from scenarios.js for page-based navigation
 */
function exitSimulation() {
  if (window.session && window.session.isConnected) {
    // Show exit confirmation modal
    if (typeof showSessionExitModal === 'function') {
      showSessionExitModal();
      return;
    }
  }

  // No active session or modal not available - navigate directly
  sessionStorage.removeItem('simulationParams');
  window.location.href = '/#scenarioSelection';
}

/**
 * Initialize the simulation room with loaded parameters
 */
function initializeSimulationRoom() {
  const params = loadSimulationParams();
  if (!params || !params.scenario) {
    console.error('[SimulationApp] No valid simulation params');
    return;
  }

  // Restore global state from params
  currentScenario = params.scenario;
  selectedDifficulty = params.difficulty || 'easy';
  selectedMode = params.mode || 'practice';

  console.log('[SimulationApp] Loaded scenario:', currentScenario.title);
  console.log('[SimulationApp] Difficulty:', selectedDifficulty);

  // Set scenario info in UI
  const scenarioTitleEl = document.getElementById('currentScenarioTitle');
  const scenarioCategoryEl = document.getElementById('currentScenarioCategory');
  const mobileTitleEl = document.getElementById('mobileScenarioTitle');

  if (scenarioTitleEl) {
    scenarioTitleEl.textContent = currentScenario.title || 'Scenario';
  }
  if (scenarioCategoryEl) {
    scenarioCategoryEl.textContent = currentScenario.category || '';
  }
  if (mobileTitleEl) {
    mobileTitleEl.textContent = currentScenario.title || 'Scenario';
  }

  // Set persona based on difficulty
  if (typeof setPersona === 'function') {
    setPersona(selectedDifficulty);
  }

  // Load clinical image if available
  if (currentScenario.imageFile) {
    loadClinicalImage(currentScenario.imageFile);
  }

  // Initialize sidebar
  if (typeof initSimSidebar === 'function') {
    initSimSidebar();
  }
  if (typeof expandToCurrentScenario === 'function') {
    expandToCurrentScenario(currentScenario.promptFile);
  }

  // Initialize mobile sidebar
  if (typeof initMobileSidebar === 'function') {
    initMobileSidebar();
  }

  // Setup button handlers
  setupSimulationButtons();

  // Initialize mock exam timer if in mock mode
  if (params.mode === 'mock-exam' && typeof initMockExamTimer === 'function') {
    initMockExamTimer();
  }

  // Show the header
  const header = document.getElementById('appHeader');
  if (header) {
    header.style.display = 'flex';
    document.body.classList.add('has-header');
  }
}

/**
 * Load and display clinical image
 */
function loadClinicalImage(imageFile) {
  const clinicalImage = document.getElementById('clinicalImage');
  const mobileClinicalImage = document.getElementById('mobileClinicalImage');
  const noImagePlaceholder = document.getElementById('noImagePlaceholder');
  const mobileNoImagePlaceholder = document.getElementById('mobileNoImagePlaceholder');
  const imageSection = document.getElementById('imageSection');
  const mobileImageSection = document.getElementById('mobileImageSection');

  if (!imageFile) {
    // No image - show placeholder
    if (clinicalImage) clinicalImage.classList.add('initially-hidden');
    if (mobileClinicalImage) mobileClinicalImage.classList.add('initially-hidden');
    if (noImagePlaceholder) noImagePlaceholder.style.display = 'flex';
    if (mobileNoImagePlaceholder) mobileNoImagePlaceholder.style.display = 'flex';
    return;
  }

  const imagePath = imageFile.startsWith('images/') ? imageFile : `images/${imageFile}`;

  // Set up load handlers
  if (clinicalImage) {
    clinicalImage.onload = () => {
      clinicalImage.classList.remove('initially-hidden');
      if (noImagePlaceholder) noImagePlaceholder.style.display = 'none';
      if (imageSection) imageSection.classList.add('visible');
    };
    clinicalImage.onerror = () => {
      clinicalImage.classList.add('initially-hidden');
      if (noImagePlaceholder) noImagePlaceholder.style.display = 'flex';
    };
    clinicalImage.src = imagePath;
  }

  if (mobileClinicalImage) {
    mobileClinicalImage.onload = () => {
      mobileClinicalImage.classList.remove('initially-hidden');
      if (mobileNoImagePlaceholder) mobileNoImagePlaceholder.style.display = 'none';
      if (mobileImageSection) mobileImageSection.classList.add('visible');
    };
    mobileClinicalImage.onerror = () => {
      mobileClinicalImage.classList.add('initially-hidden');
      if (mobileNoImagePlaceholder) mobileNoImagePlaceholder.style.display = 'flex';
    };
    mobileClinicalImage.src = imagePath;
  }
}

/**
 * Setup simulation control button handlers
 */
function setupSimulationButtons() {
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const interruptBtn = document.getElementById('interruptBtn');
  const mobileConnectBtn = document.getElementById('mobileConnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');
  const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');

  // Connect button
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      await handleConnect();
    });
  }

  // Disconnect button
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', async () => {
      await endSessionWithFeedback();
    });
  }

  // Interrupt button
  if (interruptBtn) {
    interruptBtn.addEventListener('click', () => {
      if (session && session.audioPlayer && session.audioPlayer.isPlaying) {
        session.audioPlayer.interrupt();
        session.ws.send(JSON.stringify({ type: 'user_speaking', sessionId: session.sessionId }));
        if (typeof setOrbState === 'function') {
          setOrbState('listening');
        }
      }
    });
  }

  // Mobile buttons - sync with desktop
  if (mobileConnectBtn && connectBtn) {
    mobileConnectBtn.addEventListener('click', () => connectBtn.click());
  }
  if (mobileDisconnectBtn && disconnectBtn) {
    mobileDisconnectBtn.addEventListener('click', () => disconnectBtn.click());
  }
  if (mobileInterruptBtn && interruptBtn) {
    mobileInterruptBtn.addEventListener('click', () => interruptBtn.click());
  }
}

/**
 * Handle connect button click
 */
async function handleConnect() {
  if (!currentScenario || !currentScenario.promptFile) {
    console.error('[SimulationApp] No scenario loaded');
    return;
  }

  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const interruptBtn = document.getElementById('interruptBtn');

  try {
    // Create session
    session = new V4Session(CONFIG.BACKEND_URL, currentScenario.promptFile, selectedDifficulty);
    window.session = session;

    await session.connect();
    session.startListening();

    // Update button states
    if (connectBtn) connectBtn.disabled = true;
    if (disconnectBtn) disconnectBtn.disabled = false;
    if (interruptBtn) {
      interruptBtn.classList.remove('initially-hidden');
      interruptBtn.disabled = false;
    }

    // Sync mobile buttons
    if (typeof syncMobileButtonStates === 'function') {
      syncMobileButtonStates();
    }

    // Log session start
    if (typeof logSessionStart === 'function') {
      await logSessionStart();
    }

    console.log('[SimulationApp] Session connected');
    if (typeof log === 'function') {
      log('Session ready! Voice detection active - just speak naturally.', 'success');
    }

  } catch (error) {
    console.error('[SimulationApp] Connection failed:', error);
    if (typeof log === 'function') {
      log('Connection failed: ' + error.message, 'error');
    }
  }
}

/**
 * End session with feedback and show summary
 * Adapted for page-based navigation
 */
async function endSessionWithFeedback() {
  if (!window.session || !window.session.isConnected) {
    console.warn('[SimulationApp] No active session');
    return;
  }

  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');

  // Update button states to show loading
  if (disconnectBtn) {
    disconnectBtn.disabled = true;
    const textEl = disconnectBtn.querySelector('.sim-ctrl-btn__text');
    if (textEl) textEl.textContent = 'Ending...';
  }
  if (mobileDisconnectBtn) {
    mobileDisconnectBtn.disabled = true;
    const textEl = mobileDisconnectBtn.querySelector('.sim-ctrl-btn__text');
    if (textEl) textEl.textContent = 'Ending...';
  }

  // Request feedback
  let feedback = null;
  try {
    feedback = await window.session.requestFeedbackAndDisconnect();
  } catch (error) {
    console.error('[SimulationApp] Error getting feedback:', error);
    if (window.session) {
      window.session.disconnect();
    }
  }

  // Save feedback to database
  if (feedback && typeof logSessionFeedback === 'function') {
    await logSessionFeedback(feedback);
  }

  // Log session end
  if (typeof logSessionEnd === 'function') {
    await logSessionEnd();
  }

  // Reset button states
  if (disconnectBtn) {
    disconnectBtn.disabled = true;
    const textEl = disconnectBtn.querySelector('.sim-ctrl-btn__text');
    if (textEl) textEl.textContent = 'End';
  }
  if (mobileDisconnectBtn) {
    mobileDisconnectBtn.disabled = true;
    const textEl = mobileDisconnectBtn.querySelector('.sim-ctrl-btn__text');
    if (textEl) textEl.textContent = 'End';
  }

  // Enable connect button
  const connectBtn = document.getElementById('connectBtn');
  if (connectBtn) connectBtn.disabled = false;

  if (typeof syncMobileButtonStates === 'function') {
    syncMobileButtonStates();
  }
  if (typeof setOrbState === 'function') {
    setOrbState('idle');
  }

  // Clear session reference
  window.session = null;
  session = null;

  // Show summary screen with page-based navigation handlers
  showSimulationSummary(feedback);

  console.log('[SimulationApp] Session ended with feedback');
}

/**
 * Show summary screen with page-based navigation
 */
function showSimulationSummary(feedback) {
  const summaryPage = document.getElementById('sessionSummary');
  const simulationRoom = document.getElementById('simulationRoom');

  if (!summaryPage) {
    console.error('[SimulationApp] Summary page not found');
    return;
  }

  // Use the existing showSummaryScreen if available
  const scenarioInfo = {
    name: currentScenario?.title || 'Interview Session',
    difficulty: selectedDifficulty || ''
  };

  if (typeof showSummaryScreen === 'function') {
    showSummaryScreen(feedback, scenarioInfo);
  }

  // Override button handlers for page-based navigation
  const retryBtn = document.getElementById('summaryRetryBtn');
  const newScenarioBtn = document.getElementById('summaryNewScenarioBtn');
  const exitBtn = document.getElementById('summaryExitBtn');

  if (retryBtn) {
    retryBtn.onclick = () => {
      // Reload the page to restart same scenario (params still in sessionStorage)
      window.location.reload();
    };
  }

  if (newScenarioBtn) {
    newScenarioBtn.onclick = () => {
      // Clear params and go to scenario selection
      sessionStorage.removeItem('simulationParams');
      window.location.href = '/#scenarioSelection';
    };
  }

  if (exitBtn) {
    exitBtn.onclick = () => {
      // Clear params and go to landing
      sessionStorage.removeItem('simulationParams');
      window.location.href = '/';
    };
  }
}

/**
 * Show session exit modal with page-based navigation
 */
function showSessionExitModal() {
  const modal = document.getElementById('sessionExitModal');
  const continueBtn = document.getElementById('modalContinueBtn');
  const endBtn = document.getElementById('modalEndBtn');
  const backdrop = modal?.querySelector('.session-exit-modal__backdrop');

  if (!modal) {
    console.error('[SimulationApp] Exit modal not found');
    return;
  }

  modal.classList.add('active');

  // Continue button - just close modal
  if (continueBtn) {
    continueBtn.onclick = () => {
      modal.classList.remove('active');
    };
  }

  // End button - get feedback then show summary
  if (endBtn) {
    endBtn.onclick = async () => {
      modal.classList.remove('active');
      await endSessionWithFeedback();
    };
  }

  // Backdrop click - same as continue
  if (backdrop) {
    backdrop.onclick = () => {
      modal.classList.remove('active');
    };
  }
}

/**
 * Create transcript element safely using DOM methods
 */
function createTranscriptMessage(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `transcript-message transcript-message--${role}`;

  const roleSpan = document.createElement('span');
  roleSpan.className = 'transcript-role';
  roleSpan.textContent = role === 'user' ? 'You' : 'Examiner';

  const textP = document.createElement('p');
  textP.className = 'transcript-text';
  textP.textContent = text;

  messageDiv.appendChild(roleSpan);
  messageDiv.appendChild(textP);

  return messageDiv;
}

/**
 * Create empty transcript placeholder using DOM methods
 */
function createTranscriptEmpty() {
  const emptyDiv = document.createElement('div');
  emptyDiv.className = 'transcript-empty';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('opacity', '0.4');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
  svg.appendChild(path);

  const span = document.createElement('span');
  span.textContent = 'Conversation will appear here...';

  emptyDiv.appendChild(svg);
  emptyDiv.appendChild(span);

  return emptyDiv;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[SimulationApp] Initializing...');

  // Check for simulation params
  const params = loadSimulationParams();
  if (!params) {
    console.error('[SimulationApp] No simulation params found, redirecting to index');
    window.location.href = '/';
    return;
  }

  console.log('[SimulationApp] Loaded params:', params);

  // Initialize Supabase and check auth
  if (typeof initSupabase === 'function') {
    initSupabase();
  }

  if (typeof checkAuthState === 'function') {
    try {
      await checkAuthState();
    } catch (error) {
      console.error('[SimulationApp] Auth check failed:', error);
    }
  }

  // VERIFY ACCESS: Check if user can access this scenario
  if (typeof canAccessScenario === 'function' && params.scenario?.promptFile) {
    const hasAccess = canAccessScenario(params.scenario.promptFile);
    if (!hasAccess) {
      console.warn('[SimulationApp] Access denied to scenario:', params.scenario.promptFile);
      sessionStorage.removeItem('simulationParams');
      window.location.href = '/#accessDenied';
      return;
    }
    console.log('[SimulationApp] Access verified for scenario');
  }

  // Initialize the simulation room
  initializeSimulationRoom();

  // Initialize orb visualizer
  if (typeof initOrb === 'function') {
    initOrb();
  }

  // Initialize transcript using safe DOM methods
  if (typeof window.transcript === 'undefined') {
    window.transcript = {
      messages: [],
      add: function(role, text) {
        this.messages.push({ role, text, timestamp: Date.now() });
        this.render();
      },
      clear: function() {
        this.messages = [];
        this.render();
      },
      render: function() {
        const container = document.getElementById('transcriptMessages');
        const mobileContainer = document.getElementById('mobileTranscriptMessages');

        if (!container) return;

        // Clear existing content safely
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        if (this.messages.length === 0) {
          container.appendChild(createTranscriptEmpty());
          if (mobileContainer) {
            while (mobileContainer.firstChild) {
              mobileContainer.removeChild(mobileContainer.firstChild);
            }
            mobileContainer.appendChild(createTranscriptEmpty());
          }
          return;
        }

        // Build messages using DOM methods
        this.messages.forEach(msg => {
          container.appendChild(createTranscriptMessage(msg.role, msg.text));
        });

        if (mobileContainer) {
          while (mobileContainer.firstChild) {
            mobileContainer.removeChild(mobileContainer.firstChild);
          }
          this.messages.forEach(msg => {
            mobileContainer.appendChild(createTranscriptMessage(msg.role, msg.text));
          });
        }

        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
        if (mobileContainer) {
          mobileContainer.scrollTop = mobileContainer.scrollHeight;
        }
      }
    };
  }

  // Hide loading overlay
  if (typeof hideLoadingOverlay === 'function') {
    hideLoadingOverlay();
  } else {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }
  }

  console.log('[SimulationApp] Initialization complete');
});

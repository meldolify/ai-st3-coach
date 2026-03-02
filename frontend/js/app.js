// ============================================================================
// APP.JS - Application Entry Point and Event Listeners
// ============================================================================
// Dependencies: All other JS files must be loaded before this one
// This file contains: Page transitions, button event handlers, DOMContentLoaded,
//                     scroll animations, browser compatibility check
// Load Order: state.js -> browser-detect.js -> config.js -> auth.js -> subscription.js
//             -> tracking.js -> speech.js -> vad/*.js -> session.js -> ui-helpers.js
//             -> scenarios.js -> app.js
// ============================================================================

// Note: selectedSpecialty and selectedDifficulty are in state.js

// ============================================================================
// BROWSER COMPATIBILITY WARNING BANNER
// ============================================================================

const BROWSER_WARNING_DISMISSED_KEY = 'browserWarningDismissed';

/**
 * Show browser compatibility warning if needed
 */
function showBrowserWarningIfNeeded() {
  // Check if warning was previously dismissed
  const dismissed = localStorage.getItem(BROWSER_WARNING_DISMISSED_KEY);
  if (dismissed === 'true') {
    console.log('[BrowserWarning] Previously dismissed by user');
    return;
  }

  // Use BrowserDetect to check if we should show warning
  if (!window.BrowserDetect) {
    console.warn('[BrowserWarning] BrowserDetect not available');
    return;
  }

  const warning = BrowserDetect.getWarning();
  if (!warning) {
    console.log('[BrowserWarning] No warning needed for this browser');
    return;
  }

  // Show the warning banner
  const banner = document.getElementById('browserWarningBanner');
  const title = document.getElementById('browserWarningTitle');
  const message = document.getElementById('browserWarningMessage');

  if (!banner || !title || !message) {
    console.warn('[BrowserWarning] Banner elements not found');
    return;
  }

  // Set content
  title.textContent = warning.title;
  message.textContent = warning.message;

  // Set type class (warning, error, info)
  banner.classList.remove('warning', 'error', 'info');
  banner.classList.add(warning.type || 'warning');

  // Show banner with animation
  banner.style.display = 'block';
  // Force reflow for animation
  banner.offsetHeight;
  banner.classList.add('visible');

  console.log(`[BrowserWarning] Showing ${warning.type} banner:`, warning.title);
}

/**
 * Dismiss browser warning banner
 */
function dismissBrowserWarning() {
  const banner = document.getElementById('browserWarningBanner');
  if (!banner) return;

  // Animate out
  banner.classList.remove('visible');

  // Hide after animation
  setTimeout(() => {
    banner.style.display = 'none';
  }, 300);

  // Remember dismissal
  localStorage.setItem(BROWSER_WARNING_DISMISSED_KEY, 'true');
  console.log('[BrowserWarning] Dismissed by user');
}

// Make dismissBrowserWarning available globally (called from HTML onclick)
window.dismissBrowserWarning = dismissBrowserWarning;

// ============================================================================
// FOOTER VISIBILITY CONTROL
// ============================================================================
// Pages that should show the footer: simulationRoom, scenarioSelection
// Pages that should hide the footer: landingPage, authPage, modeSelection, etc.

function showAppFooter() {
  const footer = document.getElementById('appFooter');
  if (footer) footer.classList.add('visible');
}

function hideAppFooter() {
  const footer = document.getElementById('appFooter');
  if (footer) footer.classList.remove('visible');
}

// Helper function to transition between pages with fade effect
function transitionToPage(fromPageId, toPageId, callback) {
  const fromPage = document.getElementById(fromPageId);
  const toPage = document.getElementById(toPageId);

  // Pages that should show the app footer
  const pagesWithFooter = ['simulationRoom', 'scenarioSelection'];

  // All navigable pages - ensure only one is visible at a time
  const allPages = [
    'landingPage', 'authPage', 'profilePage', 'specialtySelection',
    'difficultySelection', 'modeSelection', 'mockTypeSelection',
    'stationTypeSelection', 'scenarioSelection', 'simulationRoom',
    'sessionSummary'
  ];

  // Fade out current page
  fromPage.classList.add('fade-out');

  setTimeout(() => {
    // Hide ALL pages first to prevent stacking issues
    allPages.forEach(pageId => {
      const page = document.getElementById(pageId);
      if (page && pageId !== toPageId) {
        page.style.display = 'none';
        page.classList.remove('fade-out', 'fade-in', 'active');
      }
    });

    // Show new page - must set inline style to override hideAllPages()
    // (inline styles have higher specificity than CSS classes)
    toPage.style.display = 'block';
    toPage.classList.add('fade-in');

    // Handle footer visibility based on destination page
    if (pagesWithFooter.includes(toPageId)) {
      showAppFooter();
    } else {
      hideAppFooter();
    }

    // Initialize WebGL effects for difficulty selection page
    if (toPageId === 'difficultySelection' && typeof initDifficultyPersonaEffects === 'function') {
      // Delay to ensure layout is complete
      setTimeout(() => {
        if (!window.difficultyPersonaEffect) {
          initDifficultyPersonaEffects();
        }
      }, 200);
    }

    // Cleanup WebGL effects when leaving difficulty selection
    if (fromPageId === 'difficultySelection' && typeof cleanupDifficultyPersonaEffects === 'function') {
      cleanupDifficultyPersonaEffects();
    }

    // Execute callback if provided
    if (callback) callback();

    // Remove fade-in class after animation
    setTimeout(() => {
      toPage.classList.remove('fade-in');
    }, 500);
  }, 500); // Match CSS transition duration
}

// ============================================================================
// SESSION EXIT MODAL & NAVIGATION GATE
// ============================================================================

/**
 * Pending navigation callback - stored when user needs to confirm session exit
 */
let pendingNavigationCallback = null;

/**
 * Show the session exit confirmation modal
 * @param {Function} onConfirm - Callback when user confirms exit
 * @param {Function} onCancel - Callback when user cancels (optional)
 */
function showSessionExitModal(onConfirm, onCancel) {
  const modal = document.getElementById('sessionExitModal');
  const backdrop = modal?.querySelector('.session-exit-modal__backdrop');
  const continueBtn = document.getElementById('modalContinueBtn');
  const endBtn = document.getElementById('modalEndBtn');

  if (!modal) {
    console.error('[SessionExitModal] Modal element not found');
    // Fallback: just run the confirm callback
    if (onConfirm) onConfirm();
    return;
  }

  // Store the pending callback
  pendingNavigationCallback = onConfirm;

  // Show modal
  modal.classList.add('active');

  // Handle continue button (cancel exit)
  const handleContinue = () => {
    hideSessionExitModal();
    pendingNavigationCallback = null;
    if (onCancel) onCancel();
  };

  // Handle end button (confirm exit)
  const handleEnd = async () => {
    hideSessionExitModal();

    // Show loading state
    if (endBtn) {
      endBtn.disabled = true;
      endBtn.textContent = 'Getting Feedback...';
    }

    // Request feedback and disconnect
    let feedback = null;
    if (window.session && window.session.isConnected) {
      try {
        feedback = await window.session.requestFeedbackAndDisconnect();
      } catch (error) {
        console.error('[SessionExitModal] Error getting feedback:', error);
      }
    }

    // Reset button state
    if (endBtn) {
      endBtn.disabled = false;
      endBtn.textContent = 'End & Get Feedback';
    }

    // Show summary screen with feedback
    // currentScenario and selectedDifficulty are global variables from state.js
    if (typeof showSummaryScreen === 'function') {
      const scenarioInfo = {
        name: (typeof currentScenario !== 'undefined' && currentScenario?.title) || 'Interview Session',
        difficulty: selectedDifficulty || ''
      };
      showSummaryScreen(feedback, scenarioInfo);
    }

    pendingNavigationCallback = null;
  };

  // Handle backdrop click (same as continue)
  const handleBackdropClick = () => {
    handleContinue();
  };

  // Remove old listeners and add new ones
  if (continueBtn) {
    continueBtn.onclick = handleContinue;
  }
  if (endBtn) {
    endBtn.onclick = handleEnd;
  }
  if (backdrop) {
    backdrop.onclick = handleBackdropClick;
  }
}

/**
 * Hide the session exit confirmation modal
 */
function hideSessionExitModal() {
  const modal = document.getElementById('sessionExitModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Navigation gate that checks for active session before navigating
 * If session is active, shows confirmation modal
 * @param {string} fromPageId - Current page ID
 * @param {string} toPageId - Target page ID
 * @param {Function} callback - Optional callback after navigation
 */
function navigateWithSessionCheck(fromPageId, toPageId, callback) {
  // Check if there's an active session
  if (window.session && window.session.isConnected) {
    console.log('[NavigationGate] Active session detected, showing exit modal');
    showSessionExitModal(
      // On confirm: user will see summary screen, then can navigate
      null,
      // On cancel: do nothing, stay in session
      null
    );
    return;
  }

  // No active session, proceed with navigation
  transitionToPage(fromPageId, toPageId, callback);
}

/**
 * Request feedback and show summary screen (for disconnect button)
 * @returns {Promise<void>}
 */
async function endSessionWithFeedback() {
  if (!window.session || !window.session.isConnected) {
    console.warn('[EndSession] No active session');
    return;
  }

  // Update button states to show loading
  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');

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
    console.error('[EndSession] Error getting feedback:', error);
    // Ensure session is disconnected even on error
    if (window.session) {
      window.session.disconnect();
    }
  }

  // Save feedback to database
  if (feedback && typeof logSessionFeedback === 'function') {
    await logSessionFeedback(feedback);
  }

  // Log session end for analytics
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

  syncMobileButtonStates();
  setOrbState('idle');

  // Clear session reference
  window.session = null;
  session = null;

  // Show summary screen
  // currentScenario and selectedDifficulty are global variables from state.js
  if (typeof showSummaryScreen === 'function') {
    const scenarioInfo = {
      name: (typeof currentScenario !== 'undefined' && currentScenario?.title) || 'Interview Session',
      difficulty: selectedDifficulty || ''
    };
    showSummaryScreen(feedback, scenarioInfo);
  }

  log('Session ended with feedback', 'info');
}

function selectSpecialty(specialty) {
  selectedSpecialty = specialty;
  transitionToPage('specialtySelection', 'difficultySelection');
  log('Selected specialty: ' + specialty, 'info');
}

function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;

  // Update difficulty indicators on all pages that show it
  updateAllDifficultyIndicators(difficulty);

  // Go to Mode Selection instead of directly to Scenario Selection
  transitionToPage('difficultySelection', 'modeSelection');
  log('Selected difficulty: ' + difficulty, 'info');
}

// Handle gradient card click for difficulty selection
// Desktop: click directly selects
// Mobile: first tap expands, second tap (on button) selects
function handleCardClick(cardElement, difficulty) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileView = window.innerWidth <= 768;

  if (isTouchDevice && isMobileView) {
    // Mobile: toggle expanded state
    const allCards = document.querySelectorAll('.gradient-card');
    const isAlreadyExpanded = cardElement.classList.contains('expanded');

    // Collapse all cards first
    allCards.forEach(card => card.classList.remove('expanded'));

    // If this card wasn't expanded, expand it now
    if (!isAlreadyExpanded) {
      cardElement.classList.add('expanded');
    }
    // If it was already expanded, user tapped again - they should use the button
  } else {
    // Desktop: click directly selects
    selectDifficulty(difficulty);
  }
}

// Helper to update difficulty indicator on multiple pages
function updateAllDifficultyIndicators(difficulty) {
  const difficultyEmoji = {
    'easy': '🟢',
    'medium': '🟡',
    'strict': '🔴'
  };
  const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const indicatorText = `${difficultyEmoji[difficulty]} ${difficultyName} Mode`;
  const indicatorColor = difficulty === 'easy' ? '#059669' : difficulty === 'medium' ? '#d97706' : '#dc2626';

  // Update all difficulty indicators (matching actual HTML IDs)
  const indicatorIds = [
    'selectedDifficultyIndicator',
    'selectedDifficultyIndicatorMobile',
    'modeSelectedDifficultyIndicator',
    'mockTypeSelectedDifficultyIndicator',
    'stationTypeSelectedDifficultyIndicator'
  ];

  indicatorIds.forEach(id => {
    const indicator = document.getElementById(id);
    if (indicator) {
      indicator.textContent = indicatorText;
      indicator.style.color = indicatorColor;
    }
  });
}

// ============================================================================
// MODE SELECTION NAVIGATION
// ============================================================================

function selectMode(mode) {
  selectedMode = mode;

  if (mode === 'practice') {
    // Practice mode goes to existing scenario selection
    transitionToPage('modeSelection', 'scenarioSelection');
    log('Selected mode: Practice', 'info');
  } else if (mode === 'mock-exam') {
    // Mock exam mode goes to mock type selection
    transitionToPage('modeSelection', 'mockTypeSelection');
    log('Selected mode: Mock Exam', 'info');
  }
}

function selectMockType(type) {
  mockExamType = type;

  if (type === 'by-station') {
    // Mock by Station goes to station type selection
    transitionToPage('mockTypeSelection', 'stationTypeSelection');
    log('Selected mock type: By Station', 'info');
  } else if (type === 'full-mock') {
    // Full Mock Exam starts immediately with generated scenarios
    startFullMockExam();
    log('Selected mock type: Full Mock Exam', 'info');
  }
}

function selectStationType(stationType) {
  selectedStationType = stationType;
  // Start mock by station with random scenario from this type
  startMockByStation(stationType);
  log('Selected station type: ' + stationType, 'info');
}

// Back navigation for mock exam pages
function backToModeSelection() {
  selectedMode = null;
  transitionToPage('mockTypeSelection', 'modeSelection');
}

function backToMockTypeSelection() {
  mockExamType = null;
  transitionToPage('stationTypeSelection', 'mockTypeSelection');
}

function backToDifficultyFromMode() {
  selectedMode = null;
  selectedDifficulty = null;
  transitionToPage('modeSelection', 'difficultySelection');
}

function backToSpecialties() {
  selectedSpecialty = null;
  transitionToPage('difficultySelection', 'specialtySelection');
}

function backToDifficulty() {
  // Now goes back to mode selection (the page before scenario selection)
  selectedMode = null;
  transitionToPage('scenarioSelection', 'modeSelection');
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
// NOTE: Simulation room button handlers are now in simulation-app.js
// These handlers only run if the buttons exist (for legacy compatibility)

const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const interruptBtn = document.getElementById('interruptBtn');

if (connectBtn) {
  connectBtn.addEventListener('click', async () => {
    try {
      log('Initializing session...', 'info');
      session = new V4Session(CONFIG.BACKEND_URL, currentScenario.promptFile, selectedDifficulty);
      window.session = session; // Expose globally for cross-module access
      await session.connect();
      session.startListening();
      document.getElementById('connectBtn').disabled = true;
      document.getElementById('disconnectBtn').disabled = false;

      // VAD mode - continuous listening, no record button needed
      log('Session ready! Voice detection active - just speak naturally.', 'success');
      syncMobileButtonStates(); // Sync mobile buttons

      // Log session start for analytics
      await logSessionStart();

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
}

if (disconnectBtn) {
  disconnectBtn.addEventListener('click', async () => {
    // Use new feedback-aware end session flow
    await endSessionWithFeedback();
  });
}

// Interrupt button - stops AI and activates microphone
if (interruptBtn) {
  interruptBtn.addEventListener('click', () => {
    if (session && session.audioPlayer.isPlaying) {
      session.audioPlayer.interrupt();

      // Resume audio streaming after interrupt
      if (session.audioStreamer) {
        session.audioStreamer.setAISpeaking(false);
      }

      // Notify backend
      if (session.isConnected && session.sessionId) {
        session.ws.send(JSON.stringify({
          type: 'user_speaking',
          sessionId: session.sessionId
        }));
      }

      // Hide interrupt button and remove active styling
      interruptBtn.style.display = 'none';
      interruptBtn.disabled = true;
      interruptBtn.classList.remove('active');

      const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
      if (mobileInterruptBtn) {
        mobileInterruptBtn.classList.remove('active');
      }

      syncMobileButtonStates();
      setOrbState('listening');
      log('AI interrupted by user', 'info');
    }
  });
}

// ============================================================================
// SCROLL ANIMATIONS (Squarespace-style)
// ============================================================================

function initScrollAnimations() {
  // Create Intersection Observer for scroll-triggered animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px', // Trigger slightly before element is fully visible
    threshold: 0.15
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once animated, stop observing (one-time animation)
        animationObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with scroll animation class
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    animationObserver.observe(el);
  });

  // Feature block scroll reveal animations (Paraform style)
  const scrollRevealOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.15
  };

  const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  }, scrollRevealOptions);

  // Observe all scroll-reveal elements
  document.querySelectorAll('.scroll-reveal').forEach((el) => {
    scrollRevealObserver.observe(el);
  });

  // Parallax effect on scroll for hero decorative elements
  const parallaxElements = document.querySelectorAll('.parallax-element');
  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 0.5;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  console.log('[ANIM] Scroll animations initialized');
}

// ============================================================================
// SHOW PAGE HELPER (for hash-based navigation on return from simulation.html)
// ============================================================================

function showPage(pageId) {
  // Clean up landing page animations when navigating away
  if (pageId !== 'landingPage') {
    if (typeof window.destroyLandingScroll === 'function') {
      window.destroyLandingScroll();
    }
    if (typeof window.destroyLandingThree === 'function') {
      window.destroyLandingThree();
    }
  }

  const allPages = ['landingPage', 'authPage', 'profilePage', 'specialtySelection',
    'difficultySelection', 'modeSelection', 'mockTypeSelection',
    'stationTypeSelection', 'scenarioSelection', 'simulationRoom',
    'sessionSummary'];
  allPages.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('active');
      el.classList.add('hidden');
    }
  });
  const target = document.getElementById(pageId);
  if (target) {
    target.style.display = '';
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  const header = document.getElementById('appHeader');
  if (header) header.style.display = 'flex';
  document.body.classList.add('has-header');
}

// ============================================================================
// BROWSER COMPATIBILITY CHECK
// ============================================================================

window.addEventListener('DOMContentLoaded', async () => {
  console.log('[INIT] DOMContentLoaded fired');

  // Check browser compatibility and show warning if needed
  showBrowserWarningIfNeeded();

  // Initialize scroll animations (Squarespace-style)
  initScrollAnimations();

  // Add beforeunload warning when session is active
  window.addEventListener('beforeunload', (event) => {
    if (window.session && window.session.isConnected) {
      // Show browser confirmation dialog
      event.preventDefault();
      event.returnValue = 'You have an active interview session. Are you sure you want to leave?';
      return event.returnValue;
    }
  });

  // ============================================================================
  // MOBILE KEYBOARD VISIBILITY DETECTION
  // ============================================================================
  // Detects when mobile keyboard opens and adjusts auth modal positioning
  if ('visualViewport' in window) {
    window.visualViewport.addEventListener('resize', () => {
      const authPage = document.getElementById('authPage');
      if (authPage && authPage.classList.contains('active')) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const isKeyboardOpen = viewportHeight < windowHeight * 0.75;
        authPage.classList.toggle('keyboard-visible', isKeyboardOpen);
      }
    });
    console.log('[MOBILE] Keyboard visibility detection initialized');
  }

  try {
    // Initialize Supabase and check auth state
    // Loading overlay is shown by default - will be hidden after auth resolves
    initSupabase();
    await checkAuthState();
    // Note: hideLoadingOverlay() is called inside checkAuthState() after determining destination

    // Handle return navigation from simulation.html via URL hash
    if (window.location.hash === '#scenarioSelection') {
      console.log('[NAV] Returning from simulation - showing scenario selection');
      showPage('scenarioSelection');
      history.replaceState(null, '', window.location.pathname);
    } else if (window.location.hash === '#modeSelection') {
      console.log('[NAV] Returning to mode selection');
      showPage('modeSelection');
      history.replaceState(null, '', window.location.pathname);
    } else if (window.location.hash === '#difficultySelection') {
      console.log('[NAV] Returning to difficulty selection');
      showPage('difficultySelection');
      history.replaceState(null, '', window.location.pathname);
    } else if (window.location.hash === '#accessDenied') {
      console.log('[NAV] Access denied - showing upgrade modal');
      history.replaceState(null, '', window.location.pathname);
      showPage('scenarioSelection');
      // Show upgrade modal after a brief delay to ensure page is rendered
      setTimeout(() => {
        if (typeof showUpgradeModal === 'function') {
          showUpgradeModal({
            title: 'Access Required',
            message: 'Please subscribe to access this scenario.'
          });
        }
      }, 100);
    }
  } catch (error) {
    console.error('[INIT] Critical error during initialization:', error);
    showLandingPage();
    hideLoadingOverlay();
  }

  // Listen for auth state changes (for social login redirects)
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] State changed:', event);
      if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        await loadUserProfile();
        await loadSubscription();
        showProtectedContent();
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        userProfile = null;
        userSubscription = null;
        showLandingPage();
      }
    });
  }

  // Check for payment redirect
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment') === 'success') {
    // Reload subscription status after successful payment
    await loadSubscription();
    showSuccessModal('You now have full access to all Plastic Surgery ST3 scenarios and mock exams.');
    window.history.replaceState({}, '', window.location.pathname);
  } else if (urlParams.get('payment') === 'cancelled') {
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Log browser detection results
  if (window.BrowserDetect) {
    const detection = BrowserDetect.detect();
    console.log(`[BROWSER] Detected: ${detection.browser.name}`);
    console.log(`[BROWSER] Platform: ${detection.platform.isMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`[BROWSER] VAD: ${detection.vad.recommended} (${detection.vad.reason})`);
    console.log(`[BROWSER] Supported: ${detection.isSupported}`);
  }

  // ============================================================================
  // UI ANNOTATOR TOOL SUPPORT
  // ============================================================================
  // Listen for postMessage from UI Annotator tool to navigate between pages
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'showPage') {
      const pageId = e.data.pageId;
      const validPages = [
        'landingPage', 'authPage', 'profilePage', 'specialtySelection',
        'difficultySelection', 'modeSelection', 'mockTypeSelection',
        'stationTypeSelection', 'scenarioSelection', 'simulationRoom'
      ];

      if (validPages.includes(pageId)) {
        // Hide all pages first
        validPages.forEach(function(id) {
          const page = document.getElementById(id);
          if (page) page.style.display = 'none';
        });

        // Show requested page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
          targetPage.style.display = 'block';
          console.log('[ANNOTATOR] Navigated to page:', pageId);

          // Notify parent window of page change
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'pageChanged', pageId: pageId }, '*');
          }
        }
      }
    }
  });
});

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
    'stationTypeSelection', 'scenarioSelection', 'simulationRoom'
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

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    log('Initializing session...', 'info');
    session = new V4Session(CONFIG.BACKEND_URL, currentScenario.promptFile, selectedDifficulty);
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

document.getElementById('disconnectBtn').addEventListener('click', async () => {
  if (session) {
    session.disconnect();
    session = null;
    log('Session ended by user', 'info');
  }

  // Log session end for analytics
  await logSessionEnd();

  document.getElementById('connectBtn').disabled = false;
  document.getElementById('disconnectBtn').disabled = true;

  // Hide and reset interrupt button
  const interruptBtn = document.getElementById('interruptBtn');
  if (interruptBtn) {
    interruptBtn.style.display = 'none';
    interruptBtn.disabled = true;
  }

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

    // Resume VAD listening
    if (session.speechRecognition && session.speechRecognition.setAISpeaking) {
      session.speechRecognition.setAISpeaking(false);
    }

    // Notify backend
    if (session.isConnected && session.sessionId) {
      session.ws.send(JSON.stringify({
        type: 'user_speaking',
        sessionId: session.sessionId
      }));
    }

    // Hide interrupt button and remove active styling
    const interruptBtn = document.getElementById('interruptBtn');
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
// BROWSER COMPATIBILITY CHECK
// ============================================================================

window.addEventListener('DOMContentLoaded', async () => {
  console.log('[INIT] DOMContentLoaded fired');

  // Check browser compatibility and show warning if needed
  showBrowserWarningIfNeeded();

  // Initialize scroll animations (Squarespace-style)
  initScrollAnimations();

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
    alert('Payment successful! You now have Premium access.');
    window.history.replaceState({}, '', window.location.pathname);
  } else if (urlParams.get('payment') === 'cancelled') {
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Log browser detection results
  if (window.BrowserDetect) {
    const detection = BrowserDetect.detect();
    console.log(`[BROWSER] Detected: ${detection.browser.name}`);
    console.log(`[BROWSER] Platform: ${detection.platform.isMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`[BROWSER] VAD Support: ${detection.vad.recommended || 'none'} (${detection.vad.reason})`);
    console.log(`[BROWSER] MediaRecorder codecs:`, detection.mediaRecorderCodecs.supported);
  }

  // Browser speech recognition check (legacy log)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.log('[SPEECH] Web Speech API not available - will use Whisper via VAD/SimpleVAD');
  } else {
    console.log('[SPEECH] Web Speech API available (but using VAD/Whisper for better accuracy)');
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

// ============================================================================
// APP.JS - Application Entry Point and Event Listeners
// ============================================================================
// Dependencies: All other JS files must be loaded before this one
// This file contains: Page transitions, button event handlers, DOMContentLoaded,
//                     scroll animations, browser compatibility check
// Load Order: state.js -> config.js -> auth.js -> subscription.js -> tracking.js
//             -> speech.js -> session.js -> ui-helpers.js -> scenarios.js -> app.js
// ============================================================================

// Note: selectedSpecialty and selectedDifficulty are in state.js

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

    // Show new page - must set inline style to override hideAllPages()
    // (inline styles have higher specificity than CSS classes)
    toPage.style.display = 'block';
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

  console.log('[ANIM] Scroll animations initialized');
}

// ============================================================================
// BROWSER COMPATIBILITY CHECK
// ============================================================================

window.addEventListener('DOMContentLoaded', async () => {
  console.log('[INIT] DOMContentLoaded fired');

  // Initialize scroll animations (Squarespace-style)
  initScrollAnimations();

  // Safety fallback - if nothing shows after 3 seconds, show landing page
  const safetyTimeout = setTimeout(() => {
    console.log('[INIT] Safety timeout triggered - forcing landing page');
    showLandingPage();
  }, 3000);

  try {
    // Initialize Supabase and check auth state
    initSupabase();
    await checkAuthState();
    clearTimeout(safetyTimeout);
  } catch (error) {
    console.error('[INIT] Critical error during initialization:', error);
    clearTimeout(safetyTimeout);
    showLandingPage();
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

  // Browser speech recognition check
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    // Whisper API fallback available - all browsers supported
    console.log('[SPEECH] Using Whisper API for speech recognition (browser fallback)');
  } else {
    // Web Speech API available - optimal performance
    console.log('[SPEECH] Using Web Speech API for speech recognition (native browser support)');
  }
});

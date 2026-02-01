/**
 * Glowing Border Effect
 * Mouse-following conic gradient border effect for cards and buttons
 * Desktop/web only - requires pointer device with hover capability
 *
 * Inspired by Aceternity UI glowing-effect component
 * https://21st.dev/community/components/aceternity/glowing-effect
 */

(function() {
  'use strict';

  // Configuration matching the original React component
  const CONFIG = {
    spread: 40,           // Gradient spread in degrees
    proximity: 64,        // Activation distance in pixels
    inactiveZone: 0.01,   // Center inactive zone ratio (nearly 0 = always active when hovering)
    borderWidth: 3        // Border width in pixels
  };

  // Track all glow-enabled elements with their animation state
  const glowElements = new Map();

  // Last known mouse position for scroll updates
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Check if device supports hover (desktop)
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  /**
   * Initialize glow effect on an element
   * @param {HTMLElement} element - Element to add glow effect to
   */
  function initGlowEffect(element) {
    if (!supportsHover) return;
    if (glowElements.has(element)) return;

    element.classList.add('glow-effect');
    element.style.setProperty('--glow-spread', CONFIG.spread);
    element.style.setProperty('--glow-border-width', CONFIG.borderWidth + 'px');

    // Store element state for smooth angle animation
    glowElements.set(element, {
      currentAngle: 0,
      targetAngle: 0,
      animating: false
    });
  }

  /**
   * Calculate angle from element center to mouse position
   * @param {HTMLElement} element
   * @param {number} mouseX
   * @param {number} mouseY
   * @returns {number} Angle in degrees
   */
  function calculateAngle(element, mouseX, mouseY) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // atan2 returns radians, convert to degrees and offset by 90 for top-center start
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI) + 90;
    return angle;
  }

  /**
   * Check if mouse is within proximity of element
   * @param {HTMLElement} element
   * @param {number} mouseX
   * @param {number} mouseY
   * @param {number} proximity
   * @returns {boolean}
   */
  function isWithinProximity(element, mouseX, mouseY, proximity) {
    const rect = element.getBoundingClientRect();
    return (
      mouseX > rect.left - proximity &&
      mouseX < rect.right + proximity &&
      mouseY > rect.top - proximity &&
      mouseY < rect.bottom + proximity
    );
  }

  /**
   * Check if mouse is in inactive center zone
   * @param {HTMLElement} element
   * @param {number} mouseX
   * @param {number} mouseY
   * @param {number} inactiveZone - Ratio of element size
   * @returns {boolean}
   */
  function isInInactiveZone(element, mouseX, mouseY, inactiveZone) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(mouseX - centerX, mouseY - centerY);
    const inactiveRadius = Math.min(rect.width, rect.height) * 0.5 * inactiveZone;

    return distance < inactiveRadius;
  }

  /**
   * Normalize angle difference for smooth transitions
   * Handles wraparound at 360 degrees
   * @param {number} current
   * @param {number} target
   * @returns {number} Normalized target angle
   */
  function normalizeAngle(current, target) {
    let diff = ((target - current + 180) % 360) - 180;
    return current + diff;
  }

  /**
   * Smooth lerp (linear interpolation) for angle animation
   * @param {number} current
   * @param {number} target
   * @param {number} factor - Smoothing factor (0-1, lower = smoother)
   * @returns {number}
   */
  function lerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  /**
   * Animate angle for smooth rotation effect
   * @param {HTMLElement} element
   * @param {Object} state
   */
  function animateAngle(element, state) {
    if (!state.animating) return;

    // Smooth interpolation factor (0.15 gives nice smooth movement)
    const smoothFactor = 0.15;
    state.currentAngle = lerp(state.currentAngle, state.targetAngle, smoothFactor);

    // Update CSS property
    element.style.setProperty('--glow-angle', state.currentAngle);

    // Continue animation if not close enough to target
    if (Math.abs(state.targetAngle - state.currentAngle) > 0.5) {
      requestAnimationFrame(() => animateAngle(element, state));
    } else {
      state.currentAngle = state.targetAngle;
      element.style.setProperty('--glow-angle', state.currentAngle);
      state.animating = false;
    }
  }

  /**
   * Update glow effect for all elements
   * @param {number} mouseX
   * @param {number} mouseY
   */
  function updateGlowEffects(mouseX, mouseY) {
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    glowElements.forEach((state, element) => {
      // Skip if element is not visible
      if (!element.offsetParent) return;

      // Skip if element is in simulation room
      if (element.closest('#simulationRoom')) return;

      const withinProximity = isWithinProximity(element, mouseX, mouseY, CONFIG.proximity);
      const inInactiveZone = isInInactiveZone(element, mouseX, mouseY, CONFIG.inactiveZone);

      if (withinProximity && !inInactiveZone) {
        const rawAngle = calculateAngle(element, mouseX, mouseY);
        state.targetAngle = normalizeAngle(state.currentAngle, rawAngle);

        element.style.setProperty('--glow-active', '1');

        // Start animation if not already running
        if (!state.animating) {
          state.animating = true;
          requestAnimationFrame(() => animateAngle(element, state));
        }
      } else {
        element.style.setProperty('--glow-active', '0');
      }
    });
  }

  /**
   * Selectors for elements that should have glow effect
   */
  const GLOW_SELECTORS = [
    // Buttons (landing, auth, profile pages)
    '.hero-buttons .btn-primary',
    '.hero-buttons .btn-secondary',
    '.auth-form .btn-primary',
    '.pricing-card .btn-primary',
    '.pricing-card .btn-secondary',

    // Feature cards (landing page)
    '.feature-card',
    '.action-card',

    // Selection cards (specialty, difficulty, mode pages)
    '.specialty-card:not(.coming-soon)',
    '.difficulty-card',
    '.mode-card',

    // Mock type and station type selection
    '.mock-type-card',
    '.station-type-card',

    // Scenario cards
    '.scenario-card:not(.locked)',
    '.topic-card:not(.locked)'
  ];

  /**
   * Initialize glow effects for all target elements
   */
  function initializeAllGlowEffects() {
    if (!supportsHover) return;

    const elements = document.querySelectorAll(GLOW_SELECTORS.join(', '));
    elements.forEach(initGlowEffect);
  }

  /**
   * Observe DOM for dynamically added elements
   */
  function observeDynamicElements() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          // Check if node itself matches any selector
          GLOW_SELECTORS.forEach(selector => {
            if (node.matches && node.matches(selector)) {
              initGlowEffect(node);
            }
          });

          // Check children for matching elements
          if (node.querySelectorAll) {
            const children = node.querySelectorAll(GLOW_SELECTORS.join(', '));
            children.forEach(initGlowEffect);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Event handlers
  let rafId = null;

  function handlePointerMove(e) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      updateGlowEffects(e.clientX, e.clientY);
    });
  }

  function handleScroll() {
    // Re-trigger with last known mouse position
    // This ensures glow updates when elements move during scroll
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      updateGlowEffects(lastMouseX, lastMouseY);
    });
  }

  /**
   * Main initialization
   */
  function init() {
    if (!supportsHover) {
      console.log('[GlowEffect] Disabled: touch device detected');
      return;
    }

    initializeAllGlowEffects();
    observeDynamicElements();

    document.body.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    console.log('[GlowEffect] Initialized with', glowElements.size, 'elements');
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for manual initialization and debugging
  window.GlowEffect = {
    init: initGlowEffect,
    refresh: initializeAllGlowEffects,
    getElements: () => Array.from(glowElements.keys()),
    config: CONFIG
  };

})();

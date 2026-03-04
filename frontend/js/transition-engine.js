// ============================================================================
// TRANSITION ENGINE — Unified GSAP page transitions + staggered reveals
// ============================================================================
// Provides dramatic parallax depth transitions between selection flow pages
// and staggered element entrance animations. Replaces the old CSS fade system.
//
// Dependencies: GSAP 3.x (loaded via CDN before this file)
// ============================================================================

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Reduced Motion Detection
  // --------------------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // Animation Tokens
  // --------------------------------------------------------------------------
  const T = {
    duration: {
      fast: prefersReducedMotion ? 0.1 : 0.3,
      normal: prefersReducedMotion ? 0.1 : 0.5,
      slow: prefersReducedMotion ? 0.1 : 1.0,
    },
    easing: {
      smoothOut: 'power2.out',
      snapIn: 'back.out(1.4)',
      depth: 'power3.inOut',
      cinematic: 'power4.out',
    },
    distance: {
      slide: 80,
      depthScale: 0.85,
      parallaxOffset: 120,
    },
    stagger: {
      cards: 0.08,
      elements: 0.06,
    },
  };

  // --------------------------------------------------------------------------
  // Page Order (for determining forward/back direction)
  // --------------------------------------------------------------------------
  const PAGE_ORDER = [
    'landingPage',
    'specialtySelection',
    'difficultySelection',
    'modeSelection',
    'mockTypeSelection',
    'stationTypeSelection',
    'scenarioSelection',
  ];

  // All navigable pages (for hiding)
  const ALL_PAGES = [
    'landingPage', 'authPage', 'profilePage', 'specialtySelection',
    'difficultySelection', 'modeSelection', 'mockTypeSelection',
    'stationTypeSelection', 'scenarioSelection', 'simulationRoom',
    'sessionSummary',
  ];

  // Track if a transition is currently running
  let isTransitioning = false;

  // --------------------------------------------------------------------------
  // Direction Detection
  // --------------------------------------------------------------------------
  function getDirection(fromId, toId) {
    const fromIdx = PAGE_ORDER.indexOf(fromId);
    const toIdx = PAGE_ORDER.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1) return 'forward';
    return toIdx >= fromIdx ? 'forward' : 'back';
  }

  // --------------------------------------------------------------------------
  // Core: Parallax Out
  // --------------------------------------------------------------------------
  function parallaxOut(page, direction) {
    if (prefersReducedMotion) {
      return gsap.to(page, {
        opacity: 0,
        duration: T.duration.fast,
        ease: 'none',
      });
    }

    const yShift = direction === 'forward' ? -40 : 40;
    return gsap.to(page, {
      scale: T.distance.depthScale,
      y: yShift,
      opacity: 0,
      filter: 'blur(4px)',
      duration: T.duration.normal,
      ease: T.easing.depth,
    });
  }

  // --------------------------------------------------------------------------
  // Core: Parallax In (page + stagger children)
  // --------------------------------------------------------------------------
  function parallaxIn(page, direction) {
    // Ensure page is visible and positioned for entry
    page.style.display = 'block';
    page.classList.remove('hidden', 'initially-hidden');
    page.classList.add('active');

    if (prefersReducedMotion) {
      gsap.set(page, { clearProps: 'all' });
      page.style.display = 'block';
      staggerChildren(page);
      return gsap.to(page, {
        opacity: 1,
        duration: T.duration.fast,
        ease: 'none',
      });
    }

    const yFrom = direction === 'forward' ? T.distance.parallaxOffset : -T.distance.parallaxOffset;

    // Set initial state
    gsap.set(page, {
      scale: 1.08,
      y: yFrom,
      opacity: 0,
      filter: 'blur(6px)',
    });

    // Animate page in
    const tl = gsap.timeline();
    tl.to(page, {
      scale: 1,
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: T.duration.normal + 0.1,
      ease: T.easing.cinematic,
    });

    // Stagger children with slight overlap
    staggerChildren(page, tl);

    return tl;
  }

  // --------------------------------------------------------------------------
  // Stagger Children (cards, titles, back buttons)
  // --------------------------------------------------------------------------
  function staggerChildren(page, timeline) {
    const title = page.querySelector('[data-animate="title"]');
    const backBtn = page.querySelector('[data-animate="back"]');
    const cards = page.querySelectorAll('[data-animate="card"]');

    if (prefersReducedMotion) {
      // Just ensure everything is visible
      [title, backBtn, ...cards].forEach(el => {
        if (el) gsap.set(el, { clearProps: 'all' });
      });
      return;
    }

    // Set initial hidden state for all animatable children
    const allEls = [title, backBtn, ...cards].filter(Boolean);
    gsap.set(allEls, { opacity: 0, y: T.distance.slide, scale: 0.95 });

    const tl = timeline || gsap.timeline();
    const startOffset = timeline ? '-=0.3' : '+=0';

    // Back button first (small, quick)
    if (backBtn) {
      tl.to(backBtn, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: T.duration.fast,
        ease: T.easing.smoothOut,
      }, startOffset);
    }

    // Title next
    if (title) {
      tl.to(title, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: T.duration.fast + 0.1,
        ease: T.easing.snapIn,
      }, backBtn ? '-=0.15' : startOffset);
    }

    // Cards stagger in with dramatic entrance
    if (cards.length > 0) {
      // Reset cards with rotation for more drama
      gsap.set(cards, {
        opacity: 0,
        y: T.distance.slide,
        scale: 0.92,
        rotateX: 8,
      });

      tl.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: T.duration.normal + 0.1,
        ease: T.easing.snapIn,
        stagger: T.stagger.cards,
      }, title ? '-=0.2' : '-=0.1');
    }

    return tl;
  }

  // --------------------------------------------------------------------------
  // Main: Transition Between Pages
  // --------------------------------------------------------------------------
  function transitionPages(fromId, toId, callback) {
    if (isTransitioning) return;
    isTransitioning = true;

    const fromPage = document.getElementById(fromId);
    const toPage = document.getElementById(toId);

    if (!fromPage || !toPage) {
      isTransitioning = false;
      if (callback) callback();
      return;
    }

    const direction = getDirection(fromId, toId);
    const tl = gsap.timeline({
      onComplete: () => {
        // Clean up outgoing page
        gsap.set(fromPage, { clearProps: 'all' });
        fromPage.style.display = 'none';
        fromPage.classList.remove('active');
        fromPage.classList.add('hidden');

        isTransitioning = false;
        if (callback) callback();
      },
    });

    // Phase 1: Parallax out the current page
    tl.add(parallaxOut(fromPage, direction));

    // Phase 2: Hide all other pages, show target
    tl.call(() => {
      ALL_PAGES.forEach(pageId => {
        if (pageId !== toId && pageId !== fromId) {
          const el = document.getElementById(pageId);
          if (el) {
            el.style.display = 'none';
            el.classList.remove('active', 'fade-out', 'fade-in');
            el.classList.add('hidden');
          }
        }
      });
    });

    // Phase 3: Parallax in the new page
    tl.add(parallaxIn(toPage, direction), '-=0.15');

    return tl;
  }

  // --------------------------------------------------------------------------
  // Reveal Page (for hash-based returns — no outgoing page)
  // --------------------------------------------------------------------------
  function revealPage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    // Hide all pages first
    ALL_PAGES.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.classList.remove('active', 'fade-out', 'fade-in');
        el.classList.add('hidden');
      }
    });

    // Show and animate the target page
    page.style.display = 'block';
    page.classList.remove('hidden', 'initially-hidden');
    page.classList.add('active');

    parallaxIn(page, 'forward');
  }

  // --------------------------------------------------------------------------
  // Exit Animation (before cross-page redirect)
  // --------------------------------------------------------------------------
  function animateExit(callback) {
    // Find the currently visible page
    const activePage = document.querySelector('.page.active') ||
      document.querySelector('.page[style*="display: block"]');

    if (!activePage || prefersReducedMotion) {
      if (callback) callback();
      return;
    }

    gsap.to(activePage, {
      scale: T.distance.depthScale,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 0.4,
      ease: T.easing.depth,
      onComplete: callback,
    });
  }

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------
  window.TransitionEngine = {
    tokens: T,
    transitionPages: transitionPages,
    revealPage: revealPage,
    animateExit: animateExit,
    staggerChildren: staggerChildren,
    getDirection: getDirection,
    isTransitioning: () => isTransitioning,
  };

  console.log('[TransitionEngine] Initialized', prefersReducedMotion ? '(reduced motion)' : '');
})();

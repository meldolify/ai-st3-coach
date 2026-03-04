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
    const tl = gsap.timeline();

    if (prefersReducedMotion) {
      tl.call(() => {
        page.style.display = 'block';
        page.classList.remove('hidden', 'initially-hidden');
        page.classList.add('active');
        gsap.set(page, { clearProps: 'all' });
        page.style.display = 'block';
      });
      staggerChildren(page);
      tl.to(page, { opacity: 1, duration: T.duration.fast, ease: 'none' });
      return tl;
    }

    const yFrom = direction === 'forward' ? T.distance.parallaxOffset : -T.distance.parallaxOffset;

    // Show page at timeline-play time with initial animation state applied
    // atomically to prevent a flash of unstyled content between display:block
    // and the GSAP set.
    tl.call(() => {
      gsap.set(page, { opacity: 0, scale: 1.08, y: yFrom, filter: 'blur(6px)' });
      page.style.display = 'block';
      page.classList.remove('hidden', 'initially-hidden');
      page.classList.add('active');
    });

    // Pre-hide children at timeline-play time
    tl.call(() => {
      const allEls = page.querySelectorAll('[data-animate]');
      if (allEls.length) {
        gsap.set(allEls, { opacity: 0, y: T.distance.slide, scale: 0.95 });
      }
      const cards = page.querySelectorAll('[data-animate="card"]');
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: T.distance.slide, scale: 0.92, rotateX: 8 });
      }
    });

    // Animate page container in
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

    const allEls = [title, backBtn, ...cards].filter(Boolean);
    if (allEls.length === 0) return;

    const tl = timeline || gsap.timeline();
    const startOffset = timeline ? '-=0.3' : '+=0';

    // Only set initial hidden states in standalone mode (revealPage).
    // When called from parallaxIn with a timeline, children are already
    // hidden by the tl.call() inside parallaxIn.
    if (!timeline) {
      gsap.set(allEls, { opacity: 0, y: T.distance.slide, scale: 0.95 });
      if (cards.length > 0) {
        gsap.set(cards, { opacity: 0, y: T.distance.slide, scale: 0.92, rotateX: 8 });
      }
    }

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
        // Clean up inline GSAP transforms on both pages
        gsap.set(fromPage, { clearProps: 'all' });
        gsap.set(toPage, { clearProps: 'all' });
        toPage.style.display = 'block'; // Restore after clearProps

        isTransitioning = false;
        if (callback) callback();
      },
    });

    // Phase 1: Parallax out the current page
    tl.add(parallaxOut(fromPage, direction));

    // Phase 2: Swap — hide FROM page and all others BEFORE showing TO page
    // (Pages are position:relative in flow, so both can't be display:block at once)
    tl.call(() => {
      gsap.set(fromPage, { clearProps: 'all' });
      fromPage.style.display = 'none';
      fromPage.classList.remove('active');
      fromPage.classList.add('hidden');

      ALL_PAGES.forEach(pageId => {
        if (pageId !== toId) {
          const el = document.getElementById(pageId);
          if (el) {
            el.style.display = 'none';
            el.classList.remove('active', 'fade-out', 'fade-in');
            el.classList.add('hidden');
          }
        }
      });

      window.scrollTo(0, 0);
    });

    // Phase 3: Parallax in the new page (no overlap — starts after swap)
    tl.add(parallaxIn(toPage, direction));

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

    // Scroll to top and animate the target page
    window.scrollTo(0, 0);
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

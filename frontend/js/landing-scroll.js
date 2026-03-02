// landing-scroll.js — Landing page scroll animation orchestration
// Dependencies: Lenis, GSAP, ScrollTrigger, SplitType (all loaded via CDN)

(function () {
  'use strict';

  // Guard: only run on pages with the landing page
  if (!document.getElementById('landingPage')) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // LENIS SMOOTH SCROLL
  // ============================================================
  let lenis = null;

  function initLenis() {
    if (prefersReducedMotion) return;
    if (typeof Lenis === 'undefined') {
      console.warn('[LANDING] Lenis not loaded');
      return;
    }

    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smooth: true,
      smoothTouch: false
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Feed Lenis RAF into GSAP ticker (time is in seconds, Lenis wants ms)
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    console.log('[LANDING] Lenis smooth scroll initialized');
  }

  // ============================================================
  // GSAP + SCROLLTRIGGER
  // ============================================================
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[LANDING] GSAP or ScrollTrigger not loaded');
      return false;
    }
    gsap.registerPlugin(ScrollTrigger);
    return true;
  }

  // ============================================================
  // SECTION ANIMATIONS (Phase 2 — stubs for now)
  // ============================================================

  function initHeroEntrance() {
    // Phase 2: SplitType char reveal + parallax blobs
  }

  function initHeroParallax() {
    // Phase 2: Parallax blob movement on scroll
  }

  function initHeroTransition() {
    // Phase 2: Hero text parallax up + bg color tween to section 2
  }

  function initSectionWho() {
    // Phase 2: Clip-path circle expand + line reveals
  }

  function initSectionWhy() {
    // Phase 2: ScrollTrigger pin with 3-phase content morph
  }

  function initSectionTrust() {
    // Phase 2: Parallax text strip + word-by-word reveal
  }

  function initSectionServices() {
    // Phase 2: Rectangular clip-path card reveals
  }

  function initSectionProof() {
    // Phase 2: Scale zoom 80% -> 100%
  }

  function initSectionAction() {
    // Phase 2: Split-screen reveal from opposite sides
  }

  function initMagneticButtons() {
    // Phase 2: Magnetic button hover effect
  }

  function initCardTilt() {
    // Phase 2: 3D card tilt on hover
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    if (!initGSAP()) return;
    initLenis();

    // Section animations (populated in Phase 2)
    initHeroEntrance();
    initHeroParallax();
    initHeroTransition();
    initSectionWho();
    initSectionWhy();
    initSectionTrust();
    initSectionServices();
    initSectionProof();
    initSectionAction();
    initMagneticButtons();
    initCardTilt();

    console.log('[LANDING] Landing scroll system initialized');
  }

  // ============================================================
  // CLEANUP (called when navigating away from landing page)
  // ============================================================
  window.destroyLandingScroll = function () {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    ScrollTrigger.getAll().forEach(function (st) {
      st.kill();
    });
    console.log('[LANDING] Landing scroll system destroyed');
  };

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

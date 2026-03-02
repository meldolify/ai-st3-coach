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
    if (prefersReducedMotion) {
      gsap.set('#sectionHero .hero-line, #sectionHero .landing-overline, #sectionHero .hero-subtitle, #sectionHero .hero-ctas > *', {
        opacity: 1, y: 0
      });
      return;
    }

    // Only animate the visible hero variant
    var activeHero = document.getElementById('heroLoggedOut');
    if (activeHero && activeHero.classList.contains('initially-hidden')) {
      activeHero = document.getElementById('heroLoggedIn');
    }
    if (!activeHero || activeHero.classList.contains('initially-hidden')) return;

    var heroLines = activeHero.querySelectorAll('.hero-line');
    if (!heroLines.length) return;

    // SplitType each hero line into characters
    var splits = [];
    heroLines.forEach(function (line) {
      splits.push(new SplitType(line, { types: 'chars', tagName: 'span' }));
    });

    var tl = gsap.timeline({ delay: 0.2 });

    // Nav fade in
    tl.from('#landingNav', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' }, 0);

    // Overline fade up
    var overline = activeHero.querySelector('.landing-overline');
    if (overline) {
      tl.from(overline, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, 0.4);
    }

    // Character reveals per line, staggered 0.3s between lines
    splits.forEach(function (split, i) {
      tl.from(split.chars, {
        opacity: 0, y: 30, duration: 0.6,
        stagger: 0.025, ease: 'back.out(1.7)'
      }, 0.6 + i * 0.3);
    });

    // Subtitle fade up
    var subtitle = activeHero.querySelector('.hero-subtitle');
    if (subtitle) {
      tl.from(subtitle, { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, 1.6);
    }

    // CTA buttons slide up
    var ctas = activeHero.querySelectorAll('.hero-ctas > *');
    if (ctas.length) {
      tl.from(ctas, { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 1.8);
    }
  }

  function initHeroParallax() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.parallax-blob').forEach(function (blob) {
      var speed = parseFloat(blob.dataset.speed) || 0.5;
      gsap.to(blob, {
        y: function () { return window.innerHeight * speed * 0.5; },
        scrollTrigger: {
          trigger: '#sectionHero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.3
        }
      });
    });
  }

  function initHeroTransition() {
    if (prefersReducedMotion) return;

    // Hero content parallaxes up faster than scroll
    gsap.to('#sectionHero .hero-logged-out, #sectionHero .hero-logged-in', {
      y: -100,
      opacity: 0,
      scrollTrigger: {
        trigger: '#sectionHero',
        start: '60% top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  function initSectionWho() {
    if (prefersReducedMotion) {
      gsap.set('.section-who', { clipPath: 'none' });
      return;
    }

    // Clip-path circle expand reveal
    gsap.fromTo('.section-who',
      { clipPath: 'circle(0% at 50% 50%)' },
      {
        clipPath: 'circle(150% at 50% 50%)',
        scrollTrigger: {
          trigger: '.section-who',
          start: 'top 80%',
          end: 'top 20%',
          scrub: 0.5
        }
      }
    );

    // Display lines slide in from left after clip opens
    gsap.from('.section-who .display-line', {
      opacity: 0,
      x: -60,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.section-who',
        start: 'top 40%',
        toggleActions: 'play none none none'
      }
    });

    // Body text fade up
    gsap.from('.section-who .who-body', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.section-who .who-body',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  }

  function initSectionWhy() {
    if (prefersReducedMotion) return;

    var section = document.querySelector('.section-why');
    if (!section) return;

    var phases = section.querySelectorAll('.why-phase');
    if (phases.length < 3) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-why',
        pin: true,
        start: 'top top',
        end: '+=300%',
        scrub: 1
      }
    });

    // Pinned display text zoom in
    tl.fromTo('.why-display', { scale: 0.9, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.5 }, 0);

    // Phase 1 is visible by default, fades out at ~30%
    tl.to(phases[0], { opacity: 0, y: -40, duration: 0.15 }, 0.25);

    // Phase 2 fades in at ~30%, fades out at ~65%
    tl.fromTo(phases[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.15 }, 0.3);
    tl.to(phases[1], { opacity: 0, y: -40, duration: 0.15 }, 0.55);

    // Phase 3 fades in at ~65%
    tl.fromTo(phases[2], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.15 }, 0.6);

    // Progress indicator line fills top to bottom
    tl.fromTo('.why-progress-line', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
  }

  function initSectionTrust() {
    if (prefersReducedMotion) return;

    // Parallax text strip — moves left as user scrolls down
    gsap.to('.trust-strip', {
      x: '-30%',
      scrollTrigger: {
        trigger: '.section-trust',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.3
      }
    });

    // Word-by-word reveal with blur-to-sharp effect
    var trustDisplay = document.querySelector('.trust-display');
    if (trustDisplay && typeof SplitType !== 'undefined') {
      var split = new SplitType(trustDisplay, { types: 'words', tagName: 'span' });
      gsap.from(split.words, {
        opacity: 0,
        y: 20,
        filter: 'blur(4px)',
        duration: 0.6,
        stagger: 0.04,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: trustDisplay,
          start: 'top 70%',
          end: 'top 30%',
          scrub: 0.5
        }
      });
    }

    // Trust cards staggered entrance
    gsap.from('.trust-card', {
      opacity: 0,
      y: 60,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.trust-cards',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
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

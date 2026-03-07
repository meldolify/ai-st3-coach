// landing-scroll.js — Landing page scroll animation orchestration
// Dependencies: Lenis, GSAP, ScrollTrigger, SplitType (all loaded via CDN)

(function () {
  'use strict';

  // Guard: only run on pages with the landing page
  if (!document.getElementById('landingPage')) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile detection for performance budgeting (disable expensive scroll effects)
  const isMobile = window.innerWidth < 768;

  // ============================================================
  // LENIS SMOOTH SCROLL
  // ============================================================
  let lenis = null;
  let lenisTickerFn = null;

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
    lenisTickerFn = function (time) {
      if (lenis) lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisTickerFn);
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
      gsap.set('#sectionHero .hero-brand-char, #sectionHero .landing-overline, #sectionHero .hero-subtitle, #sectionHero .hero-ctas > *, #sectionHero .hero-asset, #sectionHero .hero-leaf', {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)'
      });
      return;
    }

    var activeHero = document.getElementById('heroLoggedOut');
    if (activeHero && activeHero.classList.contains('initially-hidden')) {
      activeHero = document.getElementById('heroLoggedIn');
    }
    if (!activeHero || activeHero.classList.contains('initially-hidden')) return;

    var tl = gsap.timeline({ delay: 0.2 });

    // Nav fade in
    tl.from('#landingNav', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' }, 0);

    // REVIVA brand — scramble-style character reveal
    var brandChars = activeHero.querySelectorAll('.hero-brand-char');
    if (brandChars.length) {
      var scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      brandChars.forEach(function(charEl, i) {
        var targetChar = charEl.textContent;
        charEl.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        tl.fromTo(charEl, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)',
          onStart: function() {
            var scrambleCount = 0;
            var interval = setInterval(function() {
              charEl.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
              scrambleCount++;
              if (scrambleCount > 5) {
                clearInterval(interval);
                charEl.textContent = targetChar;
              }
            }, 50);
          }
        }, 0.4 + i * 0.08);
      });
    }

    // Overline fade up
    var overline = activeHero.querySelector('.landing-overline');
    if (overline) {
      tl.from(overline, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, 1.0);
    }

    // Hero tableau assets — staggered blur-to-sharp entrance
    gsap.utils.toArray('.hero-asset').forEach(function(asset, i) {
      tl.fromTo(asset,
        { opacity: 0, scale: 1.15, filter: 'blur(12px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
        0.8 + i * 0.2
      );
    });

    // Subtitle fade up
    var subtitle = activeHero.querySelector('.hero-subtitle');
    if (subtitle) {
      tl.from(subtitle, { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, 1.8);
    }

    // CTA buttons slide up
    var ctas = activeHero.querySelectorAll('.hero-ctas > *');
    if (ctas.length) {
      tl.from(ctas, { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 2.0);
    }

    // Botanical leaves drift in from edges
    tl.from('.hero-leaf--1', { opacity: 0, x: -60, rotation: -30, duration: 1.2, ease: 'power2.out' }, 0.8);
    tl.from('.hero-leaf--2', { opacity: 0, x: 60, rotation: 40, duration: 1.2, ease: 'power2.out' }, 1.0);
    tl.from('.hero-leaf--3', { opacity: 0, y: 40, rotation: -20, duration: 1.2, ease: 'power2.out' }, 1.2);
  }

  function initHeroParallax() {
    if (prefersReducedMotion) return;
    if (isMobile) return; // Leaves hidden on mobile, assets simplified — no parallax needed

    // Leaf parallax on scroll
    document.querySelectorAll('.hero-leaf').forEach(function (leaf) {
      var speed = parseFloat(leaf.dataset.speed) || 0.5;
      gsap.to(leaf, {
        y: function () { return window.innerHeight * speed * 0.5; },
        rotation: '+=' + (speed * 20),
        scrollTrigger: {
          trigger: '#sectionHero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.3
        }
      });
    });

    // Hero asset parallax — each with unique vertical + horizontal drift
    document.querySelectorAll('.hero-asset').forEach(function(asset) {
      var speed = parseFloat(asset.dataset.speed) || 0.15;
      var drift = parseFloat(asset.dataset.drift) || 0;
      gsap.to(asset, {
        y: function() { return window.innerHeight * speed * 0.5; },
        x: function() { return window.innerWidth * drift * 0.3; },
        rotation: '+=' + (speed * 25),
        scrollTrigger: {
          trigger: '#sectionHero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  function initHeroTransition() {
    if (prefersReducedMotion) return;

    gsap.to('#sectionHero .hero-logged-out, #sectionHero .hero-logged-in, #sectionHero .hero-tableau', {
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

    // Clip-path circle expand reveal (desktop only — expensive on mobile GPUs)
    if (!isMobile) {
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
    }

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

    // Doctor photo scale entrance
    gsap.from('.who-photo-wrapper', {
      opacity: 0,
      scale: 0.95,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.who-photo-wrapper',
        start: 'top 85%',
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

    if (isMobile) {
      // Mobile: simple stacked fade-in per phase (no pinning — causes scroll freeze)
      gsap.from(phases[0], {
        opacity: 0, y: 30, duration: 0.6,
        scrollTrigger: { trigger: phases[0], start: 'top 80%', toggleActions: 'play none none none' }
      });
      gsap.from(phases[1], {
        opacity: 0, y: 30, duration: 0.6,
        scrollTrigger: { trigger: phases[1], start: 'top 80%', toggleActions: 'play none none none' }
      });
      gsap.from(phases[2], {
        opacity: 0, y: 30, duration: 0.6,
        scrollTrigger: { trigger: phases[2], start: 'top 80%', toggleActions: 'play none none none' }
      });
      return;
    }

    // Desktop: pinned timeline with phase transitions
    // Set initial state: phases 2 & 3 hidden
    gsap.set(phases[1], { opacity: 0, y: 30 });
    gsap.set(phases[2], { opacity: 0, y: 30 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-why',
        pin: true,
        pinType: 'transform',
        start: 'top top',
        end: '+=200%',
        scrub: 0.5
      }
    });

    // Display text zoom in (first 20%)
    tl.fromTo('.why-display',
      { scale: 0.9, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 0.2 }, 0);

    // Phase 1 visible by default, fades out 25-40%
    tl.to(phases[0], { opacity: 0, y: -30, duration: 0.15 }, 0.25);

    // Phase 2 fades in 30-45%, holds, fades out 58-73%
    tl.to(phases[1], { opacity: 1, y: 0, duration: 0.15 }, 0.30);
    tl.to(phases[1], { opacity: 0, y: -30, duration: 0.15 }, 0.58);

    // Phase 3 fades in 63-78%
    tl.to(phases[2], { opacity: 1, y: 0, duration: 0.15 }, 0.63);

    // Background colour transitions
    tl.to('.section-why', { backgroundColor: '#EBF0F5', duration: 0.20 }, 0.25);
    tl.to('.section-why', { backgroundColor: '#F5F0E5', duration: 0.20 }, 0.55);

    // Progress indicator line
    tl.fromTo('.why-progress-line', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
  }

  function initSectionTrust() {
    if (prefersReducedMotion) return;

    // Parallax text strip — moves left as user scrolls down (desktop only)
    if (!isMobile) {
      gsap.to('.trust-strip', {
        x: '-30%',
        scrollTrigger: {
          trigger: '.section-trust',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.3
        }
      });
    }

    // Word-by-word reveal with blur-to-sharp effect
    var trustDisplay = document.querySelector('.trust-display');
    if (trustDisplay) {
      if (isMobile) {
        // Mobile: simple fade-up (word-by-word blur is too expensive)
        gsap.from(trustDisplay, {
          opacity: 0, y: 30, duration: 0.8,
          scrollTrigger: { trigger: trustDisplay, start: 'top 70%', toggleActions: 'play none none none' }
        });
      } else if (typeof SplitType !== 'undefined') {
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
    }

    // Trust cards staggered entrance
    gsap.from('.trust-card', {
      opacity: 0,
      y: 60,
      rotation: -5,
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
    if (prefersReducedMotion) return;

    if (!isMobile) {
      // Title clip-path reveal from left (desktop only)
      gsap.from('.services-title', {
        clipPath: 'inset(0 100% 0 0)',
        scrollTrigger: {
          trigger: '.services-title',
          start: 'top 85%',
          end: 'top 60%',
          scrub: 0.5
        }
      });
    }

    // Services title scale entrance
    gsap.from('.services-title .display-line', {
      opacity: 0,
      scale: 0.9,
      y: 30,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.services-title',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    if (isMobile) {
      // Mobile: simple fade-up for cards (no clip-path)
      gsap.from('.service-card', {
        opacity: 0, y: 40, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: '.services-grid', start: 'top 80%', toggleActions: 'play none none none' }
      });
    } else {
      // Desktop: each card reveals from a different corner via clip-path
      var clipDirections = [
        'inset(0 100% 100% 0)',     // top-left
        'inset(0 0 100% 100%)',     // top-right
        'inset(100% 100% 0 0)',     // bottom-left
        'inset(100% 0 0 100%)',     // bottom-right
        'inset(50% 50% 50% 50%)',   // center
        'inset(50% 50% 50% 50%)'    // center
      ];

      document.querySelectorAll('.service-card').forEach(function (card, i) {
        gsap.from(card, {
          clipPath: clipDirections[i] || clipDirections[4],
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.5
          }
        });
      });
    }
  }

  function initSectionProof() {
    if (prefersReducedMotion) return;

    // Entire content zooms from 80% to 100% scale
    gsap.from('.section-proof-content', {
      scale: isMobile ? 0.95 : 0.8,
      opacity: 0.5,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.section-proof',
        start: 'top 70%',
        ...(isMobile
          ? { toggleActions: 'play none none none' }
          : { end: 'top 10%', scrub: 0.8 })
      }
    });
  }

  function initSectionAction() {
    if (prefersReducedMotion) return;

    if (isMobile) {
      // Mobile: simple fade-up (no horizontal scrub)
      gsap.from('.action-left, .action-right', {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.15,
        scrollTrigger: { trigger: '.section-action', start: 'top 75%', toggleActions: 'play none none none' }
      });
    } else {
      // Desktop: left/right entrance with scrub
      gsap.from('.action-left', {
        x: -80,
        opacity: 0,
        scrollTrigger: {
          trigger: '.section-action',
          start: 'top 70%',
          end: 'top 30%',
          scrub: 0.5
        }
      });

      gsap.from('.action-right', {
        x: 80,
        opacity: 0,
        scrollTrigger: {
          trigger: '.section-action',
          start: 'top 65%',
          end: 'top 25%',
          scrub: 0.5
        }
      });
    }

    // Premium variant (centered) fades up
    gsap.from('.action-premium', {
      y: 40,
      opacity: 0,
      scrollTrigger: {
        trigger: '.action-premium',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    // Footer fade up
    gsap.from('.section-footer .footer-grid, .section-footer .footer-bottom', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.section-footer',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    // Footer parallax reveal — content inside slides up slightly as revealed (desktop only)
    if (!isMobile) {
      gsap.from('.section-footer .footer-grid', {
        y: 40,
        scrollTrigger: {
          trigger: '.section-footer',
          start: 'top bottom',
          end: 'top 50%',
          scrub: 0.5
        }
      });
    }
  }

  function initMagneticButtons() {
    // Only on desktop with hover capability
    if (window.matchMedia('(hover: none)').matches) return;
    if (prefersReducedMotion) return;

    document.querySelectorAll('.magnetic-btn').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });

      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxDist = 150;

        if (dist < maxDist) {
          var strength = (1 - dist / maxDist) * 15;
          var angle = Math.atan2(dy, dx);
          xTo(Math.cos(angle) * strength);
          yTo(Math.sin(angle) * strength);
        }
      });

      btn.addEventListener('mouseleave', function () {
        xTo(0);
        yTo(0);
      });
    });
  }

  function initCardTilt() {
    // Only on desktop with hover capability
    if (window.matchMedia('(hover: none)').matches) return;
    if (prefersReducedMotion) return;

    document.querySelectorAll('.service-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (y * -10) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'transform'
        });
      });
    });
  }

  function initDividers() {
    if (prefersReducedMotion) return;

    // Animated amber line between sections 3 and 4
    gsap.to('#dividerLine34', {
      width: '90%',
      scrollTrigger: {
        trigger: '#dividerLine34',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 0.5
      }
    });
  }

  function initCursorFollower() {
    if (window.matchMedia('(hover: none)').matches) return;
    if (prefersReducedMotion) return;

    var cursor = document.getElementById('cursorFollower');
    if (!cursor) return;

    var xTo = gsap.quickTo(cursor, 'left', { duration: 0.4, ease: 'power3.out' });
    var yTo = gsap.quickTo(cursor, 'top', { duration: 0.4, ease: 'power3.out' });

    var landingPage = document.getElementById('landingPage');

    landingPage.addEventListener('mousemove', function(e) {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!cursor.classList.contains('active')) {
        cursor.classList.add('active');
      }
    });

    landingPage.addEventListener('mouseleave', function() {
      cursor.classList.remove('active');
      cursor.classList.remove('hovering');
    });

    // Scale up when hovering interactive elements
    var interactiveEls = landingPage.querySelectorAll('button, a, .service-card, .trust-card, .pricing-card-new');
    interactiveEls.forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursor.classList.add('hovering'); });
      el.addEventListener('mouseleave', function() { cursor.classList.remove('hovering'); });
    });
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
    initDividers();
    initMagneticButtons();
    initCardTilt();
    initCursorFollower();

    console.log('[LANDING] Landing scroll system initialized');
  }

  // ============================================================
  // CLEANUP (called when navigating away from landing page)
  // ============================================================
  window.destroyLandingScroll = function () {
    if (lenisTickerFn) {
      gsap.ticker.remove(lenisTickerFn);
      lenisTickerFn = null;
    }
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

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
      gsap.set('#sectionHero .hero-brand-char, #sectionHero .landing-overline, #sectionHero .hero-subtitle, #sectionHero .hero-ctas > *, #sectionHero .hero-centerpiece, #sectionHero .hero-leaf', {
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

    // Hero centerpiece image — blur-to-sharp entrance
    var centerpiece = activeHero.querySelector('.hero-centerpiece');
    if (centerpiece) {
      tl.fromTo(centerpiece,
        { opacity: 0, scale: 1.15, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' },
        1.0
      );
    }

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

    // Hero image parallax (moves slower than text for depth)
    gsap.to('.hero-image-wrapper', {
      y: -60,
      scale: 0.92,
      scrollTrigger: {
        trigger: '#sectionHero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });
  }

  function initHeroTransition() {
    if (prefersReducedMotion) return;

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
    if (prefersReducedMotion) return;

    // Title clip-path reveal from left
    gsap.from('.services-title', {
      clipPath: 'inset(0 100% 0 0)',
      scrollTrigger: {
        trigger: '.services-title',
        start: 'top 85%',
        end: 'top 60%',
        scrub: 0.5
      }
    });

    // Each card reveals from a different corner via clip-path
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

  function initSectionProof() {
    if (prefersReducedMotion) return;

    // Entire content zooms from 80% to 100% scale
    gsap.from('.section-proof-content', {
      scale: 0.8,
      opacity: 0.5,
      scrollTrigger: {
        trigger: '.section-proof',
        start: 'top 70%',
        end: 'top 10%',
        scrub: 0.8
      }
    });
  }

  function initSectionAction() {
    if (prefersReducedMotion) return;

    // Left content enters from left
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

    // Right content enters from right
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

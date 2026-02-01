/**
 * Features Section - Scroll-Triggered Animations
 * Uses GSAP ScrollTrigger for staggered entrance and parallax effects
 */

(function () {
  'use strict';

  // Wait for GSAP and ScrollTrigger to be available
  function waitForGSAP(callback, maxAttempts = 50) {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 100);
      } else {
        console.warn('[FeaturesAnimation] GSAP or ScrollTrigger not loaded');
        // Fallback: show elements without animation
        showElementsWithoutAnimation();
      }
    };
    check();
  }

  // Fallback function if GSAP doesn't load
  function showElementsWithoutAnimation() {
    const elements = document.querySelectorAll(
      '.feature-content, .feature-mockup-bg, .feature-mockup-main'
    );
    elements.forEach((el) => {
      el.classList.add('animate-in');
    });
  }

  // Main initialization
  function initFeaturesAnimation() {
    const featureSections = document.querySelectorAll('.feature-section');

    if (featureSections.length === 0) {
      return;
    }

    featureSections.forEach((section, index) => {
      const content = section.querySelector('.feature-content');
      const mockupBg = section.querySelector('.feature-mockup-bg');
      const mockupMain = section.querySelector('.feature-mockup-main');
      const isReversed = section.classList.contains('reverse');

      // Create a timeline for this section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'bottom 25%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate content (text side)
      if (content) {
        // Set initial state
        gsap.set(content, {
          opacity: 0,
          y: 50,
        });

        tl.to(
          content,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            onComplete: () => content.classList.add('animate-in'),
          },
          0
        );
      }

      // Animate background mockup (decorative, offset layer)
      if (mockupBg) {
        const bgStartY = isReversed ? -20 : 20;
        const bgEndY = isReversed ? 20 : -30;

        gsap.set(mockupBg, {
          opacity: 0,
          y: bgStartY,
        });

        tl.to(
          mockupBg,
          {
            opacity: 0.6,
            y: bgEndY,
            duration: 1.2,
            ease: 'power2.out',
            onComplete: () => mockupBg.classList.add('animate-in'),
          },
          0.1
        );
      }

      // Animate main mockup card
      if (mockupMain) {
        gsap.set(mockupMain, {
          opacity: 0,
          y: 60,
        });

        tl.to(
          mockupMain,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            onComplete: () => mockupMain.classList.add('animate-in'),
          },
          0.15
        );
      }

      // Add parallax effect on scroll for mockup elements
      if (mockupBg && mockupMain) {
        gsap.to(mockupBg, {
          y: isReversed ? -40 : -50,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });

        gsap.to(mockupMain, {
          y: isReversed ? 20 : 30,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    });

    // Refresh ScrollTrigger after all animations are set up
    ScrollTrigger.refresh();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForGSAP(initFeaturesAnimation);
    });
  } else {
    waitForGSAP(initFeaturesAnimation);
  }
})();

/**
 * Features Section - Scroll-Triggered Animations
 * Uses GSAP ScrollTrigger for staggered entrance and parallax effects
 */

(function () {
  'use strict';

  // Preload images to prevent flickering
  function preloadImages(urls) {
    return Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to not block
            img.src = url;
          })
      )
    );
  }

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
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }

  // Main initialization
  function initFeaturesAnimation() {
    const featureSections = document.querySelectorAll('.feature-section');

    if (featureSections.length === 0) {
      return;
    }

    // Collect all image URLs for preloading
    const imageUrls = [
      'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
      'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    ];

    // Preload images then setup animations
    preloadImages(imageUrls).then(() => {
      setupAnimations(featureSections);
    });

    // Also start setup after a short delay as fallback
    setTimeout(() => {
      if (!window._featuresAnimationSetup) {
        setupAnimations(featureSections);
      }
    }, 500);
  }

  function setupAnimations(featureSections) {
    if (window._featuresAnimationSetup) return;
    window._featuresAnimationSetup = true;

    featureSections.forEach((section) => {
      const content = section.querySelector('.feature-content');
      const mockupBg = section.querySelector('.feature-mockup-bg');
      const mockupMain = section.querySelector('.feature-mockup-main');
      const isReversed = section.classList.contains('reverse');

      // Set initial states immediately (GSAP overrides CSS)
      if (content) {
        gsap.set(content, { opacity: 0, y: 40, immediateRender: true });
      }
      if (mockupBg) {
        gsap.set(mockupBg, { opacity: 0, y: isReversed ? -15 : 15, immediateRender: true });
      }
      if (mockupMain) {
        gsap.set(mockupMain, { opacity: 0, y: 50, immediateRender: true });
      }

      // Create entrance animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none', // Play once, don't reverse
        },
      });

      // Animate content (text side)
      if (content) {
        tl.to(content, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }, 0);
      }

      // Animate main mockup card (appears first, more prominent)
      if (mockupMain) {
        tl.to(mockupMain, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }, 0.1);
      }

      // Animate background mockup (subtle, decorative)
      if (mockupBg) {
        tl.to(mockupBg, {
          opacity: 0.5,
          y: isReversed ? 10 : -20,
          duration: 1,
          ease: 'power2.out',
        }, 0.2);
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

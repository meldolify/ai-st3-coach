/**
 * Features Accordion & Mobile Carousel
 * Desktop: Hover-to-expand accordion panels
 * Mobile: Swipe carousel with dot indicators
 */

(function() {
  'use strict';

  const MOBILE_BREAKPOINT = 768;
  let currentSlide = 0;
  let startX = 0;
  let isDragging = false;
  let accordion = null;
  let panels = null;
  let dotsContainer = null;
  let track = null;

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function initAccordion() {
    accordion = document.querySelector('.features-accordion');
    if (!accordion) return;

    panels = accordion.querySelectorAll('.accordion-panel');
    dotsContainer = accordion.querySelector('.carousel-dots');
    track = accordion.querySelector('.carousel-track');

    if (panels.length === 0) return;

    // Set up event listeners based on device type
    setupEventListeners();

    // Activate first panel by default
    panels[0].classList.add('active');

    // Set initial mode
    updateMode();

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateMode();
        if (!isMobile()) {
          // Reset carousel position when switching to desktop
          if (track) track.style.transform = '';
          currentSlide = 0;
        }
      }, 100);
    });
  }

  function setupEventListeners() {
    panels.forEach((panel, index) => {
      // Desktop: Hover to expand
      panel.addEventListener('mouseenter', () => {
        if (!isMobile()) {
          activatePanel(index);
        }
      });

      // Keyboard accessibility (both modes)
      panel.setAttribute('tabindex', '0');
      panel.setAttribute('role', 'button');
      panel.setAttribute('aria-label', panel.querySelector('.accordion-title')?.textContent || `Feature ${index + 1}`);

      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isMobile()) {
            goToSlide(index);
          } else {
            activatePanel(index);
          }
        }
        // Arrow key navigation
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = Math.min(index + 1, panels.length - 1);
          panels[nextIndex].focus();
          if (isMobile()) goToSlide(nextIndex);
          else activatePanel(nextIndex);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = Math.max(index - 1, 0);
          panels[prevIndex].focus();
          if (isMobile()) goToSlide(prevIndex);
          else activatePanel(prevIndex);
        }
      });
    });

    // Mobile touch events
    if (track) {
      track.addEventListener('touchstart', handleTouchStart, { passive: true });
      track.addEventListener('touchmove', handleTouchMove, { passive: true });
      track.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Dot click handlers
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
      });
    }
  }

  function handleTouchStart(e) {
    if (!isMobile()) return;
    startX = e.touches[0].clientX;
    isDragging = true;
    if (track) {
      track.style.transition = 'none';
    }
  }

  function handleTouchMove(e) {
    if (!isDragging || !isMobile() || !track) return;
    const diff = e.touches[0].clientX - startX;
    const baseTransform = -currentSlide * 100;
    const dragPercent = (diff / track.offsetWidth) * 100;
    track.style.transform = `translateX(${baseTransform + dragPercent}%)`;
  }

  function handleTouchEnd(e) {
    if (!isDragging || !isMobile()) return;
    isDragging = false;

    if (track) {
      track.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
    }

    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    const threshold = 50;

    if (diff > threshold && currentSlide > 0) {
      goToSlide(currentSlide - 1);
    } else if (diff < -threshold && currentSlide < panels.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      goToSlide(currentSlide); // Snap back
    }
  }

  function activatePanel(index) {
    panels.forEach((p, i) => {
      p.classList.toggle('active', i === index);
      p.setAttribute('aria-expanded', i === index ? 'true' : 'false');
    });
  }

  function goToSlide(index) {
    currentSlide = index;

    if (track) {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Update active states
    panels.forEach((p, i) => {
      p.classList.toggle('active', i === index);
      p.setAttribute('aria-expanded', i === index ? 'true' : 'false');
    });

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
        d.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }
  }

  function updateMode() {
    if (!accordion) return;

    if (isMobile()) {
      accordion.classList.add('carousel-mode');
    } else {
      accordion.classList.remove('carousel-mode');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordion);
  } else {
    initAccordion();
  }
})();

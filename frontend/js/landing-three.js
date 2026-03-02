// landing-three.js — Three.js 3D background scene for landing page
// Dependencies: Three.js r128 (loaded via CDN)

(function () {
  'use strict';

  // Guard: only run on pages with the landing page
  if (!document.getElementById('landingPage')) return;

  // Guard: skip on mobile (canvas hidden via CSS anyway)
  if (window.innerWidth < 768) return;

  // Guard: skip if reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Three.js scene will be built in Phase 3
  console.log('[LANDING] Three.js placeholder loaded');

  window.destroyLandingThree = function () {
    console.log('[LANDING] Three.js scene destroyed');
  };
})();

# Landing Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the `#landingPage` section of `index.html` as an immersive scroll-driven narrative with GSAP animations, Lenis smooth scroll, SplitType text reveals, and a Three.js 3D background. Theme: "Organic meets Technology."

**Architecture:** Replace the existing static landing page HTML (lines 153-333 of `index.html`) with 8 scroll sections, each using a distinct animation technique. New CSS in a separate file scoped to `#landingPage`. New JS in two files: `landing-scroll.js` (GSAP orchestration) and `landing-three.js` (WebGL scene). Existing auth/tier logic in `auth.js` updated to work with the new HTML structure.

**Tech Stack:** GSAP 3.12.5 + ScrollTrigger (CDN), Lenis 1.1.13 (CDN), SplitType 0.3.4 (CDN), Three.js r128 (CDN already loaded), Clash Display + General Sans (Fontshare CDN)

**Design spec:** See `C:\Users\mezze\.claude\plans\bubbly-purring-stonebraker.md` for full design details — color palette, typography scale, section-by-section layout, animation techniques, Three.js spec, hover interactions, accessibility requirements, and mobile strategy.

---

## Phase 1: Foundation (HTML + CSS + Fonts + Lenis)

### Task 1.1: Add CDN Dependencies

**Files:**
- Modify: `frontend/index.html` (lines 27-32 for fonts, line 1045 area for scripts)

**Step 1: Add Fontshare preconnect + CSS link**

Replace the Google Fonts block (lines 27-32):
```html
<!-- OLD (lines 27-32): -->
<!-- Fonts: Instrument Serif (display) + Outfit (body) + DM Sans (status) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- NEW: Keep existing Google Fonts (used by non-landing pages) AND add Fontshare -->
<!-- Fonts: Instrument Serif + Outfit + DM Sans (existing pages) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!-- Fonts: Clash Display + General Sans (landing page) -->
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/css?f[]=clash-display@400,500,600,700&f[]=general-sans@400,500,600,700&display=swap">
```

**Step 2: Add Lenis + SplitType script tags before the existing GSAP scripts**

After the Three.js script tag (line 1045), add new CDN scripts. Also add the new landing page JS files after `app.js`. Remove the 3 old landing page script tags:

```html
<!-- Smooth scroll (landing page) -->
<script defer src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
<!-- Text splitting (landing page) -->
<script defer src="https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js"></script>

<!-- ... existing app scripts stay ... -->

<!-- Landing page redesign (replaces features-scroll-animation.js, features-accordion.js, glow-effect.js) -->
<script defer src="js/landing-scroll.js"></script>
<script defer src="js/landing-three.js"></script>

<!-- REMOVE these three lines: -->
<!-- <script defer src="js/glow-effect.js"></script> -->
<!-- <script defer src="js/features-scroll-animation.js"></script> -->
<!-- <script defer src="js/features-accordion.js"></script> -->
```

**IMPORTANT:** Keep GSAP + ScrollTrigger CDN links that already exist (they're used by the new code). The existing GSAP CDN links (~line 1043-1044) should stay. If they're not currently present in index.html, add them:
```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

**Step 3: Add landing page CSS link**

After `<link rel="stylesheet" href="styles/main.css">` (line 35), add:
```html
<link rel="stylesheet" href="css/landing-redesign.css">
```

**Step 4: Verify**

Run: `cd frontend && python -m http.server 5500`
Open Chrome: `http://localhost:5500`
Expected: Page loads without errors. Check Network tab — Fontshare CSS loads. Check console — no script errors from missing files (landing-scroll.js etc. don't exist yet, but they're deferred so should just 404 silently).

**Step 5: Commit**
```bash
git add frontend/index.html
git commit -m "feat(landing): add CDN deps — Fontshare fonts, Lenis, SplitType"
```

---

### Task 1.2: Create Landing Page CSS Foundation

**Files:**
- Create: `frontend/css/landing-redesign.css`

**Step 1: Create the CSS file with palette, typography, and base section styles**

This is a large file (~600+ lines). Create `frontend/css/landing-redesign.css` with the following sections:

1. **CSS custom properties** — the color palette from the design spec (see plan file)
2. **Typography utility classes** — `.landing-display`, `.landing-body`, `.landing-overline`, `.landing-caption`
3. **Section base styles** — each section: `.section-hero`, `.section-who`, `.section-why`, `.section-trust`, `.section-services`, `.section-proof`, `.section-action`, `.section-footer`
4. **Light/dark section backgrounds** — `.section--light { background: var(--organic-cream); }`, `.section--dark { background: var(--organic-canopy); }`
5. **Noise grain overlay** — `.grain-overlay` styles (position:fixed, inset:0, z-index:9999, pointer-events:none, opacity:0.06, mix-blend-mode:overlay)
6. **Nav styles** — `.landing-nav-new` (to avoid conflict with existing `.landing-nav`)
7. **Button styles** — `.btn-amber` (primary CTA), `.btn-outline` (secondary)
8. **Card styles** — feature cards, trust cards, pricing cards
9. **Footer styles** — new footer layout
10. **Responsive breakpoints** — mobile (<768px), tablet (768-1023px)
11. **Reduced motion** — `@media (prefers-reduced-motion: reduce)` block
12. **Accessibility** — focus outlines, skip-to-content

All styles scoped inside `#landingPage` selector to avoid affecting other pages.

Refer to design spec for exact values: color palette, type scale table, section-by-section layout, card styling, button styling.

**Step 2: Verify**

Refresh browser. No visible changes yet (HTML not updated), but CSS file should load without errors in Network tab.

**Step 3: Commit**
```bash
git add frontend/css/landing-redesign.css
git commit -m "feat(landing): create CSS foundation — palette, typography, section layouts"
```

---

### Task 1.3: Replace Landing Page HTML Structure

**Files:**
- Modify: `frontend/index.html` (replace lines 153-333 — the entire `#landingPage` div)

**Step 1: Replace the `#landingPage` content**

Replace everything from `<div id="landingPage" class="page">` through its closing `</div>` (line ~333) with the new 8-section HTML structure.

Key structural elements:
```html
<div id="landingPage" class="page">
  <!-- SVG Grain Overlay -->
  <svg class="grain-overlay" aria-hidden="true">
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)"/>
  </svg>

  <!-- Three.js Canvas Container -->
  <canvas id="landingCanvas" aria-hidden="true" role="presentation"></canvas>

  <!-- Navigation -->
  <nav class="landing-nav-new" id="landingNav">
    <!-- Logo + nav links (guest vs user variants, same IDs as before for auth.js compat) -->
  </nav>

  <!-- Section 1: Hero -->
  <section class="section-hero section--light" id="sectionHero">
    <!-- Logged-out variant -->
    <div class="hero-logged-out" id="heroLoggedOut">
      <span class="landing-overline">INTERVIEW PREPARATION, REIMAGINED</span>
      <h1 class="landing-display hero-display" aria-label="PRACTICE ANY TIME. ANY WHERE.">
        <span class="hero-line">PRACTICE</span>
        <span class="hero-line">ANY TIME.</span>
        <span class="hero-line">ANY WHERE.</span>
      </h1>
      <p class="landing-body hero-subtitle">AI-powered simulated interviews for surgical training. Hand-crafted stations. 24/7 access.</p>
      <div class="hero-ctas">
        <button class="btn-amber magnetic-btn" onclick="browseAsGuest()">Try Free Samples</button>
        <button class="btn-outline magnetic-btn" onclick="showAuthPage('signup')">Sign Up</button>
      </div>
    </div>
    <!-- Logged-in variant -->
    <div class="hero-logged-in initially-hidden" id="heroLoggedIn">
      <h1 class="landing-display hero-display" aria-label="WELCOME BACK.">
        <span class="hero-line">WELCOME</span>
        <span class="hero-line">BACK.</span>
      </h1>
      <button class="btn-amber btn-amber--lg magnetic-btn" onclick="showProtectedContent()">Go to Dashboard →</button>
    </div>
    <!-- Parallax blobs (desktop only, hidden on mobile via CSS) -->
    <div class="parallax-blob parallax-blob--1" aria-hidden="true"></div>
    <div class="parallax-blob parallax-blob--2" aria-hidden="true"></div>
    <div class="parallax-blob parallax-blob--3" aria-hidden="true"></div>
  </section>

  <!-- Section 2: Who -->
  <section class="section-who section--dark" id="sectionWho">
    <!-- Two-column layout: display text left, body text right -->
  </section>

  <!-- Section 3: Why (pinned) -->
  <section class="section-why section--light" id="sectionWhy">
    <!-- Pinned text left, 3 phases right, progress indicator -->
  </section>

  <!-- Section 4: Trust -->
  <section class="section-trust section--dark" id="sectionTrust">
    <!-- Parallax text strip, word-by-word display, 3 proof cards -->
  </section>

  <!-- Section 5: Services -->
  <section class="section-services section--light" id="sectionServices">
    <!-- Section title, 6 feature cards in asymmetric grid -->
  </section>

  <!-- Section 6: Proof -->
  <section class="section-proof" id="sectionProof">
    <!-- Zoom-in content, CTA button -->
  </section>

  <!-- Section 7: Action -->
  <section class="section-action" id="sectionAction">
    <!-- Tier-dependent: pricing or dashboard CTA -->
    <div class="action-with-pricing" id="actionPricing">
      <!-- Split layout: display text left, pricing cards right -->
    </div>
    <div class="action-premium initially-hidden" id="actionPremium">
      <!-- Centered: "YOUR JOURNEY CONTINUES" + dashboard button -->
    </div>
  </section>

  <!-- Section 8: Footer -->
  <footer class="section-footer" id="sectionFooter">
    <!-- SVG wave divider, logo, 3-column links, copyright -->
  </footer>
</div>
```

**CRITICAL:** Keep the same IDs where auth.js expects them: `navLinksGuest`, `navLinksUser`, `navPricingUser`, `pricingSection` (now `sectionAction` or wrap pricing in `id="pricingSection"`). The hero buttons get new IDs — auth.js will be updated in Task 4.1.

For now, keep old IDs where possible to avoid breaking auth.js before we update it:
- Keep `id="navLinksGuest"` and `id="navLinksUser"` on nav link containers
- Keep `id="navPricingUser"` on the pricing nav link for logged-in users
- Add `id="pricingSection"` as an alias on the pricing card wrapper in Section 7

**Step 2: Fill in all section content**

Write the full HTML for all 8 sections. Refer to the design spec for exact copy text, element classes, and structure. Each section should render as readable static content even without JS/animations.

**Step 3: Verify**

Refresh browser. The page should render with:
- Correct fonts (Clash Display for headings, General Sans for body)
- Alternating light/dark section backgrounds
- All text content visible and readable
- Navigation working (links, buttons wired to existing functions)
- No broken styles on other pages (specialty selection, difficulty, etc.)
- Hash navigation still works: click through Explore → specialty → difficulty → mode

Check console for errors. There will be 404s for `landing-scroll.js` and `landing-three.js` which is expected.

**Step 4: Commit**
```bash
git add frontend/index.html
git commit -m "feat(landing): replace HTML structure with 8-section scroll narrative"
```

---

### Task 1.4: Create Minimal landing-scroll.js with Lenis Init

**Files:**
- Create: `frontend/js/landing-scroll.js`

**Step 1: Create the file with Lenis + GSAP setup**

```javascript
// landing-scroll.js — Landing page scroll animation orchestration
// Dependencies: Lenis, GSAP, ScrollTrigger, SplitType (all loaded via CDN)

(function() {
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
    if (prefersReducedMotion) return; // Skip smooth scroll if reduced motion
    if (typeof Lenis === 'undefined') { console.warn('[LANDING] Lenis not loaded'); return; }

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false // Don't override native touch scroll
    });

    // Connect Lenis to GSAP's ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Feed Lenis into GSAP ticker (time in seconds → ms)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    console.log('[LANDING] Lenis smooth scroll initialized');
  }

  // ============================================================
  // GSAP + SCROLLTRIGGER REGISTRATION
  // ============================================================
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[LANDING] GSAP or ScrollTrigger not loaded');
      return false;
    }
    gsap.registerPlugin(ScrollTrigger);
    console.log('[LANDING] GSAP + ScrollTrigger registered');
    return true;
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    if (!initGSAP()) return;
    initLenis();

    // Animation functions will be added in Phase 2
    console.log('[LANDING] Landing scroll system initialized');
  }

  // ============================================================
  // CLEANUP (called when navigating away from landing page)
  // ============================================================
  window.destroyLandingScroll = function() {
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    ScrollTrigger.getAll().forEach(st => st.kill());
    console.log('[LANDING] Landing scroll system destroyed');
  };

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**Step 2: Create minimal landing-three.js placeholder**

```javascript
// landing-three.js — Three.js 3D background scene for landing page
// Dependencies: Three.js r128 (loaded via CDN)

(function() {
  'use strict';

  // Guard: only run on pages with the landing page
  if (!document.getElementById('landingPage')) return;
  // Guard: skip on mobile
  if (window.innerWidth < 768) return;
  // Guard: skip if reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Three.js scene will be built in Phase 3
  console.log('[LANDING] Three.js placeholder loaded (scene built in Phase 3)');

  window.destroyLandingThree = function() {
    console.log('[LANDING] Three.js scene destroyed');
  };
})();
```

**Step 3: Verify**

Refresh browser. Console should show:
```
[LANDING] GSAP + ScrollTrigger registered
[LANDING] Lenis smooth scroll initialized
[LANDING] Landing scroll system initialized
[LANDING] Three.js placeholder loaded
```

Smooth scroll should work — test by scrolling with mousewheel, it should feel buttery/momentum-based.

Navigate to `#scenarioSelection` → verify scroll doesn't break on other pages.

**Step 4: Commit**
```bash
git add frontend/js/landing-scroll.js frontend/js/landing-three.js
git commit -m "feat(landing): init Lenis smooth scroll + GSAP ScrollTrigger foundation"
```

---

### Task 1.5: Update app.js — Remove Old Scroll Init

**Files:**
- Modify: `frontend/js/app.js` (lines 630-689 for `initScrollAnimations()`, line 730 for the call)

**Step 1: Modify `initScrollAnimations()` to skip landing page elements**

The function currently observes `.animate-on-scroll` and `.scroll-reveal` elements. These classes are used by the OLD landing page. The new landing page doesn't use them. But other pages might use `.scroll-reveal` — check first.

Safest approach: keep `initScrollAnimations()` as-is but ensure it doesn't conflict. The old landing HTML with `.scroll-reveal` elements is gone (replaced in Task 1.3), so the observer will simply find no matching elements in the landing page. No code change needed unless there are conflicts.

However, we need to ensure `destroyLandingScroll()` is called when navigating away:

In `showPage()` (line 695), add cleanup at the start:
```javascript
function showPage(pageId) {
  // Clean up landing page scroll if navigating away
  if (pageId !== 'landingPage' && typeof window.destroyLandingScroll === 'function') {
    window.destroyLandingScroll();
  }
  if (pageId !== 'landingPage' && typeof window.destroyLandingThree === 'function') {
    window.destroyLandingThree();
  }
  // ... rest of function
}
```

**Step 2: Verify**

Navigate from landing → specialty selection → back. No console errors. Smooth scroll should stop on non-landing pages and resume when returning.

**Step 3: Commit**
```bash
git add frontend/js/app.js
git commit -m "feat(landing): add scroll cleanup on page navigation"
```

---

## Phase 2: Scroll Animations

### Task 2.1: Hero Entrance Choreography

**Files:**
- Modify: `frontend/js/landing-scroll.js`

**Step 1: Add hero entrance timeline after `init()`**

```javascript
function initHeroEntrance() {
  if (prefersReducedMotion) {
    // Show everything immediately
    gsap.set('#sectionHero .hero-line, #sectionHero .landing-overline, #sectionHero .hero-subtitle, #sectionHero .hero-ctas', { opacity: 1, y: 0 });
    return;
  }

  const heroLines = document.querySelectorAll('#sectionHero .hero-line');
  if (!heroLines.length) return;

  // SplitType each hero line into characters
  const splits = [];
  heroLines.forEach(line => {
    const split = new SplitType(line, { types: 'chars', tagName: 'span' });
    splits.push(split);
  });

  const tl = gsap.timeline({ delay: 0.2 });

  // Nav fade in
  tl.from('#landingNav', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' }, 0);

  // Overline fade up
  tl.from('#sectionHero .landing-overline', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, 0.4);

  // Character reveals per line, staggered
  splits.forEach((split, i) => {
    tl.from(split.chars, {
      opacity: 0, y: 30, duration: 0.6,
      stagger: 0.025, ease: 'back.out(1.7)'
    }, 0.6 + i * 0.3);
  });

  // Subtitle fade up
  tl.from('#sectionHero .hero-subtitle', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, 1.6);

  // CTA buttons slide up
  tl.from('#sectionHero .hero-ctas > *', { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 1.8);
}
```

Add `font-kerning: none;` to `.hero-line` in CSS (prevents character shifting from SplitType).

**Step 2: Add parallax blobs (scroll-driven)**

```javascript
function initHeroParallax() {
  if (prefersReducedMotion) return;
  const blobs = document.querySelectorAll('.parallax-blob');
  blobs.forEach(blob => {
    const speed = parseFloat(blob.dataset.speed) || 0.5;
    gsap.to(blob, {
      y: () => window.innerHeight * speed * 0.5,
      scrollTrigger: { trigger: '#sectionHero', start: 'top top', end: 'bottom top', scrub: 0.3 }
    });
  });
}
```

**Step 3: Add hero→Section 2 transition (bg color tween)**

```javascript
function initHeroTransition() {
  if (prefersReducedMotion) return;
  // Hero text parallaxes up faster than scroll
  gsap.to('#sectionHero .hero-logged-out, #sectionHero .hero-logged-in', {
    y: -100, opacity: 0,
    scrollTrigger: { trigger: '#sectionHero', start: '60% top', end: 'bottom top', scrub: true }
  });
}
```

**Step 4: Verify**

Hard refresh. Watch: nav fades in → overline → characters stagger → subtitle → buttons. Scroll: hero text parallaxes up. Blobs drift at different speeds.

**Step 5: Commit**
```bash
git add frontend/js/landing-scroll.js frontend/css/landing-redesign.css
git commit -m "feat(landing): hero entrance choreography + parallax blobs"
```

---

### Task 2.2: Section 2 — Clip-Path Circle Reveal

**Files:**
- Modify: `frontend/js/landing-scroll.js`
- Modify: `frontend/css/landing-redesign.css`

**Step 1: Add CSS initial state**
```css
.section-who { clip-path: circle(0% at 50% 50%); }
```

**Step 2: Add GSAP animation**
```javascript
function initSectionWho() {
  if (prefersReducedMotion) { gsap.set('.section-who', { clipPath: 'circle(150% at 50% 50%)' }); return; }

  // Circle expand reveal
  gsap.to('.section-who', {
    clipPath: 'circle(150% at 50% 50%)',
    scrollTrigger: { trigger: '.section-who', start: 'top 80%', end: 'top 20%', scrub: 0.5 }
  });

  // Text lines reveal (after clip reaches ~60%)
  const whoLines = document.querySelectorAll('.section-who .display-line');
  if (whoLines.length) {
    const whoSplits = [];
    whoLines.forEach(line => {
      whoSplits.push(new SplitType(line, { types: 'lines', tagName: 'span' }));
    });
    gsap.from('.section-who .display-line', {
      opacity: 0, x: -60, duration: 0.8, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.section-who', start: 'top 40%', toggleActions: 'play none none none' }
    });
  }

  // Body text fade up
  gsap.from('.section-who .who-body', {
    opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.section-who .who-body', start: 'top 80%', toggleActions: 'play none none none' }
  });
}
```

**Step 3: Verify** — Scroll past hero. Dark section should expand from a circle. Text lines slide in from left.

**Step 4: Commit**
```bash
git add frontend/js/landing-scroll.js frontend/css/landing-redesign.css
git commit -m "feat(landing): section 2 clip-path circle reveal + line animations"
```

---

### Task 2.3: Section 3 — Pinned Scroll with 3-Phase Content

**Files:**
- Modify: `frontend/js/landing-scroll.js`

**Step 1: Add pinned scroll timeline**

```javascript
function initSectionWhy() {
  if (prefersReducedMotion) return;

  const section = document.querySelector('.section-why');
  if (!section) return;

  const phases = section.querySelectorAll('.why-phase');
  if (phases.length < 3) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.section-why',
      pin: true,
      start: 'top top',
      end: '+=300%',
      scrub: 1
    }
  });

  // Pinned text zoom: 0.9→1.0 at 50%
  tl.fromTo('.why-display', { scale: 0.9, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.5 }, 0);

  // Phase 1 visible at start, fades out at 30%
  tl.to(phases[0], { opacity: 0, y: -40, duration: 0.15 }, 0.25);
  // Phase 2 fades in at 30%, fades out at 65%
  tl.fromTo(phases[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.15 }, 0.3);
  tl.to(phases[1], { opacity: 0, y: -40, duration: 0.15 }, 0.55);
  // Phase 3 fades in at 65%
  tl.fromTo(phases[2], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.15 }, 0.6);

  // Progress indicator
  tl.fromTo('.why-progress-line', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
}
```

**Step 2: Verify** — Section pins on scroll. Left text zooms in. Right content morphs through 3 phases. Progress line fills.

**Step 3: Commit**
```bash
git add frontend/js/landing-scroll.js
git commit -m "feat(landing): section 3 pinned scroll with 3-phase content morph"
```

---

### Task 2.4: Section 4 — Parallax Text Strip + Word Reveal

**Files:**
- Modify: `frontend/js/landing-scroll.js`

**Step 1: Add parallax strip + word-by-word reveal**

```javascript
function initSectionTrust() {
  if (prefersReducedMotion) return;

  // Parallax text strip — moves left on scroll
  gsap.to('.trust-strip', {
    x: '-30%',
    scrollTrigger: { trigger: '.section-trust', start: 'top bottom', end: 'bottom top', scrub: 0.3 }
  });

  // Word-by-word reveal with blur-to-sharp
  const trustDisplay = document.querySelector('.trust-display');
  if (trustDisplay) {
    const split = new SplitType(trustDisplay, { types: 'words', tagName: 'span' });
    gsap.from(split.words, {
      opacity: 0, y: 20, filter: 'blur(4px)', duration: 0.6,
      stagger: 0.04, ease: 'power2.out',
      scrollTrigger: { trigger: trustDisplay, start: 'top 70%', end: 'top 30%', scrub: 0.5 }
    });
  }

  // Trust cards staggered entrance
  gsap.from('.trust-card', {
    opacity: 0, y: 60, duration: 0.8, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.trust-cards', start: 'top 80%', toggleActions: 'play none none none' }
  });
}
```

**Step 2: Verify** — Large background text moves left as you scroll. Display text words appear with blur-to-sharp. Cards stagger in.

**Step 3: Commit**
```bash
git add frontend/js/landing-scroll.js
git commit -m "feat(landing): section 4 parallax text strip + word-blur reveal"
```

---

### Task 2.5: Section 5 — Rectangular Clip-Path Card Reveals

**Files:**
- Modify: `frontend/js/landing-scroll.js`
- Modify: `frontend/css/landing-redesign.css`

**Step 1: Add clip-path reveals from different corners**

```javascript
function initSectionServices() {
  if (prefersReducedMotion) return;

  // Title clip-path reveal from left
  gsap.from('.services-title', {
    clipPath: 'inset(0 100% 0 0)',
    scrollTrigger: { trigger: '.services-title', start: 'top 85%', end: 'top 60%', scrub: 0.5 }
  });

  // Each card from a different corner
  const clipDirections = [
    'inset(0 100% 100% 0)',    // top-left
    'inset(0 0 100% 100%)',    // top-right
    'inset(100% 100% 0 0)',    // bottom-left
    'inset(100% 0 0 100%)',    // bottom-right
    'inset(50% 50% 50% 50%)', // center
    'inset(50% 50% 50% 50%)'  // center
  ];

  document.querySelectorAll('.service-card').forEach((card, i) => {
    gsap.from(card, {
      clipPath: clipDirections[i] || clipDirections[4],
      scrollTrigger: { trigger: card, start: 'top 85%', end: 'top 55%', scrub: 0.5 }
    });
  });
}
```

**Step 2: Add 3D card tilt hover effect**

```javascript
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return; // Skip on touch devices

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform' });
    });
  });
}
```

**Step 3: Verify** — Cards reveal from different corners. Hover: card tilts in 3D.

**Step 4: Commit**
```bash
git add frontend/js/landing-scroll.js frontend/css/landing-redesign.css
git commit -m "feat(landing): section 5 clip-path card reveals + 3D tilt hover"
```

---

### Task 2.6: Section 6 — Scale Zoom + Section 7 — Split Screen

**Files:**
- Modify: `frontend/js/landing-scroll.js`

**Step 1: Section 6 zoom-in**

```javascript
function initSectionProof() {
  if (prefersReducedMotion) return;

  gsap.from('.section-proof-content', {
    scale: 0.8, opacity: 0.5,
    scrollTrigger: { trigger: '.section-proof', start: 'top 70%', end: 'top 10%', scrub: 0.8 }
  });
}
```

**Step 2: Section 7 split-screen reveal**

```javascript
function initSectionAction() {
  if (prefersReducedMotion) return;

  gsap.from('.action-left', {
    x: -80, opacity: 0,
    scrollTrigger: { trigger: '.section-action', start: 'top 70%', end: 'top 30%', scrub: 0.5 }
  });
  gsap.from('.action-right', {
    x: 80, opacity: 0,
    scrollTrigger: { trigger: '.section-action', start: 'top 65%', end: 'top 25%', scrub: 0.5 }
  });
}
```

**Step 3: Verify** — Section 6 zooms in. Section 7 content enters from opposite sides.

**Step 4: Commit**
```bash
git add frontend/js/landing-scroll.js
git commit -m "feat(landing): sections 6-7 zoom and split-screen animations"
```

---

### Task 2.7: Magnetic Buttons + Elastic Card Hover + Nav Underline

**Files:**
- Modify: `frontend/js/landing-scroll.js`
- Modify: `frontend/css/landing-redesign.css`

**Step 1: Magnetic button effect**

```javascript
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const strength = (1 - dist / 150) * 15;
        xTo(dx / dist * strength);
        yTo(dy / dist * strength);
      }
    });
    btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}
```

**Step 2: CSS for elastic trust card hover + nav underline**

```css
.trust-card { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.trust-card:hover { transform: scale(1.03); }

.landing-nav-new .nav-link { position: relative; }
.landing-nav-new .nav-link::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 100%; height: 2px; background: var(--organic-amber);
  transform: scaleX(0); transform-origin: left; transition: transform 0.3s ease;
}
.landing-nav-new .nav-link:hover::after { transform: scaleX(1); }
```

**Step 3: Verify** — Hover over CTAs: magnetic pull. Hover trust cards: elastic overshoot. Hover nav links: underline animates from left.

**Step 4: Commit**
```bash
git add frontend/js/landing-scroll.js frontend/css/landing-redesign.css
git commit -m "feat(landing): magnetic buttons, elastic card hover, nav underlines"
```

---

## Phase 3: Three.js Background

### Task 3.1: Build the Displaced Icosahedron Scene

**Files:**
- Modify: `frontend/js/landing-three.js`

**Step 1: Replace placeholder with full Three.js scene**

Build the scene as specified in the design doc:
- IcosahedronGeometry(2, 64)
- Custom ShaderMaterial with Perlin noise vertex displacement
- Vertex shader: ashima webgl-noise GLSL embedded as JS string
- Fragment shader: base color --organic-forest, wireframe overlay, fresnel rim glow
- Uniforms: uTime, uScroll, uDisplacement
- AmbientLight + DirectionalLight
- Fixed camera at z=5, no controls
- Canvas: position fixed, inset 0, z-index 0

**Step 2: Connect scroll to scene**

Use the Lenis scroll callback (or `window.addEventListener('scroll')` as fallback):
- `mesh.rotation.y = scrollProgress * Math.PI * 0.5`
- `mesh.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.2`
- `material.uniforms.uDisplacement.value = 0.15 + scrollProgress * 0.4`
- `mesh.scale.setScalar(1.0 + Math.sin(scrollProgress * Math.PI) * 0.2)`

**Step 3: Add section-based opacity**

ScrollTrigger tweens on `renderer.domElement.style.opacity`:
- Hero: 0.4 opacity (visible but subtle)
- Light sections: 0.15 opacity
- Dark sections: 0.5 opacity
- Transitions scrubbed

**Step 4: Add performance guards**

- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- Debounced resize handler (250ms)
- `display: none` on mobile (<768px)
- WebGL capability check: if no WebGL, hide canvas

**Step 5: Verify**

Refresh. Behind the content, a green organic shape should slowly rotate and morph as you scroll. It should be subtle (low opacity on light sections). On mobile viewport in DevTools — canvas should be hidden.

Performance: Chrome DevTools Performance tab → record a full page scroll. Target: no long frames, 60fps maintained.

**Step 6: Commit**
```bash
git add frontend/js/landing-three.js
git commit -m "feat(landing): Three.js displaced icosahedron with scroll-reactive morphing"
```

---

## Phase 4: Tier Logic + Auth Integration

### Task 4.1: Update auth.js for New HTML Structure

**Files:**
- Modify: `frontend/js/auth.js` (functions: `updateLandingPageForAuthState`, `renderActionCards`)

**Step 1: Update `updateLandingPageForAuthState()`**

The new HTML has different elements than before. Update the function to:
- Toggle `#heroLoggedOut` / `#heroLoggedIn` visibility based on auth state
- Toggle `#actionPricing` / `#actionPremium` in Section 7 based on subscription
- Keep nav link guest/user toggle (same IDs `navLinksGuest`, `navLinksUser`)
- Keep pricing nav link hide for subscribed users (same ID `navPricingUser`)

Replace the hero CTA button logic (old: `heroPrimaryBtn`/`heroSecondaryBtn`) with new element visibility toggling:

```javascript
// === HERO SECTION ===
const heroLoggedOut = document.getElementById('heroLoggedOut');
const heroLoggedIn = document.getElementById('heroLoggedIn');
if (heroLoggedOut && heroLoggedIn) {
  heroLoggedOut.style.display = isLoggedIn ? 'none' : '';
  heroLoggedIn.style.display = isLoggedIn ? '' : 'none';
}

// === PRICING / ACTION SECTION ===
const actionPricing = document.getElementById('actionPricing');
const actionPremium = document.getElementById('actionPremium');
if (actionPricing && actionPremium) {
  actionPricing.style.display = isSubscribed ? 'none' : '';
  actionPremium.style.display = isSubscribed ? '' : 'none';
}
```

**Step 2: Simplify or remove `renderActionCards()`**

The old action cards section is gone. `renderActionCards()` can be reduced to a no-op or removed entirely. However, it's called by `updateLandingPageForAuthState()`, so either:
- Remove the call in `updateLandingPageForAuthState()`
- Or make `renderActionCards()` a no-op: `function renderActionCards() { /* Removed — replaced by new landing page sections */ }`

Choose the no-op approach to avoid breaking anything that might call it.

**Step 3: Verify**

Test all 3 tiers:
1. **Unlogged:** Open incognito. Should see "PRACTICE ANY TIME. ANY WHERE." hero + pricing in Section 7.
2. **Free:** In console: `testTierOverride = 'free'`, then call `updateLandingPageForAuthState()`. Same as unlogged but verify nav shows logged-in links.
3. **Premium:** In console: `testTierOverride = 'premium'`, then call `updateLandingPageForAuthState()`. Should see "WELCOME BACK" hero + "YOUR JOURNEY CONTINUES" in Section 7 (no pricing).

Check CTA buttons: "Try Free Samples" calls `browseAsGuest()`, "Sign Up" calls `showAuthPage('signup')`, "Go to Dashboard" calls `showProtectedContent()`.

**Step 4: Commit**
```bash
git add frontend/js/auth.js
git commit -m "feat(landing): update auth.js tier logic for new section structure"
```

---

### Task 4.2: Check glow-effect.js Impact

**Files:**
- Modify: `frontend/index.html` (if needed — glow-effect script tag)

**Step 1: Check if glow-effect.js is needed by non-landing pages**

The glow effect targets: `.btn-primary`, `.btn-secondary`, `.feature-card`, `.action-card`, `.specialty-card`, `.difficulty-card`, `.mode-card`, `.scenario-card`, `.topic-card`.

Of these, `.specialty-card`, `.scenario-card`, `.topic-card`, `.mode-card`, `.difficulty-card` are used on selection flow pages. So **keep glow-effect.js** but it won't find any matching elements on the landing page (old classes removed). No changes needed.

Actually wait — we REMOVED the `<script>` tag in Task 1.1. We need to add it back for the non-landing pages, OR move it to be loaded conditionally. Simplest: **keep the script tag**. The glow effect checks `(hover: hover)` media query and uses `querySelectorAll` — if no matching elements exist on the current visible page, it harmlessly does nothing.

**Step 2: Re-add glow-effect.js script tag** (if removed in Task 1.1)

Keep `<script defer src="js/glow-effect.js"></script>` in index.html — it's still needed for selection flow pages.

**Step 3: Verify** — Navigate to specialty selection. Glow effect still works on cards.

**Step 4: Commit** (if changes needed)
```bash
git add frontend/index.html
git commit -m "fix(landing): keep glow-effect.js for selection flow pages"
```

---

## Phase 5: Responsive + Polish

### Task 5.1: Mobile Responsive Styles

**Files:**
- Modify: `frontend/css/landing-redesign.css`

**Step 1: Add mobile breakpoint styles**

Inside `@media (max-width: 767px)`:
- Hero: stack CTAs vertically, hide parallax blobs, smaller display font
- Section 2: single column, translateY instead of translateX for text
- Section 3: reduce pin to `+=200%`, stack layout
- Section 4: cards stack, parallax strip moves less
- Section 5: single column cards, clip-path from bottom only
- Section 6: smaller padding, zoom starts at 0.9
- Section 7: cards stack, Premium first
- Footer: single column

**Step 2: Add tablet breakpoint**

Inside `@media (min-width: 768px) and (max-width: 1023px)`:
- Tighter gaps on grids
- Three.js lower pixel ratio
- Section 3 pin at `+=250%`

**Step 3: Verify**

Chrome DevTools → Pixel 5 (393px): check all 8 sections stack correctly, text is readable, no horizontal overflow.
Galaxy Tab S4 (712px): check layouts are adjusted.

**Step 4: Commit**
```bash
git add frontend/css/landing-redesign.css
git commit -m "feat(landing): mobile + tablet responsive breakpoints"
```

---

### Task 5.2: Reduced Motion + Accessibility

**Files:**
- Modify: `frontend/css/landing-redesign.css`
- Modify: `frontend/js/landing-scroll.js`

**Step 1: CSS reduced motion**
```css
@media (prefers-reduced-motion: reduce) {
  #landingPage *, #landingPage *::before, #landingPage *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .section-who { clip-path: none !important; }
  .grain-overlay { display: none; }
}
```

**Step 2: JS already checks `prefersReducedMotion`** at the top of `landing-scroll.js` and skips GSAP animations. Verify each `init*` function has the guard.

**Step 3: Focus outlines**
```css
#landingPage :focus-visible {
  outline: 2px solid var(--organic-amber);
  outline-offset: 4px;
}
```

**Step 4: Verify**

Windows Settings → Accessibility → Visual effects → turn off animations → refresh page. All content should be visible immediately, no animations. Tab through page — amber focus outlines on all buttons/links.

**Step 5: Commit**
```bash
git add frontend/css/landing-redesign.css frontend/js/landing-scroll.js
git commit -m "feat(landing): reduced motion support + keyboard focus outlines"
```

---

### Task 5.3: Performance Audit

**Step 1: Chrome DevTools Performance recording**

- Record a full page scroll from top to bottom
- Check for any frames > 16ms (drops below 60fps)
- If Three.js is causing jank: reduce geometry detail (64→32), or lower pixel ratio

**Step 2: Check Lighthouse**

- Run Lighthouse performance audit
- Target: Performance > 80, LCP < 2.5s, CLS < 0.1

**Step 3: Optimize if needed**

Common fixes:
- Debounce expensive scroll handlers
- Use `will-change: transform` on animated elements (sparingly)
- Lazy-initialize Three.js (don't build scene until user scrolls past hero)
- Remove unused CSS from `landing-redesign.css`

**Step 4: Commit any optimizations**
```bash
git add -A
git commit -m "perf(landing): optimize scroll animation performance"
```

---

### Task 5.4: E2E Test Selector Updates

**Files:**
- Modify: `e2e-tests/tests/landing.spec.ts`
- Modify: `e2e-tests/helpers/selectors.ts`

**Step 1: Update landing page selectors**

The old selectors reference `.landing-hero`, `.hero-tagline`, `.accordion-panel`, `.pricing-card`, etc. Update to new selectors: `.section-hero`, `.hero-display`, `.service-card`, `.section-footer`, etc.

**Step 2: Update test assertions**

- Hero text: "Master Your Surgical Interview" → "PRACTICE ANY TIME. ANY WHERE."
- CTA text: "Login to Access All Scenarios" → "Try Free Samples"
- Features: accordion panels → service cards
- Footer: same structure but new classes

**Step 3: Run tests**
```bash
npm run test:e2e
```

Fix any selector mismatches until all landing page tests pass.

**Step 4: Commit**
```bash
git add e2e-tests/
git commit -m "test(landing): update E2E selectors for redesigned landing page"
```

---

### Task 5.5: Final Regression Check

**Step 1: Full regression**

1. Landing page: scroll all sections, check all animations
2. Auth: login/signup modal opens and works
3. Selection flow: specialty → difficulty → mode → scenarios → launch simulation
4. Simulation room: loads correctly from sessionStorage params
5. Back navigation: simulation → selection → landing

**Step 2: Lint**
```bash
cd backend && npm run lint:fix
```

**Step 3: Backend tests**
```bash
cd backend && npm test
```
Expected: all tests pass (no backend changes made).

**Step 4: Final commit**
```bash
git add -A
git commit -m "feat(landing): complete landing page redesign — organic scroll story"
```

---

## Summary

| Phase | Tasks | Estimated Commits |
|-------|-------|-------------------|
| 1. Foundation | 5 tasks (CDN deps, CSS, HTML, JS init, app.js cleanup) | 5 |
| 2. Animations | 7 tasks (hero, S2-S7, hover interactions) | 7 |
| 3. Three.js | 1 task (full 3D scene) | 1 |
| 4. Auth/Tier | 2 tasks (auth.js update, glow-effect check) | 2 |
| 5. Polish | 5 tasks (mobile, a11y, perf, E2E, regression) | 5 |
| **Total** | **20 tasks** | **~20 commits** |

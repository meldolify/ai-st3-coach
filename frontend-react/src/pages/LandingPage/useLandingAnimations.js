import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Landing-page animation hook.
 *
 * Slimmed down post-redesign to three concerns:
 *   - Lenis smooth scroll (page-wide)
 *   - Hero entrance: REVIVA char-scramble reveal + subtitle + CTA stagger
 *   - Hero transition: scrub the hero content out as the user scrolls past
 *   - Magnetic buttons: tasteful hover deflection on .magnetic-btn elements
 *
 * Per-section animations now live inside each section component (using
 * framer-motion's whileInView and useScroll). The old per-section blocks
 * for Who/Why/Trust/Services/Proof/Action were removed in Phase 6 along
 * with those sections.
 */
export function useLandingAnimations() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(hover: none)').matches

    // Listener cleanup registry — tracks all manually added event listeners
    const listenerCleanups = []
    function trackListener(el, event, handler) {
      el.addEventListener(event, handler)
      listenerCleanups.push(() => el.removeEventListener(event, handler))
    }

    // ============================================================
    // LENIS SMOOTH SCROLL
    // ============================================================
    let lenis = null
    let lenisTickerFn = null

    if (!prefersReducedMotion) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
      })

      window.__lenisInstance = lenis

      lenis.on('scroll', ScrollTrigger.update)

      lenisTickerFn = (time) => {
        if (lenis) lenis.raf(time * 1000)
      }
      gsap.ticker.add(lenisTickerFn)
      gsap.ticker.lagSmoothing(0)
    }

    // ============================================================
    // HERO ENTRANCE
    // ============================================================
    function initHeroEntrance() {
      if (prefersReducedMotion) {
        gsap.set('#sectionHero .hero-brand-char, #sectionHero .hero-subtitle, #sectionHero .hero-ctas > *', {
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        })
        return
      }

      const heroContent = document.getElementById('heroContent')
      if (!heroContent) return

      const tl = gsap.timeline({ delay: 0.2 })

      // Nav fade in
      tl.from('#landingNav', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out' }, 0)

      // REVIVA brand — scramble-style character reveal. Deliberate ~2.5s total
      // (stagger 0.15, per-letter 0.7s, scramble runs 6 iterations at 60ms each).
      const brandChars = heroContent.querySelectorAll('.hero-brand-char')
      const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      if (brandChars.length) {
        brandChars.forEach((charEl, i) => {
          const targetChar = charEl.textContent
          charEl.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          tl.fromTo(charEl, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)',
            onStart: () => {
              let scrambleCount = 0
              const interval = setInterval(() => {
                charEl.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
                scrambleCount++
                if (scrambleCount > 6) {
                  clearInterval(interval)
                  charEl.textContent = targetChar
                }
              }, 60)
            },
          }, 0.4 + i * 0.15)
        })
      }

      // Subtitle fade up (delayed to land after the wordmark finishes assembling)
      const subtitle = heroContent.querySelector('.hero-subtitle')
      if (subtitle) {
        tl.from(subtitle, { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, 1.9)
      }

      // CTA button slide up
      const ctas = heroContent.querySelectorAll('.hero-ctas > *')
      if (ctas.length) {
        tl.from(ctas, { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 2.3)
      }
    }

    // ============================================================
    // HERO TRANSITION (scroll out + centrepiece scale + shade-fade)
    // ============================================================
    function initHeroTransition() {
      if (prefersReducedMotion || isTouch) return

      // Hero content fades + lifts as user scrolls past
      gsap.to('#heroContent', {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: '#sectionHero',
          start: '60% top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Centrepiece block scales 1 → 0.56 over the full hero scroll range —
      // the cinematic handoff lifted from xshack's .image-full pattern.
      gsap.to('.hero-centrepiece', {
        scale: 0.56,
        scrollTrigger: {
          trigger: '#sectionHero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // Canopy shade overlay fades out — tonal-shift equivalent of xshack's
      // grayscale → colour reveal. Forest underneath becomes "louder" as user
      // scrolls into the hero.
      gsap.to('.hero-centrepiece__shade', {
        opacity: 0,
        scrollTrigger: {
          trigger: '#sectionHero',
          start: 'top top',
          end: 'bottom 80%',
          scrub: 1,
        },
      })
    }

    // ============================================================
    // HERO MASK REVEAL — black bark panel slides off on entrance
    // ============================================================
    function initHeroMaskReveal() {
      if (prefersReducedMotion) return
      const mask = document.querySelector('.hero-mask-reveal')
      if (!mask) return
      // Trigger on next frame so the initial clip-path renders, then animates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mask.classList.add('in')
        })
      })
    }

    // ============================================================
    // MAGNETIC BUTTONS
    // ============================================================
    function initMagneticButtons() {
      if (window.matchMedia('(hover: none)').matches || prefersReducedMotion) return

      document.querySelectorAll('.magnetic-btn').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' })
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' })

        function handleMove(e) {
          const rect = btn.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = e.clientX - cx
          const dy = e.clientY - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 150

          if (dist < maxDist) {
            const strength = (1 - dist / maxDist) * 15
            const angle = Math.atan2(dy, dx)
            xTo(Math.cos(angle) * strength)
            yTo(Math.sin(angle) * strength)
          }
        }

        function handleLeave() {
          xTo(0)
          yTo(0)
        }

        trackListener(btn, 'mousemove', handleMove)
        trackListener(btn, 'mouseleave', handleLeave)
      })
    }

    // ============================================================
    // PARALLAX (doctor, section photos, §B backdrop, §C polaroid, mode tiles)
    //
    // Each registered element gets a `speed` factor. Negative = drifts upward
    // as the section enters; positive = drifts downward.
    // ============================================================
    let parallaxRaf = null
    const parallaxCleanup = []

    function initParallax() {
      if (prefersReducedMotion || isTouch) return

      const targets = []
      function add(selector, speed, opts = {}) {
        document.querySelectorAll(selector).forEach((el) => {
          targets.push({ el, speed, ...opts })
        })
      }

      // Hero floating shapes drive --py so their fixed positioning stays intact.
      // Mixed speeds + directions read as layered depth.
      add('.hero-shape--l1', -0.32, { cssVar: 'py' })       // tall rect L, mid
      add('.hero-shape--r1', -0.45, { cssVar: 'py' })       // tall rect R, far/slow
      add('.hero-shape--orb', -0.55, { cssVar: 'py' })      // circle, farthest
      add('.hero-shape--diamond', 0.30, { cssVar: 'py' })   // diamond, near, opposite
      add('.hero-shape--blob', 0.15, { cssVar: 'py' })      // blob, near-mid
      add('.hero-shape--triangle', 0.40, { cssVar: 'py' })  // triangle, near
      add('.hero-bottom-block', 0.12, { cssVar: 'py' })
      // Hero doctor (left over for backwards compat — currently unused) +
      // section photos translate directly
      add('#sectionHero .hero-photo', 0.10)
      add('.section-a__photo', 0.10)
      add('.section-b__backdrop', 0.08)
      // Polaroid uses cssVar mode so the parallax composes with the
      // baseline rotate(2deg) instead of clobbering it.
      add('.section-c__polaroid', -0.35, { cssVar: 'ty' })
      // Mode tiles get a tiny parallax + sustained scale to feel alive
      document.querySelectorAll('.section-e .mode-photo img').forEach((img, i) => {
        targets.push({ el: img, speed: 0.06 + i * 0.015, scaleHold: 1.06 })
      })

      if (!targets.length) return

      function tick() {
        const vh = window.innerHeight
        targets.forEach((t) => {
          if (!t.el || !t.el.isConnected) return
          const r = t.el.getBoundingClientRect()
          const mid = (r.top + r.bottom) / 2 - vh / 2
          const off = (mid * t.speed).toFixed(1)
          if (t.cssVar) {
            t.el.style.setProperty(`--${t.cssVar}`, off)
          } else if (t.scaleHold) {
            t.el.style.transform = `translate3d(0, ${off}px, 0) scale(${t.scaleHold})`
          } else {
            t.el.style.transform = `translate3d(0, ${off}px, 0)`
          }
        })
        parallaxRaf = null
      }

      function onScroll() {
        if (!parallaxRaf) parallaxRaf = requestAnimationFrame(tick)
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      parallaxCleanup.push(() => window.removeEventListener('scroll', onScroll))
      tick()
    }

    // ============================================================
    // INIT ALL
    // ============================================================
    // Small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      initHeroEntrance()
      initHeroTransition()
      initHeroMaskReveal()
      initMagneticButtons()
      initParallax()
    }, 50)

    // ============================================================
    // CLEANUP
    // ============================================================
    return () => {
      clearTimeout(timer)
      listenerCleanups.forEach((fn) => fn())
      parallaxCleanup.forEach((fn) => fn())
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf)
      if (lenisTickerFn) {
        gsap.ticker.remove(lenisTickerFn)
      }
      if (lenis) {
        lenis.destroy()
      }
      if (window.__lenisInstance === lenis) {
        delete window.__lenisInstance
      }
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])
}

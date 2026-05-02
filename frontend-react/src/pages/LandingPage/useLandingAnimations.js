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

      // REVIVA brand — scramble-style character reveal
      const brandChars = heroContent.querySelectorAll('.hero-brand-char')
      const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      if (brandChars.length) {
        brandChars.forEach((charEl, i) => {
          const targetChar = charEl.textContent
          charEl.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          tl.fromTo(charEl, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)',
            onStart: () => {
              let scrambleCount = 0
              const interval = setInterval(() => {
                charEl.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
                scrambleCount++
                if (scrambleCount > 5) {
                  clearInterval(interval)
                  charEl.textContent = targetChar
                }
              }, 50)
            },
          }, 0.4 + i * 0.08)
        })
      }

      // Subtitle fade up
      const subtitle = heroContent.querySelector('.hero-subtitle')
      if (subtitle) {
        tl.from(subtitle, { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, 1.0)
      }

      // CTA button slide up
      const ctas = heroContent.querySelectorAll('.hero-ctas > *')
      if (ctas.length) {
        tl.from(ctas, { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 1.3)
      }
    }

    // ============================================================
    // HERO TRANSITION (scroll out)
    // ============================================================
    function initHeroTransition() {
      if (prefersReducedMotion || isTouch) return

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
    // INIT ALL
    // ============================================================
    // Small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      initHeroEntrance()
      initHeroTransition()
      initMagneticButtons()
    }, 50)

    // ============================================================
    // CLEANUP
    // ============================================================
    return () => {
      clearTimeout(timer)
      listenerCleanups.forEach((fn) => fn())
      if (lenisTickerFn) {
        gsap.ticker.remove(lenisTickerFn)
      }
      if (lenis) {
        lenis.destroy()
      }
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])
}

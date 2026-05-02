import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

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
    // SECTION WHO
    // ============================================================
    function initSectionWho() {
      if (prefersReducedMotion) {
        gsap.set('.section-who', { clipPath: 'none' })
        return
      }

      if (isTouch) {
        gsap.set('.section-who', { clipPath: 'none' })
        gsap.from('.section-who .display-line, .section-who .who-body, .who-photo-wrapper', {
          opacity: 0, y: 30, duration: 0.8, stagger: 0.1,
          scrollTrigger: { trigger: '.section-who', start: 'top 100%', toggleActions: 'play none none none' },
        })
        return
      }

      gsap.fromTo('.section-who',
        { clipPath: 'circle(0% at 50% 50%)' },
        {
          clipPath: 'circle(150% at 50% 50%)',
          scrollTrigger: {
            trigger: '.section-who',
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.5,
          },
        },
      )

      gsap.from('.section-who .display-line', {
        opacity: 0, x: -60, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-who', start: 'top 40%', toggleActions: 'play none none none' },
      })

      gsap.from('.section-who .who-body', {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '.section-who .who-body', start: 'top 80%', toggleActions: 'play none none none' },
      })

      gsap.from('.who-photo-wrapper', {
        opacity: 0, scale: 0.95, y: 30, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.who-photo-wrapper', start: 'top 85%', toggleActions: 'play none none none' },
      })
    }

    // ============================================================
    // SECTION WHY
    // ============================================================
    function initSectionWhy() {
      if (prefersReducedMotion) return

      const section = document.querySelector('.section-why')
      if (!section) return

      const phases = section.querySelectorAll('.why-phase')
      if (phases.length < 3) return

      if (isTouch) {
        phases.forEach((phase) => {
          gsap.from(phase, {
            opacity: 0, y: 30, duration: 0.8,
            scrollTrigger: { trigger: phase, start: 'top 100%', toggleActions: 'play none none none' },
          })
        })
        return
      }

      gsap.set(phases[1], { opacity: 0, y: 30 })
      gsap.set(phases[2], { opacity: 0, y: 30 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.section-why',
          pin: true,
          pinType: 'transform',
          start: 'top top',
          end: '+=200%',
          scrub: 0.5,
        },
      })

      tl.fromTo('.why-display', { scale: 0.9, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.2 }, 0)
      tl.to(phases[0], { opacity: 0, y: -30, duration: 0.15 }, 0.25)
      tl.to(phases[1], { opacity: 1, y: 0, duration: 0.15 }, 0.30)
      tl.to(phases[1], { opacity: 0, y: -30, duration: 0.15 }, 0.58)
      tl.to(phases[2], { opacity: 1, y: 0, duration: 0.15 }, 0.63)
      tl.to('.section-why', { backgroundColor: '#EBF0F5', duration: 0.20 }, 0.25)
      tl.to('.section-why', { backgroundColor: '#F5F0E5', duration: 0.20 }, 0.55)
      tl.fromTo('.why-progress-line', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)
    }

    // ============================================================
    // SECTION TRUST
    // ============================================================
    function initSectionTrust() {
      if (prefersReducedMotion) return

      if (isTouch) {
        gsap.from('.trust-card', {
          opacity: 0, y: 40, duration: 0.6, stagger: 0.1,
          scrollTrigger: { trigger: '.trust-cards', start: 'top 100%', toggleActions: 'play none none none' },
        })
        return
      }

      gsap.to('.trust-strip', {
        x: '-30%',
        scrollTrigger: {
          trigger: '.section-trust',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.3,
        },
      })

      // Word-by-word reveal (without SplitType — use CSS word animation instead)
      gsap.from('.trust-display', {
        opacity: 0, y: 30, duration: 1.0,
        scrollTrigger: {
          trigger: '.trust-display',
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from('.trust-card', {
        opacity: 0, y: 60, rotation: -5, duration: 0.8, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '.trust-cards', start: 'top 80%', toggleActions: 'play none none none' },
      })
    }

    // ============================================================
    // SECTION SERVICES
    // ============================================================
    function initSectionServices() {
      if (prefersReducedMotion) return

      if (isTouch) {
        gsap.from('.service-card', {
          opacity: 0, y: 30, duration: 0.6, stagger: 0.1,
          scrollTrigger: { trigger: '.services-grid', start: 'top 100%', toggleActions: 'play none none none' },
        })
        return
      }

      gsap.from('.services-title', {
        clipPath: 'inset(0 100% 0 0)',
        scrollTrigger: {
          trigger: '.services-title',
          start: 'top 85%',
          end: 'top 60%',
          scrub: 0.5,
        },
      })

      gsap.from('.services-title .display-line', {
        opacity: 0, scale: 0.9, y: 30, stagger: 0.1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.services-title', start: 'top 80%', toggleActions: 'play none none none' },
      })

      const clipDirections = [
        'inset(0 100% 100% 0)',
        'inset(0 0 100% 100%)',
        'inset(100% 100% 0 0)',
        'inset(100% 0 0 100%)',
        'inset(50% 50% 50% 50%)',
        'inset(50% 50% 50% 50%)',
      ]

      document.querySelectorAll('.service-card').forEach((card, i) => {
        gsap.from(card, {
          clipPath: clipDirections[i] || clipDirections[4],
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.5,
          },
        })
      })
    }

    // ============================================================
    // SECTION PROOF
    // ============================================================
    function initSectionProof() {
      if (prefersReducedMotion) return

      if (isTouch) {
        gsap.from('.section-proof-content', {
          opacity: 0, y: 30, duration: 0.8,
          scrollTrigger: { trigger: '.section-proof', start: 'top 100%', toggleActions: 'play none none none' },
        })
        return
      }

      gsap.from('.section-proof-content', {
        scale: 0.8, opacity: 0.5,
        scrollTrigger: {
          trigger: '.section-proof',
          start: 'top 70%',
          end: 'top 10%',
          scrub: 0.8,
        },
      })
    }

    // ============================================================
    // SECTION ACTION + FOOTER
    // ============================================================
    function initSectionAction() {
      if (prefersReducedMotion) return

      if (isTouch) {
        gsap.from('.action-left, .action-right, .action-premium', {
          opacity: 0, y: 30, duration: 0.8, stagger: 0.1,
          scrollTrigger: { trigger: '.section-action', start: 'top 100%', toggleActions: 'play none none none' },
        })
        gsap.from('.section-footer .footer-grid, .section-footer .footer-bottom', {
          opacity: 0, y: 30, duration: 0.8, stagger: 0.15,
          scrollTrigger: { trigger: '.section-footer', start: 'top 100%', toggleActions: 'play none none none' },
        })
        return
      }

      gsap.from('.action-left', {
        x: -80, opacity: 0,
        scrollTrigger: { trigger: '.section-action', start: 'top 70%', end: 'top 30%', scrub: 0.5 },
      })

      gsap.from('.action-right', {
        x: 80, opacity: 0,
        scrollTrigger: { trigger: '.section-action', start: 'top 65%', end: 'top 25%', scrub: 0.5 },
      })

      gsap.from('.action-premium', {
        y: 40, opacity: 0,
        scrollTrigger: { trigger: '.action-premium', start: 'top 80%', toggleActions: 'play none none none' },
      })

      gsap.from('.section-footer .footer-grid, .section-footer .footer-bottom', {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.15,
        scrollTrigger: { trigger: '.section-footer', start: 'top 85%', toggleActions: 'play none none none' },
      })

      gsap.from('.section-footer .footer-grid', {
        y: 40,
        scrollTrigger: { trigger: '.section-footer', start: 'top bottom', end: 'top 50%', scrub: 0.5 },
      })
    }

    // ============================================================
    // DIVIDERS
    // ============================================================
    function initDividers() {
      if (prefersReducedMotion || isTouch) return

      gsap.to('#dividerLine34', {
        width: '90%',
        scrollTrigger: {
          trigger: '#dividerLine34',
          start: 'top 80%',
          end: 'top 40%',
          scrub: 0.5,
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
    // CARD TILT
    // ============================================================
    function initCardTilt() {
      if (window.matchMedia('(hover: none)').matches || prefersReducedMotion) return

      document.querySelectorAll('.service-card').forEach((card) => {
        const handleMove = (e) => {
          const rect = card.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width - 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5
          card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${y * -10}deg)`
        }

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power2.out',
            clearProps: 'transform',
          })
        }

        trackListener(card, 'mousemove', handleMove)
        trackListener(card, 'mouseleave', handleLeave)
      })
    }

    // ============================================================
    // INIT ALL
    // ============================================================
    // Small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      initHeroEntrance()
      initHeroTransition()
      initSectionWho()
      initSectionWhy()
      initSectionTrust()
      initSectionServices()
      initSectionProof()
      initSectionAction()
      initDividers()
      initMagneticButtons()
      initCardTilt()
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

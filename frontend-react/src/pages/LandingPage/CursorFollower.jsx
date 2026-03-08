import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CursorFollower() {
  const cursorRef = useRef(null)

  useEffect(() => {
    // Only on desktop with hover capability
    if (window.matchMedia('(hover: none)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    const xTo = gsap.quickTo(cursor, 'left', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(cursor, 'top', { duration: 0.4, ease: 'power3.out' })

    // Find the landing page container (parent)
    const landingPage = cursor.closest('.landing-page')
    if (!landingPage) return

    function handleMouseMove(e) {
      xTo(e.clientX)
      yTo(e.clientY)
      if (!cursor.classList.contains('active')) {
        cursor.classList.add('active')
      }
    }

    function handleMouseLeave() {
      cursor.classList.remove('active')
      cursor.classList.remove('hovering')
    }

    landingPage.addEventListener('mousemove', handleMouseMove)
    landingPage.addEventListener('mouseleave', handleMouseLeave)

    // Scale up when hovering interactive elements
    const interactiveEls = landingPage.querySelectorAll('button, a, .service-card, .trust-card, .pricing-card-new')
    const enterHandlers = []
    const leaveHandlers = []

    interactiveEls.forEach((el) => {
      const enterFn = () => cursor.classList.add('hovering')
      const leaveFn = () => cursor.classList.remove('hovering')
      el.addEventListener('mouseenter', enterFn)
      el.addEventListener('mouseleave', leaveFn)
      enterHandlers.push({ el, fn: enterFn })
      leaveHandlers.push({ el, fn: leaveFn })
    })

    return () => {
      landingPage.removeEventListener('mousemove', handleMouseMove)
      landingPage.removeEventListener('mouseleave', handleMouseLeave)
      enterHandlers.forEach(({ el, fn }) => el.removeEventListener('mouseenter', fn))
      leaveHandlers.forEach(({ el, fn }) => el.removeEventListener('mouseleave', fn))
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="cursor-follower"
      id="cursorFollower"
      aria-hidden="true"
    />
  )
}

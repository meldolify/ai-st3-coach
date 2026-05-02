import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../../stores/authStore'

/**
 * HeroSection — screaming-scale wordmark + photographic subject overlap.
 *
 * Composition (per plan §12, post-feedback aesthetic pass):
 *   - REVIVA fills the screen on the left/centre — clamp(8rem, 22vw, 18rem)
 *   - A doctor portrait sits on the right, *overlapping* the wordmark
 *   - Tiny italic-serif annotations in the corners ( EST. 2026 ),
 *     ( 166 STATIONS · UK ), ( hand-crafted · ai-powered )
 *   - Single CTA bottom-left near the wordmark base — toggles between
 *     "Try a free station" (logged-out) and "Go to Dashboard" (logged-in).
 *     The CTA state IS the logged-in shortcut now (the separate
 *     LoggedInBand was removed for being redundant chrome).
 *
 * The Three.js icosahedron stays as low-opacity ambient atmosphere
 * (set globally in ThreeBackground); the photo+type carry the hero now.
 */
export default function HeroSection() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  return (
    <section className="section-hero section--light" id="sectionHero" data-testid="hero-section">
      <div className="hero-content" id="heroContent">

        {/* Top-right italic annotations */}
        <div className="hero-annotations hero-annotations--top-right" aria-hidden="true">
          <span>( est. 2026 )</span>
          <span>( 166 stations · UK )</span>
        </div>

        {/* Hero portrait — confident surgical trainee, transparent PNG cutout.
            Sits to the right, masked at the leading edge so it overlaps the
            right side of the REVIVA wordmark. */}
        <img
          src="/images/landing/hero-doctor.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          className="hero-photo"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        {/* The wordmark — screaming scale. Each letter is a span so the
            existing entrance animation in useLandingAnimations.js (REVIVA
            char scramble) keeps working. */}
        <h1 className="hero-brand" aria-label="Reviva">
          {'REVIVA'.split('').map((char, i) => (
            <span key={i} className="hero-brand-char">{char}</span>
          ))}
        </h1>

        {/* Subtitle + CTA stack — bottom-left of composition */}
        <div className="hero-stack">
          <p className="landing-body hero-subtitle">
            AI interview practice for surgical trainees.
          </p>
          <div className="hero-ctas">
            <button
              className="btn-amber btn-amber--lg magnetic-btn"
              onClick={() => navigate('/scenarios', { state: { fresh: true } })}
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Try a free station'} &rarr;
            </button>
          </div>
        </div>

        {/* Bottom-left italic annotation */}
        <div className="hero-annotations hero-annotations--bottom-left" aria-hidden="true">
          <span>( hand-crafted · ai-powered )</span>
        </div>
      </div>
    </section>
  )
}

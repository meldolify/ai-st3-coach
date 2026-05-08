import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../../stores/authStore'

/**
 * HeroSection — screaming-scale wordmark + photographic subject + drifting leaves.
 *
 * Composition (per design package v2 — `ui_kits/landing/index.html` lines 318-360):
 *   - Marble bg + cream gradient via `.section-hero` ::before/::after layers (CSS).
 *   - Three real leaf PNGs drift over the composition, each parallaxes at its own
 *     speed (--py CSS var driven by the parallax loop in useLandingAnimations).
 *   - Doctor portrait (real PNG cutout) sits to the right, masked at the bottom.
 *   - REVIVA wordmark fills the screen, character-scrambles on entrance.
 *   - Single CTA toggles "Try a free station" (logged-out) ↔ "Go to Dashboard" (logged-in).
 *   - Italic-serif corner annotations: ( est. 2026 ) / ( surgical interview · UK )
 *     top-right, ( hand-crafted · ai-powered ) bottom-left.
 *
 * Three.js icosahedron continues to render globally via <ThreeBackground />,
 * sitting behind everything at low opacity for ambient motion.
 */
export default function HeroSection() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  return (
    <section className="section-hero section--light" id="sectionHero" data-testid="hero-section">
      {/* Three drifting leaves — each parallaxes via --py (set by scroll loop). */}
      <div className="hero-leaf hero-leaf--l1" aria-hidden="true">
        <img src="/images/landing/leaf-1.png" alt="" loading="eager" />
      </div>
      <div className="hero-leaf hero-leaf--l2" aria-hidden="true">
        <img src="/images/landing/leaf-2.png" alt="" loading="lazy" />
      </div>
      <div className="hero-leaf hero-leaf--l3" aria-hidden="true">
        <img src="/images/landing/leaf-3.png" alt="" loading="lazy" />
      </div>

      <div className="hero-content" id="heroContent">

        {/* Top-right italic annotations */}
        <div className="hero-annotations hero-annotations--top-right" aria-hidden="true">
          <span>( est. 2026 )</span>
          <span>( surgical interview · UK )</span>
        </div>

        {/* Hero portrait — confident surgical trainee, transparent PNG cutout.
            Sits to the right, masked at the bottom so it composites with the
            cream gradient. */}
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
            entrance animation in useLandingAnimations.js (REVIVA char
            scramble) drives them individually. */}
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

import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../../stores/authStore'

/**
 * HeroSection — screaming wordmark + doctor portrait + slow-spinning icosahedron SVG.
 *
 * Composition:
 *   - Marble bg + cream gradient via `.section-hero` ::before/::after layers (CSS).
 *   - A wireframe icosahedron SVG slow-rotates behind the wordmark — gives the
 *     "floating animated background" the user wanted preserved. Lightweight,
 *     pure CSS animation, no Three.js dependency.
 *   - Doctor portrait (real PNG cutout) sits to the right, masked at the bottom.
 *   - REVIVA wordmark fills the screen, character-scrambles on entrance.
 *   - Single CTA toggles "Try a free station" (logged-out) ↔ "Go to Dashboard" (logged-in).
 *   - Italic-serif corner annotations: ( est. 2026 ) / ( surgical interview · UK )
 *     top-right, ( hand-crafted · ai-powered ) bottom-left.
 *
 * Three.js still renders globally via <ThreeBackground /> sitting behind
 * everything; this CSS SVG is the on-page visible-motion piece (the Three.js
 * mesh is too low-opacity to be obvious).
 */
export default function HeroSection() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  return (
    <section className="section-hero section--light" id="sectionHero" data-testid="hero-section">
      {/* Wireframe icosahedron — pure CSS slow-spin, sits behind the type */}
      <div className="hero-icosa" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <g transform="translate(100 100)">
            <path d="M0,-90 L78,-45 L78,45 L0,90 L-78,45 L-78,-45 Z" />
            <path d="M0,-90 L0,90" />
            <path d="M-78,-45 L78,45" />
            <path d="M-78,45 L78,-45" />
            <circle r="90" />
            <ellipse rx="90" ry="45" />
            <ellipse rx="45" ry="90" />
            <path d="M0,-90 L40,-22 L78,-45 M0,-90 L-40,-22 L-78,-45 M0,90 L40,22 L78,45 M0,90 L-40,22 L-78,45" />
          </g>
        </svg>
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

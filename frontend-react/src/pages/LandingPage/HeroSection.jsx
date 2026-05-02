import { useNavigate } from 'react-router-dom'

/**
 * HeroSection — screaming-scale wordmark + photographic subject overlap.
 *
 * Composition (per plan §12, post-feedback aesthetic pass):
 *   - REVIVA fills the screen on the left/centre — clamp(8rem, 22vw, 18rem)
 *   - A doctor portrait sits on the right, *overlapping* the wordmark
 *   - Tiny italic-serif annotations in the corners ( EST. 2026 ),
 *     ( 166 STATIONS · UK ), ( hand-crafted · ai-powered )
 *   - Single soft CTA bottom-left near the wordmark base
 *
 * The Three.js icosahedron stays as low-opacity ambient atmosphere
 * (set globally in ThreeBackground); the photo+type carry the hero now.
 */
export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="section-hero section--light" id="sectionHero" data-testid="hero-section">
      <div className="hero-content" id="heroContent">

        {/* Top-right italic annotations */}
        <div className="hero-annotations hero-annotations--top-right" aria-hidden="true">
          <span>( est. 2026 )</span>
          <span>( 166 stations · UK )</span>
        </div>

        {/* Photographic subject — Unsplash, free for commercial use.
            Image ref: portrait of a doctor / medical professional with simple
            background that composites cleanly against cream.
            Search "doctor portrait white coat" on Unsplash to swap. */}
        <img
          src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1200&q=85"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          className="hero-photo"
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
              Try a free station &rarr;
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

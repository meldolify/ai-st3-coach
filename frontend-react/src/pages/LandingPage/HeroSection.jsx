import { useNavigate } from 'react-router-dom'

/**
 * HeroSection — single confident moment.
 *
 * Stripped to: REVIVA wordmark + 1-line subtitle + 1 CTA.
 * Background is the global Three.js icosahedron (rendered by
 * ThreeBackground at the page root). No tableau, no leaves —
 * those PNG layers were deleted in Phase 1.
 *
 * Hero is identical for logged-in and logged-out users. Logged-in
 * users get an additional shortcut via <LoggedInBand /> placed
 * directly below the hero in LandingPage.jsx.
 */
export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="section-hero section--light" id="sectionHero" data-testid="hero-section">
      <div className="hero-content" id="heroContent">
        <h1 className="hero-brand" aria-label="Reviva">
          {'REVIVA'.split('').map((char, i) => (
            <span key={i} className="hero-brand-char">{char}</span>
          ))}
        </h1>
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
    </section>
  )
}

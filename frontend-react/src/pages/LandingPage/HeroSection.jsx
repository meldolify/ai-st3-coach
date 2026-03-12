import { useNavigate } from 'react-router-dom'

export default function HeroSection({ isLoggedIn }) {
  const navigate = useNavigate()

  return (
    <section className="section-hero section--light" id="sectionHero">
      {/* Botanical leaf overlays (parallax, hidden on mobile via CSS) */}
      <img src="/images/landing/leaf-1.png" className="hero-leaf hero-leaf--1" data-speed="0.2" aria-hidden="true" alt="" />
      <img src="/images/landing/leaf-2.png" className="hero-leaf hero-leaf--2" data-speed="0.5" aria-hidden="true" alt="" />
      <img src="/images/landing/leaf-3.png" className="hero-leaf hero-leaf--3" data-speed="0.35" aria-hidden="true" alt="" />

      {/* Hero parallax assets (Knowledge Tableau) */}
      <div className="hero-tableau">
        <img src="/images/landing/hero-textbook.png" className="hero-asset hero-asset--textbook" data-speed="0.06" data-drift="-0.08" alt="" aria-hidden="true" />
        <img src="/images/landing/hero-scalpel.png" className="hero-asset hero-asset--scalpel" data-speed="0.35" data-drift="-0.05" alt="" aria-hidden="true" />
        <img src="/images/landing/hero-penlight.png" className="hero-asset hero-asset--penlight" data-speed="0.25" data-drift="0.10" alt="" aria-hidden="true" />
        <img src="/images/landing/hero-reflex-hammer.png" className="hero-asset hero-asset--reflex-hammer" data-speed="0.12" data-drift="0.06" alt="" aria-hidden="true" />
        <img src="/images/landing/hero-tablet.png" className="hero-asset hero-asset--tablet" data-speed="0.10" data-drift="0.08" alt="" aria-hidden="true" />
        <img src="/images/landing/hero-stethoscope.png" className="hero-asset hero-asset--stethoscope" data-speed="0.20" data-drift="-0.12" alt="" aria-hidden="true" />
      </div>

      {/* Logged-out hero */}
      {!isLoggedIn && (
        <div className="hero-logged-out" id="heroLoggedOut">
          <h1 className="hero-brand" aria-label="Reviva">
            {'REVIVA'.split('').map((char, i) => (
              <span key={i} className="hero-brand-char">{char}</span>
            ))}
          </h1>
          <span className="landing-overline">Interview Preparation, Reimagined</span>
          <p className="landing-body hero-subtitle">
            AI-powered simulated interviews for surgical training.<br />
            Hand-crafted stations. 24/7 access. Real interview experience.
          </p>
          <div className="hero-ctas">
            <button className="btn-amber magnetic-btn" onClick={() => navigate('/scenarios', { state: { fresh: true } })}>Try Free Samples</button>
            <button className="btn-outline magnetic-btn" onClick={() => navigate('/login')}>Sign Up</button>
          </div>
        </div>
      )}

      {/* Logged-in hero */}
      {isLoggedIn && (
        <div className="hero-logged-in" id="heroLoggedIn">
          <h1 className="hero-brand" aria-label="Reviva">
            {'REVIVA'.split('').map((char, i) => (
              <span key={i} className="hero-brand-char">{char}</span>
            ))}
          </h1>
          <span className="landing-overline" style={{ marginBottom: '1rem' }}>Welcome back</span>
          <div className="hero-ctas">
            <button className="btn-amber btn-amber--lg magnetic-btn" onClick={() => navigate('/scenarios', { state: { fresh: true } })}>Go to Dashboard &rarr;</button>
          </div>
        </div>
      )}
    </section>
  )
}

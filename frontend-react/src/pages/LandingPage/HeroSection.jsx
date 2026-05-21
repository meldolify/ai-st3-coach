import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../../stores/authStore'

/**
 * HeroSection — solid-colour block composition + REVIVA wordmark overlaid +
 * scroll-driven parallax handoff.
 *
 * Layout:
 *   - Section background: --organic-bark (dark) so cream type reads cleanly.
 *   - Centrepiece: vertical 2:3 forest-green block with a canopy-tinted
 *     shade overlay that fades on scroll past the hero (the tonal-shift
 *     equivalent of xshack's grayscale→colour reveal).
 *   - Side blocks: small flanking amber + sand panels, parallax at
 *     differing speeds (`--py` CSS var driven by useLandingAnimations.js).
 *   - Bottom block: wider canopy panel beneath the centrepiece.
 *   - Wireframe icosahedron (CSS-only spinning SVG) sits behind it all.
 *   - REVIVA wordmark (cream) absolute-centred over the centrepiece.
 *   - Subtitle + CTA stack below the wordmark.
 *   - Black mask reveal entrance.
 *
 * Italic-serif corner annotations were removed 2026-05-08 (user feedback:
 * "floating small texts, pointless and distracting").
 *
 * Three.js `<ThreeBackground />` continues to render globally behind
 * everything.
 */
export default function HeroSection() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  return (
    <section className="section-hero" id="sectionHero" data-testid="hero-section">
      {/* Wireframe icosahedron — pure CSS slow-spin, sits behind everything */}
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

      {/* Floating decorative shapes — mixed forms (rectangle, circle, diamond,
          blob, triangle), depth-graded shadows, varying parallax speeds via --py */}
      <div className="hero-shape hero-shape--l1" aria-hidden="true" />
      <div className="hero-shape hero-shape--r1" aria-hidden="true" />
      <div className="hero-shape hero-shape--orb" aria-hidden="true" />
      <div className="hero-shape hero-shape--diamond" aria-hidden="true" />
      <div className="hero-shape hero-shape--blob" aria-hidden="true" />
      <div className="hero-shape hero-shape--triangle" aria-hidden="true" />

      {/* Bottom block — canopy panel beneath the centrepiece */}
      <div className="hero-bottom-block" aria-hidden="true" />

      {/* Centrepiece — solid forest panel with canopy overlay that fades on scroll */}
      <div className="hero-centrepiece" aria-hidden="true">
        <div className="hero-centrepiece__shade" />
      </div>

      <div className="hero-content" id="heroContent">

        {/* The wordmark — screaming scale, cream over dark. Each letter is
            a span so the entrance animation in useLandingAnimations.js
            (REVIVA char scramble) drives them individually. */}
        <h1 className="hero-brand" aria-label="Reviva">
          {'REVIVA'.split('').map((char, i) => (
            <span key={i} className="hero-brand-char">{char}</span>
          ))}
        </h1>

        {/* Subtitle + CTA stack — sits below the wordmark, overlaid */}
        <div className="hero-stack">
          <p className="landing-body hero-subtitle">
            Your viva, on repeat.<br />
            Built for the UK medical and surgical specialty training interviews.
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
      </div>

      {/* Black mask reveal — covers the hero on first paint, animates open
          via clip-path on entrance (driven by useLandingAnimations.js). */}
      <div className="hero-mask-reveal" aria-hidden="true" />
    </section>
  )
}

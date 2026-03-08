import { useNavigate } from 'react-router-dom'

export default function ProofSection() {
  const navigate = useNavigate()

  return (
    <section className="section-proof" id="sectionProof">
      <div className="section-proof-content">
        <h2 className="hero-display" style={{ color: 'var(--text-on-dark)' }} aria-label="Don't take our word for it.">
          <span className="display-line">DON&rsquo;T TAKE</span>
          <span className="display-line">OUR WORD</span>
          <span className="display-line">FOR IT.</span>
        </h2>
        <p className="landing-body" style={{ color: 'var(--text-on-dark)', opacity: 0.8, marginTop: '1.5rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          Try sample scenarios completely free. Quick sign-up, no credit card. Just register and practice.
        </p>
        <div style={{ marginTop: '2.5rem' }}>
          <button className="btn-amber btn-amber--lg magnetic-btn" onClick={() => navigate('/scenarios')}>
            Explore Free Scenarios &rarr;
          </button>
        </div>
        <p className="landing-caption" style={{ color: 'var(--text-on-dark)', opacity: 0.5, marginTop: '1rem' }}>
          4 free scenarios across all station types
        </p>
      </div>
    </section>
  )
}

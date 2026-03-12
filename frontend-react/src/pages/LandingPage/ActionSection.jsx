import { useNavigate } from 'react-router-dom'

export default function ActionSection({ isLoggedIn, isPremium }) {
  const navigate = useNavigate()

  return (
    <section className="section-action" id="sectionAction">
      {/* Unlogged / Free tier — shows pricing */}
      {!isPremium && (
        <div className="action-with-pricing" id="actionPricing">
          <div className="action-left">
            <h2 className="landing-display" aria-label="Ready to start?">
              <span className="display-line">READY TO</span>
              <span className="display-line">START?</span>
            </h2>
            <p className="landing-body" style={{ marginTop: '1rem' }}>Choose your path.</p>
          </div>
          <div className="action-right" id="pricingSection">
            <div className="pricing-card-new pricing-card-new--free">
              <span className="landing-overline" style={{ color: 'var(--organic-forest)' }}>Free</span>
              <h3 style={{ fontFamily: 'var(--font-landing-display)', fontSize: '1.5rem', margin: '16px 0' }}>4 Sample Scenarios</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}>
                <li style={{ padding: '4px 0' }}>Basic feedback</li>
                <li style={{ padding: '4px 0' }}>Free sign-up, no card</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-landing-display)', fontSize: '1.75rem', fontWeight: 700, margin: '24px 0 16px' }}>&pound;0</p>
              <button className="btn-outline" style={{ color: 'var(--text-on-light)', borderColor: 'var(--organic-forest)' }} onClick={() => navigate('/scenarios', { state: { fresh: true } })}>Explore Free</button>
            </div>
            <div className="pricing-card-new pricing-card-new--premium">
              <span className="landing-overline" style={{ color: 'var(--organic-amber)' }}>Premium &starf;</span>
              <h3 style={{ fontFamily: 'var(--font-landing-display)', fontSize: '1.5rem', margin: '16px 0', color: 'var(--text-on-dark)' }}>All 166 Scenarios</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', color: 'var(--text-muted-dark)' }}>
                <li style={{ padding: '4px 0' }}>Full feedback + scoring</li>
                <li style={{ padding: '4px 0' }}>Mock exams</li>
                <li style={{ padding: '4px 0' }}>Progress tracking</li>
              </ul>
              <p style={{ fontFamily: 'var(--font-landing-display)', fontSize: '1.75rem', fontWeight: 700, margin: '24px 0 4px', color: 'var(--text-on-dark)' }}>From &pound;8.33/mo</p>
              <p className="landing-caption" style={{ color: 'var(--text-muted-dark)', marginBottom: '16px' }}>&pound;99.99/year (save &pound;80)</p>
              <button className="btn-amber" onClick={() => navigate('/login')}>Subscribe &rarr;</button>
            </div>
          </div>
        </div>
      )}

      {/* Premium tier — no pricing, just dashboard CTA */}
      {isPremium && (
        <div className="action-premium" id="actionPremium">
          <h2 className="hero-display" style={{ color: 'var(--text-on-dark)' }} aria-label="Your journey continues.">
            <span className="display-line">YOUR JOURNEY</span>
            <span className="display-line">CONTINUES.</span>
          </h2>
          <div style={{ marginTop: '2.5rem' }}>
            <button className="btn-amber btn-amber--lg magnetic-btn" onClick={() => navigate('/scenarios', { state: { fresh: true } })}>Go to Dashboard &rarr;</button>
          </div>
        </div>
      )}
    </section>
  )
}

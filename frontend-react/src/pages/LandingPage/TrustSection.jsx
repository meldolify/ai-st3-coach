export default function TrustSection() {
  return (
    <section className="section-trust section--dark" id="sectionTrust">
      {/* Parallax background text strip */}
      <div className="trust-strip" aria-hidden="true">
        HAND-CRAFTED &bull; TRAINEE-TESTED &bull; CLINICALLY ACCURATE &bull; HAND-CRAFTED &bull; TRAINEE-TESTED &bull; CLINICALLY ACCURATE &bull; HAND-CRAFTED &bull; TRAINEE-TESTED
      </div>

      <div className="trust-content">
        <h2 className="landing-display trust-display">
          Every station is built by actual trainees in the specialty. Tested. Refined. Verified.
        </h2>

        <div className="trust-cards">
          <div className="trust-card">
            <h3>Hand-Crafted</h3>
            <p>Each scenario written by specialty doctors who know the interview inside out.</p>
          </div>
          <div className="trust-card">
            <h3>Trainee-Tested</h3>
            <p>Real ST3 trainees have validated every station against the actual exam experience.</p>
          </div>
          <div className="trust-card">
            <h3>Constantly Evolving</h3>
            <p>Updated based on real exam feedback. The curriculum grows with each interview cycle.</p>
          </div>
        </div>
      </div>
      <svg className="section-divider section-divider--wave2" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,70 1380,50 1440,40 L1440,80 L0,80 Z" fill="var(--organic-cream)" />
      </svg>
    </section>
  )
}

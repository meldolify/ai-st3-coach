export default function WhoSection() {
  return (
    <section className="section-who section--dark" id="sectionWho">
      <div className="who-inner">
        <div className="who-left">
          <h2 className="landing-display" aria-label="Built for doctors who want more.">
            <span className="display-line">BUILT FOR</span>
            <span className="display-line">DOCTORS</span>
            <span className="display-line">WHO WANT</span>
            <span className="display-line">MORE.</span>
          </h2>
        </div>
        <div className="who-right">
          <p className="landing-body who-body">
            Designed for UK doctors applying for national specialty training interviews.
            ST3 Plastic Surgery stations, with more specialties coming soon.
          </p>
          <p className="landing-body who-body" style={{ fontStyle: 'italic', marginTop: '1rem' }}>
            The principles apply to any medical interview where practice makes the difference.
          </p>
          <div className="who-photo-wrapper">
            <img src="/images/Landing/doctor-portrait.png" className="who-photo" alt="Medical trainee preparing for interviews" loading="lazy" />
          </div>
        </div>
      </div>
      <svg className="section-divider section-divider--wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,60 C240,80 480,20 720,50 C960,80 1200,30 1440,60 L1440,80 L0,80 Z" fill="var(--organic-cream)" />
      </svg>
    </section>
  )
}

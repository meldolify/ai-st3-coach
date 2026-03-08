export default function ServicesSection() {
  return (
    <section className="section-services section--light" id="sectionServices">
      <h2 className="landing-display services-title">
        <span className="display-line">EVERYTHING</span>
        <span className="display-line">YOU NEED.</span>
      </h2>

      <div className="services-grid">
        <div className="service-card">
          <svg className="card-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="6" y="4" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M12 12h16M12 18h16M12 24h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M26 28c0-2 4-2 4 0s-4 2-4 0" stroke="currentColor" strokeWidth="1.2" fill="var(--organic-forest)" opacity="0.3"/></svg>
          <span className="card-overline">Feature</span>
          <h3>Practice Mode</h3>
          <p>Choose any scenario. Take your time. Learn at your pace. No pressure, just progress.</p>
        </div>
        <div className="service-card">
          <svg className="card-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5"/><path d="M20 10v10l6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg>
          <span className="card-overline">Feature</span>
          <h3>Mock Exam</h3>
          <p>Timed exam conditions. Station by station or full circuit. Feel the real pressure.</p>
        </div>
        <div className="service-card">
          <svg className="card-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="22" r="12" stroke="currentColor" strokeWidth="1.5"/><path d="M20 10V6M14 11l-2-3M26 11l2-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 22a4 4 0 108 0" stroke="currentColor" strokeWidth="1.5"/></svg>
          <span className="card-overline">Feature</span>
          <h3>24/7 Access</h3>
          <p>Morning. Night. Weekend. Your call. Practice whenever inspiration strikes.</p>
        </div>
        <div className="service-card">
          <svg className="card-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="6" y="28" width="6" height="8" rx="1" fill="currentColor" opacity="0.2"/><rect x="14" y="20" width="6" height="16" rx="1" fill="currentColor" opacity="0.3"/><rect x="22" y="14" width="6" height="22" rx="1" fill="currentColor" opacity="0.4"/><rect x="30" y="8" width="6" height="28" rx="1" fill="currentColor" opacity="0.5"/><path d="M8 26l8-6 8 2 8-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="card-overline">Feature</span>
          <h3>Structured Feedback</h3>
          <p>Detailed scoring. Section-by-section breakdown. Know exactly where to improve.</p>
        </div>
        <div className="service-card">
          <svg className="card-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M6 34L14 22l8 6 8-14 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="36" cy="10" r="3" fill="var(--organic-forest)" opacity="0.4"/><path d="M33 32c0-2 3-4 3-2s-3 4-3 2" stroke="currentColor" strokeWidth="1" opacity="0.5"/></svg>
          <span className="card-overline">Feature</span>
          <h3>Progress Tracking</h3>
          <p>Watch yourself improve over time. Session history. Score trends. Category insights.</p>
        </div>
        <div className="service-card">
          <svg className="card-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="4" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><rect x="16" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><rect x="28" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><rect x="16" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><rect x="28" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M20 30v6M17 33h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/></svg>
          <span className="card-overline">Feature</span>
          <h3>Full Curriculum</h3>
          <p>166 stations across 4 domains. Clinical, communication, consent, and structured interview.</p>
        </div>
      </div>
    </section>
  )
}

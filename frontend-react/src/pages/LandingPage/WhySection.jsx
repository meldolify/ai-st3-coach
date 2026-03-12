export default function WhySection() {
  return (
    <section className="section-why section--light" id="sectionWhy">
      <div className="why-display">
        <h2 className="landing-display" aria-label="Practice is everything.">
          <span className="display-line">PRACTICE</span>
          <span className="display-line">IS</span>
          <span className="display-line">EVERY</span>
          <span className="display-line">THING.</span>
        </h2>
      </div>
      <div className="why-phases">
        {/* Phase 1: The Problem */}
        <div className="why-phase" id="whyPhase1">
          <div className="why-phase-text">
            <span className="landing-overline">The Problem</span>
            <h3 className="landing-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Finding practice partners is hard.</h3>
            <p className="landing-body">
              Trainees struggle to find people to practise with. Consultants are busy.
              Friends get tired of being asked the same questions. You need structured,
              reliable practice &mdash; not favours.
            </p>
          </div>
          <img src="/images/landing/why-problem.png" className="why-phase-img" alt="" aria-hidden="true" />
        </div>
        {/* Phase 2: The Gap */}
        <div className="why-phase" id="whyPhase2">
          <div className="why-phase-text">
            <span className="landing-overline">The Gap</span>
            <h3 className="landing-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>AI chatbots don&rsquo;t cut it.</h3>
            <p className="landing-body">
              Generic AI chatbots don&rsquo;t understand the interview format.
              They hallucinate scenarios. They don&rsquo;t push back like a real examiner.
              You deserve better.
            </p>
          </div>
          <img src="/images/landing/why-gap.png" className="why-phase-img" alt="" aria-hidden="true" />
        </div>
        {/* Phase 3: The Solution */}
        <div className="why-phase" id="whyPhase3">
          <div className="why-phase-text">
            <span className="landing-overline">The Solution</span>
            <h3 className="landing-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Hand-crafted. Available 24/7.</h3>
            <p className="landing-body">
              24/7 access to hand-crafted interview stations. Each one built to mirror the
              real experience. Practice at your pace, on your schedule.
            </p>
          </div>
          <img src="/images/landing/why-solution.png" className="why-phase-img" alt="" aria-hidden="true" />
        </div>
        {/* Progress indicator line */}
        <div className="why-progress-line" aria-hidden="true"></div>
      </div>
    </section>
  )
}

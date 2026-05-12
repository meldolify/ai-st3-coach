import { Link, useNavigate } from 'react-router-dom'

export default function FooterSection() {
  const navigate = useNavigate()

  return (
    <footer className="section-footer" id="sectionFooter">
      {/* SVG wave divider */}
      <svg className="footer-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="var(--organic-bark)" />
      </svg>

      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/">
            <img src="/images/logo/logo-md.png" alt="ReViva" className="logo-img logo-img--footer" style={{ height: '32px', marginBottom: '12px' }} />
          </Link>
          <p className="footer-tag">
            <em>Hand-crafted, AI-powered prep for the trainees who&rsquo;d rather rehearse than panic.</em>
          </p>
        </div>
        <div className="footer-column">
          <h4>Product</h4>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate('/scenarios', { state: { fresh: true } })
            }}
          >
            Practice
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate('/scenarios', { state: { fresh: true } })
            }}
          >
            Mock by Station
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate('/scenarios', { state: { fresh: true } })
            }}
          >
            Full Mock Exam
          </a>
          <span className="footer-pending">Mentor mode &middot; coming soon</span>
        </div>
        <div className="footer-column">
          <h4>Resources</h4>
          <span className="footer-pending">Marking criteria &middot; coming soon</span>
          <span className="footer-pending">FAQ &middot; coming soon</span>
          <span className="footer-pending">Blog &middot; coming soon</span>
          <span className="footer-pending">Contact &middot; coming soon</span>
        </div>
        <div className="footer-column">
          <h4>Legal</h4>
          <span className="footer-pending">Terms &middot; coming soon</span>
          <span className="footer-pending">Privacy &middot; coming soon</span>
          <span className="footer-pending">Cookies &middot; coming soon</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 ReViva Ltd. Made with care in the UK.</span>
        <em className="footer-bottom__est">( est. 2026 )</em>
      </div>
    </footer>
  )
}

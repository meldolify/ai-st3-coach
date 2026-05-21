import { Link } from 'react-router-dom'

export default function FooterSection() {
  return (
    <footer className="section-footer" id="sectionFooter">
      {/* SVG wave divider */}
      <svg className="footer-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="var(--organic-bark)" />
      </svg>

      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/">
            <img
              src="/images/logo/logo-md.png"
              alt="ReViva"
              className="logo-img logo-img--footer"
              style={{ height: '56px', marginBottom: '14px', filter: 'invert(1)', opacity: 0.9 }}
            />
          </Link>
          <p className="footer-tag">
            <em>Hand-crafted, AI-powered prep for the trainees who&rsquo;d rather rehearse than panic.</em>
          </p>
        </div>
        <div className="footer-column">
          <h4>Resources</h4>
          <Link to="/about">About</Link>
          <Link to="/help">Help &amp; FAQ</Link>
          <span className="footer-pending">Blog &middot; coming soon</span>
          <span className="footer-pending">Testimonials &middot; coming soon</span>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-column">
          <h4>Legal</h4>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 ReViva Limited. Made with care in the UK.</span>
      </div>
    </footer>
  )
}

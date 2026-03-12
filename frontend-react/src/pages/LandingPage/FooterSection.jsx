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
          <p>AI-powered interview preparation for surgical trainees. Practice smarter, not harder.</p>
        </div>
        <div className="footer-column">
          <h4>Product</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/scenarios', { state: { fresh: true } }); }}>Practice Mode</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/scenarios', { state: { fresh: true } }); }}>Mock Exams</a>
          <a href="#pricingSection" onClick={(e) => { e.preventDefault(); document.getElementById('pricingSection')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
        </div>
        <div className="footer-column">
          <h4>Support</h4>
          <a href="#">Contact Us</a>
          <a href="#">Help</a>
          <a href="#">FAQ</a>
        </div>
        <div className="footer-column">
          <h4>Legal</h4>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 ReViva. All rights reserved.</p>
      </div>
    </footer>
  )
}

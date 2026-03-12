import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { supabaseClient } from '../../lib/supabase'

export default function LandingNav({ isLoggedIn }) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  function scrollToPricing(e) {
    e.preventDefault()
    document.getElementById('pricingSection')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    logout()
    navigate('/')
  }

  return (
    <nav className="landing-nav-new" id="landingNav">
      <Link to="/" className="nav-logo">
        <img src="/images/logo/logo-md.png" alt="ReViva" className="logo-img logo-img--nav" />
      </Link>
      {!isLoggedIn ? (
        <div className="nav-links">
          <a href="#pricingSection" className="nav-link" onClick={scrollToPricing}>Pricing</a>
          <button className="nav-link" onClick={() => navigate('/scenarios')}>Explore</button>
          <button className="nav-link" onClick={() => navigate('/login')}>Log In</button>
          <button className="nav-link btn-amber btn-amber--sm" onClick={() => navigate('/login')}>Sign Up</button>
        </div>
      ) : (
        <div className="nav-links">
          <a href="#pricingSection" className="nav-link" onClick={scrollToPricing}>Pricing</a>
          <button className="nav-link" onClick={() => navigate('/scenarios')}>Explore</button>
          <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
          <button className="nav-link" onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </nav>
  )
}

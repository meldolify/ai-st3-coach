import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useSelectionStore } from '../../stores/selectionStore'
import { supabaseClient } from '../../lib/supabase'

const LENIS_PRICING_DURATION = 2.0

export default function LandingNav({ isLoggedIn }) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const resetSelection = useSelectionStore((s) => s.resetSelection)

  function scrollToPricing(e) {
    e.preventDefault()
    const lenis = window.__lenisInstance
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo('#pricingSection', {
        duration: LENIS_PRICING_DURATION,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      return
    }
    document.getElementById('pricingSection')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleExplore() {
    if (isLoggedIn) {
      navigate('/scenarios', { state: { fresh: true } })
      return
    }
    const fakeEvent = { preventDefault: () => {} }
    scrollToPricing(fakeEvent)
  }

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    logout()
    resetSelection()
    sessionStorage.removeItem('simulationParams')
    navigate('/')
  }

  return (
    <nav className="landing-nav-new" id="landingNav" data-testid="landing-nav">
      <Link to="/" className="nav-logo nav-logo--home" aria-label="ReViva home">
        <img src="/images/logo/logo-md.png" alt="ReViva" className="logo-img logo-img--nav" />
      </Link>
      {!isLoggedIn ? (
        <div className="nav-links">
          <button className="nav-link" data-testid="nav-explore" onClick={handleExplore}>Explore</button>
          <button className="nav-link" data-testid="nav-login" onClick={() => navigate('/login')}>Log In</button>
          <button className="nav-link btn-amber btn-amber--sm" data-testid="nav-signup" onClick={() => navigate('/login')}>Sign Up</button>
        </div>
      ) : (
        <div className="nav-links">
          <a href="#pricingSection" className="nav-link" onClick={scrollToPricing}>Pricing</a>
          <button className="nav-link" data-testid="nav-explore" onClick={handleExplore}>Explore</button>
          <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
          <button className="nav-link" onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </nav>
  )
}

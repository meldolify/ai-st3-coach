import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../stores/authStore'
import { useSelectionStore } from '../stores/selectionStore'
import { supabaseClient } from '../lib/supabase'

/**
 * AppNav — Lightweight top navigation for inner pages (scenarios, profile).
 * Provides logo home link, profile access, and logout.
 */
export default function AppNav() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(selectIsLoggedIn)
  const logout = useAuthStore((s) => s.logout)
  const resetSelection = useSelectionStore((s) => s.resetSelection)

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    logout()
    resetSelection()
    sessionStorage.removeItem('simulationParams')
    navigate('/')
  }

  return (
    <nav data-testid="app-nav" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'rgba(247, 245, 242, 0.9)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(74, 93, 76, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img
          src="/images/logo/logo-md.png"
          alt="ReViva"
          style={{ height: '36px' }}
        />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4A5D4C',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: "'Outfit', sans-serif",
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(74, 93, 76, 0.08)' }}
              onMouseLeave={(e) => { e.target.style.background = 'none' }}
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid rgba(74, 93, 76, 0.2)',
                color: '#4A5D4C',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: "'Outfit', sans-serif",
                padding: '6px 14px',
                borderRadius: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(74, 93, 76, 0.08)'
                e.target.style.borderColor = 'rgba(74, 93, 76, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none'
                e.target.style.borderColor = 'rgba(74, 93, 76, 0.2)'
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#4A5D4C',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: "'Outfit', sans-serif",
              padding: '6px 16px',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#3A4A3C' }}
            onMouseLeave={(e) => { e.target.style.background = '#4A5D4C' }}
          >
            Log In
          </button>
        )}
      </div>
    </nav>
  )
}

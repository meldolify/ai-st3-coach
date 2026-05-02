import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../../stores/authStore'

/**
 * LoggedInBand — conditional welcome-back band between hero and §A.
 *
 * Renders only when the user is logged in. Gives an immediate "go to
 * dashboard" exit so logged-in visitors don't have to scroll the full
 * narrative. Logged-out users skip it entirely (component returns null) —
 * the page collapses straight from hero to §A.
 *
 * Routes to /scenarios with a `fresh: true` state — same fresh-start
 * pattern used elsewhere on the landing (HeroSection, FooterSection,
 * LandingNav) so the scenario flow resets cleanly.
 */
export default function LoggedInBand() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  if (!isLoggedIn) return null

  return (
    <div className="logged-in-band" id="loggedInBand" data-testid="logged-in-band">
      <div className="logged-in-band__inner">
        <span className="logged-in-band__greeting">Welcome back.</span>
        <button
          type="button"
          className="logged-in-band__cta"
          onClick={() => navigate('/scenarios', { state: { fresh: true } })}
        >
          Go to Dashboard <span aria-hidden="true">&rarr;</span>
        </button>
        <span className="logged-in-band__hint">or scroll to learn more</span>
      </div>
    </div>
  )
}

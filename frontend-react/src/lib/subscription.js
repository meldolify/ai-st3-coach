import { CONFIG } from '../config'
import { useAuthStore } from '../stores/authStore'

/**
 * canAccessScenario — Three-tier access control for scenario paths.
 *
 * Unlogged → all locked. Free → FREE_TIER_SCENARIOS only. Premium → all allowed.
 */
export function canAccessScenario(scenarioPath) {
  const { currentUser, userSubscription } = useAuthStore.getState()

  // Tier 1: Unlogged users — all scenarios locked
  if (!currentUser) return false

  // Tier 3: Paid users — access within their specialty
  if (userSubscription?.status === 'active' || userSubscription?.status === 'trialing') {
    const requiredSpecialty = CONFIG.getScenarioSpecialty(scenarioPath)
    if (requiredSpecialty && userSubscription.specialty && userSubscription.specialty !== requiredSpecialty) {
      return false
    }
    return true
  }

  // Tier 2: Free users — limited scenarios
  return CONFIG.FREE_TIER_SCENARIOS.includes(scenarioPath)
}

export function isPremiumUser() {
  const sub = useAuthStore.getState().userSubscription
  return sub?.status === 'active' || sub?.status === 'trialing'
}

/**
 * startCheckout — Redirect to Stripe Checkout for subscription purchase.
 */
export async function startCheckout(plan = 'monthly') {
  const { currentUser } = useAuthStore.getState()

  if (!currentUser) {
    throw new Error('Please sign in to subscribe.')
  }

  const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      email: currentUser.email,
      priceType: plan,
      specialty: 'plastic-surgery',
    }),
  })

  if (!response.ok) throw new Error('Failed to create checkout session')

  const { url } = await response.json()
  window.location.href = url
}

/**
 * openCustomerPortal — Redirect to Stripe Customer Portal for subscription management.
 */
export async function openCustomerPortal() {
  const { userSubscription } = useAuthStore.getState()

  if (!userSubscription?.stripe_customer_id) {
    throw new Error('No active subscription found.')
  }

  const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/create-portal-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: userSubscription.stripe_customer_id,
    }),
  })

  if (!response.ok) throw new Error('Failed to create portal session')

  const { url } = await response.json()
  window.location.href = url
}

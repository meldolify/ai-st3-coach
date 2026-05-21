import { CONFIG } from '../config'
import { useAuthStore } from '../stores/authStore'
import { supabaseClient } from './supabase'

/**
 * Defense-in-depth check for full-page redirects sourced from our own backend.
 * Even though the URL is returned by api.reviva.live (which we control), a
 * compromised or misconfigured backend response could otherwise hand us a
 * `javascript:`-scheme URL — assigning that to `window.location.href` would
 * execute attacker JS in our origin with the current user's session.
 */
function isSafeRedirectUrl(url) {
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return false
    return (
      u.hostname === 'checkout.stripe.com' ||
      u.hostname === 'billing.stripe.com' ||
      u.hostname.endsWith('.stripe.com')
    )
  } catch {
    return false
  }
}

/**
 * Fetch the current Supabase session and return an Authorization header value.
 * The backend Stripe routes require this on every call (audit 2026-05-21
 * findings HIGH-01 + HIGH-02). Throws if no session — caller is expected to
 * already be logged in.
 */
async function getBearerHeader() {
  const { data } = await supabaseClient.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('Not signed in.')
  return { Authorization: `Bearer ${token}` }
}

/**
 * canAccessScenario — Three-tier access control for scenario paths.
 *
 * Unlogged → all locked. Free → FREE_TIER_SCENARIOS only. Premium → all allowed.
 */
export function canAccessScenario(scenarioPath) {
  // E2E test tier override
  if (typeof window !== 'undefined' && window.__TEST_TIER__) {
    if (window.__TEST_TIER__ === 'premium') return true
    if (window.__TEST_TIER__ === 'free') {
      return CONFIG.FREE_TIER_SCENARIOS.includes(scenarioPath)
    }
    if (window.__TEST_TIER__ === 'unlogged') return false
  }

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
 *
 * The backend derives userId + email from the Supabase Bearer token, so we
 * only send the plan choice. See audit 2026-05-21 §HIGH-02.
 */
export async function startCheckout(plan = 'monthly') {
  const { currentUser } = useAuthStore.getState()

  if (!currentUser) {
    throw new Error('Please sign in to subscribe.')
  }

  const authHeader = await getBearerHeader()
  const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({ priceType: plan }),
  })

  if (!response.ok) throw new Error('Failed to create checkout session')

  const { url } = await response.json()
  if (!isSafeRedirectUrl(url)) {
    throw new Error('Unsafe redirect URL returned by checkout endpoint')
  }
  window.location.href = url
}

/**
 * openCustomerPortal — Redirect to Stripe Customer Portal for subscription management.
 *
 * The backend looks up the caller's stripe_customer_id from their own
 * subscriptions row using the Supabase Bearer token; the client no longer
 * sends a customerId. See audit 2026-05-21 §HIGH-01.
 */
export async function openCustomerPortal() {
  const { userSubscription } = useAuthStore.getState()

  if (!userSubscription?.stripe_customer_id) {
    throw new Error('No active subscription found.')
  }

  const authHeader = await getBearerHeader()
  const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/create-portal-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
  })

  if (!response.ok) throw new Error('Failed to create portal session')

  const { url } = await response.json()
  if (!isSafeRedirectUrl(url)) {
    throw new Error('Unsafe redirect URL returned by portal endpoint')
  }
  window.location.href = url
}

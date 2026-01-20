// ============================================================================
// SUBSCRIPTION.JS - Stripe Payments and Tier Access Control
// ============================================================================
// Dependencies: state.js, config.js
// Functions: canAccessScenario, showUpgradeModal, startCheckout, openCustomerPortal
// ============================================================================

function canAccessScenario(scenarioPath) {
  // Test mode override (for development testing)
  if (testTierOverride) {
    switch (testTierOverride) {
      case 'unlogged':
        return false;
      case 'free':
        return CONFIG.FREE_TIER_SCENARIOS.includes(scenarioPath);
      case 'premium':
        return true;
    }
  }

  // Tier 1: Unlogged users - all scenarios locked
  if (!currentUser) {
    return false;
  }

  // Tier 3: Paid users (logged in + active subscription) - full access
  if (userSubscription?.status === 'active') {
    return true;
  }

  // Tier 2: Free users (logged in, no subscription) - limited scenarios
  return CONFIG.FREE_TIER_SCENARIOS.includes(scenarioPath);
}

function showUpgradeModal() {
  document.getElementById('upgradeModal').classList.add('active');
}

function hideUpgradeModal() {
  document.getElementById('upgradeModal').classList.remove('active');
}

async function startCheckout() {
  if (!currentUser) {
    alert('Please log in to subscribe.');
    return;
  }

  try {
    const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        email: currentUser.email
      })
    });

    if (!response.ok) throw new Error('Failed to create checkout session');

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('[PAYMENT] Checkout error:', error);
    alert('Unable to start checkout. Please try again.');
  }
}

async function openCustomerPortal() {
  if (!userSubscription?.stripe_customer_id) {
    alert('No subscription found.');
    return;
  }

  try {
    const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/create-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: userSubscription.stripe_customer_id
      })
    });

    if (!response.ok) throw new Error('Failed to create portal session');

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('[PAYMENT] Portal error:', error);
    alert('Unable to open subscription management. Please try again.');
  }
}


// ============================================================================
// SUBSCRIPTION.JS - Stripe Payments and Tier Access Control
// ============================================================================
// Dependencies: state.js, config.js
// Functions: canAccessScenario, showUpgradeModal, startCheckout, openCustomerPortal
// ============================================================================

// Pricing state
let selectedPlan = 'monthly';

// Default modal content
const DEFAULT_MODAL_TITLE = 'Unlock Plastic Surgery ST3';
const DEFAULT_MODAL_MESSAGE = 'Get full access to all Plastic Surgery interview scenarios and mock exams.';

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

  // Tier 3: Paid users (logged in + active subscription) - access within their specialty
  if (userSubscription?.status === 'active') {
    // Check specialty match if subscription has a specialty set
    const requiredSpecialty = CONFIG.getScenarioSpecialty(scenarioPath);
    if (requiredSpecialty && userSubscription.specialty && userSubscription.specialty !== requiredSpecialty) {
      return false; // Subscription for different specialty
    }
    return true;
  }

  // Tier 2: Free users (logged in, no subscription) - limited scenarios
  return CONFIG.FREE_TIER_SCENARIOS.includes(scenarioPath);
}

function isPremiumUser() {
  // Test mode override
  if (testTierOverride) {
    return testTierOverride === 'premium';
  }

  // Check active subscription
  return userSubscription?.status === 'active';
}

// ============================================================================
// UPGRADE MODAL
// ============================================================================

function showUpgradeModal(options = {}) {
  const { title, message } = options;

  // Set title and message (use defaults if not provided)
  const titleEl = document.getElementById('upgradeModalTitle');
  const messageEl = document.getElementById('upgradeModalMessage');

  if (titleEl) titleEl.textContent = title || DEFAULT_MODAL_TITLE;
  if (messageEl) messageEl.textContent = message || DEFAULT_MODAL_MESSAGE;

  // Reset to monthly plan
  selectedPlan = 'monthly';
  updatePlanButtons();
  updatePriceDisplay();

  document.getElementById('upgradeModal').classList.add('active');
}

function hideUpgradeModal() {
  document.getElementById('upgradeModal').classList.remove('active');

  // Reset to defaults after close animation
  setTimeout(() => {
    const titleEl = document.getElementById('upgradeModalTitle');
    const messageEl = document.getElementById('upgradeModalMessage');
    if (titleEl) titleEl.textContent = DEFAULT_MODAL_TITLE;
    if (messageEl) messageEl.textContent = DEFAULT_MODAL_MESSAGE;
  }, 300);
}

function selectPlan(plan) {
  selectedPlan = plan;
  updatePlanButtons();
  updatePriceDisplay();
}

function updatePlanButtons() {
  const buttons = document.querySelectorAll('.plan-btn');
  buttons.forEach(btn => {
    if (btn.dataset.plan === selectedPlan) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updatePriceDisplay() {
  const priceEl = document.getElementById('priceDisplay');
  const periodEl = document.getElementById('periodDisplay');
  const savingsEl = document.getElementById('savingsDisplay');

  if (!priceEl || !periodEl) return;

  if (selectedPlan === 'annual') {
    priceEl.textContent = '£99.99';
    periodEl.textContent = '/year';
    if (savingsEl) savingsEl.textContent = 'Save £80 compared to monthly!';
  } else {
    priceEl.textContent = '£14.99';
    periodEl.textContent = '/month';
    if (savingsEl) savingsEl.textContent = '';
  }
}

// ============================================================================
// SUCCESS MODAL
// ============================================================================

function showSuccessModal(message) {
  const modal = document.getElementById('successModal');
  if (modal) {
    // Update message if provided
    const msgEl = modal.querySelector('p');
    if (msgEl && message) msgEl.textContent = message;
    modal.classList.add('active');
  }
}

function hideSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const messageSpan = document.createElement('span');
  messageSpan.className = 'toast-message';
  messageSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast-close';
  closeBtn.textContent = '\u00D7';
  closeBtn.onclick = () => toast.remove();

  toast.appendChild(messageSpan);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showErrorToast(message) {
  showToast(message, 'error');
}

function showSuccessToast(message) {
  showToast(message, 'success');
}

// ============================================================================
// STRIPE CHECKOUT
// ============================================================================

async function startCheckout() {
  if (!currentUser) {
    // Show login modal or redirect to auth
    hideUpgradeModal();
    showErrorToast('Please sign in to subscribe.');
    // Trigger auth modal if available
    if (typeof showAuthModal === 'function') {
      showAuthModal();
    }
    return;
  }

  try {
    const response = await fetch(`${CONFIG.HTTP_BACKEND_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        email: currentUser.email,
        priceType: selectedPlan,
        specialty: 'plastic-surgery'
      })
    });

    if (!response.ok) throw new Error('Failed to create checkout session');

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('[PAYMENT] Checkout error:', error);
    showErrorToast('Unable to start checkout. Please try again.');
  }
}

async function openCustomerPortal() {
  if (!userSubscription?.stripe_customer_id) {
    showErrorToast('No active subscription found.');
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
    showErrorToast('Unable to open billing portal. Please try again.');
  }
}


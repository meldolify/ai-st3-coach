// ============================================================================
// AUTH.JS - Authentication, User Profile, and Login/Logout
// ============================================================================
// Dependencies: state.js, config.js, Supabase SDK
// Functions: initSupabase, checkAuthState, loadUserProfile, loadSubscription,
//            handleAuthSubmit, handleLogout, handleSocialLogin, saveProfile
// ============================================================================

function initSupabase() {
  if (CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL' || CONFIG.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('[AUTH] Supabase not configured. Running in demo mode.');
    return false;
  }

  // Check if Supabase SDK loaded
  if (typeof window.supabase === 'undefined') {
    console.error('[AUTH] Supabase SDK not loaded. Running in demo mode.');
    return false;
  }

  try {
    supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log('[AUTH] Supabase initialized');
    return true;
  } catch (error) {
    console.error('[AUTH] Failed to initialize Supabase:', error);
    return false;
  }
}

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

// Hide the loading overlay with fade transition
function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    // Remove from DOM after transition completes
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }
}

async function checkAuthState() {
  if (!supabaseClient) {
    // No Supabase configured - show landing page so users can sign up
    console.log('[AUTH] No Supabase configured - showing landing page');
    showLandingPage();
    hideLoadingOverlay();
    return;
  }

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
      currentUser = session.user;
      await loadUserProfile();
      await loadSubscription();
      // Always show landing page for logged-in users
      showLandingPage();
    } else {
      showLandingPage();
    }
  } catch (error) {
    console.error('[AUTH] Error checking auth state:', error);
    // Show landing page on error so user can try to login
    showLandingPage();
  }

  // Always hide loading overlay after auth check completes
  hideLoadingOverlay();
}

async function loadUserProfile() {
  if (!supabaseClient || !currentUser) return;

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) throw error;
    userProfile = data;
    console.log('[AUTH] Profile loaded:', userProfile?.email);
  } catch (error) {
    console.error('[AUTH] Error loading profile:', error);
  }
}

async function loadSubscription() {
  if (!supabaseClient || !currentUser) return;

  try {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (error) throw error;
    userSubscription = data;
    console.log('[AUTH] Subscription status:', userSubscription?.status);
  } catch (error) {
    console.error('[AUTH] Error loading subscription:', error);
    // Default to free if no subscription record
    userSubscription = { status: 'free' };
  }
}

async function loadUserStats() {
  if (!supabaseClient || !currentUser) {
    return { totalSessions: 0, lastSessionDate: null };
  }

  try {
    // Count completed sessions
    const { count } = await supabaseClient
      .from('session_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .not('ended_at', 'is', null);

    // Get last session date
    const { data: lastSession } = await supabaseClient
      .from('session_history')
      .select('ended_at')
      .eq('user_id', currentUser.id)
      .not('ended_at', 'is', null)
      .order('ended_at', { ascending: false })
      .limit(1)
      .single();

    return {
      totalSessions: count || 0,
      lastSessionDate: lastSession?.ended_at || null
    };
  } catch (error) {
    console.error('[AUTH] Error loading stats:', error);
    return { totalSessions: 0, lastSessionDate: null };
  }
}

/**
 * Load feedback statistics grouped by scenario category
 * Categories are determined by the scenario_path:
 * - clinical_stations/* -> Clinical Stations
 * - communication/* -> Communication
 * - structured_interview/* -> Structured Interview
 */
async function loadFeedbackStats() {
  if (!supabaseClient || !currentUser) {
    return {
      clinical: { count: 0, avgScore: null },
      communication: { count: 0, avgScore: null },
      structured: { count: 0, avgScore: null }
    };
  }

  try {
    // Fetch all sessions with feedback for this user
    const { data, error } = await supabaseClient
      .from('session_history')
      .select('scenario_path, feedback_data')
      .eq('user_id', currentUser.id)
      .not('feedback_data', 'is', null);

    if (error) throw error;

    // Group and aggregate by category
    const stats = {
      clinical: { scores: [], count: 0, avgScore: null },
      communication: { scores: [], count: 0, avgScore: null },
      structured: { scores: [], count: 0, avgScore: null }
    };

    (data || []).forEach(session => {
      const path = (session.scenario_path || '').toLowerCase();
      const score = session.feedback_data?.score;

      // Determine category from path
      let category = null;
      if (path.includes('clinical_stations') || path.includes('clinical/')) {
        category = 'clinical';
      } else if (path.includes('communication') || path.includes('call_boss') || path.includes('consent')) {
        category = 'communication';
      } else if (path.includes('structured_interview') || path.includes('structured')) {
        category = 'structured';
      }

      if (category && score) {
        stats[category].scores.push(score);
        stats[category].count++;
      }
    });

    // Calculate averages
    Object.keys(stats).forEach(cat => {
      if (stats[cat].scores.length > 0) {
        const sum = stats[cat].scores.reduce((a, b) => a + b, 0);
        stats[cat].avgScore = (sum / stats[cat].scores.length).toFixed(1);
      }
      delete stats[cat].scores; // Clean up
    });

    return stats;
  } catch (error) {
    console.error('[AUTH] Error loading feedback stats:', error);
    return {
      clinical: { count: 0, avgScore: null },
      communication: { count: 0, avgScore: null },
      structured: { count: 0, avgScore: null }
    };
  }
}

/**
 * Populate progress cards with feedback statistics
 */
function populateProgressCards(stats) {
  const categories = [
    { key: 'clinical', name: 'Clinical Stations' },
    { key: 'communication', name: 'Communication' },
    { key: 'structured', name: 'Structured Interview' }
  ];

  categories.forEach(cat => {
    const countEl = document.getElementById(`progress-${cat.key}-count`);
    const scoreEl = document.getElementById(`progress-${cat.key}-score`);
    const indicatorEl = document.getElementById(`progress-${cat.key}-indicator`);
    const cardEl = document.getElementById(`progress-${cat.key}-card`);

    if (countEl) countEl.textContent = stats[cat.key]?.count || 0;

    if (scoreEl) {
      const avg = stats[cat.key]?.avgScore;
      scoreEl.textContent = avg ? `${avg}/5` : '-';
    }

    if (indicatorEl && cardEl) {
      const avg = parseFloat(stats[cat.key]?.avgScore) || 0;
      // Remove existing color classes
      indicatorEl.classList.remove('progress-indicator--low', 'progress-indicator--medium', 'progress-indicator--high');
      cardEl.classList.remove('progress-card--low', 'progress-card--medium', 'progress-card--high');

      if (avg > 0) {
        if (avg < 3) {
          indicatorEl.classList.add('progress-indicator--low');
          cardEl.classList.add('progress-card--low');
        } else if (avg < 4) {
          indicatorEl.classList.add('progress-indicator--medium');
          cardEl.classList.add('progress-card--medium');
        } else {
          indicatorEl.classList.add('progress-indicator--high');
          cardEl.classList.add('progress-card--high');
        }
      }
    }
  });
}

// ============================================================================
// PAGE NAVIGATION (AUTH)
// ============================================================================

function showLandingPage() {
  // Guard: Only run on pages that have the landing page element (index.html)
  const landingPage = document.getElementById('landingPage');
  if (!landingPage) {
    console.log('[AUTH] showLandingPage called on page without landing page element');
    return;
  }

  hideAllPages();
  landingPage.classList.remove('hidden');
  landingPage.classList.add('active');
  landingPage.style.display = 'block';
  const appHeader = document.getElementById('appHeader');
  if (appHeader) appHeader.style.display = 'none';
  document.body.classList.remove('has-header');

  // Update landing page content based on auth state
  updateLandingPageForAuthState();
}

// Navigate back to landing page (from app header logo)
// Always goes to landing page regardless of auth state
function navigateToLanding() {
  showLandingPage();
}

// Update landing page content based on authentication and subscription state
// Three states: Guest (not logged in), Free (logged in, no subscription), Subscribed (active subscription)
function updateLandingPageForAuthState() {
  const isLoggedIn = !!currentUser;
  const isSubscribed = userSubscription?.status === 'active';

  // === NAVIGATION ===
  const navGuest = document.getElementById('navLinksGuest');
  const navUser = document.getElementById('navLinksUser');
  const navPricingUser = document.getElementById('navPricingUser');

  if (navGuest && navUser) {
    navGuest.style.display = isLoggedIn ? 'none' : 'flex';
    navUser.style.display = isLoggedIn ? 'flex' : 'none';
  }

  // Hide pricing link in nav for subscribed users
  if (navPricingUser) {
    navPricingUser.style.display = isSubscribed ? 'none' : 'inline';
  }

  // === HERO CTA BUTTONS ===
  const primaryBtn = document.getElementById('heroPrimaryBtn');
  const secondaryBtn = document.getElementById('heroSecondaryBtn');

  if (primaryBtn && secondaryBtn) {
    if (!isLoggedIn) {
      // Guest: Show signup and explore options
      primaryBtn.textContent = 'Login to Practise Free Sample Scenarios';
      primaryBtn.onclick = () => showAuthPage('signup');
      secondaryBtn.textContent = 'Explore the website without login';
      secondaryBtn.onclick = browseAsGuest;
      secondaryBtn.style.display = 'inline-flex';
    } else if (isSubscribed) {
      // Subscribed: Single dashboard button, no pricing CTA
      primaryBtn.textContent = 'Continue to Dashboard';
      primaryBtn.onclick = showProtectedContent;
      secondaryBtn.style.display = 'none';
    } else {
      // Free tier: Dashboard button + pricing link
      primaryBtn.textContent = 'Continue to Dashboard';
      primaryBtn.onclick = showProtectedContent;
      secondaryBtn.textContent = 'View Pricing';
      secondaryBtn.onclick = () => {
        const pricingSection = document.getElementById('pricingSection');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      };
      secondaryBtn.style.display = 'inline-flex';
    }
  }

  // === PRICING SECTION ===
  const pricingSection = document.getElementById('pricingSection');
  if (pricingSection) {
    pricingSection.style.display = isSubscribed ? 'none' : 'block';
  }

  // === DYNAMIC ACTION CARDS ===
  renderActionCards();
}

// Render dynamic action cards based on user tier
function renderActionCards() {
  const container = document.getElementById('actionCardsContainer');
  if (!container) return;

  const isLoggedIn = !!currentUser;
  const isPremium = userSubscription?.status === 'active';

  // Determine effective tier (with test override support)
  let effectiveTier = 'unlogged';
  if (typeof testTierOverride !== 'undefined' && testTierOverride) {
    effectiveTier = testTierOverride;
  } else if (isPremium) {
    effectiveTier = 'premium';
  } else if (isLoggedIn) {
    effectiveTier = 'free';
  }

  let cardsHTML = '';
  let cardNumber = 1;

  if (effectiveTier === 'unlogged') {
    // Card 1: Explore without login
    cardsHTML += createActionCard(cardNumber++, 'Explore', 'Scenarios',
      'Browse our curated library of clinical, communication, and structured interview scenarios',
      'Begin exploring', 'browseAsGuest()');

    // Card 2: Login to practise
    cardsHTML += createActionCard(cardNumber++, 'Login to', 'Practise',
      'Sign in to practise sample scenarios for free and track your progress',
      'Sign in', "showAuthPage('login')");

    // Card 3: Pricing
    cardsHTML += createActionCard(cardNumber++, 'View', 'Pricing',
      'Simple, transparent plans designed for surgical trainees at every stage',
      'See plans', "document.getElementById('pricingSection').scrollIntoView({behavior: 'smooth'})");

    container.classList.add('three-cards');
    container.classList.remove('single-card');

  } else if (effectiveTier === 'free') {
    // Card 1: Dashboard
    cardsHTML += createActionCard(cardNumber++, 'Go to', 'Dashboard',
      'Practise sample scenarios for free - upgrade for full access to all topics',
      'Start practising', 'showProtectedContent()');

    // Card 2: Pricing
    cardsHTML += createActionCard(cardNumber++, 'View', 'Pricing',
      'Unlock all scenarios and features with a premium subscription',
      'See plans', "document.getElementById('pricingSection').scrollIntoView({behavior: 'smooth'})");

    container.classList.remove('three-cards');
    container.classList.remove('single-card');

  } else if (effectiveTier === 'premium') {
    // Card 1: Dashboard (single card)
    cardsHTML += createActionCard(cardNumber++, 'Go to', 'Dashboard',
      'Unlimited access to all modes and topics in the specialty - continue your preparation',
      'Continue training', 'showProtectedContent()', true);

    container.classList.remove('three-cards');
    container.classList.add('single-card');
  }

  container.innerHTML = cardsHTML;
}

// Helper to create action card HTML
function createActionCard(number, titlePart1, titlePart2, description, ctaText, onclickAction, fullWidth = false) {
  const paddedNumber = String(number).padStart(2, '0');
  const fullWidthClass = fullWidth ? 'action-card--full' : '';

  return `
    <article class="action-card ${fullWidthClass}" onclick="${onclickAction}" role="button" tabindex="0">
      <div class="card-number">${paddedNumber}</div>
      <h3 class="card-title">${titlePart1} <em>${titlePart2}</em></h3>
      <p class="card-description">${description}</p>
      <div class="card-cta">
        <span>${ctaText}</span>
        <svg class="cta-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </article>
  `;
}

function showAuthPage(mode = 'login') {
  console.log('[DEBUG] showAuthPage called with mode:', mode);
  authMode = mode;
  // Don't hide other pages - modal overlays on top
  const authPage = document.getElementById('authPage');
  console.log('[DEBUG] authPage element:', authPage);
  if (!authPage) {
    console.error('[ERROR] authPage element not found!');
    return;
  }
  authPage.classList.remove('hidden');
  authPage.classList.add('active');
  authPage.style.display = 'flex';
  // Reset scroll position (fixes mobile issue where modal opens scrolled down)
  authPage.scrollTop = 0;
  console.log('[DEBUG] authPage display set to:', authPage.style.display);
  console.log('[DEBUG] authPage classes:', authPage.className);
  updateAuthUI();
}

function closeAuthModal() {
  const authPage = document.getElementById('authPage');
  authPage.classList.add('hidden');
  authPage.classList.remove('active');
  authPage.style.display = 'none';
  // Clear any errors
  document.getElementById('authError').classList.remove('visible');
}

function showProtectedContent() {
  hideAllPages();
  document.getElementById('appHeader').style.display = 'flex';
  document.body.classList.add('has-header');

  // Check if user has a default specialty set
  const defaultSpecialty = localStorage.getItem('defaultSpecialty');
  if (defaultSpecialty) {
    // Skip specialty selection - go directly to difficulty selection
    selectedSpecialty = defaultSpecialty;
    const difficultySelection = document.getElementById('difficultySelection');
    difficultySelection.classList.remove('hidden');
    difficultySelection.style.display = 'block';
    console.log('[AUTH] Default specialty set, skipping to difficulty selection:', defaultSpecialty);
  } else {
    // Show specialty selection as normal
    const specialtySelection = document.getElementById('specialtySelection');
    specialtySelection.classList.remove('hidden');
    specialtySelection.style.display = 'block';
  }
}

// Allow users to browse without logging in (all scenarios will be locked)
function browseAsGuest() {
  console.log('[AUTH] Browsing as guest - all scenarios will be locked');
  currentUser = null;
  userProfile = null;
  userSubscription = null;
  showProtectedContent();
}

function showProfilePage() {
  // Track current page before showing profile
  if (document.getElementById('landingPage').style.display !== 'none') {
    previousPage = 'landingPage';
  } else if (document.getElementById('specialtySelection').style.display !== 'none') {
    previousPage = 'specialtySelection';
  } else if (document.getElementById('difficultySelection').style.display !== 'none') {
    previousPage = 'difficultySelection';
  } else if (document.getElementById('scenarioSelection').style.display !== 'none') {
    previousPage = 'scenarioSelection';
  } else if (document.getElementById('simulationRoom').style.display !== 'none') {
    previousPage = 'simulationRoom';
  }

  hideAllPages();
  const profilePage = document.getElementById('profilePage');
  profilePage.classList.remove('hidden');
  profilePage.classList.add('active');
  profilePage.style.display = 'block';

  // Keep app header visible for profile page (unless coming from landing)
  if (previousPage !== 'landingPage') {
    document.getElementById('appHeader').style.display = 'flex';
    document.body.classList.add('has-header');
  }

  // Close user dropdown
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.remove('active');

  // Populate profile fields
  populateProfilePage();
}

function hideProfilePage() {
  const profilePage = document.getElementById('profilePage');
  profilePage.style.display = 'none';
  profilePage.classList.add('hidden');
  profilePage.classList.remove('active');

  // Return to previous page
  if (previousPage === 'landingPage') {
    // Going back to landing page - hide header and show landing
    showLandingPage();
  } else {
    // Going back to a protected page - show header and the page
    const prevPage = document.getElementById(previousPage);
    prevPage.classList.remove('hidden');
    prevPage.style.display = 'block';
    document.getElementById('appHeader').style.display = 'flex';
    document.body.classList.add('has-header');
  }
}

async function populateProfilePage() {
  // Email
  document.getElementById('profileEmail').value = currentUser?.email || '';

  // Profile fields
  document.getElementById('profileName').value = userProfile?.full_name || '';
  document.getElementById('profileSpecialty').value = userProfile?.specialty || '';
  document.getElementById('profileTrainingLevel').value = userProfile?.training_level || '';

  // Default specialty preference (from localStorage)
  const defaultSpecialtySelect = document.getElementById('profileDefaultSpecialty');
  if (defaultSpecialtySelect) {
    defaultSpecialtySelect.value = localStorage.getItem('defaultSpecialty') || '';
  }

  // Subscription
  const isPremium = userSubscription?.status === 'active';
  document.getElementById('subscriptionPlanName').textContent = isPremium ? 'Premium Plan' : 'Free Plan';
  document.getElementById('subscriptionDetails').textContent = isPremium
    ? `Renews ${userSubscription.current_period_end ? new Date(userSubscription.current_period_end).toLocaleDateString() : 'monthly'}`
    : 'Access to sample scenarios';
  document.getElementById('subscriptionBadge').textContent = isPremium ? 'Premium' : 'Free';
  document.getElementById('subscriptionBadge').className = `subscription-badge ${isPremium ? 'premium' : 'free'}`;
  document.getElementById('upgradeBtn').style.display = isPremium ? 'none' : 'block';
  document.getElementById('manageSubscriptionBtn').style.display = isPremium ? 'block' : 'none';

  // Stats (elements may not exist if stats section not in HTML)
  const stats = await loadUserStats();
  const statTotalEl = document.getElementById('statTotalSessions');
  const statLastEl = document.getElementById('statLastSession');
  if (statTotalEl) statTotalEl.textContent = stats.totalSessions;
  if (statLastEl) statLastEl.textContent = stats.lastSessionDate
    ? new Date(stats.lastSessionDate).toLocaleDateString()
    : '-';

  // Load feedback stats and populate progress cards
  const feedbackStats = await loadFeedbackStats();
  populateProgressCards(feedbackStats);
}

function hideAllPages() {
  const pages = [
    'landingPage',
    'authPage',
    'profilePage',
    'specialtySelection',
    'difficultySelection',
    'modeSelection',
    'mockTypeSelection',
    'stationTypeSelection',
    'scenarioSelection',
    'simulationRoom'
  ];
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.add('hidden');
      el.classList.remove('active');
    }
  });
}

// ============================================================================
// AUTH UI
// ============================================================================

function updateAuthUI() {
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const toggleText = document.getElementById('authToggleText');
  const toggleLink = document.getElementById('authToggleLink');
  const confirmGroup = document.getElementById('confirmPasswordGroup');
  const forgotLink = document.getElementById('forgotPasswordLink');

  if (authMode === 'signup') {
    title.textContent = 'Create Account';
    subtitle.textContent = 'Start your interview training journey';
    submitBtn.textContent = 'Sign Up';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Sign in';
    confirmGroup.style.display = 'flex';
    forgotLink.style.display = 'none';
  } else {
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Sign in to continue your training';
    submitBtn.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Sign up';
    confirmGroup.style.display = 'none';
    forgotLink.style.display = 'block';
  }

  // Clear errors and form
  document.getElementById('authError').classList.remove('visible');
  document.getElementById('authForm').reset();
}

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  updateAuthUI();
}

function showAuthError(message) {
  const errorEl = document.getElementById('authError');
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

function setAuthLoading(loading) {
  const form = document.getElementById('authForm');
  const loadingEl = document.getElementById('authLoading');

  if (loading) {
    form.style.display = 'none';
    loadingEl.classList.add('visible');
  } else {
    form.style.display = 'flex';
    loadingEl.classList.remove('visible');
  }
}

// ============================================================================
// AUTH HANDLERS
// ============================================================================

async function handleAuthSubmit(event) {
  event.preventDefault();

  if (!supabaseClient) {
    showAuthError('Authentication not configured. Please contact support.');
    return;
  }

  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (authMode === 'signup') {
    const confirmPassword = document.getElementById('authConfirmPassword').value;
    if (password !== confirmPassword) {
      showAuthError('Passwords do not match');
      return;
    }
  }

  setAuthLoading(true);
  document.getElementById('authError').classList.remove('visible');

  try {
    let result;

    if (authMode === 'signup') {
      result = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
    } else {
      result = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
    }

    if (result.error) throw result.error;

    if (authMode === 'signup' && result.data.user && !result.data.session) {
      // Email confirmation required
      setAuthLoading(false);
      alert('Please check your email to confirm your account.');
      showAuthPage('login');
    } else if (result.data.session) {
      currentUser = result.data.user;
      await loadUserProfile();
      await loadSubscription();
      showProtectedContent();
    }
  } catch (error) {
    console.error('[AUTH] Error:', error);
    showAuthError(error.message || 'Authentication failed. Please try again.');
  } finally {
    setAuthLoading(false);
  }
}

async function handleSocialLogin(provider) {
  if (!supabaseClient) {
    showAuthError('Authentication not configured. Please contact support.');
    return;
  }

  try {
    // Use current origin for redirect (works for both localhost and production)
    const redirectUrl = window.location.origin;
    console.log('[AUTH] OAuth redirect URL:', redirectUrl);

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('[AUTH] Social login error:', error);
    showAuthError(error.message || 'Social login failed. Please try again.');
  }
}

async function handleForgotPassword() {
  if (!supabaseClient) {
    showAuthError('Authentication not configured. Please contact support.');
    return;
  }

  const email = document.getElementById('authEmail').value;
  if (!email) {
    showAuthError('Please enter your email address first.');
    return;
  }

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });

    if (error) throw error;
    alert('Password reset email sent. Please check your inbox.');
  } catch (error) {
    console.error('[AUTH] Password reset error:', error);
    showAuthError(error.message || 'Failed to send reset email.');
  }
}

async function handleLogout() {
  if (!supabaseClient) {
    showLandingPage();
    return;
  }

  try {
    await supabaseClient.auth.signOut();
    currentUser = null;
    userProfile = null;
    userSubscription = null;
    document.getElementById('userDropdown').classList.remove('active');
    showLandingPage();
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
  }
}

// ============================================================================
// PROFILE FUNCTIONS
// ============================================================================

async function saveProfile() {
  // Save default specialty preference to localStorage (works even without Supabase)
  const defaultSpecialtySelect = document.getElementById('profileDefaultSpecialty');
  if (defaultSpecialtySelect) {
    localStorage.setItem('defaultSpecialty', defaultSpecialtySelect.value);
  }

  if (!supabaseClient || !currentUser) {
    // Even without Supabase, we saved the default specialty preference
    alert('Preferences saved!');
    return;
  }

  const fullName = document.getElementById('profileName').value;
  const specialty = document.getElementById('profileSpecialty').value;
  const trainingLevel = document.getElementById('profileTrainingLevel').value;

  try {
    const { error } = await supabaseClient
      .from('profiles')
      .update({
        full_name: fullName,
        specialty: specialty,
        training_level: trainingLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (error) throw error;

    // Update local state
    userProfile = { ...userProfile, full_name: fullName, specialty, training_level: trainingLevel };
    alert('Profile saved successfully!');
  } catch (error) {
    console.error('[AUTH] Error saving profile:', error);
    alert('Failed to save profile. Please try again.');
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('userDropdown');
  const btn = document.querySelector('.user-menu-btn');
  if (dropdown && btn && !dropdown.contains(event.target) && !btn.contains(event.target)) {
    dropdown.classList.remove('active');
  }
});

// ============================================================================
// AUTH MODAL VISUAL EFFECTS
// ============================================================================

/**
 * Initialize auth modal cursor-following effects
 * - Panel glow that follows cursor
 * - Input border glow on hover
 */
function initAuthModalEffects() {
  const formPanel = document.getElementById('authFormPanel');
  const glow = document.getElementById('authGlow');

  if (!formPanel || !glow) return;

  // Check if device supports hover
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (!supportsHover) return;

  // Track mouse position for panel glow
  formPanel.addEventListener('mousemove', (e) => {
    const rect = formPanel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glow.style.left = x + 'px';
    glow.style.top = y + 'px';
  });

  // Initialize input hover effects
  initAuthInputEffects();

  console.log('[AUTH] Modal visual effects initialized');
}

/**
 * Initialize input border glow effects
 * Creates a radial gradient glow that wraps around the entire border following cursor
 */
function initAuthInputEffects() {
  const inputWrappers = document.querySelectorAll('.auth-input-wrapper');

  inputWrappers.forEach(wrapper => {
    const input = wrapper.querySelector('.auth-input');
    const glowBorder = wrapper.querySelector('.input-glow-border');

    if (!input || !glowBorder) return;

    // Track mouse position relative to input for full border glow
    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create radial gradient at mouse position
      const gradient = `radial-gradient(80px circle at ${x}px ${y}px, var(--brand-primary) 0%, transparent 70%)`;
      glowBorder.style.setProperty('--glow-gradient', gradient);
    });

    wrapper.addEventListener('mouseleave', () => {
      glowBorder.style.setProperty('--glow-gradient', 'transparent');
    });
  });
}

// Initialize effects when auth page is shown
const originalShowAuthPage = typeof showAuthPage !== 'undefined' ? showAuthPage : null;

// Reinitialize effects when DOM is ready and when auth modal opens
document.addEventListener('DOMContentLoaded', () => {
  // Initial setup
  initAuthModalEffects();

  // Also observe for auth page becoming visible
  const authPage = document.getElementById('authPage');
  if (authPage) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (authPage.classList.contains('active')) {
            initAuthModalEffects();
          }
        }
      });
    });
    observer.observe(authPage, { attributes: true });
  }
});


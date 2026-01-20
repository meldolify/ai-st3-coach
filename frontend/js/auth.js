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

async function checkAuthState() {
  if (!supabaseClient) {
    // No Supabase configured - show landing page so users can sign up
    console.log('[AUTH] No Supabase configured - showing landing page');
    showLandingPage();
    return;
  }

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
      currentUser = session.user;
      await loadUserProfile();
      await loadSubscription();
      showProtectedContent();
    } else {
      showLandingPage();
    }
  } catch (error) {
    console.error('[AUTH] Error checking auth state:', error);
    // Show landing page on error so user can try to login
    showLandingPage();
  }
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

// ============================================================================
// PAGE NAVIGATION (AUTH)
// ============================================================================

function showLandingPage() {
  hideAllPages();
  const landingPage = document.getElementById('landingPage');
  landingPage.classList.remove('hidden');
  landingPage.classList.add('active');
  landingPage.style.display = 'block';
  document.getElementById('appHeader').style.display = 'none';
  document.body.classList.remove('has-header');

  // Update landing page nav based on login status
  updateLandingNavForAuthState();
}

// Navigate back to landing page (from app header)
function navigateToLanding() {
  showLandingPage();
}

// Update landing page navigation based on authentication state
function updateLandingNavForAuthState() {
  const navGuest = document.getElementById('navLinksGuest');
  const navUser = document.getElementById('navLinksUser');

  if (!navGuest || !navUser) return;

  if (currentUser) {
    // User is logged in - show profile/logout options
    navGuest.style.display = 'none';
    navUser.style.display = 'flex';
  } else {
    // User is not logged in - show login/signup options
    navGuest.style.display = 'flex';
    navUser.style.display = 'none';
  }
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
  const specialtySelection = document.getElementById('specialtySelection');
  specialtySelection.classList.remove('hidden');
  specialtySelection.style.display = 'block';
  document.getElementById('appHeader').style.display = 'flex';
  document.body.classList.add('has-header');
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
  if (document.getElementById('specialtySelection').style.display !== 'none') {
    previousPage = 'specialtySelection';
  } else if (document.getElementById('difficultySelection').style.display !== 'none') {
    previousPage = 'difficultySelection';
  } else if (document.getElementById('scenarioSelection').style.display !== 'none') {
    previousPage = 'scenarioSelection';
  }

  hideAllPages();
  const profilePage = document.getElementById('profilePage');
  profilePage.classList.remove('hidden');
  profilePage.classList.add('active');
  profilePage.style.display = 'block';

  // Close user dropdown
  document.getElementById('userDropdown').classList.remove('active');

  // Populate profile fields
  populateProfilePage();
}

function hideProfilePage() {
  const profilePage = document.getElementById('profilePage');
  profilePage.style.display = 'none';
  profilePage.classList.add('hidden');
  profilePage.classList.remove('active');

  // Return to previous page
  const prevPage = document.getElementById(previousPage);
  prevPage.classList.remove('hidden');
  prevPage.style.display = 'block';
}

async function populateProfilePage() {
  // Email
  document.getElementById('profileEmail').value = currentUser?.email || '';

  // Profile fields
  document.getElementById('profileName').value = userProfile?.full_name || '';
  document.getElementById('profileSpecialty').value = userProfile?.specialty || '';
  document.getElementById('profileTrainingLevel').value = userProfile?.training_level || '';

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
}

function hideAllPages() {
  const pages = ['landingPage', 'authPage', 'profilePage', 'specialtySelection', 'difficultySelection', 'scenarioSelection', 'simulationRoom'];
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
  if (!supabaseClient || !currentUser) {
    alert('Unable to save. Please try again.');
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


// ============================================================================
// GLOBAL STATE - Shared application state
// ============================================================================
// This file must be loaded FIRST before all other JS files

let session = null;
let currentScenario = { category: '', title: '', promptFile: 'template.txt', imageFile: null };

// Authentication State
let supabaseClient = null;
let currentUser = null;
let userProfile = null;
let userSubscription = null;
let currentSessionHistoryId = null;
let authMode = 'login'; // 'login' or 'signup'
let previousPage = 'specialtySelection'; // Track page before profile

// Scenario Selection State
let selectedSpecialty = null;
let selectedDifficulty = null;
let subheadingsTimer = null;
let topicsTimer = null;
let activeHeading = null;
let activeSubheading = null;

// Mobile Navigation State
let mobileCurrentLevel = 'headings';
let mobileCurrentHeading = null;
let mobileCurrentSubheading = null;
let mobileButtonListenersSetup = false;

// ============================================================================
// TIER TESTING MODE (Development Only)
// ============================================================================
// Use browser console to test different user tiers:
//   setTestTier('unlogged')  - Tier 1: No access to any scenarios
//   setTestTier('free')      - Tier 2: Access to free tier scenarios only
//   setTestTier('premium')   - Tier 3: Full access to all scenarios
//   setTestTier('off')       - Disable test mode, use real auth state

let testTierOverride = null; // null = use real auth, 'unlogged' | 'free' | 'premium'

window.setTestTier = function(tier) {
  const validTiers = ['unlogged', 'free', 'premium', 'off'];
  if (!validTiers.includes(tier)) {
    console.error(`[TEST] Invalid tier. Use: ${validTiers.join(', ')}`);
    return;
  }

  if (tier === 'off') {
    testTierOverride = null;
    console.log('[TEST] Test mode disabled. Using real authentication state.');
  } else {
    testTierOverride = tier;
    console.log(`[TEST] Test tier set to: ${tier}`);
    console.log('[TEST] Refresh scenario list to see changes.');
  }

  // Refresh the current page to apply changes
  if (document.getElementById('scenarioSelection').style.display !== 'none') {
    const currentHeading = document.querySelector('.scenario-selection-layout h2')?.textContent;
    if (currentHeading) {
      console.log('[TEST] Refreshing scenario view...');
    }
  }
}

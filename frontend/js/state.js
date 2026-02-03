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

// Mock Exam Mode State
let selectedMode = null;              // 'practice' | 'mock-exam'
let mockExamType = null;              // 'by-station' | 'full-mock'
let selectedStationType = null;       // 'clinical' | 'call-the-boss' | 'consent' | 'structured'

// Mock Exam Session State
let isMockExamActive = false;
let mockExamStations = [];            // Array of station configs for full mock
let currentStationIndex = 0;
let mockExamResults = [];             // Track results for profile

// Timer State
let scenarioTimerInterval = null;
let scenarioStartTime = null;
let scenarioTimeLimit = 300;          // 5 minutes default (mock by station)
let timerWarningShown = false;

// ============================================================================
// SIMULATION PAGE SESSION STORAGE HELPERS
// ============================================================================
// These functions manage state transfer between index.html and simulation.html

/**
 * Save simulation parameters to sessionStorage before navigating to simulation.html
 * @param {Object} params - Simulation parameters
 * @param {Object} params.scenario - Scenario info (title, promptFile, imageFile, category)
 * @param {string} params.difficulty - Difficulty level (easy/medium/strict)
 * @param {string} params.mode - Mode (practice/mock-exam)
 * @param {string} [params.mockExamType] - Mock exam type if applicable
 * @param {string} [params.returnPage] - Page to return to after exit
 */
function saveSimulationParams(params) {
  const simulationParams = {
    scenario: params.scenario || currentScenario,
    difficulty: params.difficulty || selectedDifficulty || 'easy',
    mode: params.mode || selectedMode || 'practice',
    mockExamType: params.mockExamType || mockExamType,
    stationType: params.stationType || selectedStationType,
    mockExam: params.mockExam || {
      isActive: isMockExamActive,
      stations: mockExamStations,
      currentIndex: currentStationIndex,
      results: mockExamResults
    },
    returnPage: params.returnPage || 'scenarioSelection'
  };
  sessionStorage.setItem('simulationParams', JSON.stringify(simulationParams));
  console.log('[State] Saved simulation params:', simulationParams);
  return simulationParams;
}

/**
 * Load simulation parameters from sessionStorage
 * @returns {Object|null} Simulation params or null if not found
 */
function loadSimulationParams() {
  const paramsJson = sessionStorage.getItem('simulationParams');
  if (!paramsJson) {
    return null;
  }
  try {
    const params = JSON.parse(paramsJson);
    console.log('[State] Loaded simulation params:', params);
    return params;
  } catch (e) {
    console.error('[State] Error parsing simulation params:', e);
    return null;
  }
}

/**
 * Clear simulation parameters from sessionStorage
 */
function clearSimulationParams() {
  sessionStorage.removeItem('simulationParams');
  console.log('[State] Cleared simulation params');
}

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

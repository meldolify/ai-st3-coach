// ============================================================================
// MOCK-EXAM.JS - Mock Exam Mode Logic
// ============================================================================
// Dependencies: state.js, config.js, subscription.js, scenarios.js, app.js
// Functions: startMockByStation, startFullMockExam, getRandomScenario,
//            startMockScenario, timer functions
// ============================================================================

// Station type to subheading mapping
const stationTypeSubheadings = {
  'clinical': [
    'breast-and-aesthetic',
    'burns',
    'elective-hand',
    'emergencies',
    'hand-trauma',
    'lower-limb',
    'skin-cancer',
    'head-and-neck',
    'congenital',
    'microsurgery'
  ],
  'call-the-boss': [
    'call-the-boss-scenarios'
  ],
  'consent': [
    'consent-breast-and-aesthetic',
    'consent-hand-surgery',
    'consent-skin-surgery',
    'consent-emergency-procedures',
    'consent-reconstructive'
  ],
  'structured': [
    'structured-audit',
    'structured-clinical-governance',
    'structured-complaints',
    'structured-consent-ethics',
    'structured-ethics',
    'structured-research',
    'structured-risk-management',
    'structured-teaching'
  ]
};

/**
 * Get topics for a subheading from the shared getTopicsData() source
 * This consolidates the duplicate data that was previously in mockExamTopicsData
 * @param {string} subheadingId - The subheading ID (e.g., 'breast-and-aesthetic')
 * @returns {Array} Array of [folder, title] pairs
 */
function getMockExamTopics(subheadingId) {
  if (typeof getTopicsData !== 'function') {
    console.error('[MOCK] getTopicsData function not available - scenarios.js may not be loaded');
    return [];
  }
  const topicsData = getTopicsData();
  const subcategory = topicsData[subheadingId];
  if (!subcategory || !subcategory.topics) {
    console.warn('[MOCK] No topics found for subheading:', subheadingId);
    return [];
  }
  return subcategory.topics;
}

// ============================================================================
// RANDOM SCENARIO SELECTION
// ============================================================================

/**
 * Get a random scenario from a specific station type
 * @param {string} stationType - 'clinical' | 'call-the-boss' | 'consent' | 'structured'
 * @returns {object} - { folder, title, promptFile }
 */
function getRandomScenarioFromStationType(stationType) {
  const subheadings = stationTypeSubheadings[stationType];
  if (!subheadings || subheadings.length === 0) {
    console.error('[MOCK] Invalid station type:', stationType);
    return null;
  }

  // Pick a random subheading
  const randomSubheading = subheadings[Math.floor(Math.random() * subheadings.length)];

  // Get topics for this subheading from the shared getTopicsData() source
  const topics = getMockExamTopics(randomSubheading);
  if (!topics || topics.length === 0) {
    console.error('[MOCK] No topics found for subheading:', randomSubheading);
    return null;
  }

  // Pick a random topic
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const [folder, title] = randomTopic;

  // Construct prompt file path
  const folderName = folder.split('/').pop();
  const heading = folder.split('/')[0];
  const promptFile = `prompts/${folder}/${selectedDifficulty}_${heading}_${folderName}_1.txt`;

  console.log('[MOCK] Selected random scenario:', { stationType, subheading: randomSubheading, title, promptFile });

  return {
    folder,
    title,
    promptFile,
    stationType,
    subheading: randomSubheading
  };
}

// ============================================================================
// MOCK BY STATION MODE
// ============================================================================

/**
 * Start a Mock by Station session
 * @param {string} stationType - 'clinical' | 'call-the-boss' | 'consent' | 'structured'
 */
function startMockByStation(stationType) {
  console.log('[MOCK] Starting Mock by Station:', stationType);

  // Get random scenario
  const scenario = getRandomScenarioFromStationType(stationType);
  if (!scenario) {
    showErrorToast('Could not load scenario. Please try again.');
    return;
  }

  // Check access
  if (!canAccessScenario(scenario.promptFile)) {
    showUpgradeModal({
      title: 'Plastic Surgery ST3',
      message: 'Unlock all Plastic Surgery mock exam scenarios with a subscription.'
    });
    return;
  }

  // Set mock exam state
  isMockExamActive = true;
  mockExamType = 'by-station';
  scenarioTimeLimit = 300; // 5 minutes for mock by station
  timerWarningShown = false;

  // Track for results (title hidden from user but recorded)
  mockExamResults = [{
    scenario: scenario,
    stationType: stationType,
    startTime: null,
    endTime: null
  }];

  // Show transition overlay
  showMockTransitionOverlay('Mock Station', stationType);

  // Transition to simulation room
  setTimeout(() => {
    hideMockTransitionOverlay();
    transitionToPage('stationTypeSelection', 'simulationRoom', () => {
      startMockScenario(scenario, true); // true = hide title
    });
  }, 1500);
}

// ============================================================================
// FULL MOCK EXAM MODE
// ============================================================================

/**
 * Start a Full Mock Exam (3 stations, 10 mins each)
 */
function startFullMockExam() {
  console.log('[MOCK] Starting Full Mock Exam');

  // Strict Premium Check
  if (!isPremiumUser()) {
    showUpgradeModal({
      title: 'Plastic Surgery Mock Exam',
      message: 'Practice timed Plastic Surgery ST3 exams with 3 rotating stations.'
    });
    return;
  }

  // Generate scenarios for all 3 stations
  mockExamStations = [
    {
      name: 'Clinical Station',
      timeLimit: 600, // 10 minutes
      scenarios: [
        getRandomScenarioFromStationType('clinical'),
        getRandomScenarioFromStationType('clinical')
      ]
    },
    {
      name: 'Communication Station',
      timeLimit: 600, // 10 minutes
      scenarios: [
        getRandomScenarioFromStationType('call-the-boss'),
        getRandomScenarioFromStationType('consent')
      ]
    },
    {
      name: 'Structured Interview Station',
      timeLimit: 600, // 10 minutes
      scenarios: [
        getRandomScenarioFromStationType('structured'),
        getRandomScenarioFromStationType('structured'),
        getRandomScenarioFromStationType('structured')
      ]
    }
  ];

  // Verify all scenarios loaded
  for (const station of mockExamStations) {
    for (const scenario of station.scenarios) {
      if (!scenario) {
        showErrorToast('Could not generate mock exam scenarios. Please try again.');
        return;
      }
    }
  }

  // Set mock exam state
  isMockExamActive = true;
  mockExamType = 'full-mock';
  currentStationIndex = 0;
  mockExamResults = [];
  timerWarningShown = false;

  // Show intro overlay
  showMockTransitionOverlay('Full Mock Exam', 'Starting Station 1 of 3: Clinical');

  // Start first station after delay
  setTimeout(() => {
    hideMockTransitionOverlay();
    startFullMockStation(0);
  }, 2000);
}

/**
 * Start a specific station in full mock exam
 * @param {number} stationIndex - 0, 1, or 2
 */
function startFullMockStation(stationIndex) {
  const station = mockExamStations[stationIndex];
  if (!station) {
    console.error('[MOCK] Invalid station index:', stationIndex);
    endFullMockExam();
    return;
  }

  currentStationIndex = stationIndex;
  scenarioTimeLimit = station.timeLimit;
  timerWarningShown = false;

  console.log('[MOCK] Starting station:', station.name);

  // Update progress indicator
  updateMockExamProgress(stationIndex + 1, 3);

  // For full mock, we start the first scenario of the station
  const firstScenario = station.scenarios[0];

  // Transition to simulation room (or just load if already there)
  if (stationIndex === 0) {
    transitionToPage('mockTypeSelection', 'simulationRoom', () => {
      startMockScenario(firstScenario, true);
    });
  } else {
    // Already in simulation room, just load new scenario
    startMockScenario(firstScenario, true);
  }
}

/**
 * Advance to next station in full mock exam
 */
function advanceToNextStation() {
  currentStationIndex++;

  if (currentStationIndex >= mockExamStations.length) {
    // All stations complete
    endFullMockExam();
    return;
  }

  // Show transition overlay
  const station = mockExamStations[currentStationIndex];
  showMockTransitionOverlay(station.name, `Station ${currentStationIndex + 1} of 3`);

  setTimeout(() => {
    hideMockTransitionOverlay();
    startFullMockStation(currentStationIndex);
  }, 2000);
}

/**
 * End full mock exam and show summary
 */
function endFullMockExam() {
  console.log('[MOCK] Full Mock Exam complete');

  // Stop timer
  stopScenarioTimer();

  // Disconnect session
  if (session) {
    session.disconnect();
    session = null;
  }

  // Reset mock state
  isMockExamActive = false;

  // TODO: Show summary page with results
  // For now, just return to mode selection
  showSuccessToast('Full Mock Exam Complete! You completed all 3 stations.');
  transitionToPage('simulationRoom', 'modeSelection');
}

// ============================================================================
// MOCK SCENARIO LOADING
// ============================================================================

/**
 * Start a mock scenario (loads into simulation room)
 * @param {object} scenario - { folder, title, promptFile }
 * @param {boolean} hideTitle - Whether to hide the scenario title
 */
function startMockScenario(scenario, hideTitle) {
  // Set current scenario (similar to selectScenario)
  currentScenario = {
    category: scenario.stationType || 'Mock',
    title: hideTitle ? 'Mock Exam Scenario' : scenario.title,
    promptFile: scenario.promptFile,
    imageFile: null
  };

  // Update UI elements
  const titleElement = document.getElementById('currentScenarioTitle');
  const categoryElement = document.getElementById('currentScenarioCategory');

  if (hideTitle) {
    titleElement.textContent = 'Mock Exam Scenario';
    categoryElement.textContent = 'Scenario details hidden';
  } else {
    titleElement.textContent = scenario.title;
    // Show difficulty mode instead of station type
    const diff = selectedDifficulty || 'easy';
    const difficultyLabels = {
      'easy': 'Easy Mode',
      'medium': 'Medium Mode',
      'strict': 'Strict Mode'
    };
    categoryElement.textContent = difficultyLabels[diff] || 'Easy Mode';
    categoryElement.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-strict');
    categoryElement.classList.add(`difficulty-${diff}`);
  }

  // Apply active class to simulation room
  const simulationRoom = document.getElementById('simulationRoom');
  simulationRoom.classList.add('active');

  // Show timer
  showScenarioTimer();

  // Sync mobile elements
  if (typeof syncMobileSimulationElements === 'function') {
    syncMobileSimulationElements();
  }

  // Log for tracking (even if hidden from user)
  console.log('[MOCK] Loaded scenario:', scenario.title, '| Prompt:', scenario.promptFile);

  // Record start time
  if (mockExamResults.length > 0) {
    mockExamResults[mockExamResults.length - 1].startTime = Date.now();
  }
}

// ============================================================================
// TIMER FUNCTIONS
// ============================================================================

/**
 * Show and start the scenario timer
 */
function showScenarioTimer() {
  const timerContainer = document.getElementById('mockExamTimer');
  if (timerContainer) {
    timerContainer.style.display = 'flex';
  }

  // Start countdown
  scenarioStartTime = Date.now();
  updateTimerDisplay();

  // Clear any existing interval
  if (scenarioTimerInterval) {
    clearInterval(scenarioTimerInterval);
  }

  // Update every second
  scenarioTimerInterval = setInterval(updateTimerDisplay, 1000);
}

// Recalculate timer immediately when tab regains focus (setInterval is throttled in background)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && scenarioTimerInterval) {
    updateTimerDisplay();
  }
});

/**
 * Update the timer display
 */
function updateTimerDisplay() {
  const elapsed = Math.floor((Date.now() - scenarioStartTime) / 1000);
  const remaining = Math.max(0, scenarioTimeLimit - elapsed);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const minutesElement = document.getElementById('timerMinutes');
  const secondsElement = document.getElementById('timerSeconds');
  const timerContainer = document.getElementById('mockExamTimer');
  const timerWarning = document.getElementById('timerWarning');

  if (minutesElement && secondsElement) {
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
  }

  // Warning at 1 minute remaining
  if (remaining <= 60 && remaining > 0) {
    if (timerContainer) {
      timerContainer.classList.add('warning');
    }
    if (timerWarning && !timerWarningShown) {
      timerWarning.style.display = 'block';
      timerWarningShown = true;
    }
  }

  // Time's up
  if (remaining <= 0) {
    stopScenarioTimer();

    if (mockExamType === 'full-mock') {
      // Auto-advance to next station
      advanceToNextStation();
    } else {
      // Mock by station - just show time's up (don't auto-end)
      if (timerWarning) {
        timerWarning.textContent = "Time's up!";
        timerWarning.style.display = 'block';
      }
    }
  }
}

/**
 * Stop the scenario timer
 */
function stopScenarioTimer() {
  if (scenarioTimerInterval) {
    clearInterval(scenarioTimerInterval);
    scenarioTimerInterval = null;
  }

  // Record end time
  if (mockExamResults.length > 0) {
    mockExamResults[mockExamResults.length - 1].endTime = Date.now();
  }
}

/**
 * Hide the timer
 */
function hideScenarioTimer() {
  const timerContainer = document.getElementById('mockExamTimer');
  if (timerContainer) {
    timerContainer.style.display = 'none';
    timerContainer.classList.remove('warning');
  }

  const timerWarning = document.getElementById('timerWarning');
  if (timerWarning) {
    timerWarning.style.display = 'none';
  }

  stopScenarioTimer();
}

// ============================================================================
// TRANSITION OVERLAY
// ============================================================================

/**
 * Show transition overlay between scenarios
 * @param {string} title - Main title
 * @param {string} subtitle - Subtitle text
 */
function showMockTransitionOverlay(title, subtitle) {
  const overlay = document.getElementById('mockTransitionOverlay');
  const titleEl = document.getElementById('mockTransitionTitle');
  const subtitleEl = document.getElementById('mockTransitionSubtitle');

  if (overlay && titleEl && subtitleEl) {
    titleEl.textContent = title;
    subtitleEl.textContent = subtitle;
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
  }
}

/**
 * Hide transition overlay
 */
function hideMockTransitionOverlay() {
  const overlay = document.getElementById('mockTransitionOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 500);
  }
}

// ============================================================================
// PROGRESS INDICATOR (Full Mock only)
// ============================================================================

/**
 * Update mock exam progress indicator
 * @param {number} current - Current station (1-3)
 * @param {number} total - Total stations (3)
 */
function updateMockExamProgress(current, total) {
  const progressContainer = document.getElementById('mockExamProgress');
  const progressText = document.getElementById('mockProgressText');
  const progressFill = document.getElementById('mockProgressFill');

  if (progressContainer && mockExamType === 'full-mock') {
    progressContainer.style.display = 'block';

    if (progressText) {
      progressText.textContent = `Station ${current} of ${total}`;
    }

    if (progressFill) {
      progressFill.style.width = `${(current / total) * 100}%`;
    }
  }
}

/**
 * Hide mock exam progress indicator
 */
function hideMockExamProgress() {
  const progressContainer = document.getElementById('mockExamProgress');
  if (progressContainer) {
    progressContainer.style.display = 'none';
  }
}

// ============================================================================
// CLEANUP ON EXIT
// ============================================================================

// Override exitSimulation to handle mock exam state
const originalExitSimulation = typeof exitSimulation === 'function' ? exitSimulation : null;

function exitMockExamSimulation() {
  // Clean up mock exam state
  if (isMockExamActive) {
    stopScenarioTimer();
    hideScenarioTimer();
    hideMockExamProgress();
    isMockExamActive = false;
    mockExamType = null;
    mockExamStations = [];
    currentStationIndex = 0;
    mockExamResults = [];
  }

  // Call original exit if exists
  if (originalExitSimulation) {
    originalExitSimulation();
  }
}

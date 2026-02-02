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

// Topics data for random selection (same structure as scenarios.js)
const mockExamTopicsData = {
  // ========== CLINICAL ==========
  'breast-and-aesthetic': [
    ['clinical/breast_and_aesthetic/breast_reconstruction', 'Breast Reconstruction'],
    ['clinical/breast_and_aesthetic/breast_reduction', 'Breast Reduction'],
    ['clinical/breast_and_aesthetic/mastopexy', 'Mastopexy'],
    ['clinical/breast_and_aesthetic/gynaecomastia', 'Gynaecomastia'],
    ['clinical/breast_and_aesthetic/liposuction', 'Liposuction'],
    ['clinical/breast_and_aesthetic/abdominoplasty', 'Abdominoplasty'],
    ['clinical/breast_and_aesthetic/blepharoplasty', 'Blepharoplasty'],
    ['clinical/breast_and_aesthetic/otoplasty', 'Otoplasty'],
    ['clinical/breast_and_aesthetic/rhinoplasty', 'Rhinoplasty'],
    ['clinical/breast_and_aesthetic/brachioplasty', 'Brachioplasty'],
    ['clinical/breast_and_aesthetic/thighplasty', 'Thighplasty'],
    ['clinical/breast_and_aesthetic/fat_necrosis', 'Fat Necrosis'],
    ['clinical/breast_and_aesthetic/capsular_contracture', 'Capsular Contracture'],
    ['clinical/breast_and_aesthetic/implant_complications', 'Implant Complications'],
    ['clinical/breast_and_aesthetic/lymphoedema', 'Lymphoedema']
  ],
  'burns': [
    ['clinical/burns/acute_burns_assessment', 'Acute Burns Assessment'],
    ['clinical/burns/fluid_resuscitation', 'Fluid Resuscitation'],
    ['clinical/burns/escharotomy', 'Escharotomy'],
    ['clinical/burns/burn_wound_management', 'Burn Wound Management'],
    ['clinical/burns/toxic_epidermal_necrolysis', 'Toxic Epidermal Necrolysis'],
    ['clinical/burns/chemical_burns', 'Chemical Burns'],
    ['clinical/burns/electrical_burns', 'Electrical Burns'],
    ['clinical/burns/inhalation_injury', 'Inhalation Injury'],
    ['clinical/burns/non_accidental_injury_burns', 'Non-Accidental Injury Burns'],
    ['clinical/burns/burn_scar_contracture', 'Burn Scar Contracture']
  ],
  'elective-hand': [
    ['clinical/elective_hand/carpal_tunnel_syndrome', 'Carpal Tunnel Syndrome'],
    ['clinical/elective_hand/cubital_tunnel_syndrome', 'Cubital Tunnel Syndrome'],
    ['clinical/elective_hand/trigger_finger', 'Trigger Finger'],
    ['clinical/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
    ['clinical/elective_hand/de_quervains_tenosynovitis', "De Quervain's Tenosynovitis"],
    ['clinical/elective_hand/ganglion_cyst', 'Ganglion Cyst'],
    ['clinical/elective_hand/mucous_cyst', 'Mucous Cyst'],
    ['clinical/elective_hand/rheumatoid_hand', 'Rheumatoid Hand'],
    ['clinical/elective_hand/osteoarthritis_hand', 'Osteoarthritis Hand'],
    ['clinical/elective_hand/thumb_cmc_arthritis', 'Thumb CMC Arthritis'],
    ['clinical/elective_hand/kienbocks_disease', "Kienbock's Disease"],
    ['clinical/elective_hand/scaphoid_non_union', 'Scaphoid Non-Union'],
    ['clinical/elective_hand/ulnar_impaction', 'Ulnar Impaction'],
    ['clinical/elective_hand/madelungs_deformity', "Madelung's Deformity"]
  ],
  'emergencies': [
    ['clinical/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis'],
    ['clinical/emergencies/compartment_syndrome', 'Compartment Syndrome'],
    ['clinical/emergencies/high_pressure_injection_injury', 'High Pressure Injection Injury'],
    ['clinical/emergencies/extravasation_injury', 'Extravasation Injury'],
    ['clinical/emergencies/septic_arthritis_hand', 'Septic Arthritis Hand'],
    ['clinical/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
    ['clinical/emergencies/palmar_space_infection', 'Palmar Space Infection'],
    ['clinical/emergencies/hand_abscess', 'Hand Abscess'],
    ['clinical/emergencies/bite_wounds', 'Bite Wounds'],
    ['clinical/emergencies/electrical_injury_acute', 'Electrical Injury Acute']
  ],
  'hand-trauma': [
    ['clinical/hand_trauma/flexor_tendon_injury', 'Flexor Tendon Injury'],
    ['clinical/hand_trauma/extensor_tendon_injury', 'Extensor Tendon Injury'],
    ['clinical/hand_trauma/digital_nerve_injury', 'Digital Nerve Injury'],
    ['clinical/hand_trauma/replantation', 'Replantation'],
    ['clinical/hand_trauma/fingertip_amputation', 'Fingertip Amputation'],
    ['clinical/hand_trauma/nail_bed_injury', 'Nail Bed Injury'],
    ['clinical/hand_trauma/mallet_finger', 'Mallet Finger'],
    ['clinical/hand_trauma/boutonniere_deformity', 'Boutonniere Deformity'],
    ['clinical/hand_trauma/fracture_dislocations_hand', 'Fracture Dislocations Hand'],
    ['clinical/hand_trauma/scaphoid_fracture', 'Scaphoid Fracture'],
    ['clinical/hand_trauma/distal_radius_fracture', 'Distal Radius Fracture'],
    ['clinical/hand_trauma/metacarpal_fracture', 'Metacarpal Fracture'],
    ['clinical/hand_trauma/phalangeal_fracture', 'Phalangeal Fracture'],
    ['clinical/hand_trauma/thumb_ulnar_collateral_ligament', 'Thumb UCL Injury'],
    ['clinical/hand_trauma/complex_hand_trauma', 'Complex Hand Trauma']
  ],
  'lower-limb': [
    ['clinical/lower_limb/diabetic_foot', 'Diabetic Foot'],
    ['clinical/lower_limb/chronic_leg_ulcer', 'Chronic Leg Ulcer'],
    ['clinical/lower_limb/pressure_sores', 'Pressure Sores'],
    ['clinical/lower_limb/lower_limb_reconstruction', 'Lower Limb Reconstruction'],
    ['clinical/lower_limb/free_flap_lower_limb', 'Free Flap Lower Limb'],
    ['clinical/lower_limb/skin_graft_lower_limb', 'Skin Graft Lower Limb'],
    ['clinical/lower_limb/osteomyelitis_lower_limb', 'Osteomyelitis Lower Limb'],
    ['clinical/lower_limb/peripheral_vascular_disease', 'Peripheral Vascular Disease']
  ],
  'skin-cancer': [
    ['clinical/skin_cancer/basal_cell_carcinoma', 'Basal Cell Carcinoma'],
    ['clinical/skin_cancer/squamous_cell_carcinoma', 'Squamous Cell Carcinoma'],
    ['clinical/skin_cancer/melanoma', 'Melanoma'],
    ['clinical/skin_cancer/merkel_cell_carcinoma', 'Merkel Cell Carcinoma'],
    ['clinical/skin_cancer/dermatofibrosarcoma', 'Dermatofibrosarcoma'],
    ['clinical/skin_cancer/soft_tissue_sarcoma', 'Soft Tissue Sarcoma'],
    ['clinical/skin_cancer/sentinel_lymph_node_biopsy', 'Sentinel Lymph Node Biopsy'],
    ['clinical/skin_cancer/lymph_node_dissection', 'Lymph Node Dissection'],
    ['clinical/skin_cancer/moh_surgery_defects', 'Mohs Surgery Defects'],
    ['clinical/skin_cancer/skin_lesion_assessment', 'Skin Lesion Assessment']
  ],
  'head-and-neck': [
    ['clinical/head_and_neck/facial_laceration', 'Facial Laceration'],
    ['clinical/head_and_neck/facial_nerve_injury', 'Facial Nerve Injury'],
    ['clinical/head_and_neck/parotid_injury', 'Parotid Injury'],
    ['clinical/head_and_neck/nasal_fracture', 'Nasal Fracture'],
    ['clinical/head_and_neck/orbital_fracture', 'Orbital Fracture'],
    ['clinical/head_and_neck/mandible_fracture', 'Mandible Fracture'],
    ['clinical/head_and_neck/maxillary_fracture', 'Maxillary Fracture'],
    ['clinical/head_and_neck/frontal_sinus_fracture', 'Frontal Sinus Fracture'],
    ['clinical/head_and_neck/scalp_reconstruction', 'Scalp Reconstruction'],
    ['clinical/head_and_neck/ear_reconstruction', 'Ear Reconstruction'],
    ['clinical/head_and_neck/lip_reconstruction', 'Lip Reconstruction'],
    ['clinical/head_and_neck/eyelid_reconstruction', 'Eyelid Reconstruction']
  ],
  'congenital': [
    ['clinical/congenital/cleft_lip', 'Cleft Lip'],
    ['clinical/congenital/cleft_palate', 'Cleft Palate'],
    ['clinical/congenital/syndactyly', 'Syndactyly'],
    ['clinical/congenital/polydactyly', 'Polydactyly'],
    ['clinical/congenital/congenital_hand_anomaly', 'Congenital Hand Anomaly'],
    ['clinical/congenital/hypospadias', 'Hypospadias'],
    ['clinical/congenital/craniosynostosis', 'Craniosynostosis'],
    ['clinical/congenital/vascular_anomalies', 'Vascular Anomalies'],
    ['clinical/congenital/congenital_melanocytic_naevus', 'Congenital Melanocytic Naevus'],
    ['clinical/congenital/prominent_ears', 'Prominent Ears']
  ],
  'microsurgery': [
    ['clinical/microsurgery/free_flap_principles', 'Free Flap Principles'],
    ['clinical/microsurgery/radial_forearm_flap', 'Radial Forearm Flap'],
    ['clinical/microsurgery/anterolateral_thigh_flap', 'Anterolateral Thigh Flap'],
    ['clinical/microsurgery/latissimus_dorsi_flap', 'Latissimus Dorsi Flap'],
    ['clinical/microsurgery/diep_flap', 'DIEP Flap'],
    ['clinical/microsurgery/fibula_free_flap', 'Fibula Free Flap'],
    ['clinical/microsurgery/flap_failure_management', 'Flap Failure Management'],
    ['clinical/microsurgery/microvascular_anastomosis', 'Microvascular Anastomosis'],
    ['clinical/microsurgery/nerve_repair_reconstruction', 'Nerve Repair Reconstruction']
  ],

  // ========== CALL-THE-BOSS ==========
  'call-the-boss-scenarios': [
    ['call_the_boss/scenarios/necrotising_fasciitis', 'Necrotising Fasciitis'],
    ['call_the_boss/scenarios/compartment_syndrome', 'Compartment Syndrome'],
    ['call_the_boss/scenarios/replantation', 'Replantation'],
    ['call_the_boss/scenarios/free_flap_compromise', 'Free Flap Compromise'],
    ['call_the_boss/scenarios/major_burn', 'Major Burn'],
    ['call_the_boss/scenarios/high_pressure_injection', 'High Pressure Injection'],
    ['call_the_boss/scenarios/extravasation_injury', 'Extravasation Injury'],
    ['call_the_boss/scenarios/flexor_sheath_infection', 'Flexor Sheath Infection'],
    ['call_the_boss/scenarios/septic_arthritis', 'Septic Arthritis'],
    ['call_the_boss/scenarios/cauda_equina', 'Cauda Equina'],
    ['call_the_boss/scenarios/open_fracture', 'Open Fracture'],
    ['call_the_boss/scenarios/facial_laceration_complex', 'Facial Laceration Complex'],
    ['call_the_boss/scenarios/bite_wound_hand', 'Bite Wound Hand'],
    ['call_the_boss/scenarios/electrical_injury', 'Electrical Injury'],
    ['call_the_boss/scenarios/non_accidental_injury', 'Non-Accidental Injury']
  ],

  // ========== CONSENT ==========
  'consent-breast-and-aesthetic': [
    ['consent/breast_and_aesthetic/breast_reconstruction_consent', 'Breast Reconstruction'],
    ['consent/breast_and_aesthetic/breast_reduction_consent', 'Breast Reduction'],
    ['consent/breast_and_aesthetic/abdominoplasty_consent', 'Abdominoplasty'],
    ['consent/breast_and_aesthetic/liposuction_consent', 'Liposuction'],
    ['consent/breast_and_aesthetic/implant_surgery_consent', 'Implant Surgery']
  ],
  'consent-hand-surgery': [
    ['consent/hand_surgery/carpal_tunnel_release_consent', 'Carpal Tunnel Release'],
    ['consent/hand_surgery/trigger_finger_release_consent', 'Trigger Finger Release'],
    ['consent/hand_surgery/dupuytrens_fasciectomy_consent', "Dupuytren's Fasciectomy"],
    ['consent/hand_surgery/tendon_repair_consent', 'Tendon Repair'],
    ['consent/hand_surgery/nerve_repair_consent', 'Nerve Repair']
  ],
  'consent-skin-surgery': [
    ['consent/skin_surgery/skin_lesion_excision_consent', 'Skin Lesion Excision'],
    ['consent/skin_surgery/skin_graft_consent', 'Skin Graft'],
    ['consent/skin_surgery/local_flap_consent', 'Local Flap'],
    ['consent/skin_surgery/sentinel_lymph_node_biopsy_consent', 'Sentinel Lymph Node Biopsy'],
    ['consent/skin_surgery/lymph_node_dissection_consent', 'Lymph Node Dissection']
  ],
  'consent-emergency-procedures': [
    ['consent/emergency_procedures/debridement_necrotising_fasciitis_consent', 'Debridement for Nec Fasc'],
    ['consent/emergency_procedures/fasciotomy_consent', 'Fasciotomy'],
    ['consent/emergency_procedures/washout_and_debridement_consent', 'Washout & Debridement'],
    ['consent/emergency_procedures/escharotomy_consent', 'Escharotomy'],
    ['consent/emergency_procedures/amputation_consent', 'Amputation']
  ],
  'consent-reconstructive': [
    ['consent/reconstructive/free_flap_consent', 'Free Flap'],
    ['consent/reconstructive/local_flap_reconstruction_consent', 'Local Flap Reconstruction'],
    ['consent/reconstructive/tissue_expansion_consent', 'Tissue Expansion'],
    ['consent/reconstructive/scar_revision_consent', 'Scar Revision']
  ],

  // ========== STRUCTURED INTERVIEW ==========
  'structured-audit': [
    ['structured_interview/audit/focused_interview', 'Focused Interview']
  ],
  'structured-clinical-governance': [
    ['structured_interview/clinical_governance/focused_interview', 'Focused Interview']
  ],
  'structured-complaints': [
    ['structured_interview/complaints/focused_interview', 'Focused Interview']
  ],
  'structured-consent-ethics': [
    ['structured_interview/consent_ethics/focused_interview', 'Focused Interview']
  ],
  'structured-ethics': [
    ['structured_interview/ethics/focused_interview', 'Focused Interview']
  ],
  'structured-research': [
    ['structured_interview/research/focused_interview', 'Focused Interview']
  ],
  'structured-risk-management': [
    ['structured_interview/risk_management/focused_interview', 'Focused Interview']
  ],
  'structured-teaching': [
    ['structured_interview/teaching/focused_interview', 'Focused Interview']
  ]
};

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

  // Get topics for this subheading
  const topics = mockExamTopicsData[randomSubheading];
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
    alert('Error: Could not load scenario. Please try again.');
    return;
  }

  // Check access
  if (!canAccessScenario(scenario.promptFile)) {
    alert('This scenario requires a Premium subscription.\n\nUpgrade to access all scenarios.');
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
    alert('Full Mock Exam is a Premium feature.\n\nUpgrade to access timed exam simulations with 3 rotating stations.');
    showUpgradeModal();
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
        alert('Error: Could not generate mock exam scenarios. Please try again.');
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
  alert('Full Mock Exam Complete!\n\nYou completed all 3 stations.');
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

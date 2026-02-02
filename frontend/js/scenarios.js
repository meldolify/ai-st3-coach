// ============================================================================
// SCENARIOS.JS - Scenario Selection and Card-Based Navigation
// ============================================================================
// Dependencies: state.js, config.js, subscription.js, session.js
// Functions: selectScenarioCategory, selectScenarioSubcategory, getTopicsData,
//            selectScenario, startScenario, exitSimulation, loadSelectedScenario
// ============================================================================

// ============================================================================
// CARD-BASED SCENARIO NAVIGATION (New System)
// ============================================================================

// Store current selection state for card navigation
let currentScenarioCategory = null;
let currentScenarioSubcategory = null;

// Subcategory definitions for each category (matching Scenarios hierarchy.txt)
const categorySubcategories = {
  'clinical': [
    { id: 'infections', name: 'Infections', icon: '🦠' },
    { id: 'hand-trauma', name: 'Hand Trauma', icon: '🩹' },
    { id: 'elective-hand', name: 'Elective Hand', icon: '✋' },
    { id: 'skin-cancer', name: 'Skin Cancer', icon: '🔬' },
    { id: 'chronic-wounds', name: 'Chronic Wounds', icon: '🩹' },
    { id: 'breast-and-aesthetic', name: 'Breast & Aesthetics', icon: '💎' },
    { id: 'burns', name: 'Burns', icon: '🔥' },
    { id: 'lower-limb-trauma', name: 'Lower Limb Trauma', icon: '🦵' },
    { id: 'paediatrics', name: 'Paediatrics', icon: '👶' },
    { id: 'miscellaneous', name: 'Miscellaneous', icon: '📋' }
  ],
  'call-the-boss': [
    { id: 'call-the-boss-scenarios', name: 'Scenarios', icon: '📞' }
  ],
  'consent': [
    { id: 'consent-hand-trauma', name: 'Hand Trauma', icon: '🩹' },
    { id: 'consent-elective-hand', name: 'Elective Hand', icon: '✋' },
    { id: 'consent-burn', name: 'Burn', icon: '🔥' },
    { id: 'consent-lower-limb', name: 'Lower Limb', icon: '🦵' },
    { id: 'consent-chronic-wounds', name: 'Chronic Wounds', icon: '🩹' },
    { id: 'consent-skin-cancer', name: 'Skin Cancer', icon: '🔬' },
    { id: 'consent-breast-and-aesthetic', name: 'Breast & Aesthetics', icon: '💎' }
  ],
  'structured': [
    { id: 'structured-audit', name: 'Audit', icon: '📊' },
    { id: 'structured-research', name: 'Research', icon: '🔬' },
    { id: 'structured-teaching', name: 'Teaching', icon: '📚' },
    { id: 'structured-risk-and-safety', name: 'Risk & Safety', icon: '⚠️' },
    { id: 'structured-leadership', name: 'Leadership & Management', icon: '👔' },
    { id: 'structured-consent', name: 'Consent', icon: '📝' },
    { id: 'structured-ethics', name: 'Ethics', icon: '⚖️' },
    { id: 'structured-misc', name: 'Misc', icon: '📋' }
  ]
};

// Category display names
const categoryNames = {
  'clinical': 'Clinical Stations',
  'call-the-boss': 'Call-The-Boss',
  'consent': 'Consent',
  'structured': 'Structured Interview'
};

// Select a category (Level 1 -> Level 2)
function selectScenarioCategory(category) {
  currentScenarioCategory = category;
  currentScenarioSubcategory = null;

  // Update breadcrumb
  const breadcrumbSubcat = document.getElementById('breadcrumbSubcat');
  breadcrumbSubcat.querySelector('.breadcrumb-label').textContent = categoryNames[category] || category;
  breadcrumbSubcat.classList.remove('disabled');
  breadcrumbSubcat.classList.add('active');

  // Update category breadcrumb to not be active
  document.querySelector('.breadcrumb-item[data-level="category"]').classList.remove('active');

  // Update eyebrow
  document.getElementById('subcatEyebrow').textContent = categoryNames[category] || category;

  // Populate subcategory cards
  populateSubcategoryCards(category);

  // Show subcategory level, hide category level
  document.getElementById('categoryLevel').classList.add('hidden');
  document.getElementById('subcategoryLevel').classList.remove('hidden');
  document.getElementById('topicLevel').classList.add('hidden');

  log('Selected scenario category: ' + category, 'info');
}

// Populate subcategory cards based on category
function populateSubcategoryCards(category) {
  const container = document.getElementById('subcategoryCards');
  const subcategories = categorySubcategories[category] || [];

  container.innerHTML = subcategories.map(sub => {
    // Check if ANY topic in this subcategory is unlocked
    const topics = getTopicsForSubheading(sub.id);
    const hasUnlockedTopics = topics.some(topic => {
      const folderName = topic.file.split('/').pop();
      const heading = topic.file.split('/')[0];
      const promptFile = `prompts/${topic.file}/easy_${heading}_${folderName}_1.txt`;
      return canAccessScenario(promptFile);
    });

    const lockedClass = !hasUnlockedTopics ? 'locked' : '';
    const lockIndicator = !hasUnlockedTopics ? '<span class="subcategory-lock">🔒</span>' : '';

    const onclickAction = hasUnlockedTopics
      ? `selectScenarioSubcategory('${sub.id}', '${sub.name}')`
      : `showLockedScenarioMessage()`;

    return `
      <article class="scenario-card ${lockedClass}" data-subcategory="${sub.id}" onclick="${onclickAction}">
        <div class="card-header">
          <div class="card-icon-frame">
            <span style="font-size: 1.25rem;">${sub.icon}</span>
          </div>
          ${lockIndicator}
        </div>
        <h3 class="card-title">${sub.name}</h3>
      </article>
    `;
  }).join('');
}

// Select a subcategory (Level 2 -> Level 3)
function selectScenarioSubcategory(subcategoryId, subcategoryName) {
  currentScenarioSubcategory = subcategoryId;

  // Update breadcrumb
  const breadcrumbTopic = document.getElementById('breadcrumbTopic');
  breadcrumbTopic.querySelector('.breadcrumb-label').textContent = subcategoryName;
  breadcrumbTopic.classList.remove('disabled');

  // Update subcategory breadcrumb
  document.getElementById('breadcrumbSubcat').classList.remove('active');

  // Update eyebrow
  document.getElementById('topicEyebrow').textContent = subcategoryName;

  // Populate topic cards
  populateTopicCards(subcategoryId);

  // Show topic level, hide subcategory level
  document.getElementById('categoryLevel').classList.add('hidden');
  document.getElementById('subcategoryLevel').classList.add('hidden');
  document.getElementById('topicLevel').classList.remove('hidden');

  log('Selected scenario subcategory: ' + subcategoryId, 'info');
}

// Get topics data structure (matching Scenarios hierarchy.txt)
// NOTE: Backend paths must match actual folder structure in backend/prompts/
function getTopicsData() {
  return {
    // ========== CLINICAL HEADING (10 subcategories) ==========
    'infections': {
      title: 'Infections',
      topics: [
        ['clinical/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis'],
        ['clinical/infections/flexor_sheath_infections', 'Flexor Sheath Infections'],
        ['clinical/infections/hand_space_infections', 'Hand Space Infections'],
        ['clinical/infections/animal_bites', 'Animal Bites'],
        ['clinical/infections/fight_bites', 'Fight Bites'],
        ['clinical/infections/paronychia', 'Paronychia']
      ]
    },
    'hand-trauma': {
      title: 'Hand Trauma',
      topics: [
        ['clinical/hand_trauma/flexor_tendon_injury', 'Flexor Tendon Injury'],
        ['clinical/hand_trauma/revascularisation', 'Revascularisation'],
        ['clinical/hand_trauma/reimplantation', 'Reimplantation'],
        ['clinical/hand_trauma/extensor_tendon_injury', 'Extensor Tendon Injury'],
        ['clinical/hand_trauma/mangled_hand', 'Mangled Hand'],
        ['clinical/hand_trauma/fdp_avulsion', 'FDP Avulsion'],
        ['clinical/hand_trauma/nailbed_injury', 'Nailbed Injury / Seymour Fracture'],
        ['clinical/hand_trauma/fingertip_injury', 'Fingertip Injury'],
        ['clinical/hand_trauma/open_hand_fractures', 'Open Hand Fractures'],
        ['clinical/hand_trauma/closed_hand_fractures', 'Closed Hand Fractures'],
        ['clinical/hand_trauma/crps', 'Complex Regional Pain Syndrome (CRPS)']
      ]
    },
    'elective-hand': {
      title: 'Elective Hand',
      topics: [
        ['clinical/elective_hand/compressive_neuropathies', 'Compressive Neuropathies'],
        ['clinical/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
        ['clinical/elective_hand/trigger_finger', 'Trigger Finger'],
        ['clinical/elective_hand/finger_mass', 'Finger Mass'],
        ['clinical/elective_hand/finger_deformity', 'Finger Deformity'],
        ['clinical/elective_hand/nerve_palsies', 'Nerve Palsies']
      ]
    },
    'skin-cancer': {
      title: 'Skin Cancer',
      topics: [
        ['clinical/skin_cancer/bcc', 'BCC'],
        ['clinical/skin_cancer/scc', 'SCC'],
        ['clinical/skin_cancer/mm', 'MM (Melanoma)'],
        ['clinical/skin_cancer/scalp', 'Scalp'],
        ['clinical/skin_cancer/forehead_temple', 'Forehead / Temple'],
        ['clinical/skin_cancer/eyelid', 'Eyelid'],
        ['clinical/skin_cancer/nose', 'Nose'],
        ['clinical/skin_cancer/lip', 'Lip'],
        ['clinical/skin_cancer/ear', 'Ear'],
        ['clinical/skin_cancer/subungual', 'Subungual'],
        ['clinical/skin_cancer/mucosal', 'Mucosal'],
        ['clinical/skin_cancer/fungating_massive', 'Fungating / Massive'],
        ['clinical/skin_cancer/lymph_node_management', 'Lymph Node Management']
      ]
    },
    'chronic-wounds': {
      title: 'Chronic Wounds',
      topics: [
        ['clinical/chronic_wounds/abdominal_wound_dehiscence', 'Abdominal Wound Dehiscence'],
        ['clinical/chronic_wounds/sternal_wound_dehiscence', 'Sternal Wound Dehiscence'],
        ['clinical/chronic_wounds/pressure_ulcer', 'Pressure Ulcer']
      ]
    },
    'breast-and-aesthetic': {
      title: 'Breast & Aesthetics',
      topics: [
        ['clinical/breast_and_aesthetic/breast_reduction', 'Breast Reduction'],
        ['clinical/breast_and_aesthetic/breast_augmentation', 'Breast Augmentation'],
        ['clinical/breast_and_aesthetic/mastopexy', 'Mastopexy'],
        ['clinical/breast_and_aesthetic/breast_reconstruction', 'Breast Reconstruction (DIEP)'],
        ['clinical/breast_and_aesthetic/pinnaplasty', 'Pinnaplasty'],
        ['clinical/breast_and_aesthetic/rhinoplasty', 'Rhinoplasty'],
        ['clinical/breast_and_aesthetic/blepharoplasty', 'Blepharoplasty'],
        ['clinical/breast_and_aesthetic/abdominoplasty', 'Abdominoplasty'],
        ['clinical/breast_and_aesthetic/gynaecomastia', 'Gynaecomastia']
      ]
    },
    'burns': {
      title: 'Burns',
      topics: [
        ['clinical/burns/flame_burn', 'Flame Burn'],
        ['clinical/burns/electric_burn', 'Electric Burn'],
        ['clinical/burns/chemical_burn', 'Chemical Burn'],
        ['clinical/burns/paediatric_burn', 'Paediatric Burn'],
        ['clinical/burns/tss', 'Toxic Shock Syndrome (TSS)']
      ]
    },
    'lower-limb-trauma': {
      title: 'Lower Limb Trauma',
      topics: [
        ['clinical/lower_limb_trauma/pretibial_laceration', 'Pretibial Laceration / Hematoma'],
        ['clinical/lower_limb_trauma/open_lower_limb_fracture', 'Open Lower Limb Fracture']
      ]
    },
    'paediatrics': {
      title: 'Paediatrics',
      topics: [
        ['clinical/paediatrics/cleft_lip', 'Cleft Lip'],
        ['clinical/paediatrics/cleft_palate', 'Cleft Palate'],
        ['clinical/paediatrics/hypospadias', 'Hypospadias'],
        ['clinical/paediatrics/paediatric_hand_fracture', 'Paediatric Hand Fracture'],
        ['clinical/paediatrics/tip_amputation_composite_graft', 'Tip Amputation / Composite Graft'],
        ['clinical/paediatrics/prominent_ear', 'Prominent Ear']
      ]
    },
    'miscellaneous': {
      title: 'Miscellaneous',
      topics: [
        ['clinical/miscellaneous/compromised_flap', 'Compromised Flap'],
        ['clinical/miscellaneous/facial_laceration', 'Facial Laceration'],
        ['clinical/miscellaneous/extravasation_injury', 'Extravasation Injury'],
        ['clinical/miscellaneous/distal_humerus_fracture', 'Distal Humerus Fracture with Vascular Compromise'],
        ['clinical/miscellaneous/high_pressure_injection_injury', 'High Pressure Injection Injury']
      ]
    },
    // ========== CALL THE BOSS (15 scenarios - flat list) ==========
    'call-the-boss-scenarios': {
      title: 'Call-The-Boss Scenarios',
      topics: [
        ['call_the_boss/scenarios/revascularisation', 'Revascularisation'],
        ['call_the_boss/scenarios/reimplantation', 'Reimplantation'],
        ['call_the_boss/scenarios/extravasation_injury', 'Extravasation Injury'],
        ['call_the_boss/scenarios/mangled_hand', 'Mangled Hand'],
        ['call_the_boss/scenarios/high_pressure_injection_injury', 'High Pressure Injection Injury / Compartment Syndrome'],
        ['call_the_boss/scenarios/flexor_sheath_infection', 'Flexor Sheath Infection'],
        ['call_the_boss/scenarios/necrotising_fasciitis', 'Necrotising Fasciitis'],
        ['call_the_boss/scenarios/distal_humerus_vascular', 'Distal Humerus with Vascular Compromise'],
        ['call_the_boss/scenarios/flame_burn', 'Flame Burn'],
        ['call_the_boss/scenarios/electric_burn', 'Electric Burn'],
        ['call_the_boss/scenarios/chemical_burn', 'Chemical Burn'],
        ['call_the_boss/scenarios/paediatric_burn_tss', 'Paediatric Burn / TSS'],
        ['call_the_boss/scenarios/open_leg_fracture', 'Open Leg Fracture + Vascular Compromise / Compartment Syndrome'],
        ['call_the_boss/scenarios/facial_laceration', 'Facial Laceration'],
        ['call_the_boss/scenarios/compromised_flap', 'Compromised Flap']
      ]
    },
    // ========== CONSENT HEADING (7 subcategories) ==========
    'consent-hand-trauma': {
      title: 'Consent: Hand Trauma',
      topics: [
        ['consent/hand_trauma/flexor_tendon_repair', 'Flexor Tendon Repair'],
        ['consent/hand_trauma/revasc', 'Revasc'],
        ['consent/hand_trauma/reimplant', 'Reimplant'],
        ['consent/hand_trauma/debridement_extravasation_hpii', 'Debridement of Extravasation / HPII'],
        ['consent/hand_trauma/exploration_mangled_hand', 'Exploration of Mangled Hand'],
        ['consent/hand_trauma/washout_kwires_open_fracture', 'Washout + K-wires of Open Fracture'],
        ['consent/hand_trauma/fixation_paediatric_fracture', 'Fixation of Paediatric Fracture'],
        ['consent/hand_trauma/orif_closed_fracture', 'ORIF of Closed Fracture'],
        ['consent/hand_trauma/local_flap_fingertip', 'Local Flap to Fingertip Injury'],
        ['consent/hand_trauma/composite_graft_tip', 'Composite Graft for Tip Amputation'],
        ['consent/hand_trauma/nailbed_repair', 'Nailbed Repair'],
        ['consent/hand_trauma/release_hand_compartments', 'Release of Hand Compartments'],
        ['consent/hand_trauma/repair_fdp_avulsion', 'Repair of FDP Avulsion'],
        ['consent/hand_trauma/repair_nerve_injury', 'Repair of Nerve Injury']
      ]
    },
    'consent-elective-hand': {
      title: 'Consent: Elective Hand',
      topics: [
        ['consent/hand_surgery/dupuytrens_fasciectomy_consent', "Fasciectomy of Dupuytren's Disease"],
        ['consent/hand_surgery/carpal_tunnel_release_consent', 'Carpal Tunnel Release'],
        ['consent/elective_hand/trigger_finger_release', 'Release of Trigger Finger'],
        ['consent/elective_hand/excision_finger_mass', 'Excision of Finger Mass'],
        ['consent/elective_hand/washout_flexor_sheath', 'Washout of Flexor Sheath Infection'],
        ['consent/elective_hand/debridement_nec_fasc', 'Debridement of Necrotising Fasciitis'],
        ['consent/elective_hand/drainage_paronychia', 'Drainage of Paronychia'],
        ['consent/elective_hand/washout_bite', 'Washout of Animal / Fight Bite'],
        ['consent/elective_hand/drainage_hand_space_infection', 'Drainage of Hand Space Infection']
      ]
    },
    'consent-burn': {
      title: 'Consent: Burn',
      topics: [
        ['consent/burn/excision_grafting', 'Excision and Grafting of Burn'],
        ['consent/burn/excision_btm_biobrane', 'Excision and BTM / Biobrane of Burn'],
        ['consent/burn/versajet_epiprotect', 'Versajet and Epiprotect of Burn']
      ]
    },
    'consent-lower-limb': {
      title: 'Consent: Lower Limb',
      topics: [
        ['consent/lower_limb/first_stage_excision_open_leg', 'First Stage Excision of Open Leg Fracture + Temporary Stabilisation'],
        ['consent/lower_limb/fix_and_flap', 'Fix and Flap Open Leg Fracture'],
        ['consent/lower_limb/debridement_pretibial_ssg', 'Debridement of Pretibial Laceration / Hematoma + SSG'],
        ['consent/lower_limb/release_leg_compartments', 'Release of Leg Compartments']
      ]
    },
    'consent-chronic-wounds': {
      title: 'Consent: Chronic Wounds',
      topics: [
        ['consent/chronic_wounds/debridement_sternal_pec_major', 'Debridement of Sternal Wound + Reconstruction with Pec Major Flap'],
        ['consent/chronic_wounds/debridement_sacral_vy_flap', 'Debridement of Sacral Pressure Sore + Reconstruction with V-Y Flap']
      ]
    },
    'consent-skin-cancer': {
      title: 'Consent: Skin Cancer',
      topics: [
        ['consent/skin_cancer/excision_ssg', 'Excision of Skin Lesion + SSG'],
        ['consent/skin_cancer/excision_ftsg', 'Excision of Skin Lesion + FTSG'],
        ['consent/skin_cancer/excision_local_flap', 'Excision of Skin Lesion + Local Flap'],
        ['consent/skin_cancer/wle_slnb', 'WLE + SLNB'],
        ['consent/skin_cancer/neck_dissection', 'Neck Dissection'],
        ['consent/skin_cancer/axillary_dissection', 'Axillary Dissection'],
        ['consent/skin_cancer/groin_dissection', 'Groin Dissection']
      ]
    },
    'consent-breast-and-aesthetic': {
      title: 'Consent: Breast & Aesthetics',
      topics: [
        ['consent/breast_and_aesthetic/breast_reduction_consent', 'Breast Reduction'],
        ['consent/breast_and_aesthetic/breast_augmentation_consent', 'Breast Augmentation'],
        ['consent/breast_and_aesthetic/mastopexy_consent', 'Mastopexy'],
        ['consent/breast_and_aesthetic/breast_reconstruction_consent', 'Breast Recon (DIEP)'],
        ['consent/breast_and_aesthetic/flap_salvage_consent', 'Flap Salvage'],
        ['consent/breast_and_aesthetic/pinnaplasty_consent', 'Pinnaplasty'],
        ['consent/breast_and_aesthetic/rhinoplasty_consent', 'Rhinoplasty'],
        ['consent/breast_and_aesthetic/blepharoplasty_consent', 'Blepharoplasty'],
        ['consent/breast_and_aesthetic/abdominoplasty_consent', 'Abdominoplasty'],
        ['consent/breast_and_aesthetic/liposuction_consent', 'Liposuction'],
        ['consent/breast_and_aesthetic/liposuction_disc_excision_consent', 'Liposuction + Disc Excision (Gynaecomastia)']
      ]
    },
    // ========== STRUCTURED INTERVIEW HEADING (8 subcategories) ==========
    'structured-audit': {
      title: 'Audit',
      topics: [
        ['structured_interview/audit/focused_interview', 'Audit Interview']
      ]
    },
    'structured-research': {
      title: 'Research',
      topics: [
        ['structured_interview/research/research_interview', 'Research Interview']
      ]
    },
    'structured-teaching': {
      title: 'Teaching',
      topics: [
        ['structured_interview/teaching/teaching_interview', 'Teaching Interview']
      ]
    },
    'structured-risk-and-safety': {
      title: 'Risk & Safety',
      topics: [
        ['structured_interview/risk_and_safety/risk_safety_interview', 'Risk & Safety Interview']
      ]
    },
    'structured-leadership': {
      title: 'Leadership & Management',
      topics: [
        ['structured_interview/leadership/leadership_interview', 'Leadership & Management Interview']
      ]
    },
    'structured-consent': {
      title: 'Consent',
      topics: [
        ['structured_interview/consent/consent_interview', 'Consent Interview']
      ]
    },
    'structured-ethics': {
      title: 'Ethics',
      topics: [
        ['structured_interview/ethics/ethics_interview', 'Ethics Interview']
      ]
    },
    'structured-misc': {
      title: 'Misc',
      topics: [
        ['structured_interview/misc/misc_interview', 'Miscellaneous Interview']
      ]
    }
  };
}

// Get topics for a subcategory
function getTopicsForSubheading(subcategoryId) {
  const topicsDataRef = getTopicsData();
  const data = topicsDataRef[subcategoryId];

  if (!data || !data.topics) {
    return [];
  }

  // Transform array format [file, name, image?] to object format
  return data.topics.map(topic => ({
    file: topic[0],
    name: topic[1],
    image: topic[2] || null,
    difficulty: selectedDifficulty || 'easy' // Use current difficulty
  }));
}

// Populate topic cards based on subcategory
function populateTopicCards(subcategoryId) {
  const container = document.getElementById('topicCards');
  const topics = getTopicsForSubheading(subcategoryId);

  if (!topics || topics.length === 0) {
    container.innerHTML = '<p class="no-topics">No scenarios available for this category yet.</p>';
    return;
  }

  container.innerHTML = topics.map(topic => {
    const difficultyClass = topic.difficulty ? `difficulty-badge--${topic.difficulty}` : '';
    const difficultyLabel = topic.difficulty ? topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1) : '';

    // Build prompt file path to check access (same logic as selectScenario)
    const folderName = topic.file.split('/').pop();
    const heading = topic.file.split('/')[0];
    const promptFile = `prompts/${topic.file}/${topic.difficulty || 'easy'}_${heading}_${folderName}_1.txt`;

    // Check if user has access to this scenario
    const isLocked = !canAccessScenario(promptFile);
    const lockedClass = isLocked ? 'locked' : '';
    const lockBadge = isLocked ? `
      <div class="lock-badge" title="Premium subscription required">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>` : '';

    const onclickAction = isLocked
      ? `showLockedScenarioMessage()`
      : `selectScenarioFromCard('${topic.file}', '${topic.name.replace(/'/g, "\\'")}')`;

    return `
      <article class="scenario-card topic-card ${lockedClass}" data-scenario="${topic.file}" onclick="${onclickAction}">
        ${lockBadge}
        ${difficultyLabel ? `<span class="difficulty-badge ${difficultyClass}">${difficultyLabel}</span>` : ''}
        <h3 class="card-title">${topic.name}</h3>
        ${topic.description ? `<p class="card-description">${topic.description}</p>` : ''}
      </article>
    `;
  }).join('');
}

// Show message when clicking a locked scenario
function showLockedScenarioMessage() {
  alert('This scenario requires a Premium subscription.\n\nUpgrade to access all scenarios and features.');
}

// Select a scenario from card and start it
function selectScenarioFromCard(scenarioFile, scenarioName) {
  // Use the existing selectScenario logic
  // Pass null for imageFile - clinical images are loaded separately based on scenario
  selectScenario(scenarioFile, scenarioName, null);
}

// Navigate via breadcrumb
function navigateToBreadcrumb(level) {
  if (level === 'category') {
    // Reset to category level
    currentScenarioCategory = null;
    currentScenarioSubcategory = null;

    // Reset breadcrumbs
    document.querySelector('.breadcrumb-item[data-level="category"]').classList.add('active');
    document.getElementById('breadcrumbSubcat').classList.add('disabled');
    document.getElementById('breadcrumbSubcat').classList.remove('active');
    document.getElementById('breadcrumbTopic').classList.add('disabled');

    // Show category level
    document.getElementById('categoryLevel').classList.remove('hidden');
    document.getElementById('subcategoryLevel').classList.add('hidden');
    document.getElementById('topicLevel').classList.add('hidden');
  } else if (level === 'subcategory' && currentScenarioCategory) {
    // Go back to subcategory level
    currentScenarioSubcategory = null;

    // Update breadcrumbs
    document.getElementById('breadcrumbSubcat').classList.add('active');
    document.getElementById('breadcrumbTopic').classList.add('disabled');

    // Show subcategory level
    document.getElementById('categoryLevel').classList.add('hidden');
    document.getElementById('subcategoryLevel').classList.remove('hidden');
    document.getElementById('topicLevel').classList.add('hidden');
  }
}

// Back to mode selection from scenarios
function backToModeFromScenarios() {
  // Reset card navigation state
  currentScenarioCategory = null;
  currentScenarioSubcategory = null;

  // Reset breadcrumbs
  document.querySelector('.breadcrumb-item[data-level="category"]').classList.add('active');
  document.getElementById('breadcrumbSubcat').classList.add('disabled');
  document.getElementById('breadcrumbSubcat').classList.remove('active');
  document.getElementById('breadcrumbTopic').classList.add('disabled');

  // Reset to category level view
  document.getElementById('categoryLevel').classList.remove('hidden');
  document.getElementById('subcategoryLevel').classList.add('hidden');
  document.getElementById('topicLevel').classList.add('hidden');

  // Go back to mode selection
  transitionToPage('scenarioSelection', 'modeSelection');
}

// Called when user clicks a scenario - directly starts with pre-selected difficulty
function selectScenario(topicFolder, title, imageFile) {
  // Ensure we have a difficulty selected
  if (!selectedDifficulty) {
    log('Error: No difficulty selected', 'error');
    alert('Please select a difficulty level first');
    return;
  }

  // Construct the prompt file path using the pre-selected difficulty
  // Extract folder name and heading for the new naming convention
  const folderName = topicFolder.split('/').pop();
  const heading = topicFolder.split('/')[0];
  // Format: prompts/{topicFolder}/{difficulty}_{heading}_{folderName}_1.txt
  const promptFile = `prompts/${topicFolder}/${selectedDifficulty}_${heading}_${folderName}_1.txt`;

  // Check if user has access to this scenario
  if (!canAccessScenario(promptFile)) {
    alert('This scenario requires a Premium subscription.\n\nUpgrade to access all scenarios and features.');
    return;
  }

  // Show "Entering Simulation Room" overlay
  const overlay = document.getElementById('simulationTransition');
  overlay.style.display = 'flex';

  // Trigger fade-in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
  });

  // Wait 1 second then fade out overlay
  setTimeout(() => {
    overlay.classList.remove('active');

    // After overlay fades out, hide it and start page transition
    setTimeout(() => {
      overlay.style.display = 'none';

      // Use the same transition pattern as other page transitions
      transitionToPage('scenarioSelection', 'simulationRoom', () => {
        // Load scenario content after page transition starts
        startScenario(title, title, promptFile, imageFile);
      });
    }, 800); // Wait for overlay fade-out
  }, 1000); // Display overlay for 1 second
}

function startScenario(category, title, promptFile, imageFile) {
  promptFile = promptFile || 'template.txt';
  currentScenario = { category: category, title: title, promptFile: promptFile, imageFile: imageFile };

  // Apply active class to simulation room to trigger grid layout
  const simulationRoom = document.getElementById('simulationRoom');
  simulationRoom.classList.add('active');

  // Initialize and expand sidebar to current scenario
  if (typeof initSimSidebar === 'function') {
    initSimSidebar();
    if (typeof expandToCurrentScenario === 'function') {
      expandToCurrentScenario(promptFile);
    }
  }

  // Initialize mobile sidebar
  if (typeof initMobileSidebar === 'function') {
    initMobileSidebar();
  }

  // Update mobile header scenario info
  if (typeof updateMobileScenarioInfo === 'function') {
    updateMobileScenarioInfo(title);
  }

  // Set scenario information
  document.getElementById('currentScenarioTitle').textContent = title;

  // Show difficulty mode instead of category
  const categoryEl = document.getElementById('currentScenarioCategory');
  if (categoryEl) {
    const diff = selectedDifficulty || 'easy';
    const difficultyLabels = {
      'easy': 'Easy Mode',
      'medium': 'Medium Mode',
      'strict': 'Strict Mode'
    };
    categoryEl.textContent = difficultyLabels[diff] || 'Easy Mode';
    categoryEl.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-strict');
    categoryEl.classList.add(`difficulty-${diff}`);
  }

  // Set persona based on selected difficulty
  if (typeof setPersona === 'function' && selectedDifficulty) {
    setPersona(selectedDifficulty);
  }

  // Clear transcript for new session
  if (window.transcript) {
    window.transcript.clear();
  }

  const imageSection = document.getElementById('imageSection');
  const clinicalImage = document.getElementById('clinicalImage');
  const noImagePlaceholder = document.getElementById('noImagePlaceholder');

  // Pre-load image but keep section hidden until session starts
  if (imageFile) {
    const imagePath = 'images/' + imageFile;
    clinicalImage.src = imagePath;
    clinicalImage.onload = () => {
      clinicalImage.style.display = 'block';
      noImagePlaceholder.style.display = 'none';
      log('Clinical image loaded: ' + imageFile, 'success');
    };
    clinicalImage.onerror = () => {
      clinicalImage.style.display = 'none';
      noImagePlaceholder.style.display = 'block';
      noImagePlaceholder.textContent = 'Image not found: ' + imageFile;
      log('Clinical image not found: ' + imageFile, 'warning');
    };
  }
  // Image section is always visible in the layout, but hidden with opacity
  // It will fade in when user clicks "Start Session"

  // Sync mobile elements with desktop elements
  syncMobileSimulationElements();

  log('Selected scenario: ' + title, 'info');
}

// Sync mobile simulation elements with desktop elements
function syncMobileSimulationElements() {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;

  if (!isMobile) return; // Only sync on mobile

  // Sync clinical image - use onload to ensure image is ready
  const desktopImage = document.getElementById('clinicalImage');
  const mobileImage = document.getElementById('mobileClinicalImage');
  const desktopPlaceholder = document.getElementById('noImagePlaceholder');
  const mobilePlaceholder = document.getElementById('mobileNoImagePlaceholder');

  if (desktopImage && mobileImage) {
    // Copy src first
    if (desktopImage.src) {
      mobileImage.src = desktopImage.src;
      mobileImage.onload = () => {
        mobileImage.style.display = 'block';
        if (mobilePlaceholder) mobilePlaceholder.style.display = 'none';
      };
      mobileImage.onerror = () => {
        mobileImage.style.display = 'none';
        if (mobilePlaceholder) {
          mobilePlaceholder.style.display = 'block';
          mobilePlaceholder.textContent = 'Image not found';
        }
      };
    } else {
      mobileImage.style.display = 'none';
      if (mobilePlaceholder) {
        mobilePlaceholder.style.display = 'block';
        mobilePlaceholder.textContent = desktopPlaceholder ? desktopPlaceholder.textContent : 'No clinical image available';
      }
    }
  }

  // Sync status values
  const sessionStatus = document.getElementById('sessionStatus');
  const mobileSessionStatus = document.getElementById('mobileSessionStatus');
  const mobileSessionDot = document.getElementById('mobileSessionDot');
  if (sessionStatus && mobileSessionStatus) {
    mobileSessionStatus.textContent = sessionStatus.textContent;
    // Update status dot for new mobile layout
    if (mobileSessionDot) {
      mobileSessionDot.classList.remove('connected', 'active');
      if (sessionStatus.classList.contains('status-connected')) {
        mobileSessionDot.classList.add('connected');
      } else if (sessionStatus.classList.contains('status-active')) {
        mobileSessionDot.classList.add('active');
      }
    }
  }

  const micStatus = document.getElementById('micStatus');
  const mobileMicStatus = document.getElementById('mobileMicStatus');
  const mobileMicDot = document.getElementById('mobileMicDot');
  if (micStatus && mobileMicStatus) {
    mobileMicStatus.textContent = micStatus.textContent;
    // Update mic dot for new mobile layout
    if (mobileMicDot) {
      mobileMicDot.classList.remove('connected', 'active');
      if (micStatus.classList.contains('status-active')) {
        mobileMicDot.classList.add('active');
      } else if (micStatus.classList.contains('status-connected')) {
        mobileMicDot.classList.add('connected');
      }
    }
  }

  // Sync AI status bubble
  const aiStatus = document.getElementById('aiStatus');
  const mobileAiStatus = document.getElementById('mobileAiStatus');
  if (aiStatus && mobileAiStatus) {
    mobileAiStatus.textContent = aiStatus.textContent;
  }

  // Sync voice orb
  const voiceOrb = document.getElementById('voiceOrb');
  const mobileVoiceOrb = document.getElementById('mobileVoiceOrb');
  if (voiceOrb && mobileVoiceOrb) {
    mobileVoiceOrb.className = voiceOrb.className;
  }

  // Sync button states
  syncMobileButtonStates();

  // Add event listeners to mobile buttons to trigger desktop buttons (only once)
  setupMobileButtonListeners();
}

// Separate function to sync mobile button states - call this whenever desktop button states change
function syncMobileButtonStates() {
  const connectBtn = document.getElementById('connectBtn');
  const mobileConnectBtn = document.getElementById('mobileConnectBtn');
  if (connectBtn && mobileConnectBtn) {
    mobileConnectBtn.disabled = connectBtn.disabled;
  }

  const interruptBtn = document.getElementById('interruptBtn');
  const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
  if (interruptBtn && mobileInterruptBtn) {
    mobileInterruptBtn.disabled = interruptBtn.disabled;
    // Mobile interrupt button should always be visible (just disabled when not active)
    // Unlike desktop where it's hidden when not needed
    mobileInterruptBtn.style.display = 'flex';
  }

  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');
  if (disconnectBtn && mobileDisconnectBtn) {
    mobileDisconnectBtn.disabled = disconnectBtn.disabled;
  }
}

// Setup mobile button click handlers (call once)
// Note: mobileButtonListenersSetup flag is in state.js
function setupMobileButtonListeners() {
  if (mobileButtonListenersSetup) return;
  mobileButtonListenersSetup = true;

  const connectBtn = document.getElementById('connectBtn');
  const mobileConnectBtn = document.getElementById('mobileConnectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');

  if (mobileConnectBtn && connectBtn) {
    mobileConnectBtn.onclick = () => {
      console.log('[Mobile] Connect button clicked');
      connectBtn.click();
    };
  }
  const interruptBtn = document.getElementById('interruptBtn');
  const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
  if (mobileInterruptBtn && interruptBtn) {
    mobileInterruptBtn.onclick = () => {
      console.log('[Mobile] Interrupt button clicked');
      interruptBtn.click();
    };
  }
  if (mobileDisconnectBtn && disconnectBtn) {
    mobileDisconnectBtn.onclick = () => {
      console.log('[Mobile] Disconnect button clicked');
      disconnectBtn.click();
    };
  }
}

function exitSimulation() {
  if (session) {
    session.disconnect();
    session = null;
  }

  // Clear transcript on exit
  if (window.transcript) {
    window.transcript.clear();
  }

  // Reset sidebar state
  if (typeof resetSimSidebar === 'function') {
    resetSimSidebar();
  }

  // Close model answer drawer if open
  if (typeof closeModelAnswerDrawer === 'function') {
    closeModelAnswerDrawer();
  }

  const simulationRoom = document.getElementById('simulationRoom');
  simulationRoom.classList.add('fade-out');

  setTimeout(() => {
    simulationRoom.classList.remove('active', 'fade-out');
    // Must set inline style to hide - CSS classes can't override inline display:block
    simulationRoom.style.display = 'none';

    // Show scenario selection with fade in
    const scenarioSelection = document.getElementById('scenarioSelection');
    scenarioSelection.style.display = 'block';
    scenarioSelection.classList.add('fade-in');

    setTimeout(() => {
      scenarioSelection.classList.remove('fade-in');
    }, 500);

    document.getElementById('connectBtn').disabled = false;
    document.getElementById('disconnectBtn').disabled = true;
    syncMobileButtonStates(); // Sync mobile buttons
    updateStatus('connectionStatus', 'Disconnected', 'disconnected');
    updateStatus('sessionStatus', 'No Session', 'disconnected');
    updateStatus('micStatus', 'Inactive', 'disconnected');
    updateStatus('aiStatus', 'Idle', 'disconnected');
    setOrbState('idle'); // Reset orb state when exiting

    // Reset image section (it will fade out via CSS)
    const imageSection = document.getElementById('imageSection');
    const mobileImageSection = document.getElementById('mobileImageSection');
    if (imageSection) {
      imageSection.classList.remove('visible');
    }
    if (mobileImageSection) {
      mobileImageSection.classList.remove('visible');
    }
  }, 500);
}

/**
 * Load a selected scenario from the sidebar while already in simulation room
 * This switches the current scenario and updates the UI without leaving the room
 * @param {string} title - Scenario title
 * @param {string} imageFile - Image filename (optional)
 * @param {string} promptFile - Full prompt file path
 */
function loadSelectedScenario(title, imageFile, promptFile) {
  console.log('[Scenarios] Loading selected scenario:', { title, imageFile, promptFile });

  // Update current scenario state
  currentScenario = {
    category: title, // Using title as category for simplicity
    title: title,
    promptFile: promptFile,
    imageFile: imageFile || ''
  };

  // Update the clinical image
  const clinicalImage = document.getElementById('clinicalImage');
  const noImagePlaceholder = document.getElementById('noImagePlaceholder');
  const mobileImage = document.getElementById('mobileClinicalImage');
  const mobilePlaceholder = document.getElementById('mobileNoImagePlaceholder');

  if (imageFile) {
    const imagePath = 'images/' + imageFile;
    if (clinicalImage) {
      clinicalImage.src = imagePath;
      clinicalImage.onload = () => {
        clinicalImage.style.display = 'block';
        if (noImagePlaceholder) noImagePlaceholder.style.display = 'none';
      };
      clinicalImage.onerror = () => {
        clinicalImage.style.display = 'none';
        if (noImagePlaceholder) {
          noImagePlaceholder.style.display = 'block';
          noImagePlaceholder.textContent = 'Image not available';
        }
      };
    }
    if (mobileImage) {
      mobileImage.src = imagePath;
      mobileImage.onload = () => {
        mobileImage.style.display = 'block';
        if (mobilePlaceholder) mobilePlaceholder.style.display = 'none';
      };
    }
  } else {
    if (clinicalImage) clinicalImage.style.display = 'none';
    if (noImagePlaceholder) {
      noImagePlaceholder.style.display = 'block';
      noImagePlaceholder.textContent = 'No clinical image for this scenario';
    }
    if (mobileImage) mobileImage.style.display = 'none';
    if (mobilePlaceholder) {
      mobilePlaceholder.style.display = 'block';
      mobilePlaceholder.textContent = 'No clinical image for this scenario';
    }
  }

  // If there's an active session, disconnect and prompt to reconnect
  if (typeof session !== 'undefined' && session && session.isConnected) {
    log('Scenario changed - please reconnect to start the new scenario', 'warning');
    // Disconnect the current session
    session.disconnect();
    document.getElementById('connectBtn').disabled = false;
    document.getElementById('disconnectBtn').disabled = true;
    if (typeof syncMobileButtonStates === 'function') {
      syncMobileButtonStates();
    }
    updateStatus('sessionStatus', 'Scenario Changed', 'warning');
    updateStatus('connectionStatus', 'Disconnected', 'disconnected');
  }

  log('Scenario loaded: ' + title, 'success');
}

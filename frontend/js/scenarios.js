// ============================================================================
// SCENARIOS.JS - Scenario Selection and Card-Based Navigation
// ============================================================================
// Dependencies: state.js, config.js, subscription.js
// Functions: selectScenarioCategory, selectScenarioSubcategory, getTopicsData,
//            selectScenario (redirects to React simulation.html)
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

// Get topics data structure
// NOTE: Backend paths must match actual folder structure in backend/prompts/
// Path formula: prompts/${topic.file}/${difficulty}_${heading}_${folderName}_1.txt
// where heading = topic.file.split('/')[0], folderName = topic.file.split('/').pop()
function getTopicsData() {
  return {
    // ========== CLINICAL HEADING (10 subcategories) ==========
    'infections': {
      title: 'Infections',
      topics: [
        ['clinical/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis'],
        ['clinical/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
        ['clinical/emergencies/palmar_space_infection', 'Palmar Space Infection'],
        ['clinical/emergencies/hand_abscess', 'Hand Abscess'],
        ['clinical/emergencies/bite_wounds', 'Bite Wounds'],
        ['clinical/emergencies/septic_arthritis_hand', 'Septic Arthritis (Hand)']
      ]
    },
    'hand-trauma': {
      title: 'Hand Trauma',
      topics: [
        ['clinical/hand_trauma/flexor_tendon_injury', 'Flexor Tendon Injury'],
        ['clinical/hand_trauma/extensor_tendon_injury', 'Extensor Tendon Injury'],
        ['clinical/hand_trauma/replantation', 'Replantation'],
        ['clinical/hand_trauma/complex_hand_trauma', 'Complex Hand Trauma'],
        ['clinical/hand_trauma/digital_nerve_injury', 'Digital Nerve Injury'],
        ['clinical/hand_trauma/fingertip_amputation', 'Fingertip Amputation'],
        ['clinical/hand_trauma/nail_bed_injury', 'Nail Bed Injury'],
        ['clinical/hand_trauma/metacarpal_fracture', 'Metacarpal Fracture'],
        ['clinical/hand_trauma/phalangeal_fracture', 'Phalangeal Fracture'],
        ['clinical/hand_trauma/fracture_dislocations_hand', 'Fracture Dislocations (Hand)'],
        ['clinical/hand_trauma/scaphoid_fracture', 'Scaphoid Fracture'],
        ['clinical/hand_trauma/distal_radius_fracture', 'Distal Radius Fracture'],
        ['clinical/hand_trauma/mallet_finger', 'Mallet Finger'],
        ['clinical/hand_trauma/boutonniere_deformity', 'Boutonniere Deformity'],
        ['clinical/hand_trauma/thumb_ulnar_collateral_ligament', 'Thumb UCL Injury']
      ]
    },
    'elective-hand': {
      title: 'Elective Hand',
      topics: [
        ['clinical/elective_hand/carpal_tunnel_syndrome', 'Carpal Tunnel Syndrome'],
        ['clinical/elective_hand/cubital_tunnel_syndrome', 'Cubital Tunnel Syndrome'],
        ['clinical/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
        ['clinical/elective_hand/trigger_finger', 'Trigger Finger'],
        ['clinical/elective_hand/de_quervains_tenosynovitis', "De Quervain's Tenosynovitis"],
        ['clinical/elective_hand/ganglion_cyst', 'Ganglion Cyst'],
        ['clinical/elective_hand/mucous_cyst', 'Mucous Cyst'],
        ['clinical/elective_hand/rheumatoid_hand', 'Rheumatoid Hand'],
        ['clinical/elective_hand/osteoarthritis_hand', 'Osteoarthritis (Hand)'],
        ['clinical/elective_hand/thumb_cmc_arthritis', 'Thumb CMC Arthritis'],
        ['clinical/elective_hand/scaphoid_non_union', 'Scaphoid Non-Union'],
        ['clinical/elective_hand/kienbocks_disease', "Kienbock's Disease"],
        ['clinical/elective_hand/ulnar_impaction', 'Ulnar Impaction'],
        ['clinical/elective_hand/madelungs_deformity', "Madelung's Deformity"]
      ]
    },
    'skin-cancer': {
      title: 'Skin Cancer',
      topics: [
        ['clinical/skin_cancer/basal_cell_carcinoma', 'Basal Cell Carcinoma (BCC)'],
        ['clinical/skin_cancer/squamous_cell_carcinoma', 'Squamous Cell Carcinoma (SCC)'],
        ['clinical/skin_cancer/melanoma', 'Melanoma'],
        ['clinical/skin_cancer/merkel_cell_carcinoma', 'Merkel Cell Carcinoma'],
        ['clinical/skin_cancer/dermatofibrosarcoma', 'Dermatofibrosarcoma'],
        ['clinical/skin_cancer/soft_tissue_sarcoma', 'Soft Tissue Sarcoma'],
        ['clinical/skin_cancer/skin_lesion_assessment', 'Skin Lesion Assessment'],
        ['clinical/skin_cancer/moh_surgery_defects', 'Mohs Surgery Defects'],
        ['clinical/skin_cancer/sentinel_lymph_node_biopsy', 'Sentinel Lymph Node Biopsy'],
        ['clinical/skin_cancer/lymph_node_dissection', 'Lymph Node Dissection']
      ]
    },
    'chronic-wounds': {
      title: 'Chronic Wounds',
      topics: [
        ['clinical/lower_limb/chronic_leg_ulcer', 'Chronic Leg Ulcer'],
        ['clinical/lower_limb/pressure_sores', 'Pressure Sores'],
        ['clinical/lower_limb/diabetic_foot', 'Diabetic Foot'],
        ['clinical/lower_limb/osteomyelitis_lower_limb', 'Osteomyelitis (Lower Limb)']
      ]
    },
    'breast-and-aesthetic': {
      title: 'Breast & Aesthetics',
      topics: [
        ['clinical/breast_and_aesthetic/breast_reduction', 'Breast Reduction'],
        ['clinical/breast_and_aesthetic/breast_reconstruction', 'Breast Reconstruction (DIEP)'],
        ['clinical/breast_and_aesthetic/mastopexy', 'Mastopexy'],
        ['clinical/breast_and_aesthetic/gynaecomastia', 'Gynaecomastia'],
        ['clinical/breast_and_aesthetic/rhinoplasty', 'Rhinoplasty'],
        ['clinical/breast_and_aesthetic/blepharoplasty', 'Blepharoplasty'],
        ['clinical/breast_and_aesthetic/abdominoplasty', 'Abdominoplasty'],
        ['clinical/breast_and_aesthetic/otoplasty', 'Otoplasty'],
        ['clinical/breast_and_aesthetic/liposuction', 'Liposuction'],
        ['clinical/breast_and_aesthetic/brachioplasty', 'Brachioplasty'],
        ['clinical/breast_and_aesthetic/thighplasty', 'Thighplasty'],
        ['clinical/breast_and_aesthetic/capsular_contracture', 'Capsular Contracture'],
        ['clinical/breast_and_aesthetic/implant_complications', 'Implant Complications'],
        ['clinical/breast_and_aesthetic/fat_necrosis', 'Fat Necrosis'],
        ['clinical/breast_and_aesthetic/lymphoedema', 'Lymphoedema']
      ]
    },
    'burns': {
      title: 'Burns',
      topics: [
        ['clinical/burns/acute_burns_assessment', 'Acute Burns Assessment'],
        ['clinical/burns/fluid_resuscitation', 'Fluid Resuscitation'],
        ['clinical/burns/burn_wound_management', 'Burn Wound Management'],
        ['clinical/burns/escharotomy', 'Escharotomy'],
        ['clinical/burns/chemical_burns', 'Chemical Burns'],
        ['clinical/burns/electrical_burns', 'Electrical Burns'],
        ['clinical/burns/inhalation_injury', 'Inhalation Injury'],
        ['clinical/burns/non_accidental_injury_burns', 'Non-Accidental Injury Burns'],
        ['clinical/burns/toxic_epidermal_necrolysis', 'Toxic Epidermal Necrolysis'],
        ['clinical/burns/burn_scar_contracture', 'Burn Scar Contracture']
      ]
    },
    'lower-limb-trauma': {
      title: 'Lower Limb Trauma',
      topics: [
        ['clinical/lower_limb/lower_limb_reconstruction', 'Lower Limb Reconstruction'],
        ['clinical/lower_limb/free_flap_lower_limb', 'Free Flap (Lower Limb)'],
        ['clinical/lower_limb/skin_graft_lower_limb', 'Skin Graft (Lower Limb)'],
        ['clinical/lower_limb/peripheral_vascular_disease', 'Peripheral Vascular Disease']
      ]
    },
    'paediatrics': {
      title: 'Paediatrics',
      topics: [
        ['clinical/congenital/cleft_lip', 'Cleft Lip'],
        ['clinical/congenital/cleft_palate', 'Cleft Palate'],
        ['clinical/congenital/hypospadias', 'Hypospadias'],
        ['clinical/congenital/prominent_ears', 'Prominent Ears'],
        ['clinical/congenital/syndactyly', 'Syndactyly'],
        ['clinical/congenital/polydactyly', 'Polydactyly'],
        ['clinical/congenital/congenital_hand_anomaly', 'Congenital Hand Anomaly'],
        ['clinical/congenital/craniosynostosis', 'Craniosynostosis'],
        ['clinical/congenital/congenital_melanocytic_naevus', 'Congenital Melanocytic Naevus'],
        ['clinical/congenital/vascular_anomalies', 'Vascular Anomalies']
      ]
    },
    'miscellaneous': {
      title: 'Miscellaneous',
      topics: [
        ['clinical/emergencies/compartment_syndrome', 'Compartment Syndrome'],
        ['clinical/emergencies/extravasation_injury', 'Extravasation Injury'],
        ['clinical/emergencies/high_pressure_injection_injury', 'High Pressure Injection Injury'],
        ['clinical/emergencies/electrical_injury_acute', 'Electrical Injury (Acute)'],
        ['clinical/head_and_neck/facial_laceration', 'Facial Laceration'],
        ['clinical/head_and_neck/nasal_fracture', 'Nasal Fracture'],
        ['clinical/head_and_neck/orbital_fracture', 'Orbital Fracture'],
        ['clinical/head_and_neck/mandible_fracture', 'Mandible Fracture'],
        ['clinical/head_and_neck/facial_nerve_injury', 'Facial Nerve Injury'],
        ['clinical/head_and_neck/parotid_injury', 'Parotid Injury']
      ]
    },
    // ========== CALL THE BOSS (15 scenarios - flat list) ==========
    'call-the-boss-scenarios': {
      title: 'Call-The-Boss Scenarios',
      topics: [
        ['call_the_boss/scenarios/replantation', 'Replantation'],
        ['call_the_boss/scenarios/extravasation_injury', 'Extravasation Injury'],
        ['call_the_boss/scenarios/high_pressure_injection', 'High Pressure Injection / Compartment Syndrome'],
        ['call_the_boss/scenarios/compartment_syndrome', 'Compartment Syndrome'],
        ['call_the_boss/scenarios/flexor_sheath_infection', 'Flexor Sheath Infection'],
        ['call_the_boss/scenarios/necrotising_fasciitis', 'Necrotising Fasciitis'],
        ['call_the_boss/scenarios/septic_arthritis', 'Septic Arthritis'],
        ['call_the_boss/scenarios/major_burn', 'Major Burn'],
        ['call_the_boss/scenarios/electrical_injury', 'Electrical Injury'],
        ['call_the_boss/scenarios/non_accidental_injury', 'Non-Accidental Injury'],
        ['call_the_boss/scenarios/open_fracture', 'Open Fracture'],
        ['call_the_boss/scenarios/facial_laceration_complex', 'Complex Facial Laceration'],
        ['call_the_boss/scenarios/free_flap_compromise', 'Free Flap Compromise'],
        ['call_the_boss/scenarios/bite_wound_hand', 'Bite Wound (Hand)'],
        ['call_the_boss/scenarios/cauda_equina', 'Cauda Equina']
      ]
    },
    // ========== CONSENT HEADING (7 subcategories) ==========
    'consent-hand-trauma': {
      title: 'Consent: Hand Surgery',
      topics: [
        ['consent/hand_surgery/tendon_repair_consent', 'Tendon Repair'],
        ['consent/hand_surgery/nerve_repair_consent', 'Nerve Repair'],
        ['consent/hand_surgery/dupuytrens_fasciectomy_consent', "Dupuytren's Fasciectomy"],
        ['consent/hand_surgery/carpal_tunnel_release_consent', 'Carpal Tunnel Release'],
        ['consent/hand_surgery/trigger_finger_release_consent', 'Trigger Finger Release']
      ]
    },
    'consent-elective-hand': {
      title: 'Consent: Emergency Procedures',
      topics: [
        ['consent/emergency_procedures/washout_and_debridement_consent', 'Washout and Debridement'],
        ['consent/emergency_procedures/debridement_necrotising_fasciitis_consent', 'Debridement of Necrotising Fasciitis'],
        ['consent/emergency_procedures/fasciotomy_consent', 'Fasciotomy'],
        ['consent/emergency_procedures/escharotomy_consent', 'Escharotomy'],
        ['consent/emergency_procedures/amputation_consent', 'Amputation']
      ]
    },
    'consent-burn': {
      title: 'Consent: Reconstructive',
      topics: [
        ['consent/reconstructive/free_flap_consent', 'Free Flap'],
        ['consent/reconstructive/local_flap_reconstruction_consent', 'Local Flap Reconstruction'],
        ['consent/reconstructive/tissue_expansion_consent', 'Tissue Expansion'],
        ['consent/reconstructive/scar_revision_consent', 'Scar Revision']
      ]
    },
    'consent-lower-limb': {
      title: 'Consent: Skin Surgery',
      topics: [
        ['consent/skin_surgery/skin_lesion_excision_consent', 'Skin Lesion Excision'],
        ['consent/skin_surgery/skin_graft_consent', 'Skin Graft'],
        ['consent/skin_surgery/local_flap_consent', 'Local Flap'],
        ['consent/skin_surgery/sentinel_lymph_node_biopsy_consent', 'Sentinel Lymph Node Biopsy'],
        ['consent/skin_surgery/lymph_node_dissection_consent', 'Lymph Node Dissection']
      ]
    },
    'consent-chronic-wounds': {
      title: 'Consent: Breast & Aesthetics',
      topics: [
        ['consent/breast_and_aesthetic/breast_reduction_consent', 'Breast Reduction'],
        ['consent/breast_and_aesthetic/breast_reconstruction_consent', 'Breast Reconstruction'],
        ['consent/breast_and_aesthetic/abdominoplasty_consent', 'Abdominoplasty'],
        ['consent/breast_and_aesthetic/liposuction_consent', 'Liposuction'],
        ['consent/breast_and_aesthetic/implant_surgery_consent', 'Implant Surgery']
      ]
    },
    'consent-skin-cancer': {
      title: 'Consent: Skin Cancer',
      topics: [
        ['consent/skin_surgery/skin_lesion_excision_consent', 'Skin Lesion Excision'],
        ['consent/skin_surgery/skin_graft_consent', 'Skin Graft'],
        ['consent/skin_surgery/sentinel_lymph_node_biopsy_consent', 'Sentinel Lymph Node Biopsy'],
        ['consent/skin_surgery/lymph_node_dissection_consent', 'Lymph Node Dissection']
      ]
    },
    'consent-breast-and-aesthetic': {
      title: 'Consent: Breast & Aesthetics',
      topics: [
        ['consent/breast_and_aesthetic/breast_reduction_consent', 'Breast Reduction'],
        ['consent/breast_and_aesthetic/breast_reconstruction_consent', 'Breast Reconstruction (DIEP)'],
        ['consent/breast_and_aesthetic/abdominoplasty_consent', 'Abdominoplasty'],
        ['consent/breast_and_aesthetic/liposuction_consent', 'Liposuction'],
        ['consent/breast_and_aesthetic/implant_surgery_consent', 'Implant Surgery']
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
        ['structured_interview/research/focused_interview', 'Research Interview']
      ]
    },
    'structured-teaching': {
      title: 'Teaching',
      topics: [
        ['structured_interview/teaching/focused_interview', 'Teaching Interview']
      ]
    },
    'structured-risk-and-safety': {
      title: 'Risk & Safety',
      topics: [
        ['structured_interview/risk_management/focused_interview', 'Risk & Safety Interview']
      ]
    },
    'structured-leadership': {
      title: 'Leadership & Management',
      topics: [
        ['structured_interview/clinical_governance/focused_interview', 'Clinical Governance Interview']
      ]
    },
    'structured-consent': {
      title: 'Consent',
      topics: [
        ['structured_interview/consent_ethics/focused_interview', 'Consent & Ethics Interview']
      ]
    },
    'structured-ethics': {
      title: 'Ethics',
      topics: [
        ['structured_interview/ethics/focused_interview', 'Ethics Interview']
      ]
    },
    'structured-misc': {
      title: 'Misc',
      topics: [
        ['structured_interview/complaints/focused_interview', 'Complaints Interview']
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

    // Check if user has access to this scenario (topicFolder format matches FREE_TIER_SCENARIOS)
    const isLocked = !canAccessScenario(topic.file);
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
  showUpgradeModal({
    title: 'Plastic Surgery ST3',
    message: 'Unlock all 231 Plastic Surgery scenarios with a subscription.'
  });
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
    showErrorToast('Please select a difficulty level first');
    return;
  }

  // Use topicFolder directly — server assembles modular prompt files
  const promptFile = topicFolder;

  // Check if user has access to this scenario
  if (!canAccessScenario(promptFile)) {
    showUpgradeModal({
      title: 'Plastic Surgery ST3',
      message: 'Unlock all 231 Plastic Surgery scenarios with a subscription.'
    });
    return;
  }

  // Save simulation parameters to sessionStorage for the simulation page
  if (typeof saveSimulationParams === 'function') {
    saveSimulationParams({
      scenario: {
        category: topicFolder.split('/')[0],
        title: title,
        promptFile: promptFile,
        imageFile: imageFile
      },
      difficulty: selectedDifficulty,
      mode: selectedMode || 'practice',
      mockExamType: mockExamType,
      returnPage: 'scenarioSelection'
    });
  }

  // Animate current page content out with depth effect, then show overlay
  if (window.TransitionEngine) {
    window.TransitionEngine.animateExit(() => {
      // Show "Entering Simulation Room" overlay after page exits
      const overlay = document.getElementById('simulationTransition');
      overlay.style.display = 'flex';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add('active');
        });
      });

      // Navigate after overlay is visible
      setTimeout(() => {
        window.location.href = 'simulation.html';
      }, 800);
    });
  } else {
    // Fallback: original overlay behavior
    const overlay = document.getElementById('simulationTransition');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
    });
    setTimeout(() => {
      window.location.href = 'simulation.html';
    }, 1000);
  }
}

// NOTE: startScenario(), syncMobileSimulationElements(), syncMobileButtonStates(),
// setupMobileButtonListeners(), exitSimulation(), performSimulationCleanup(), and
// loadSelectedScenario() were removed — they targeted the old vanilla simulation room
// DOM (removed when simulation.html was rebuilt as React). The live flow uses
// selectScenario() which redirects to simulation.html (React app).

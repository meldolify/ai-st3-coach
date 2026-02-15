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

  // Show "Entering Simulation Room" overlay
  const overlay = document.getElementById('simulationTransition');
  overlay.style.display = 'flex';

  // Trigger fade-in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
  });

  // Wait 1 second then navigate to simulation page
  setTimeout(() => {
    window.location.href = 'simulation.html';
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
  // Check if there's an active connected session
  if (window.session && window.session.isConnected) {
    // Show exit confirmation modal - endSessionWithFeedback will handle cleanup and show summary
    if (typeof showSessionExitModal === 'function') {
      showSessionExitModal();
      return;
    }
  }

  // No active session or modal not available - do direct cleanup
  performSimulationCleanup();
}

/**
 * Perform simulation room cleanup (called after session ends or when no session active)
 */
function performSimulationCleanup() {
  // Disconnect session if exists (shouldn't be connected at this point)
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

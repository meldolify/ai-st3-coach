// ============================================================================
// SCENARIOS.JS - Scenario Selection, Panel Navigation, and Mobile UI
// ============================================================================
// Dependencies: state.js, config.js, subscription.js, session.js
// Functions: toggleMenu, showSubheadings, showTopics, selectScenario,
//            startScenario, exitSimulation, mobile navigation functions
// ============================================================================

function toggleMenu(menuId) {
  const content = document.getElementById('content-' + menuId);
  const arrow = document.getElementById('arrow-' + menuId);
  const header = arrow.parentElement;
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    arrow.classList.remove('open');
    header.classList.remove('active');
  } else {
    content.classList.add('open');
    arrow.classList.add('open');
    header.classList.add('active');
  }
}

// Cascading Hover Panel System
// Note: Timer variables (subheadingsTimer, topicsTimer) are in state.js

// Show subheadings panel when hovering over a heading
function showSubheadings(headingId) {
  // Clear any pending timer
  clearTimeout(subheadingsTimer);

  // Delay before opening panel
  subheadingsTimer = setTimeout(() => {
    const subheadingsPanel = document.getElementById('subheadings-panel');
    const topicsPanel = document.getElementById('topics-panel');

    // Hide all subheading groups
    document.querySelectorAll('.subheading-group').forEach(group => {
      group.style.display = 'none';
    });

    // Show the appropriate subheading group
    const subheadingGroup = document.getElementById('subheadings-' + headingId);
    if (subheadingGroup) {
      subheadingGroup.style.display = 'block';
      subheadingsPanel.classList.add('visible');
    }

    // Hide topics panel when switching headings
    topicsPanel.classList.remove('visible');
  }, 300); // 300ms delay before opening
}

// Cancel subheadings timer when mouse enters subheadings panel
function cancelSubheadingsTimer() {
  if (subheadingsTimer) {
    clearTimeout(subheadingsTimer);
    subheadingsTimer = null;
  }
}

// Cancel topics timer when mouse enters topics panel
function cancelTopicsTimer() {
  if (topicsTimer) {
    clearTimeout(topicsTimer);
    topicsTimer = null;
  }
}

// Show topics panel when hovering over a subheading
function showTopics(subheadingId) {
  // Clear any pending timer
  if (topicsTimer) {
    clearTimeout(topicsTimer);
  }

  // Always use delay, even if panel is already visible
  // This prevents accidental switching while moving mouse through subheadings
  topicsTimer = setTimeout(() => {
    updateTopicsContent(subheadingId);
  }, 300); // 300ms delay before switching topics
}

// Helper function to update topics panel content
function updateTopicsContent(subheadingId) {
  const topicsPanel = document.getElementById('topics-panel');

  // Define all topics for each subheading - NEW HIERARCHY
  const topicsData = {
    // ========== CLINICAL HEADING ==========
    'breast-and-aesthetic': {
      title: 'Breast & Aesthetic',
      topics: [
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
      ]
    },
    'burns': {
      title: 'Burns',
      topics: [
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
      ]
    },
    'elective-hand': {
      title: 'Elective Hand',
      topics: [
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
      ]
    },
    'emergencies': {
      title: 'Emergencies',
      topics: [
        ['clinical/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis', 'nec_fasc_1.jpg'],
        ['clinical/emergencies/compartment_syndrome', 'Compartment Syndrome'],
        ['clinical/emergencies/high_pressure_injection_injury', 'High Pressure Injection Injury'],
        ['clinical/emergencies/extravasation_injury', 'Extravasation Injury'],
        ['clinical/emergencies/septic_arthritis_hand', 'Septic Arthritis Hand'],
        ['clinical/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
        ['clinical/emergencies/palmar_space_infection', 'Palmar Space Infection'],
        ['clinical/emergencies/hand_abscess', 'Hand Abscess'],
        ['clinical/emergencies/bite_wounds', 'Bite Wounds'],
        ['clinical/emergencies/electrical_injury_acute', 'Electrical Injury Acute']
      ]
    },
    'hand-trauma': {
      title: 'Hand Trauma',
      topics: [
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
      ]
    },
    'lower-limb': {
      title: 'Lower Limb',
      topics: [
        ['clinical/lower_limb/diabetic_foot', 'Diabetic Foot'],
        ['clinical/lower_limb/chronic_leg_ulcer', 'Chronic Leg Ulcer'],
        ['clinical/lower_limb/pressure_sores', 'Pressure Sores'],
        ['clinical/lower_limb/lower_limb_reconstruction', 'Lower Limb Reconstruction'],
        ['clinical/lower_limb/free_flap_lower_limb', 'Free Flap Lower Limb'],
        ['clinical/lower_limb/skin_graft_lower_limb', 'Skin Graft Lower Limb'],
        ['clinical/lower_limb/osteomyelitis_lower_limb', 'Osteomyelitis Lower Limb'],
        ['clinical/lower_limb/peripheral_vascular_disease', 'Peripheral Vascular Disease']
      ]
    },
    'skin-cancer': {
      title: 'Skin Cancer',
      topics: [
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
      ]
    },
    'head-and-neck': {
      title: 'Head & Neck',
      topics: [
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
      ]
    },
    'congenital': {
      title: 'Congenital',
      topics: [
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
      ]
    },
    'microsurgery': {
      title: 'Microsurgery',
      topics: [
        ['clinical/microsurgery/free_flap_principles', 'Free Flap Principles'],
        ['clinical/microsurgery/radial_forearm_flap', 'Radial Forearm Flap'],
        ['clinical/microsurgery/anterolateral_thigh_flap', 'Anterolateral Thigh Flap'],
        ['clinical/microsurgery/latissimus_dorsi_flap', 'Latissimus Dorsi Flap'],
        ['clinical/microsurgery/diep_flap', 'DIEP Flap'],
        ['clinical/microsurgery/fibula_free_flap', 'Fibula Free Flap'],
        ['clinical/microsurgery/flap_failure_management', 'Flap Failure Management'],
        ['clinical/microsurgery/microvascular_anastomosis', 'Microvascular Anastomosis'],
        ['clinical/microsurgery/nerve_repair_reconstruction', 'Nerve Repair Reconstruction']
      ]
    },

    // ========== CALL-THE-BOSS HEADING ==========
    'call-the-boss-scenarios': {
      title: 'Call-The-Boss Scenarios',
      topics: [
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
      ]
    },

    // ========== CONSENT HEADING ==========
    'consent-breast-and-aesthetic': {
      title: 'Breast & Aesthetic Consent',
      topics: [
        ['consent/breast_and_aesthetic/breast_reconstruction_consent', 'Breast Reconstruction'],
        ['consent/breast_and_aesthetic/breast_reduction_consent', 'Breast Reduction'],
        ['consent/breast_and_aesthetic/abdominoplasty_consent', 'Abdominoplasty'],
        ['consent/breast_and_aesthetic/liposuction_consent', 'Liposuction'],
        ['consent/breast_and_aesthetic/implant_surgery_consent', 'Implant Surgery']
      ]
    },
    'consent-hand-surgery': {
      title: 'Hand Surgery Consent',
      topics: [
        ['consent/hand_surgery/carpal_tunnel_release_consent', 'Carpal Tunnel Release'],
        ['consent/hand_surgery/trigger_finger_release_consent', 'Trigger Finger Release'],
        ['consent/hand_surgery/dupuytrens_fasciectomy_consent', "Dupuytren's Fasciectomy"],
        ['consent/hand_surgery/tendon_repair_consent', 'Tendon Repair'],
        ['consent/hand_surgery/nerve_repair_consent', 'Nerve Repair']
      ]
    },
    'consent-skin-surgery': {
      title: 'Skin Surgery Consent',
      topics: [
        ['consent/skin_surgery/skin_lesion_excision_consent', 'Skin Lesion Excision'],
        ['consent/skin_surgery/skin_graft_consent', 'Skin Graft'],
        ['consent/skin_surgery/local_flap_consent', 'Local Flap'],
        ['consent/skin_surgery/sentinel_lymph_node_biopsy_consent', 'Sentinel Lymph Node Biopsy'],
        ['consent/skin_surgery/lymph_node_dissection_consent', 'Lymph Node Dissection']
      ]
    },
    'consent-emergency-procedures': {
      title: 'Emergency Procedures Consent',
      topics: [
        ['consent/emergency_procedures/debridement_necrotising_fasciitis_consent', 'Debridement for Nec Fasc'],
        ['consent/emergency_procedures/fasciotomy_consent', 'Fasciotomy'],
        ['consent/emergency_procedures/washout_and_debridement_consent', 'Washout & Debridement'],
        ['consent/emergency_procedures/escharotomy_consent', 'Escharotomy'],
        ['consent/emergency_procedures/amputation_consent', 'Amputation']
      ]
    },
    'consent-reconstructive': {
      title: 'Reconstructive Consent',
      topics: [
        ['consent/reconstructive/free_flap_consent', 'Free Flap'],
        ['consent/reconstructive/local_flap_reconstruction_consent', 'Local Flap Reconstruction'],
        ['consent/reconstructive/tissue_expansion_consent', 'Tissue Expansion'],
        ['consent/reconstructive/scar_revision_consent', 'Scar Revision']
      ]
    },

    // ========== STRUCTURED INTERVIEW HEADING ==========
    'structured-audit': {
      title: 'Audit',
      topics: [
        ['structured_interview/audit/focused_interview', 'Focused Interview']
      ]
    },
    'structured-clinical-governance': {
      title: 'Clinical Governance',
      topics: [
        ['structured_interview/clinical_governance/focused_interview', 'Focused Interview']
      ]
    },
    'structured-complaints': {
      title: 'Complaints',
      topics: [
        ['structured_interview/complaints/focused_interview', 'Focused Interview']
      ]
    },
    'structured-consent-ethics': {
      title: 'Consent & Ethics',
      topics: [
        ['structured_interview/consent_ethics/focused_interview', 'Focused Interview']
      ]
    },
    'structured-ethics': {
      title: 'Ethics',
      topics: [
        ['structured_interview/ethics/focused_interview', 'Focused Interview']
      ]
    },
    'structured-research': {
      title: 'Research',
      topics: [
        ['structured_interview/research/focused_interview', 'Focused Interview']
      ]
    },
    'structured-risk-management': {
      title: 'Risk Management',
      topics: [
        ['structured_interview/risk_management/focused_interview', 'Focused Interview']
      ]
    },
    'structured-teaching': {
      title: 'Teaching',
      topics: [
        ['structured_interview/teaching/focused_interview', 'Focused Interview']
      ]
    }
  };

  const data = topicsData[subheadingId];
  if (!data) return;

  // Build topics HTML
  let html = `<div class="topics-panel-title">${data.title}</div>`;
  data.topics.forEach(topic => {
    const [folder, title, image] = topic;
    const imageArg = image ? `, '${image}'` : '';

    // Check if scenario is locked (for all difficulty levels)
    const folderName = folder.split('/').pop();
    // Get heading from folder path (first segment)
    const heading = folder.split('/')[0];
    const easyPromptFile = `prompts/${folder}/easy_${heading}_${folderName}_1.txt`;
    const isLocked = !canAccessScenario(easyPromptFile);

    if (isLocked) {
      html += `<div class="topic-item locked" onclick="alert('This scenario requires a Premium subscription.\\n\\nUpgrade to access all scenarios.')">🔒 ${title}</div>`;
    } else {
      html += `<div class="topic-item" onclick="selectScenario('${folder}', '${title.replace(/'/g, "\\'")}'${imageArg})">📋 ${title}</div>`;
    }
  });

  topicsPanel.innerHTML = html;
  topicsPanel.classList.add('visible');
}

// Handle mouse leave events for panels
function handlePanelMouseLeave(panelType) {
  // Use setTimeout to allow mouse movement to next panel without closing
  setTimeout(() => {
    const headingsPanel = document.getElementById('headings-panel');
    const subheadingsPanel = document.getElementById('subheadings-panel');
    const topicsPanel = document.getElementById('topics-panel');

    // Check if mouse is still over specific panels
    const isOverHeadings = headingsPanel.matches(':hover');
    const isOverSubheadings = subheadingsPanel.matches(':hover');
    const isOverTopics = topicsPanel.matches(':hover');

    if (panelType === 'headings') {
      // If mouse left headings panel, hide subheadings and topics
      // unless hovering over subheadings or topics
      if (!isOverSubheadings && !isOverTopics) {
        subheadingsPanel.classList.remove('visible');
        topicsPanel.classList.remove('visible');
      }
    } else if (panelType === 'subheadings') {
      // If mouse left subheadings panel, hide topics
      // unless hovering over topics
      if (!isOverTopics) {
        topicsPanel.classList.remove('visible');
      }
      // Hide subheadings only if not hovering over headings, subheadings, OR topics
      if (!isOverHeadings && !isOverSubheadings && !isOverTopics) {
        subheadingsPanel.classList.remove('visible');
      }
    } else if (panelType === 'topics') {
      // If mouse left topics panel, hide topics only
      // unless still hovering over topics panel itself
      if (!isOverTopics) {
        topicsPanel.classList.remove('visible');
      }
    }
  }, 50); // Reduced delay for more responsive hiding
}

// Hide all panels when hovering over content area
function hideAllPanels() {
  const subheadingsPanel = document.getElementById('subheadings-panel');
  const topicsPanel = document.getElementById('topics-panel');

  subheadingsPanel.classList.remove('visible');
  topicsPanel.classList.remove('visible');
}

// Mobile progressive hierarchy navigation
// Note: Mobile state variables (mobileCurrentLevel, etc.) are in state.js

function initMobilePanelNavigation() {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;

  if (isMobile) {
    console.log('[MOBILE] Initializing progressive hierarchy navigation');

    // Copy difficulty indicator to mobile version
    const desktopIndicator = document.getElementById('selectedDifficultyIndicator');
    const mobileIndicator = document.getElementById('selectedDifficultyIndicatorMobile');
    if (desktopIndicator && mobileIndicator) {
      mobileIndicator.textContent = desktopIndicator.textContent;
      mobileIndicator.style.color = desktopIndicator.style.color;
    }

    // Reset to headings level
    mobileShowHeadings();
  }
}

function mobileShowHeadings() {
  const headingsGrid = document.getElementById('mobileHeadingsGrid');
  const subheadingsGrid = document.getElementById('mobileSubheadingsGrid');
  const topicsGrid = document.getElementById('mobileTopicsGrid');
  const backButton = document.getElementById('mobileBackButton');

  // Show headings, hide others
  headingsGrid.style.display = 'grid';
  subheadingsGrid.style.display = 'none';
  topicsGrid.style.display = 'none';

  // Update back button
  backButton.textContent = '← Back to Difficulty';
  backButton.onclick = backToDifficulty;

  mobileCurrentLevel = 'headings';
  mobileCurrentHeading = null;

  // Populate headings - NEW 4 HEADINGS
  headingsGrid.innerHTML = '';
  const headings = [
    { id: 'clinical', icon: '📋', name: 'Clinical' },
    { id: 'call-the-boss', icon: '📞', name: 'Call-The-Boss' },
    { id: 'consent', icon: '✍️', name: 'Consent' },
    { id: 'structured', icon: '📝', name: 'Structured Interview' }
  ];

  headings.forEach(heading => {
    const card = document.createElement('div');
    card.className = 'mobile-scenario-card';
    card.onclick = () => mobileShowSubheadings(heading.id, heading.name);
    card.innerHTML = `
      <h3>${heading.icon} ${heading.name}</h3>
    `;
    headingsGrid.appendChild(card);
  });
}

function mobileShowSubheadings(headingId, headingName) {
  const headingsGrid = document.getElementById('mobileHeadingsGrid');
  const subheadingsGrid = document.getElementById('mobileSubheadingsGrid');
  const topicsGrid = document.getElementById('mobileTopicsGrid');
  const backButton = document.getElementById('mobileBackButton');

  // Show subheadings, hide others
  headingsGrid.style.display = 'none';
  subheadingsGrid.style.display = 'grid';
  topicsGrid.style.display = 'none';

  // Update back button
  backButton.textContent = '← Back to Categories';
  backButton.onclick = mobileShowHeadings;

  mobileCurrentLevel = 'subheadings';
  mobileCurrentHeading = headingId;

  // Populate subheadings based on heading - NEW HIERARCHY
  subheadingsGrid.innerHTML = '';

  const subheadingsData = {
    clinical: [
      { id: 'breast-and-aesthetic', name: '💄 Breast & Aesthetic' },
      { id: 'burns', name: '🔥 Burns' },
      { id: 'elective-hand', name: '🤚 Elective Hand' },
      { id: 'emergencies', name: '🚨 Emergencies' },
      { id: 'hand-trauma', name: '✋ Hand Trauma' },
      { id: 'lower-limb', name: '🦵 Lower Limb' },
      { id: 'skin-cancer', name: '🔬 Skin Cancer' },
      { id: 'head-and-neck', name: '👤 Head & Neck' },
      { id: 'congenital', name: '👶 Congenital' },
      { id: 'microsurgery', name: '🔬 Microsurgery' }
    ],
    'call-the-boss': [
      { id: 'call-the-boss-scenarios', name: '📞 Scenarios' }
    ],
    consent: [
      { id: 'consent-breast-and-aesthetic', name: '💄 Breast & Aesthetic' },
      { id: 'consent-hand-surgery', name: '✋ Hand Surgery' },
      { id: 'consent-skin-surgery', name: '🔬 Skin Surgery' },
      { id: 'consent-emergency-procedures', name: '🚨 Emergency Procedures' },
      { id: 'consent-reconstructive', name: '🔧 Reconstructive' }
    ],
    structured: [
      { id: 'structured-audit', name: '📊 Audit' },
      { id: 'structured-clinical-governance', name: '🏛️ Clinical Governance' },
      { id: 'structured-complaints', name: '📝 Complaints' },
      { id: 'structured-consent-ethics', name: '⚖️ Consent & Ethics' },
      { id: 'structured-ethics', name: '🤔 Ethics' },
      { id: 'structured-research', name: '🔬 Research' },
      { id: 'structured-risk-management', name: '⚠️ Risk Management' },
      { id: 'structured-teaching', name: '📚 Teaching' }
    ]
  };

  const subheadings = subheadingsData[headingId] || [];

  subheadings.forEach(subheading => {
    const card = document.createElement('div');
    card.className = 'mobile-scenario-card';
    card.onclick = () => mobileShowTopics(subheading.id, subheading.name);
    card.innerHTML = `<h3>${subheading.name}</h3>`;
    subheadingsGrid.appendChild(card);
  });
}

function mobileShowTopics(subheadingId, subheadingName) {
  const headingsGrid = document.getElementById('mobileHeadingsGrid');
  const subheadingsGrid = document.getElementById('mobileSubheadingsGrid');
  const topicsGrid = document.getElementById('mobileTopicsGrid');
  const backButton = document.getElementById('mobileBackButton');

  // Show topics, hide others
  headingsGrid.style.display = 'none';
  subheadingsGrid.style.display = 'none';
  topicsGrid.style.display = 'grid';

  // Update back button
  backButton.textContent = '← Back';
  backButton.onclick = () => mobileShowSubheadings(mobileCurrentHeading, '');

  mobileCurrentLevel = 'topics';
  mobileCurrentSubheading = subheadingId;

  // Populate topics - using the same data from topicsData - NEW HIERARCHY
  topicsGrid.innerHTML = '';

  const topicsData = {
    // ========== CLINICAL HEADING ==========
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
      ['clinical/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis', 'nec_fasc_1.jpg'],
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

    // ========== CALL-THE-BOSS HEADING ==========
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

    // ========== CONSENT HEADING ==========
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

    // ========== STRUCTURED INTERVIEW HEADING ==========
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

  const topics = topicsData[subheadingId] || [];

  topics.forEach(topic => {
    const [folder, title, image] = topic;

    // Check if scenario is locked
    const folderName = folder.split('/').pop();
    // Get heading from folder path (first segment)
    const heading = folder.split('/')[0];
    const easyPromptFile = `prompts/${folder}/easy_${heading}_${folderName}_1.txt`;
    const isLocked = !canAccessScenario(easyPromptFile);

    const card = document.createElement('div');
    card.className = isLocked ? 'mobile-scenario-card locked' : 'mobile-scenario-card';

    if (isLocked) {
      card.onclick = () => alert('This scenario requires a Premium subscription.\n\nUpgrade to access all scenarios.');
      card.innerHTML = `<h3>🔒 ${title}</h3>`;
    } else {
      card.onclick = () => selectScenario(folder, title, image);
      card.innerHTML = `<h3>${title}</h3>`;
    }

    topicsGrid.appendChild(card);
  });
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

  // Set scenario information
  document.getElementById('currentScenarioTitle').textContent = title;
  document.getElementById('currentScenarioCategory').textContent = category;

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
  if (sessionStatus && mobileSessionStatus) {
    mobileSessionStatus.textContent = sessionStatus.textContent;
    mobileSessionStatus.className = sessionStatus.className;
  }

  const micStatus = document.getElementById('micStatus');
  const mobileMicStatus = document.getElementById('mobileMicStatus');
  if (micStatus && mobileMicStatus) {
    mobileMicStatus.textContent = micStatus.textContent;
    mobileMicStatus.className = micStatus.className;
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

  const recordBtn = document.getElementById('recordBtn');
  const mobileRecordBtn = document.getElementById('mobileRecordBtn');
  if (recordBtn && mobileRecordBtn) {
    mobileRecordBtn.disabled = recordBtn.disabled;
    mobileRecordBtn.style.display = recordBtn.style.display;
    // Sync recording state class
    if (recordBtn.classList.contains('recording')) {
      mobileRecordBtn.classList.add('recording');
    } else {
      mobileRecordBtn.classList.remove('recording');
    }
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
  const recordBtn = document.getElementById('recordBtn');
  const mobileRecordBtn = document.getElementById('mobileRecordBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');

  if (mobileConnectBtn && connectBtn) {
    mobileConnectBtn.onclick = () => {
      console.log('[Mobile] Connect button clicked');
      connectBtn.click();
    };
  }
  if (mobileRecordBtn && recordBtn) {
    mobileRecordBtn.onclick = () => {
      console.log('[Mobile] Record button clicked');
      recordBtn.click();
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
    document.getElementById('recordBtn').style.display = 'none';
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

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

  // Define all topics for each subheading
  const topicsData = {
    'emergencies': {
      title: '1. Emergencies',
      topics: [
        ['clinical_stations/hand_trauma/digital_amputation', 'Digital Amputation'],
        ['clinical_stations/hand_trauma/macro_amputation', 'Macro Amputation'],
        ['clinical_stations/hand_trauma/degloving_devascularisation', 'Degloving / Devascularisation'],
        ['clinical_stations/hand_trauma/mangled_hand', 'Mangled Hand'],
        ['clinical_stations/emergencies/high_pressure_injection', 'High Pressure Injection Injury'],
        ['clinical_stations/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
        ['clinical_stations/miscellaneous/extravasation_injury', 'Extravasation Injury'],
        ['clinical_stations/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis', 'nec_fasc_1.jpg'],
        ['clinical_stations/hand_trauma/open_fracture', 'Open Fracture'],
        ['clinical_stations/emergencies/compartment_syndrome', 'Compartment Syndrome'],
        ['clinical_stations/miscellaneous/flap_at_risk', 'Flap at Risk']
      ]
    },
    'hand-trauma': {
      title: '2. Hand Trauma',
      topics: [
        ['clinical_stations/hand_trauma/fingertip_injury', 'Fingertip Injury'],
        ['clinical_stations/hand_trauma/closed_hand_fracture', 'Closed Hand Fracture'],
        ['clinical_stations/hand_trauma/tendon_injury', 'Tendon Injury'],
        ['clinical_stations/emergencies/fightbite_injury', 'Fightbite Injury'],
        ['clinical_stations/elective_hand/finger_deformities_ligamental', 'Finger Deformities and Ligamental Injuries']
      ]
    },
    'elective-hand': {
      title: '3. Elective Hand',
      topics: [
        ['clinical_stations/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
        ['clinical_stations/elective_hand/compression_neuropathies', 'Compression Neuropathies'],
        ['clinical_stations/elective_hand/hand_deformities', 'Hand Deformities']
      ]
    },
    'skin-cancer': {
      title: '4. Skin Cancer',
      topics: [
        ['clinical_stations/skin_cancer/bcc_basic', 'BCC Basic'],
        ['clinical_stations/skin_cancer/scc_basic', 'SCC Basic'],
        ['clinical_stations/skin_cancer/mm_basic', 'MM Basic'],
        ['clinical_stations/miscellaneous/scalp', 'Scalp'],
        ['clinical_stations/miscellaneous/forehead_temple', 'Forehead / Temple'],
        ['clinical_stations/miscellaneous/eyelid', 'Eyelid'],
        ['clinical_stations/miscellaneous/nose', 'Nose'],
        ['clinical_stations/miscellaneous/lip', 'Lip'],
        ['clinical_stations/miscellaneous/ear', 'Ear'],
        ['clinical_stations/skin_cancer/subungual', 'Subungual'],
        ['clinical_stations/skin_cancer/mucosal', 'Mucosal'],
        ['clinical_stations/miscellaneous/fungating_massive', 'Fungating / Massive'],
        ['clinical_stations/skin_cancer/lymph_node_management', 'Lymph Node Management']
      ]
    },
    'miscellaneous': {
      title: '5. Miscellaneous',
      topics: [
        ['clinical_stations/miscellaneous/sternal_wound_dehiscence', 'Sternal Wound Dehiscence'],
        ['clinical_stations/miscellaneous/pressure_ulcer', 'Pressure Ulcer'],
        ['clinical_stations/miscellaneous/pretibial_laceration', 'Pretibial Laceration'],
        ['clinical_stations/burns/haemangioma_vascular', 'Haemangioma / Vascular Malformation'],
        ['clinical_stations/miscellaneous/chronic_lower_limb_infections', 'Chronic Lower Limb Infections'],
        ['clinical_stations/burns/cleft_lip_palate', 'Cleft Lip and Palate'],
        ['clinical_stations/burns/hypospadias', 'Hypospadias']
      ]
    },
    'breast-aesthetic': {
      title: '6. Breast & Aesthetic',
      topics: [
        ['clinical_stations/breast_aesthetic/breast_cancer_reconstruction', 'Breast Cancer and Reconstruction'],
        ['clinical_stations/breast_aesthetic/breast_reduction', 'Breast Reduction'],
        ['clinical_stations/breast_aesthetic/mastopexy', 'Mastopexy'],
        ['clinical_stations/breast_aesthetic/breast_augmentation_implants', 'Breast Augmentation / Implants'],
        ['clinical_stations/breast_aesthetic/gynaecomastia', 'Gynaecomastia'],
        ['clinical_stations/breast_aesthetic/abdominoplasty', 'Abdominoplasty'],
        ['clinical_stations/breast_aesthetic/rhinoplasty', 'Rhinoplasty'],
        ['clinical_stations/breast_aesthetic/pinnaplasty', 'Pinnaplasty']
      ]
    },
    'burns': {
      title: '7. Burns',
      topics: [
        ['clinical_stations/emergencies/resus_burn', 'Resuscitation Burn'],
        ['clinical_stations/emergencies/electric_burn', 'Electric Burn'],
        ['clinical_stations/emergencies/chemical_burn', 'Chemical Burn'],
        ['clinical_stations/burns/major_paediatric_burn', 'Major Paediatric Burn'],
        ['clinical_stations/burns/minor_paediatric_burn', 'Minor Paediatric Burn / TSS'],
        ['clinical_stations/burns/burn_scars', 'Burn Scars'],
        ['clinical_stations/burns/burn_dressings_skin_substitutes', 'Burn Dressings and Skin Substitutes']
      ]
    },
    'call-the-boss': {
      title: 'Call-The-Boss',
      topics: [
        ['communication/call_boss/call_boss_resus_burn', 'Resus Burn'],
        ['communication/call_boss/call_boss_electric_burn', 'Electric Burn'],
        ['communication/call_boss/call_boss_chemical_hf', 'Chemical / HF Burn'],
        ['communication/call_boss/call_boss_toxic_shock', 'Toxic Shock Syndrome'],
        ['communication/call_boss/call_boss_open_fracture', 'Open Fracture'],
        ['communication/call_boss/call_boss_compartment_syndrome', 'Compartment Syndrome'],
        ['communication/call_boss/call_boss_compromised_flap', 'Compromised Flap'],
        ['communication/call_boss/call_boss_nec_fasc', 'Necrotising Fasciitis'],
        ['communication/call_boss/call_boss_finger_replant', 'Finger Replant / Revascularisation'],
        ['communication/call_boss/call_boss_macro_replant', 'Macro Replant']
      ]
    },
    'consent': {
      title: 'Consent',
      topics: [
        ['communication/consent/consent_breast_reduction', 'Breast Reduction'],
        ['communication/consent/consent_diep', 'DIEP'],
        ['communication/consent/consent_skin_lesion', 'Skin Lesion Excision +/- Reconstruction'],
        ['communication/consent/consent_pinnaplasty', 'Pinnaplasty'],
        ['communication/consent/consent_pretibial', 'Pretibial Laceration'],
        ['communication/consent/consent_tendon_nerve', 'Tendon / Digital Nerve Repair']
      ]
    },
    'structured-topics': {
      title: 'Structured Interview',
      topics: [
        ['structured_interview/structured_research', 'Research'],
        ['structured_interview/structured_audit', 'Audit'],
        ['structured_interview/structured_teaching', 'Teaching'],
        ['structured_interview/structured_ethics', 'Ethics'],
        ['structured_interview/structured_risk_management', 'Risk Management'],
        ['structured_interview/structured_consent', 'Consent']
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
      const easyPromptFile = `prompts/${folder}/easy_${folderName}_1.txt`;
      const isLocked = !canAccessScenario(easyPromptFile);

      if (isLocked) {
        html += `<div class="topic-item locked" onclick="alert('🔒 This scenario requires a Premium subscription.\\n\\nUpgrade to access all scenarios.')">🔒 ${title}</div>`;
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

  // Populate headings
  headingsGrid.innerHTML = '';
  const headings = [
    { id: 'clinical', icon: '📋', name: 'Clinical Stations' },
    { id: 'communication', icon: '💬', name: 'Communication' },
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

  // Populate subheadings based on heading
  subheadingsGrid.innerHTML = '';

  const subheadingsData = {
    clinical: [
      { id: 'emergencies', name: '🚨 Emergencies' },
      { id: 'hand-trauma', name: '✋ Hand Trauma' },
      { id: 'elective-hand', name: '🤚 Elective Hand' },
      { id: 'skin-cancer', name: '🔬 Skin Cancer' },
      { id: 'miscellaneous', name: '📦 Miscellaneous' },
      { id: 'breast-aesthetic', name: '💄 Breast & Aesthetic' },
      { id: 'burns', name: '🔥 Burns' }
    ],
    communication: [
      { id: 'call-the-boss', name: '📞 Call-The-Boss' },
      { id: 'consent', name: '✍️ Consent' }
    ],
    structured: [
      { id: 'structured-topics', name: '📝 Interview Topics' }
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

  // Populate topics - using the same data from topicsData
  topicsGrid.innerHTML = '';

  const topicsData = {
    'emergencies': [
      ['clinical_stations/hand_trauma/digital_amputation', 'Digital Amputation'],
      ['clinical_stations/hand_trauma/macro_amputation', 'Macro Amputation'],
      ['clinical_stations/hand_trauma/degloving_devascularisation', 'Degloving / Devascularisation'],
      ['clinical_stations/hand_trauma/mangled_hand', 'Mangled Hand'],
      ['clinical_stations/emergencies/high_pressure_injection', 'High Pressure Injection Injury'],
      ['clinical_stations/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
      ['clinical_stations/miscellaneous/extravasation_injury', 'Extravasation Injury'],
      ['clinical_stations/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis', 'nec_fasc_1.jpg'],
      ['clinical_stations/hand_trauma/open_fracture', 'Open Fracture'],
      ['clinical_stations/emergencies/compartment_syndrome', 'Compartment Syndrome'],
      ['clinical_stations/miscellaneous/flap_at_risk', 'Flap at Risk']
    ],
    'hand-trauma': [
      ['clinical_stations/hand_trauma/fingertip_injury', 'Fingertip Injury'],
      ['clinical_stations/hand_trauma/closed_hand_fracture', 'Closed Hand Fracture'],
      ['clinical_stations/hand_trauma/tendon_injury', 'Tendon Injury'],
      ['clinical_stations/emergencies/fightbite_injury', 'Fightbite Injury'],
      ['clinical_stations/elective_hand/finger_deformities_ligamental', 'Finger Deformities and Ligamental Injuries']
    ],
    'elective-hand': [
      ['clinical_stations/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
      ['clinical_stations/elective_hand/compression_neuropathies', 'Compression Neuropathies'],
      ['clinical_stations/elective_hand/hand_deformities', 'Hand Deformities']
    ],
    'skin-cancer': [
      ['clinical_stations/skin_cancer/bcc_basic', 'BCC Basic'],
      ['clinical_stations/skin_cancer/scc_basic', 'SCC Basic'],
      ['clinical_stations/skin_cancer/mm_basic', 'MM Basic'],
      ['clinical_stations/miscellaneous/scalp', 'Scalp'],
      ['clinical_stations/miscellaneous/forehead_temple', 'Forehead / Temple'],
      ['clinical_stations/miscellaneous/eyelid', 'Eyelid'],
      ['clinical_stations/miscellaneous/nose', 'Nose'],
      ['clinical_stations/miscellaneous/lip', 'Lip'],
      ['clinical_stations/miscellaneous/ear', 'Ear'],
      ['clinical_stations/skin_cancer/subungual', 'Subungual'],
      ['clinical_stations/skin_cancer/mucosal', 'Mucosal'],
      ['clinical_stations/miscellaneous/fungating_massive', 'Fungating / Massive'],
      ['clinical_stations/skin_cancer/lymph_node_management', 'Lymph Node Management']
    ],
    'miscellaneous': [
      ['clinical_stations/miscellaneous/sternal_wound_dehiscence', 'Sternal Wound Dehiscence'],
      ['clinical_stations/miscellaneous/pressure_ulcer', 'Pressure Ulcer'],
      ['clinical_stations/miscellaneous/pretibial_laceration', 'Pretibial Laceration'],
      ['clinical_stations/burns/haemangioma_vascular', 'Haemangioma / Vascular Malformation'],
      ['clinical_stations/miscellaneous/chronic_lower_limb_infections', 'Chronic Lower Limb Infections'],
      ['clinical_stations/burns/cleft_lip_palate', 'Cleft Lip and Palate'],
      ['clinical_stations/burns/hypospadias', 'Hypospadias']
    ],
    'breast-aesthetic': [
      ['clinical_stations/breast_aesthetic/breast_cancer_reconstruction', 'Breast Cancer and Reconstruction'],
      ['clinical_stations/breast_aesthetic/breast_reduction', 'Breast Reduction'],
      ['clinical_stations/breast_aesthetic/mastopexy', 'Mastopexy'],
      ['clinical_stations/breast_aesthetic/breast_augmentation_implants', 'Breast Augmentation / Implants'],
      ['clinical_stations/breast_aesthetic/gynaecomastia', 'Gynaecomastia'],
      ['clinical_stations/breast_aesthetic/abdominoplasty', 'Abdominoplasty'],
      ['clinical_stations/breast_aesthetic/rhinoplasty', 'Rhinoplasty'],
      ['clinical_stations/breast_aesthetic/pinnaplasty', 'Pinnaplasty']
    ],
    'burns': [
      ['clinical_stations/emergencies/resus_burn', 'Resuscitation Burn'],
      ['clinical_stations/emergencies/electric_burn', 'Electric Burn'],
      ['clinical_stations/emergencies/chemical_burn', 'Chemical Burn'],
      ['clinical_stations/burns/major_paediatric_burn', 'Major Paediatric Burn'],
      ['clinical_stations/burns/minor_paediatric_burn', 'Minor Paediatric Burn / TSS'],
      ['clinical_stations/burns/burn_scars', 'Burn Scars'],
      ['clinical_stations/burns/burn_dressings_skin_substitutes', 'Burn Dressings and Skin Substitutes']
    ],
    'call-the-boss': [
      ['communication/call_boss/call_boss_resus_burn', 'Resus Burn'],
      ['communication/call_boss/call_boss_electric_burn', 'Electric Burn'],
      ['communication/call_boss/call_boss_chemical_hf', 'Chemical / HF Burn'],
      ['communication/call_boss/call_boss_toxic_shock', 'Toxic Shock Syndrome'],
      ['communication/call_boss/call_boss_open_fracture', 'Open Fracture'],
      ['communication/call_boss/call_boss_compartment_syndrome', 'Compartment Syndrome'],
      ['communication/call_boss/call_boss_compromised_flap', 'Compromised Flap'],
      ['communication/call_boss/call_boss_nec_fasc', 'Necrotising Fasciitis'],
      ['communication/call_boss/call_boss_finger_replant', 'Finger Replant / Revascularisation'],
      ['communication/call_boss/call_boss_macro_replant', 'Macro Replant']
    ],
    'consent': [
      ['communication/consent/consent_breast_reduction', 'Breast Reduction'],
      ['communication/consent/consent_diep', 'DIEP'],
      ['communication/consent/consent_skin_lesion', 'Skin Lesion Excision +/- Reconstruction'],
      ['communication/consent/consent_pinnaplasty', 'Pinnaplasty'],
      ['communication/consent/consent_pretibial', 'Pretibial Laceration'],
      ['communication/consent/consent_tendon_nerve', 'Tendon / Digital Nerve Repair']
    ],
    'structured-topics': [
      ['structured_interview/structured_research', 'Research'],
      ['structured_interview/structured_audit', 'Audit'],
      ['structured_interview/structured_teaching', 'Teaching'],
      ['structured_interview/structured_leadership', 'Leadership'],
      ['structured_interview/structured_portfolio', 'Portfolio'],
      ['structured_interview/structured_hot_topics', 'Hot Topics']
    ]
  };

  const topics = topicsData[subheadingId] || [];

  topics.forEach(topic => {
    const [folder, title, image] = topic;

    // Check if scenario is locked
    const folderName = folder.split('/').pop();
    const easyPromptFile = `prompts/${folder}/easy_${folderName}_1.txt`;
    const isLocked = !canAccessScenario(easyPromptFile);

    const card = document.createElement('div');
    card.className = isLocked ? 'mobile-scenario-card locked' : 'mobile-scenario-card';

    if (isLocked) {
      card.onclick = () => alert('🔒 This scenario requires a Premium subscription.\n\nUpgrade to access all scenarios.');
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
  // Extract just the folder name (last part after final slash) for the filename
  const folderName = topicFolder.split('/').pop();
  // Format: prompts/{topicFolder}/{difficulty}_{folderName}_1.txt
  const promptFile = `prompts/${topicFolder}/${selectedDifficulty}_${folderName}_1.txt`;

  // Check if user has access to this scenario
  if (!canAccessScenario(promptFile)) {
    alert('🔒 This scenario requires a Premium subscription.\n\nUpgrade to access all scenarios and features.');
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

  const interruptBtn = document.getElementById('interruptBtn');
  const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
  if (interruptBtn && mobileInterruptBtn) {
    mobileInterruptBtn.disabled = interruptBtn.disabled;
    mobileInterruptBtn.style.display = interruptBtn.style.display;
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
  const interruptBtn = document.getElementById('interruptBtn');
  const mobileInterruptBtn = document.getElementById('mobileInterruptBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const mobileDisconnectBtn = document.getElementById('mobileDisconnectBtn');

  if (mobileConnectBtn && connectBtn) {
    mobileConnectBtn.onclick = () => {
      console.log('[Mobile] Connect button clicked');
      connectBtn.click();
    };
  }
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
    document.getElementById('interruptBtn').style.display = 'none';
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


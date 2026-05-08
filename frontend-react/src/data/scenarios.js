/**
 * Scenario data — categories, subcategories, and topics.
 * Mirrors frontend/js/scenarios.js for the React sidebar.
 */

export const CATEGORIES = [
  { id: 'clinical', name: 'Clinical Stations', icon: '🏥' },
  { id: 'call-the-boss', name: 'Call-The-Boss', icon: '📞' },
  { id: 'consent', name: 'Consent', icon: '📝' },
  { id: 'structured', name: 'Structured Interview', icon: '📊' },
]

export const SUBCATEGORIES = {
  clinical: [
    { id: 'emergencies', name: 'Emergencies', icon: '🚨' },
    { id: 'hand-trauma', name: 'Hand Trauma', icon: '🩹' },
    { id: 'elective-hand', name: 'Elective Hand', icon: '✋' },
    { id: 'skin-cancer', name: 'Skin Cancer', icon: '🔬' },
    { id: 'breast-and-aesthetic', name: 'Breast & Aesthetics', icon: '💎' },
    { id: 'burns', name: 'Burns', icon: '🔥' },
    { id: 'lower-limb', name: 'Lower Limb', icon: '🦵' },
    { id: 'paediatrics', name: 'Paediatrics', icon: '👶' },
    { id: 'miscellaneous', name: 'Miscellaneous', icon: '📋' },
  ],
  'call-the-boss': [
    { id: 'call-the-boss-scenarios', name: 'Scenarios', icon: '📞' },
  ],
  consent: [
    { id: 'consent-hand-surgery', name: 'Hand Surgery', icon: '✋' },
    { id: 'consent-emergency-procedures', name: 'Emergency Procedures', icon: '🚨' },
    { id: 'consent-breast-and-aesthetic', name: 'Breast & Aesthetic', icon: '💎' },
    { id: 'consent-reconstructive', name: 'Reconstructive', icon: '🔧' },
    { id: 'consent-skin-surgery', name: 'Skin Surgery', icon: '🔬' },
  ],
  structured: [
    { id: 'structured-audit', name: 'Audit', icon: '📊' },
    { id: 'structured-research', name: 'Research', icon: '🔬' },
    { id: 'structured-teaching', name: 'Teaching', icon: '📚' },
    { id: 'structured-risk-and-safety', name: 'Risk & Safety', icon: '⚠️' },
    { id: 'structured-leadership', name: 'Leadership & Management', icon: '👔' },
    { id: 'structured-consent', name: 'Consent', icon: '📝' },
    { id: 'structured-ethics', name: 'Ethics', icon: '⚖️' },
  ],
}

// Clinical image map: promptFile -> imageFile (in public/images/)
export const IMAGE_MAP = {
  'clinical/emergencies/necrotising_fasciitis': 'nec_fasc_1.jpg',
}

// Topics: subcategoryId -> { title, topics: [[promptFile, displayName], ...] }
export const TOPICS = {
  emergencies: {
    title: 'Emergencies',
    topics: [
      ['clinical/emergencies/necrotising_fasciitis', 'Necrotising Fasciitis'],
      ['clinical/emergencies/flexor_sheath_infection', 'Flexor Sheath Infection'],
      ['clinical/emergencies/palmar_space_infection', 'Palmar Space Infection'],
      ['clinical/emergencies/hand_abscess', 'Hand Abscess'],
      ['clinical/emergencies/bite_wounds', 'Bite Wounds'],
      ['clinical/emergencies/septic_arthritis_hand', 'Septic Arthritis (Hand)'],
      ['clinical/emergencies/compartment_syndrome', 'Compartment Syndrome'],
      ['clinical/emergencies/electrical_injury_acute', 'Electrical Injury (Acute)'],
      ['clinical/emergencies/extravasation_injury', 'Extravasation Injury'],
      ['clinical/emergencies/high_pressure_injection_injury', 'High Pressure Injection Injury'],
    ],
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
      ['clinical/hand_trauma/mallet_finger', 'Mallet Finger'],
      ['clinical/hand_trauma/boutonniere_deformity', 'Boutonniere Deformity'],
      ['clinical/hand_trauma/thumb_ulnar_collateral_ligament', 'Thumb UCL Injury'],
    ],
  },
  'elective-hand': {
    title: 'Elective Hand',
    topics: [
      ['clinical/elective_hand/carpal_tunnel_syndrome', 'Carpal Tunnel Syndrome'],
      ['clinical/elective_hand/cubital_tunnel_syndrome', 'Cubital Tunnel Syndrome'],
      ['clinical/elective_hand/dupuytrens_disease', "Dupuytren's Disease"],
      ['clinical/elective_hand/trigger_finger', 'Trigger Finger'],
      ['clinical/elective_hand/de_quervains_tenosynovitis', "De Quervain's Tenosynovitis"],
    ],
  },
  'skin-cancer': {
    title: 'Skin Cancer',
    topics: [
      ['clinical/skin_cancer/basal_cell_carcinoma', 'Basal Cell Carcinoma (BCC)'],
      ['clinical/skin_cancer/squamous_cell_carcinoma', 'Squamous Cell Carcinoma (SCC)'],
      ['clinical/skin_cancer/melanoma', 'Melanoma'],
      ['clinical/skin_cancer/soft_tissue_sarcoma', 'Soft Tissue Sarcoma'],
      ['clinical/skin_cancer/sentinel_lymph_node_biopsy', 'Sentinel Lymph Node Biopsy'],
      ['clinical/skin_cancer/lymph_node_dissection', 'Lymph Node Dissection'],
    ],
  },
  'lower-limb': {
    title: 'Lower Limb',
    topics: [
      ['clinical/lower_limb/lower_limb_reconstruction', 'Lower Limb Reconstruction'],
      ['clinical/lower_limb/pressure_sores', 'Pressure Sores'],
      ['clinical/lower_limb/diabetic_foot', 'Diabetic Foot'],
      ['clinical/lower_limb/osteomyelitis_lower_limb', 'Osteomyelitis (Lower Limb)'],
    ],
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
      ['clinical/breast_and_aesthetic/capsular_contracture', 'Capsular Contracture'],
      ['clinical/breast_and_aesthetic/implant_complications', 'Implant Complications'],
    ],
  },
  burns: {
    title: 'Burns',
    topics: [
      ['clinical/burns/acute_burns_assessment', 'Acute Burns Assessment'],
      ['clinical/burns/chemical_burns', 'Chemical Burns'],
      ['clinical/burns/electrical_burns', 'Electrical Burns'],
      ['clinical/burns/inhalation_injury', 'Inhalation Injury'],
      ['clinical/burns/escharotomy', 'Escharotomy'],
      ['clinical/burns/burn_wound_management', 'Burn Wound Management'],
      ['clinical/burns/non_accidental_injury_burns', 'Non-Accidental Injury (Burns)'],
      ['clinical/burns/burn_scar_contracture', 'Burn Scar Contracture'],
    ],
  },
  paediatrics: {
    title: 'Paediatrics / Congenital',
    topics: [
      ['clinical/congenital/cleft_lip', 'Cleft Lip'],
      ['clinical/congenital/cleft_palate', 'Cleft Palate'],
      ['clinical/congenital/syndactyly', 'Syndactyly'],
      ['clinical/congenital/prominent_ears', 'Prominent Ears'],
      ['clinical/congenital/vascular_anomalies', 'Vascular Anomalies'],
      ['clinical/congenital/craniosynostosis', 'Craniosynostosis'],
      ['clinical/congenital/congenital_melanocytic_naevus', 'Congenital Melanocytic Naevus'],
    ],
  },
  miscellaneous: {
    title: 'Head & Neck / Microsurgery',
    topics: [
      ['clinical/head_and_neck/facial_laceration', 'Facial Laceration'],
      ['clinical/head_and_neck/lip_reconstruction', 'Lip Reconstruction'],
      ['clinical/head_and_neck/ear_reconstruction', 'Ear Reconstruction'],
      ['clinical/head_and_neck/eyelid_reconstruction', 'Eyelid Reconstruction'],
      ['clinical/head_and_neck/scalp_reconstruction', 'Scalp Reconstruction'],
      ['clinical/head_and_neck/facial_nerve_injury', 'Facial Nerve Injury'],
      ['clinical/microsurgery/anterolateral_thigh_flap', 'Anterolateral Thigh Flap'],
      ['clinical/microsurgery/radial_forearm_flap', 'Radial Forearm Flap'],
      ['clinical/microsurgery/latissimus_dorsi_flap', 'Latissimus Dorsi Flap'],
      ['clinical/microsurgery/fibula_free_flap', 'Fibula Free Flap'],
      ['clinical/microsurgery/diep_flap', 'DIEP Flap'],
      ['clinical/microsurgery/flap_failure_management', 'Flap Failure Management'],
    ],
  },
  'call-the-boss-scenarios': {
    title: 'Scenarios',
    topics: [
      ['call_the_boss/scenarios/major_burn', 'Major Burn'],
      ['call_the_boss/scenarios/replantation', 'Replantation'],
      ['call_the_boss/scenarios/necrotising_fasciitis', 'Necrotising Fasciitis'],
      ['call_the_boss/scenarios/open_fracture', 'Open Fracture'],
      ['call_the_boss/scenarios/compartment_syndrome', 'Compartment Syndrome'],
      ['call_the_boss/scenarios/electrical_injury', 'Electrical Injury'],
      ['call_the_boss/scenarios/free_flap_compromise', 'Free Flap Compromise'],
      ['call_the_boss/scenarios/flexor_sheath_infection', 'Flexor Sheath Infection'],
      ['call_the_boss/scenarios/bite_wound_hand', 'Bite Wound (Hand)'],
      ['call_the_boss/scenarios/high_pressure_injection', 'High Pressure Injection'],
      ['call_the_boss/scenarios/extravasation_injury', 'Extravasation Injury'],
      ['call_the_boss/scenarios/septic_arthritis', 'Septic Arthritis'],
      ['call_the_boss/scenarios/non_accidental_injury', 'Non-Accidental Injury'],
      ['call_the_boss/scenarios/facial_laceration_complex', 'Complex Facial Laceration'],
    ],
  },
  'consent-hand-surgery': {
    title: 'Hand Surgery',
    topics: [
      ['consent/hand_surgery/carpal_tunnel_release_consent', 'Carpal Tunnel Release'],
      ['consent/hand_surgery/dupuytrens_fasciectomy_consent', "Dupuytren's Fasciectomy"],
      ['consent/hand_surgery/nerve_repair_consent', 'Nerve Repair'],
      ['consent/hand_surgery/tendon_repair_consent', 'Tendon Repair'],
      ['consent/hand_surgery/trigger_finger_release_consent', 'Trigger Finger Release'],
    ],
  },
  'consent-emergency-procedures': {
    title: 'Emergency Procedures',
    topics: [
      ['consent/emergency_procedures/amputation_consent', 'Amputation'],
      ['consent/emergency_procedures/debridement_necrotising_fasciitis_consent', 'Debridement (Necrotising Fasciitis)'],
      ['consent/emergency_procedures/escharotomy_consent', 'Escharotomy'],
      ['consent/emergency_procedures/fasciotomy_consent', 'Fasciotomy'],
    ],
  },
  'consent-breast-and-aesthetic': {
    title: 'Breast & Aesthetic',
    topics: [
      ['consent/breast_and_aesthetic/abdominoplasty_consent', 'Abdominoplasty'],
      ['consent/breast_and_aesthetic/breast_reconstruction_consent', 'Breast Reconstruction'],
      ['consent/breast_and_aesthetic/breast_reduction_consent', 'Breast Reduction'],
      ['consent/breast_and_aesthetic/implant_surgery_consent', 'Implant Surgery'],
      ['consent/breast_and_aesthetic/liposuction_consent', 'Liposuction'],
    ],
  },
  'consent-reconstructive': {
    title: 'Reconstructive',
    topics: [
      ['consent/reconstructive/free_flap_consent', 'Free Flap'],
      ['consent/reconstructive/local_flap_reconstruction_consent', 'Local Flap Reconstruction'],
      ['consent/reconstructive/scar_revision_consent', 'Scar Revision'],
      ['consent/reconstructive/tissue_expansion_consent', 'Tissue Expansion'],
    ],
  },
  'consent-skin-surgery': {
    title: 'Skin Surgery',
    topics: [
      ['consent/skin_surgery/local_flap_consent', 'Skin lesion excision + local flap'],
      ['consent/skin_surgery/lymph_node_dissection_consent', 'Lymph Node Dissection'],
      ['consent/skin_surgery/sentinel_lymph_node_biopsy_consent', 'Sentinel Lymph Node Biopsy'],
      ['consent/skin_surgery/skin_graft_consent', 'Skin lesion excision + Skin graft'],
      ['consent/skin_surgery/skin_lesion_excision_consent', 'Skin lesion excision + direct closure'],
    ],
  },
  'structured-audit': {
    title: 'Audit',
    topics: [['structured_interview/audit', 'Audit']],
  },
  'structured-research': {
    title: 'Research',
    topics: [['structured_interview/research', 'Research']],
  },
  'structured-teaching': {
    title: 'Teaching',
    topics: [['structured_interview/teaching', 'Teaching']],
  },
  'structured-risk-and-safety': {
    title: 'Risk & Safety',
    topics: [['structured_interview/risk_and_safety', 'Risk & Safety']],
  },
  'structured-leadership': {
    title: 'Leadership & Management',
    topics: [['structured_interview/leadership', 'Leadership & Management']],
  },
  'structured-consent': {
    title: 'Consent',
    topics: [['structured_interview/consent_ethics', 'Consent']],
  },
  'structured-ethics': {
    title: 'Ethics',
    topics: [['structured_interview/ethics', 'Ethics']],
  },
}

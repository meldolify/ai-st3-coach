/**
 * Script to generate the new scenario folder structure and placeholder files
 * Run with: node scripts/generate-scenario-structure.js
 */

const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

// Template for placeholder files
const createPlaceholder = (heading, subheading, topic, difficulty) => {
  const difficultyNames = {
    easy: 'EASY',
    medium: 'MEDIUM',
    strict: 'STRICT'
  };

  return `SECTION 1
REALTIME CORE BEHAVIOURS

(GLOBAL – SHARED BY ALL CASES AND DIFFICULTIES)

[PLACEHOLDER - Core behaviours to be added]

SECTION 2
DIFFICULTY AND PERSONALITY LAYER

${difficultyNames[difficulty]}

[PLACEHOLDER - Personality layer to be added]

SECTION 3
CLINICAL SCENARIO BLOCK

(CASE-SPECIFIC)

SCENARIO TITLE

${topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}

HEADING: ${heading.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
SUBHEADING: ${subheading.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}

[PLACEHOLDER - Clinical scenario to be added]

END OF SCENARIO CRITERIA

[PLACEHOLDER - End criteria to be added]
`;
};

// Complete hierarchy structure
const hierarchy = {
  clinical: {
    breast_and_aesthetic: [
      'breast_reconstruction',
      'breast_reduction',
      'mastopexy',
      'gynaecomastia',
      'liposuction',
      'abdominoplasty',
      'blepharoplasty',
      'otoplasty',
      'rhinoplasty',
      'brachioplasty',
      'thighplasty',
      'fat_necrosis',
      'capsular_contracture',
      'implant_complications',
      'lymphoedema'
    ],
    burns: [
      'acute_burns_assessment',
      'fluid_resuscitation',
      'escharotomy',
      'burn_wound_management',
      'toxic_epidermal_necrolysis',
      'chemical_burns',
      'electrical_burns',
      'inhalation_injury',
      'non_accidental_injury_burns',
      'burn_scar_contracture'
    ],
    elective_hand: [
      'carpal_tunnel_syndrome',
      'cubital_tunnel_syndrome',
      'trigger_finger',
      'dupuytrens_disease',
      'de_quervains_tenosynovitis',
      'ganglion_cyst',
      'mucous_cyst',
      'rheumatoid_hand',
      'osteoarthritis_hand',
      'thumb_cmc_arthritis',
      'kienbocks_disease',
      'scaphoid_non_union',
      'ulnar_impaction',
      'madelungs_deformity'
    ],
    emergencies: [
      'necrotising_fasciitis',
      'compartment_syndrome',
      'high_pressure_injection_injury',
      'extravasation_injury',
      'septic_arthritis_hand',
      'flexor_sheath_infection',
      'palmar_space_infection',
      'hand_abscess',
      'bite_wounds',
      'electrical_injury_acute'
    ],
    hand_trauma: [
      'flexor_tendon_injury',
      'extensor_tendon_injury',
      'digital_nerve_injury',
      'replantation',
      'fingertip_amputation',
      'nail_bed_injury',
      'mallet_finger',
      'boutonniere_deformity',
      'fracture_dislocations_hand',
      'scaphoid_fracture',
      'distal_radius_fracture',
      'metacarpal_fracture',
      'phalangeal_fracture',
      'thumb_ulnar_collateral_ligament',
      'complex_hand_trauma'
    ],
    lower_limb: [
      'diabetic_foot',
      'chronic_leg_ulcer',
      'pressure_sores',
      'lower_limb_reconstruction',
      'free_flap_lower_limb',
      'skin_graft_lower_limb',
      'osteomyelitis_lower_limb',
      'peripheral_vascular_disease'
    ],
    skin_cancer: [
      'basal_cell_carcinoma',
      'squamous_cell_carcinoma',
      'melanoma',
      'merkel_cell_carcinoma',
      'dermatofibrosarcoma',
      'soft_tissue_sarcoma',
      'sentinel_lymph_node_biopsy',
      'lymph_node_dissection',
      'moh_surgery_defects',
      'skin_lesion_assessment'
    ],
    head_and_neck: [
      'facial_laceration',
      'facial_nerve_injury',
      'parotid_injury',
      'nasal_fracture',
      'orbital_fracture',
      'mandible_fracture',
      'maxillary_fracture',
      'frontal_sinus_fracture',
      'scalp_reconstruction',
      'ear_reconstruction',
      'lip_reconstruction',
      'eyelid_reconstruction'
    ],
    congenital: [
      'cleft_lip',
      'cleft_palate',
      'syndactyly',
      'polydactyly',
      'congenital_hand_anomaly',
      'hypospadias',
      'craniosynostosis',
      'vascular_anomalies',
      'congenital_melanocytic_naevus',
      'prominent_ears'
    ],
    microsurgery: [
      'free_flap_principles',
      'radial_forearm_flap',
      'anterolateral_thigh_flap',
      'latissimus_dorsi_flap',
      'diep_flap',
      'fibula_free_flap',
      'flap_failure_management',
      'microvascular_anastomosis',
      'nerve_repair_reconstruction'
    ]
  },
  call_the_boss: {
    scenarios: [
      'necrotising_fasciitis',
      'compartment_syndrome',
      'replantation',
      'free_flap_compromise',
      'major_burn',
      'high_pressure_injection',
      'extravasation_injury',
      'flexor_sheath_infection',
      'septic_arthritis',
      'cauda_equina',
      'open_fracture',
      'facial_laceration_complex',
      'bite_wound_hand',
      'electrical_injury',
      'non_accidental_injury'
    ]
  },
  consent: {
    breast_and_aesthetic: [
      'breast_reconstruction_consent',
      'breast_reduction_consent',
      'abdominoplasty_consent',
      'liposuction_consent',
      'implant_surgery_consent'
    ],
    hand_surgery: [
      'carpal_tunnel_release_consent',
      'trigger_finger_release_consent',
      'dupuytrens_fasciectomy_consent',
      'tendon_repair_consent',
      'nerve_repair_consent'
    ],
    skin_surgery: [
      'skin_lesion_excision_consent',
      'skin_graft_consent',
      'local_flap_consent',
      'sentinel_lymph_node_biopsy_consent',
      'lymph_node_dissection_consent'
    ],
    emergency_procedures: [
      'debridement_necrotising_fasciitis_consent',
      'fasciotomy_consent',
      'washout_and_debridement_consent',
      'escharotomy_consent',
      'amputation_consent'
    ],
    reconstructive: [
      'free_flap_consent',
      'local_flap_reconstruction_consent',
      'tissue_expansion_consent',
      'scar_revision_consent'
    ]
  },
  structured_interview: {
    audit: ['focused_interview'],
    clinical_governance: ['focused_interview'],
    complaints: ['focused_interview'],
    consent_ethics: ['focused_interview'],
    ethics: ['focused_interview'],
    research: ['focused_interview'],
    risk_management: ['focused_interview'],
    teaching: ['focused_interview']
  }
};

const difficulties = ['easy', 'medium', 'strict'];

function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function createPlaceholderFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created file: ${filePath}`);
    return true;
  }
  return false;
}

function generateStructure() {
  let totalDirs = 0;
  let totalFiles = 0;

  // Create main prompts directory
  createDirectoryIfNotExists(PROMPTS_DIR);

  for (const [heading, subheadings] of Object.entries(hierarchy)) {
    const headingDir = path.join(PROMPTS_DIR, heading);
    createDirectoryIfNotExists(headingDir);
    totalDirs++;

    for (const [subheading, topics] of Object.entries(subheadings)) {
      const subheadingDir = path.join(headingDir, subheading);
      createDirectoryIfNotExists(subheadingDir);
      totalDirs++;

      for (const topic of topics) {
        const topicDir = path.join(subheadingDir, topic);
        createDirectoryIfNotExists(topicDir);
        totalDirs++;

        // Create placeholder files for each difficulty
        for (const difficulty of difficulties) {
          const fileName = `${difficulty}_${heading}_${topic}_1.txt`;
          const filePath = path.join(topicDir, fileName);
          const content = createPlaceholder(heading, subheading, topic, difficulty);

          if (createPlaceholderFile(filePath, content)) {
            totalFiles++;
          }
        }
      }
    }
  }

  console.log('\n=== Generation Complete ===');
  console.log(`Total directories created: ${totalDirs}`);
  console.log(`Total files created: ${totalFiles}`);
}

// Run the script
generateStructure();

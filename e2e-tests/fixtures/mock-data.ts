/**
 * Test scenario data aligned with FREE_TIER_SCENARIOS from frontend/config.js:42-62.
 */
export const FREE_SCENARIOS = {
  necFasc: {
    title: 'Necrotising Fasciitis',
    promptFile: 'prompts/clinical/emergencies/necrotising_fasciitis/easy_clinical_necrotising_fasciitis_1.txt',
    imageFile: null,
    category: 'Clinical Stations',
  },
  majorBurn: {
    title: 'Major Burn',
    promptFile: 'prompts/call_the_boss/scenarios/major_burn/easy_call_the_boss_major_burn_1.txt',
    imageFile: null,
    category: 'Call-The-Boss',
  },
  carpalTunnel: {
    title: 'Carpal Tunnel Release Consent',
    promptFile: 'prompts/consent/hand_surgery/carpal_tunnel_release_consent/easy_consent_carpal_tunnel_release_consent_1.txt',
    imageFile: null,
    category: 'Consent',
  },
} as const;

/** A scenario path that is NOT in FREE_TIER_SCENARIOS (premium only). */
export const PREMIUM_SCENARIO = {
  title: 'Breast Augmentation Consent',
  promptFile: 'prompts/consent/breast_aesthetic/breast_augmentation_consent/easy_consent_breast_augmentation_consent_1.txt',
  imageFile: null,
  category: 'Consent',
};

/**
 * Build simulation params ready for sessionStorage.
 */
export function createSimulationParams(
  scenario: { title: string; promptFile: string; imageFile: string | null; category: string },
  difficulty: 'easy' | 'medium' | 'strict' = 'easy',
  mode: 'practice' | 'mock-exam' = 'practice'
) {
  return {
    scenario,
    difficulty,
    mode,
    mockExamType: mode === 'mock-exam' ? 'by-station' : null,
    returnPage: 'scenarioSelection',
  };
}

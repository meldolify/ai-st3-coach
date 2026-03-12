/**
 * Test scenario data aligned with FREE_TIER_SCENARIOS from frontend/config.js:42-62.
 */
export const FREE_SCENARIOS = {
  necFasc: {
    title: 'Necrotising Fasciitis',
    promptFile: 'clinical/emergencies/necrotising_fasciitis',
    imageFile: null,
    category: 'Clinical Stations',
  },
  majorBurn: {
    title: 'Major Burn',
    promptFile: 'call_the_boss/scenarios/major_burn',
    imageFile: null,
    category: 'Call-The-Boss',
  },
  carpalTunnel: {
    title: 'Carpal Tunnel Release Consent',
    promptFile: 'consent/hand_surgery/carpal_tunnel_release_consent',
    imageFile: null,
    category: 'Consent',
  },
} as const;

/** A scenario path that is NOT in FREE_TIER_SCENARIOS (premium only). */
export const PREMIUM_SCENARIO = {
  title: 'Breast Reconstruction Consent',
  promptFile: 'consent/breast_and_aesthetic/breast_reconstruction_consent',
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
    returnPage: '/scenarios',
  };
}

/**
 * Centralized data-testid selectors for E2E tests (React SPA).
 * Update these when the DOM changes rather than fixing individual tests.
 */
export const SELECTORS = {
  landing: {
    nav: '[data-testid="landing-nav"]',
    heroSection: '[data-testid="hero-section"]',
    pricingSection: '[data-testid="pricing-section"]',
    navExplore: '[data-testid="nav-explore"]',
    navLogin: '[data-testid="nav-login"]',
    navSignup: '[data-testid="nav-signup"]',
  },
  auth: {
    page: '[data-testid="auth-page"]',
    googleOAuth: '[data-testid="google-oauth-btn"]',
  },
  scenarios: {
    flow: '[data-testid="scenario-flow"]',
    specialtySelection: '[data-testid="specialty-selection"]',
    difficultySelection: '[data-testid="difficulty-selection"]',
    modeSelection: '[data-testid="mode-selection"]',
    scenarioSelection: '[data-testid="scenario-selection"]',
  },
  simulation: {
    room: '[data-testid="sim-room"]',
    voiceOrb: '[data-testid="voice-orb"]',
    sessionToggle: '[data-testid="session-toggle"]',
    transcriptPanel: '[data-testid="transcript-panel"]',
    sidebar: '[data-testid="sidebar"]',
    header: '[data-testid="sim-header"]',
    timer: '[data-testid="session-timer"]',
    feedbackButton: '[data-testid="feedback-button"]',
  },
  upgrade: {
    modal: '[data-testid="upgrade-modal"]',
  },
  appNav: '[data-testid="app-nav"]',
} as const;

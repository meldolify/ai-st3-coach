/**
 * Centralized CSS selectors for E2E tests.
 * Update these when the DOM changes rather than fixing individual tests.
 */
export const SELECTORS = {
  // Landing page (index.html #landingPage)
  landing: {
    page: '#landingPage',
    heroTagline: '.hero-tagline',
    heroPrimaryBtn: '#heroPrimaryBtn',
    navLinksGuest: '#navLinksGuest',
    navLinksUser: '#navLinksUser',
    loginBtn: '#navLinksGuest button:nth-child(3)', // "Log In"
    signupBtn: '#navLinksGuest button:nth-child(4)', // "Sign Up"
    exploreBtn: '#navLinksGuest button:nth-child(2)', // "Explore without login"
  },

  // Auth modal
  auth: {
    modal: '#authPage',
    emailInput: '#authEmail',
    passwordInput: '#authPassword',
  },

  // Upgrade modal
  upgrade: {
    modal: '#upgradeModal',
    title: '#upgradeModalTitle',
    message: '#upgradeModalMessage',
    subscribeBtn: '.btn-upgrade',
    closeBtn: '#upgradeModal .modal-close',
    maybeLaterBtn: '.btn-cancel',
  },

  // Scenario selection (index.html #scenarioSelection)
  scenarios: {
    page: '#scenarioSelection',
  },

  // Simulation room (simulation.html)
  simulation: {
    room: '#simulationRoom',
    voiceOrb: '#voiceOrb',
    aiStatus: '#aiStatus',
    scenarioTitle: '#currentScenarioTitle',
    scenarioCategory: '#currentScenarioCategory',
    connectBtn: '#connectBtn',
    disconnectBtn: '#disconnectBtn',
    interruptBtn: '#interruptBtn',
    sidebar: '#simSidebar',
    sidebarToggle: '#sidebarToggle',
    transcript: '#transcriptMessages',
    clinicalImage: '#clinicalImage',
    sessionStatus: '#sessionStatus',
    exitBtn: '.sidebar-back-btn',
    mockExamTimer: '#mockExamTimer',
    timerMinutes: '#timerMinutes',
    timerSeconds: '#timerSeconds',
    personaName: '#personaName',
    personaTitle: '#personaTitle',
  },
} as const;

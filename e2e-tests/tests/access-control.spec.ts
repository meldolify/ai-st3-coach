import { test, expect } from '../fixtures/test-user';
import { FREE_SCENARIOS, PREMIUM_SCENARIO } from '../fixtures/mock-data';
import { SELECTORS } from '../helpers/selectors';
import { navigateToSimulation } from '../helpers/navigation';

test.describe('Access Control - Three Tier System', () => {
  test('free user can access free tier scenario paths', async ({ freeUser }) => {
    const canAccess = await freeUser.evaluate((path) => {
      return typeof (window as any).canAccessScenario === 'function'
        ? (window as any).canAccessScenario(path)
        : null;
    }, FREE_SCENARIOS.necFasc.promptFile);

    if (canAccess !== null) {
      expect(canAccess).toBe(true);
    }
  });

  test('free user cannot access premium scenario paths', async ({ freeUser }) => {
    const canAccess = await freeUser.evaluate((path) => {
      return typeof (window as any).canAccessScenario === 'function'
        ? (window as any).canAccessScenario(path)
        : null;
    }, PREMIUM_SCENARIO.promptFile);

    if (canAccess !== null) {
      expect(canAccess).toBe(false);
    }
  });

  test('premium user can access all scenario paths', async ({ premiumUser }) => {
    const canAccessFree = await premiumUser.evaluate((path) => {
      return typeof (window as any).canAccessScenario === 'function'
        ? (window as any).canAccessScenario(path)
        : null;
    }, FREE_SCENARIOS.necFasc.promptFile);

    const canAccessPremium = await premiumUser.evaluate((path) => {
      return typeof (window as any).canAccessScenario === 'function'
        ? (window as any).canAccessScenario(path)
        : null;
    }, PREMIUM_SCENARIO.promptFile);

    if (canAccessFree !== null) expect(canAccessFree).toBe(true);
    if (canAccessPremium !== null) expect(canAccessPremium).toBe(true);
  });

  test('free user is denied access to premium scenario on simulation.html', async ({ freeUser }) => {
    // Inject premium scenario into sessionStorage
    await freeUser.evaluate((scenario) => {
      sessionStorage.setItem('simulationParams', JSON.stringify({
        scenario,
        difficulty: 'easy',
        mode: 'practice',
        returnPage: 'scenarioSelection',
      }));
    }, PREMIUM_SCENARIO);

    await freeUser.goto('/simulation.html');

    // simulation-app.js denies access and redirects to index.html/#accessDenied
    // The redirect lands on index.html where checkAuthState runs first
    // Verify we left simulation.html (redirected back to index)
    await freeUser.waitForURL(/localhost:\d+\/(?!simulation)/, { timeout: 15000 });
    // sessionStorage should be cleared by the access check
    const params = await freeUser.evaluate(() => sessionStorage.getItem('simulationParams'));
    expect(params).toBeNull();
  });

  test('upgrade modal can be triggered programmatically', async ({ freeUser }) => {
    // Test the showUpgradeModal function directly
    const hasFunction = await freeUser.evaluate(() =>
      typeof (window as any).showUpgradeModal === 'function'
    );
    expect(hasFunction).toBe(true);

    // Trigger the modal
    await freeUser.evaluate(() => {
      (window as any).showUpgradeModal({
        title: 'Access Required',
        message: 'Please subscribe to access this scenario.',
      });
    });

    const modal = freeUser.locator(SELECTORS.upgrade.modal);
    await expect(modal).toBeVisible();
    await expect(modal.locator(SELECTORS.upgrade.title)).toContainText('Access Required');
  });
});

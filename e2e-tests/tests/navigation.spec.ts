import { test, expect } from '@playwright/test';
import { navigateToSimulation, clearSimulationParams } from '../helpers/navigation';
import { setTierViaRoute } from '../helpers/tier-control';
import { FREE_SCENARIOS, createSimulationParams } from '../fixtures/mock-data';
import { SELECTORS } from '../helpers/selectors';

test.describe('Multi-Page Navigation', () => {
  test('should show specialty selection via browseAsGuest flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Click "Explore without login" to enter guest browse mode
    await page.locator('#navLinksGuest button:nth-child(2)').click();
    await expect(page.locator('#specialtySelection')).toBeVisible();
  });

  test('should transfer state to simulation.html via sessionStorage', async ({ page }) => {
    await setTierViaRoute(page, 'premium');

    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    await expect(page).toHaveURL(/simulation\.html/);

    const stored = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem('simulationParams')!)
    );
    expect(stored.scenario.title).toBe('Necrotising Fasciitis');
    expect(stored.difficulty).toBe('easy');
    expect(stored.mode).toBe('practice');
  });

  test('should display scenario title in simulation room', async ({ page }) => {
    await setTierViaRoute(page, 'premium');

    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    const title = page.locator(SELECTORS.simulation.scenarioTitle);
    await expect(title).toContainText('Necrotising Fasciitis');
  });

  test('should redirect to index when simulation has no params', async ({ page }) => {
    await page.goto('/simulation.html');
    // Without params, simulation-app.js redirects back
    await page.waitForURL(/(localhost:\d+\/|index\.html)/, { timeout: 10000 });
  });

  test('should navigate back to index on exit (no active session)', async ({ page }) => {
    await setTierViaRoute(page, 'premium');

    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    await page.locator(SELECTORS.simulation.exitBtn).click();
    await page.waitForURL(/.*#scenarioSelection/, { timeout: 10000 });
  });

  test.afterEach(async ({ page }) => {
    await clearSimulationParams(page);
  });
});

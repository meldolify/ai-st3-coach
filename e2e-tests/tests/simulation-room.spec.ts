import { test, expect } from '@playwright/test';
import { navigateToSimulation, clearSimulationParams } from '../helpers/navigation';
import { setTierViaRoute } from '../helpers/tier-control';
import { FREE_SCENARIOS, createSimulationParams } from '../fixtures/mock-data';
import { SELECTORS } from '../helpers/selectors';

test.describe('Simulation Room', () => {
  test.beforeEach(async ({ page }) => {
    await setTierViaRoute(page, 'premium');
  });

  test.afterEach(async ({ page }) => {
    await clearSimulationParams(page);
  });

  test('should load room with scenario info', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    await expect(page.locator(SELECTORS.simulation.room)).toBeVisible();
    await expect(page.locator(SELECTORS.simulation.scenarioTitle)).toContainText('Necrotising Fasciitis');
    await expect(page.locator(SELECTORS.simulation.scenarioCategory)).toContainText('Clinical');
  });

  test('should display voice orb', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    await expect(page.locator(SELECTORS.simulation.voiceOrb)).toBeVisible();
  });

  test('should show control buttons', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    const connectBtn = page.locator(SELECTORS.simulation.connectBtn);
    await expect(connectBtn).toBeVisible();

    const disconnectBtn = page.locator(SELECTORS.simulation.disconnectBtn);
    await expect(disconnectBtn).toBeVisible();
    await expect(disconnectBtn).toBeDisabled();
  });

  test('should show sidebar with categories', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    const sidebar = page.locator(SELECTORS.simulation.sidebar);
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator('.nav-category-btn')).toHaveCount(4);
  });

  test('should show AI status as ready', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    const status = page.locator(SELECTORS.simulation.aiStatus);
    await expect(status).toBeVisible();
    await expect(status).toContainText('Ready');
  });

  test('should have transcript area', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    const transcript = page.locator(SELECTORS.simulation.transcript);
    await expect(transcript).toBeVisible();
    await expect(transcript).toContainText('Conversation will appear here');
  });

  test('should load different scenarios correctly', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.majorBurn);
    await navigateToSimulation(page, params);

    await expect(page.locator(SELECTORS.simulation.scenarioTitle)).toContainText('Major Burn');
    await expect(page.locator(SELECTORS.simulation.scenarioCategory)).toContainText('Call');
  });
});

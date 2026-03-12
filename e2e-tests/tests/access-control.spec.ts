import { test, expect } from '../fixtures/test-user'
import { SELECTORS } from '../helpers/selectors'
import { navigateToSimulation } from '../helpers/navigation'
import { FREE_SCENARIOS, PREMIUM_SCENARIO, createSimulationParams } from '../fixtures/mock-data'
import { setTestTier } from '../helpers/tier-control'

/**
 * Access control tests — verifies three-tier scenario gating.
 *
 * Uses freeUser/premiumUser fixtures from test-user.ts which set
 * window.__TEST_TIER__ via addInitScript before navigation.
 *
 * Access flow (subscription.js):
 *   - 'premium' tier: canAccessScenario() returns true for all scenarios
 *   - 'free' tier: canAccessScenario() returns true only for FREE_TIER_SCENARIOS
 *   - 'unlogged' tier: canAccessScenario() returns false for all
 *
 * When SimulationRoom denies access, it redirects to /scenarios (SimulationRoom.jsx:84).
 * The UpgradeModal is shown from ScenarioSelection when a locked scenario card is clicked.
 */

test.describe('Access Control', () => {

  test('free user can access free-tier scenario', async ({ freeUser: page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc)
    await navigateToSimulation(page, params)

    // Should stay on simulation page and render the room
    const room = page.locator(SELECTORS.simulation.room)
    await expect(room).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveURL(/\/simulation/)
  })

  test('free user accessing premium scenario is redirected', async ({ freeUser: page }) => {
    const params = createSimulationParams(PREMIUM_SCENARIO)
    await navigateToSimulation(page, params)

    // SimulationRoom.jsx — denied access redirects to /scenarios
    await expect(page).toHaveURL(/\/scenarios/, { timeout: 10_000 })
  })

  test('premium user can access any scenario', async ({ premiumUser: page }) => {
    const params = createSimulationParams(PREMIUM_SCENARIO)
    await navigateToSimulation(page, params)

    // Should stay on simulation page and render the room
    const room = page.locator(SELECTORS.simulation.room)
    await expect(room).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveURL(/\/simulation/)
  })

  test('unlogged user is redirected from simulation', async ({ page }) => {
    // Set tier to 'unlogged' — canAccessScenario returns false for everything
    await setTestTier(page, 'unlogged')

    const params = createSimulationParams(FREE_SCENARIOS.necFasc)
    await navigateToSimulation(page, params)

    // Should be redirected away from simulation to /scenarios
    await expect(page).toHaveURL(/\/scenarios/, { timeout: 10_000 })
  })
})

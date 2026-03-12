import { test, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'
import { clearSimulationParams } from '../helpers/navigation'
import { FREE_SCENARIOS, createSimulationParams } from '../fixtures/mock-data'

const DEFAULT_PARAMS = createSimulationParams(FREE_SCENARIOS.necFasc, 'easy', 'practice')

/**
 * Helper: set tier override via addInitScript (persists across navigations)
 * then navigate to /simulation with params in sessionStorage.
 */
async function setupSimulation(page: import('@playwright/test').Page, params = DEFAULT_PARAMS, tier = 'free') {
  // addInitScript runs before every navigation's page load
  await page.addInitScript((t) => {
    ;(window as any).__TEST_TIER__ = t
  }, tier)

  // Need a page context to set sessionStorage
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await page.evaluate((p) => {
    sessionStorage.setItem('simulationParams', JSON.stringify(p))
  }, params)
  await page.goto('/simulation')
  await page.waitForLoadState('domcontentloaded')
}

test.describe('Simulation Room', () => {
  // Desktop + mobile layouts both render (CSS controls visibility),
  // so some data-testid selectors match 2 elements. Use .first() for
  // the visible desktop instance at the 1280×720 test viewport.

  test('room renders with key components', async ({ page }) => {
    await setupSimulation(page)

    await expect(page.locator(SELECTORS.simulation.room)).toBeVisible({ timeout: 10000 })
    await expect(page.locator(SELECTORS.simulation.sessionToggle).first()).toBeVisible()
  })

  test('header shows scenario title', async ({ page }) => {
    await setupSimulation(page)

    const header = page.locator(SELECTORS.simulation.header)
    await expect(header).toBeVisible({ timeout: 10000 })
    await expect(header).toContainText('Necrotising Fasciitis')
  })

  test('session toggle is present', async ({ page }) => {
    await setupSimulation(page)

    const toggle = page.locator(SELECTORS.simulation.sessionToggle).first()
    await expect(toggle).toBeVisible({ timeout: 10000 })
  })

  test('sidebar renders', async ({ page }) => {
    await setupSimulation(page)

    const sidebar = page.locator(SELECTORS.simulation.sidebar)
    await expect(sidebar).toBeAttached({ timeout: 10000 })
  })

  test('exit button navigates back to /scenarios', async ({ page }) => {
    await setupSimulation(page)

    await expect(page.locator(SELECTORS.simulation.room)).toBeVisible({ timeout: 10000 })

    const exitBtn = page.getByRole('button', { name: /exit/i }).first()
    await expect(exitBtn).toBeVisible()
    await exitBtn.click()

    await expect(page).toHaveURL(/\/scenarios/, { timeout: 5000 })
  })

  test('without simulationParams, shows empty state', async ({ page }) => {
    // Set tier but NO simulation params
    await page.addInitScript(() => {
      ;(window as any).__TEST_TIER__ = 'free'
    })
    // Clear any stale params then navigate
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => sessionStorage.removeItem('simulationParams'))
    await page.goto('/simulation', { waitUntil: 'domcontentloaded' })

    // Room renders but with "No scenario selected" placeholder
    await expect(page.locator(SELECTORS.simulation.room)).toBeVisible({ timeout: 10000 })
    await expect(page.locator(SELECTORS.simulation.header)).toContainText('No scenario selected')
  })

  test('timer is present in header', async ({ page }) => {
    await setupSimulation(page)

    const timer = page.locator(SELECTORS.simulation.timer)
    await expect(timer).toBeVisible({ timeout: 10000 })
    await expect(timer).toHaveText(/\d{1,2}:\d{2}/)
  })

  test('transcript panel is visible', async ({ page }) => {
    await setupSimulation(page)

    const transcript = page.locator(SELECTORS.simulation.transcriptPanel).first()
    await expect(transcript).toBeVisible({ timeout: 10000 })
  })
})

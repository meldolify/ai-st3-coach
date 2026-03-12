import { test, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'
import { navigateToSimulation } from '../helpers/navigation'
import { FREE_SCENARIOS, createSimulationParams } from '../fixtures/mock-data'

/**
 * Responsive layout tests — run ONLY on mobile and tablet projects.
 *
 * The React SPA uses a single render with CSS breakpoints:
 *   - Mobile (<1024px): `.lg:hidden` elements visible, `.hidden.lg:flex` hidden
 *   - Desktop (>=1024px): `.hidden.lg:flex` visible, `.lg:hidden` hidden
 *
 * Projects: mobile (Pixel 5, 393x851), tablet (Galaxy Tab S4, 712x1138).
 * Matched via `testMatch: /responsive\.spec\.ts/` in playwright.config.ts.
 */

test.describe('Responsive Layout', () => {

  test('[Mobile/Tablet] Landing page renders at narrow viewport', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const hero = page.locator(SELECTORS.landing.heroSection)
    await expect(hero).toBeVisible()

    const nav = page.locator(SELECTORS.landing.nav)
    await expect(nav).toBeVisible()
  })

  test('[Mobile/Tablet] Simulation room shows mobile layout', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc)
    await navigateToSimulation(page, params, 'free')

    // The sim-room container should render
    const room = page.locator(SELECTORS.simulation.room)
    await expect(room).toBeVisible({ timeout: 10000 })

    // At mobile/tablet widths, key components should be visible.
    // Desktop + mobile layouts both exist in DOM — use last() to get the
    // mobile instance (desktop is first in DOM order but hidden at <1024px)
    const toggle = page.locator(SELECTORS.simulation.sessionToggle).last()
    await expect(toggle).toBeVisible()

    const orb = page.locator(SELECTORS.simulation.voiceOrb).last()
    await expect(orb).toBeVisible()

    // Transcript panel in mobile stacked layout
    const transcript = page.locator(SELECTORS.simulation.transcriptPanel).last()
    await expect(transcript).toBeVisible()
  })

  test('[Mobile/Tablet] Navigation links work on narrow viewport', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const nav = page.locator(SELECTORS.landing.nav)
    await expect(nav).toBeVisible()

    // Explore button should be present and functional
    const explore = page.locator(SELECTORS.landing.navExplore)
    await expect(explore).toBeVisible()
    await explore.click()
    await expect(page).toHaveURL(/\/scenarios/)
  })

  test('[Mobile/Tablet] Landing hero text is visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const hero = page.locator(SELECTORS.landing.heroSection)
    await expect(hero).toBeVisible()

    // Brand heading should render
    const brand = hero.locator('h1[aria-label="Reviva"]')
    await expect(brand).toBeVisible()
  })

  test('[Mobile/Tablet] Simulation room has session toggle at narrow width', async ({ page }) => {
    const params = createSimulationParams(FREE_SCENARIOS.necFasc)
    await navigateToSimulation(page, params, 'free')

    const room = page.locator(SELECTORS.simulation.room)
    await expect(room).toBeVisible({ timeout: 10000 })

    // Desktop + mobile layouts both render — use last() for mobile instance
    const toggle = page.locator(SELECTORS.simulation.sessionToggle).last()
    await expect(toggle).toBeVisible()
  })

  test('[Mobile/Tablet] AppNav renders on scenarios page', async ({ page }) => {
    await page.goto('/scenarios')
    await page.waitForLoadState('domcontentloaded')

    const appNav = page.locator(SELECTORS.appNav)
    await expect(appNav).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'

test.describe('Scenario Selection Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted state so each test starts fresh
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      sessionStorage.clear()
      localStorage.clear()
    })
  })

  test('shows specialty selection as first step', async ({ page }) => {
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })
    // Pass fresh state to reset the selection store
    await page.evaluate(() => {
      window.history.replaceState({ fresh: true }, '')
    })
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })

    const specialtyStep = page.locator(SELECTORS.scenarios.specialtySelection)
    await expect(specialtyStep).toBeVisible()
    await expect(specialtyStep).toContainText('Select your specialty')
  })

  test('clicking Plastic Surgery ST3 advances to difficulty selection', async ({ page }) => {
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })

    // Click the Plastic Surgery specialty card
    const specialtyCard = page.locator('.specialty-card').filter({ hasText: 'Plastic Surgery ST3' })
    await expect(specialtyCard).toBeVisible()
    await specialtyCard.click()

    const difficultyStep = page.locator(SELECTORS.scenarios.difficultySelection)
    await expect(difficultyStep).toBeVisible()
    await expect(difficultyStep).toContainText('Choose Your Examiner')
  })

  test('selecting difficulty advances to mode selection', async ({ page }) => {
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })

    // Advance through specialty
    await page.locator('.specialty-card').filter({ hasText: 'Plastic Surgery ST3' }).click()
    await expect(page.locator(SELECTORS.scenarios.difficultySelection)).toBeVisible()

    // Click the Easy examiner button (Mr John -> "Select John")
    const easyButton = page.getByRole('button', { name: 'Select John' })
    await easyButton.click()

    const modeStep = page.locator(SELECTORS.scenarios.modeSelection)
    await expect(modeStep).toBeVisible()
    await expect(modeStep).toContainText('Choose Your Mode')
  })

  test('selecting Practice mode shows scenario selection', async ({ page }) => {
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })

    // Advance: specialty -> difficulty -> mode
    await page.locator('.specialty-card').filter({ hasText: 'Plastic Surgery ST3' }).click()
    await page.getByRole('button', { name: 'Select John' }).click()
    await expect(page.locator(SELECTORS.scenarios.modeSelection)).toBeVisible()

    // Click Practice Mode card
    const practiceCard = page.locator('.mode-card.mode-practice')
    await practiceCard.click()

    const scenarioStep = page.locator(SELECTORS.scenarios.scenarioSelection)
    await expect(scenarioStep).toBeVisible()
    // Should show category-level cards
    await expect(page.locator('.scenario-cards-grid')).toBeVisible()
  })

  test('back navigation returns to previous step', async ({ page }) => {
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })

    // Advance to difficulty
    await page.locator('.specialty-card').filter({ hasText: 'Plastic Surgery ST3' }).click()
    await expect(page.locator(SELECTORS.scenarios.difficultySelection)).toBeVisible()

    // Click back button (labeled "Specialties")
    const backButton = page.getByRole('button', { name: /Specialties/i })
    await backButton.click()

    // Should return to specialty selection
    await expect(page.locator(SELECTORS.scenarios.specialtySelection)).toBeVisible()
  })

  test('fresh navigation from landing resets to specialty', async ({ page }) => {
    // First, navigate through the flow to set some state
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })
    await page.locator('.specialty-card').filter({ hasText: 'Plastic Surgery ST3' }).click()
    await page.getByRole('button', { name: 'Select John' }).click()
    await expect(page.locator(SELECTORS.scenarios.modeSelection)).toBeVisible()

    // Go to landing and click Explore (passes { fresh: true } state)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const exploreBtn = page.locator(SELECTORS.landing.navExplore).first()
    await exploreBtn.click()

    // Should arrive at /scenarios starting at specialty selection (reset)
    await expect(page).toHaveURL(/\/scenarios/)
    await expect(page.locator(SELECTORS.scenarios.specialtySelection)).toBeVisible()
  })

  test('AppNav is present with logo', async ({ page }) => {
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })

    const appNav = page.locator(SELECTORS.appNav)
    await expect(appNav).toBeVisible()

    // Logo image should exist within AppNav
    const logo = appNav.locator('img[alt="ReViva"]')
    await expect(logo).toBeVisible()
  })

  test('scenario cards display in the category grid', async ({ page }) => {
    await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })

    // Navigate to scenario selection: specialty -> difficulty -> practice
    await page.locator('.specialty-card').filter({ hasText: 'Plastic Surgery ST3' }).click()
    await page.getByRole('button', { name: 'Select John' }).click()
    await page.locator('.mode-card.mode-practice').click()

    await expect(page.locator(SELECTORS.scenarios.scenarioSelection)).toBeVisible()

    // At category level, there should be multiple category cards
    const cards = page.locator('.scenario-cards-grid .scenario-card')
    await expect(cards.first()).toBeVisible()
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

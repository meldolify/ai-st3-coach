import { test, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'
import { setTestTier } from '../helpers/tier-control'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Reviva/)
  })

  test('hero section is visible with brand text', async ({ page }) => {
    const hero = page.locator(SELECTORS.landing.heroSection)
    await expect(hero).toBeVisible()

    // REVIVA is rendered as individual <span> characters inside h1[aria-label="Reviva"]
    const brand = hero.locator('h1[aria-label="Reviva"]')
    await expect(brand).toBeVisible()
    await expect(brand).toHaveText('REVIVA')
  })

  test('"Try a free station" hero CTA navigates to /scenarios', async ({ page }) => {
    const cta = page.getByRole('button', { name: /Try a free station/ })
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/scenarios/)
  })

  test('nav has Explore, Log In, and Sign Up buttons', async ({ page }) => {
    const nav = page.locator(SELECTORS.landing.nav)
    await expect(nav).toBeVisible()

    await expect(page.locator(SELECTORS.landing.navExplore)).toBeVisible()
    await expect(page.locator(SELECTORS.landing.navLogin)).toBeVisible()
    await expect(page.locator(SELECTORS.landing.navSignup)).toBeVisible()
  })

  test('Explore scrolls to pricing section for logged-out users', async ({ page }) => {
    await page.locator(SELECTORS.landing.navExplore).click()

    const pricingSection = page.locator(SELECTORS.landing.pricingSection)
    await expect(pricingSection).toBeInViewport({ timeout: 5000 })
  })

  test('Explore button navigates to /scenarios for logged-in users', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await setTestTier(page, 'premium')
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.locator(SELECTORS.landing.navExplore).click()
    await expect(page).toHaveURL(/\/scenarios/)
    await context.close()
  })

  test('§B AI Interviewer section renders with persona toggle', async ({ page }) => {
    const sectionB = page.locator(SELECTORS.landing.sectionB)
    await sectionB.scrollIntoViewIfNeeded()
    await expect(sectionB).toBeVisible()
    // Persona pill renders all three personas
    await expect(sectionB.locator('[data-testid="persona-toggle-easy"]')).toBeVisible()
    await expect(sectionB.locator('[data-testid="persona-toggle-medium"]')).toBeVisible()
    await expect(sectionB.locator('[data-testid="persona-toggle-strict"]')).toBeVisible()
  })

  test('§D Signature section renders with the orb CTA', async ({ page }) => {
    const sectionD = page.locator(SELECTORS.landing.sectionD)
    await sectionD.scrollIntoViewIfNeeded()
    await expect(sectionD).toBeVisible()
    await expect(
      sectionD.getByRole('button', { name: /Press to hear the examiner|Listening/ })
    ).toBeVisible()
  })

  test('§F pricing renders Free and Premium for unauthenticated visitors', async ({ page }) => {
    const sectionF = page.locator(SELECTORS.landing.sectionF)
    await sectionF.scrollIntoViewIfNeeded()
    await expect(sectionF).toBeVisible()
    await expect(sectionF.getByRole('button', { name: /Explore Free/ })).toBeVisible()
    await expect(sectionF.getByRole('button', { name: /Subscribe/ })).toBeVisible()
  })

  test('footer is visible with no broken support/legal links', async ({ page }) => {
    const footer = page.locator('footer#sectionFooter')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
    // Coming-soon placeholders replace href="#" dead links
    await expect(footer.getByText(/Contact .* coming soon/)).toBeVisible()
    await expect(footer.getByText(/Privacy .* coming soon/)).toBeVisible()
  })
})

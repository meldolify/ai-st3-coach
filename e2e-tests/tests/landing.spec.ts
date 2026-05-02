import { test, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'

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

  test('Pricing link scrolls to pricing section', async ({ page }) => {
    const pricingLink = page.locator(SELECTORS.landing.nav).getByText('Pricing')
    await pricingLink.click()

    const pricingSection = page.locator(SELECTORS.landing.pricingSection)
    await expect(pricingSection).toBeInViewport({ timeout: 5000 })
  })

  test('Explore button navigates to /scenarios', async ({ page }) => {
    await page.locator(SELECTORS.landing.navExplore).click()
    await expect(page).toHaveURL(/\/scenarios/)
  })

  test('§B AI Interviewer section renders with Practice/Mock toggle', async ({ page }) => {
    const sectionB = page.locator(SELECTORS.landing.sectionB)
    await sectionB.scrollIntoViewIfNeeded()
    await expect(sectionB).toBeVisible()
    // The toggle pill renders both labels
    await expect(sectionB.getByRole('button', { name: 'Practice Mode' })).toBeVisible()
    await expect(sectionB.getByRole('button', { name: 'Mock Exam' })).toBeVisible()
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

  test('logged-in band is hidden for unauthenticated users', async ({ page }) => {
    const band = page.locator(SELECTORS.landing.loggedInBand)
    await expect(band).toHaveCount(0)
  })

  test('footer is visible with no broken support/legal links', async ({ page }) => {
    const footer = page.locator('footer#sectionFooter')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
    // Coming-soon placeholders replace href="#" dead links
    await expect(footer.getByText(/Contact .* coming soon/)).toBeVisible()
    await expect(footer.getByText(/Privacy Policy .* coming soon/)).toBeVisible()
  })
})

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

  test('"Try Free Samples" CTA navigates to /scenarios', async ({ page }) => {
    const cta = page.getByRole('button', { name: 'Try Free Samples' })
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/scenarios/)
  })

  test('"Sign Up" hero CTA navigates to /login', async ({ page }) => {
    // The hero has a "Sign Up" button (btn-outline) distinct from the nav one
    const heroSignUp = page.locator('.hero-ctas').getByRole('button', { name: 'Sign Up' })
    await expect(heroSignUp).toBeVisible()
    await heroSignUp.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('nav has Explore, Log In, and Sign Up buttons', async ({ page }) => {
    const nav = page.locator(SELECTORS.landing.nav)
    await expect(nav).toBeVisible()

    await expect(page.locator(SELECTORS.landing.navExplore)).toBeVisible()
    await expect(page.locator(SELECTORS.landing.navLogin)).toBeVisible()
    await expect(page.locator(SELECTORS.landing.navSignup)).toBeVisible()
  })

  test('Pricing link scrolls to pricing section', async ({ page }) => {
    // Click the Pricing nav link
    const pricingLink = page.locator(SELECTORS.landing.nav).getByText('Pricing')
    await pricingLink.click()

    // The pricing section should be scrolled into view
    const pricingSection = page.locator(SELECTORS.landing.pricingSection)
    await expect(pricingSection).toBeInViewport({ timeout: 5000 })
  })

  test('Explore button navigates to /scenarios', async ({ page }) => {
    await page.locator(SELECTORS.landing.navExplore).click()
    await expect(page).toHaveURL(/\/scenarios/)
  })

  test('footer is visible', async ({ page }) => {
    const footer = page.locator('footer#sectionFooter')
    // Scroll to footer since it is below the fold
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
  })
})

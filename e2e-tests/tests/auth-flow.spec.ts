import { test, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/selectors'

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
  })

  test('/login renders auth page', async ({ page }) => {
    const authPage = page.locator(SELECTORS.auth.page)
    await expect(authPage).toBeVisible()
  })

  test('email and password fields are present', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Verify placeholder text
    await expect(emailInput).toHaveAttribute('placeholder', 'Email address')
    await expect(passwordInput).toHaveAttribute('placeholder', 'Password')
  })

  test('Google OAuth button is present', async ({ page }) => {
    const googleBtn = page.getByRole('button', { name: /Continue with Google/ })
    await expect(googleBtn).toBeVisible()
  })

  test('close button navigates to landing page', async ({ page }) => {
    const closeBtn = page.locator('button[aria-label="Close"]')
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()
    await expect(page).toHaveURL(/^\/$|^http:\/\/localhost:\d+\/$/)
  })

  test('login/signup toggle switches mode', async ({ page }) => {
    // Default mode is login — header says "Welcome Back"
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()

    // The submit button says "Sign In" in login mode
    const submitBtn = page.locator('button.btn-auth-submit')
    await expect(submitBtn).toHaveText(/Sign In/)

    // Click "Sign Up" toggle in the footer
    const toggleBtn = page.locator('.auth-footer').getByRole('button', { name: 'Sign Up' })
    await toggleBtn.click()

    // Now mode is signup — header says "Create Account"
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(submitBtn).toHaveText(/Create Account/)

    // Confirm password field appears in signup mode
    const confirmPassword = page.locator('input[placeholder="Confirm password"]')
    await expect(confirmPassword).toBeVisible()

    // Toggle back to login
    const toggleBack = page.locator('.auth-footer').getByRole('button', { name: 'Sign In' })
    await toggleBack.click()

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(confirmPassword).not.toBeVisible()
  })
})

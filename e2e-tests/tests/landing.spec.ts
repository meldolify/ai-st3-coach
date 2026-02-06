import { test, expect } from '@playwright/test';
import { SELECTORS } from '../helpers/selectors';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/ReViva/);
  });

  test('should display hero section', async ({ page }) => {
    const tagline = page.locator(SELECTORS.landing.heroTagline);
    await expect(tagline).toBeVisible();
    await expect(tagline).toContainText('Master Your Surgical Interview');
  });

  test('should show guest navigation links', async ({ page }) => {
    const navGuest = page.locator(SELECTORS.landing.navLinksGuest);
    await expect(navGuest).toBeVisible();
  });

  test('should have a primary CTA button', async ({ page }) => {
    const cta = page.locator(SELECTORS.landing.heroPrimaryBtn);
    await expect(cta).toBeVisible();
  });

  test('should navigate to specialty selection via Explore', async ({ page }) => {
    await page.locator(SELECTORS.landing.exploreBtn).click();
    // browseAsGuest() shows specialty selection directly without changing URL hash
    await expect(page.locator('#specialtySelection')).toBeVisible();
  });
});

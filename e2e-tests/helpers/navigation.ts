import { Page } from '@playwright/test';

/**
 * Navigate to simulation room with params set in sessionStorage.
 * Mirrors the React SPA flow: set sessionStorage -> navigate to /simulation.
 * Optionally sets window.__TEST_TIER__ (persists across navigations via addInitScript).
 * Pass null/undefined tier to skip tier setup (useful when fixture already set tier).
 */
export async function navigateToSimulation(page: Page, params: Record<string, unknown>, tier?: string | null) {
  // Set tier override before any navigation (persists via addInitScript)
  if (tier) {
    await page.addInitScript((t) => {
      ;(window as any).__TEST_TIER__ = t
    }, tier);
  }

  // Need a page context to set sessionStorage
  if (page.url() === 'about:blank') {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  }
  await page.evaluate((p) => {
    sessionStorage.setItem('simulationParams', JSON.stringify(p));
  }, params);
  await page.goto('/simulation');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Clear simulation params from sessionStorage.
 */
export async function clearSimulationParams(page: Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem('simulationParams');
  });
}

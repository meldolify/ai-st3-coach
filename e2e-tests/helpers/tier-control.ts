import { Page } from '@playwright/test';

export type Tier = 'free' | 'premium' | 'unlogged';

/**
 * Set test tier override via window global.
 * Must be called BEFORE navigating to any page.
 * The React app checks window.__TEST_TIER__ in subscription logic.
 */
export async function setTestTier(page: Page, tier: Tier) {
  await page.addInitScript((t) => {
    (window as any).__TEST_TIER__ = t;
  }, tier);
}

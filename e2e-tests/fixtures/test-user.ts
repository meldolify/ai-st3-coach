import { test as base, Page } from '@playwright/test';
import { setTierViaRoute } from '../helpers/tier-control';

type TierFixtures = {
  freeUser: Page;
  premiumUser: Page;
};

/**
 * Custom fixtures that pre-configure user tiers via route interception.
 * setTierViaRoute modifies state.js source to set testTierOverride before
 * it runs, persisting across page navigations (index.html -> simulation.html).
 */
export const test = base.extend<TierFixtures>({
  freeUser: async ({ page }, use) => {
    await setTierViaRoute(page, 'free');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
  premiumUser: async ({ page }, use) => {
    await setTierViaRoute(page, 'premium');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
});

export { expect } from '@playwright/test';

import { test as base, Page } from '@playwright/test';
import { setTestTier, Tier } from '../helpers/tier-control';

type TierFixtures = {
  freeUser: Page;
  premiumUser: Page;
};

export const test = base.extend<TierFixtures>({
  freeUser: async ({ page }, use) => {
    await setTestTier(page, 'free');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
  premiumUser: async ({ page }, use) => {
    await setTestTier(page, 'premium');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
});

export { expect } from '@playwright/test';

import { Page } from '@playwright/test';

type Tier = 'unlogged' | 'free' | 'premium';

/**
 * Set test tier on the current page using window.setTestTier().
 * Only works on a page that has already loaded state.js.
 * Does NOT persist across page navigations.
 */
export async function setTestTier(page: Page, tier: Tier | 'off') {
  await page.waitForFunction(
    () => typeof (window as any).setTestTier === 'function',
    { timeout: 5000 }
  );
  await page.evaluate((t) => (window as any).setTestTier(t), tier);
}

/**
 * Intercept state.js to set the initial testTierOverride value.
 * This persists across page navigations because the route handler
 * modifies the source before it executes on every page load.
 *
 * Must be called BEFORE any page.goto().
 */
export async function setTierViaRoute(page: Page, tier: Tier) {
  await page.route('**/js/state.js', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const modified = body.replace(
      /let testTierOverride = .*?;/,
      `let testTierOverride = '${tier}';`
    );
    await route.fulfill({ body: modified, headers: response.headers() });
  });
}

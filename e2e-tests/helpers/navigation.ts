import { Page } from '@playwright/test';

/**
 * Navigate to a hash route in index.html.
 */
export async function navigateToHash(page: Page, hash: string) {
  await page.goto(`/#${hash}`);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Set simulation params in sessionStorage and navigate to simulation.html.
 */
export async function navigateToSimulation(
  page: Page,
  params: {
    scenario: {
      title: string;
      promptFile: string;
      imageFile: string | null;
      category: string;
    };
    difficulty: 'easy' | 'medium' | 'strict';
    mode: 'practice' | 'mock-exam';
    mockExamType?: string | null;
    returnPage?: string;
  }
) {
  // Ensure we're on the same origin first
  if (page.url() === 'about:blank') {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  }

  await page.evaluate((p) => {
    sessionStorage.setItem('simulationParams', JSON.stringify(p));
  }, params);

  await page.goto('/simulation.html');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Clear simulation params from sessionStorage.
 */
export async function clearSimulationParams(page: Page) {
  await page.evaluate(() => sessionStorage.removeItem('simulationParams'));
}

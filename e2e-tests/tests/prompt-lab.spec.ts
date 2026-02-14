/**
 * Prompt Lab E2E Tests
 * Tests multi-topic navigation, UI structure, and GitHub PR visibility.
 *
 * URL is configurable via PROMPT_LAB_URL env var:
 *   Local:  http://localhost:8080/prompt-lab.html (default, same-origin API)
 *   Live:   PROMPT_LAB_URL=https://api.reviva.live/prompt-lab.html
 */

import { test, expect } from '@playwright/test';

const PROMPT_LAB_URL = process.env.PROMPT_LAB_URL || 'http://localhost:8080/prompt-lab.html';

test.describe('Prompt Lab - Page Load & Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROMPT_LAB_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Prompt Lab/);
  });

  test('header shows title, topic select, difficulty select', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Prompt Lab');
    await expect(page.locator('#topicSelect')).toBeVisible();
    await expect(page.locator('#difficultySelect')).toBeVisible();
  });

  test('header buttons are visible', async ({ page }) => {
    await expect(page.locator('#newSessionBtn')).toBeVisible();
    await expect(page.locator('#savePromptBtn')).toBeVisible();
  });

  test('has 3 main panels', async ({ page }) => {
    const panels = page.locator('section.pl-panel');
    await expect(panels).toHaveCount(3);
  });

  test('4 prompt editor tabs are visible', async ({ page }) => {
    await expect(page.locator('button.pl-tab[data-tab="core"]')).toBeVisible();
    await expect(page.locator('button.pl-tab[data-tab="difficulty"]')).toBeVisible();
    await expect(page.locator('button.pl-tab[data-tab="clinical"]')).toBeVisible();
    await expect(page.locator('button.pl-tab[data-tab="feedback"]')).toBeVisible();
  });

  test('core tab is active by default', async ({ page }) => {
    const coreTab = page.locator('button.pl-tab[data-tab="core"]');
    await expect(coreTab).toHaveClass(/active/);
  });

  test('prompt editor textarea is visible', async ({ page }) => {
    await expect(page.locator('#promptEditor')).toBeVisible();
  });
});

test.describe('Prompt Lab - Topic Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROMPT_LAB_URL);
    await page.waitForLoadState('domcontentloaded');
    // Wait for topics API to respond and populate dropdown
    await page.waitForFunction(
      () => document.querySelectorAll('#topicSelect optgroup').length > 0,
      { timeout: 10000 }
    );
  });

  test('topic dropdown is populated with optgroup elements', async ({ page }) => {
    const optgroups = page.locator('#topicSelect optgroup');
    const count = await optgroups.count();
    expect(count).toBeGreaterThan(0);
  });

  test('default topic is necrotising_fasciitis', async ({ page }) => {
    const value = await page.locator('#topicSelect').inputValue();
    expect(value).toBe('clinical/emergencies/necrotising_fasciitis');
  });

  test('optgroup labels contain > separator', async ({ page }) => {
    const firstOptgroup = page.locator('#topicSelect optgroup').first();
    const label = await firstOptgroup.getAttribute('label');
    expect(label).toContain('>');
  });

  test('prompt editor has content after loading', async ({ page }) => {
    // Wait for prompt to load into editor
    await page.waitForFunction(
      () => {
        const el = document.getElementById('promptEditor') as HTMLTextAreaElement;
        return el && el.value && el.value.length > 0;
      },
      { timeout: 10000 }
    );
    const content = await page.locator('#promptEditor').inputValue();
    expect(content.length).toBeGreaterThan(50);
  });
});

test.describe('Prompt Lab - Difficulty Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROMPT_LAB_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('difficulty selector has 3 options', async ({ page }) => {
    const options = page.locator('#difficultySelect option');
    await expect(options).toHaveCount(3);
  });

  test('default difficulty is easy', async ({ page }) => {
    const value = await page.locator('#difficultySelect').inputValue();
    expect(value).toBe('easy');
  });
});

test.describe('Prompt Lab - GitHub PR Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROMPT_LAB_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('Create PR button is hidden when GitHub not configured', async ({ page }) => {
    // Wait for config API call to complete
    await page.waitForTimeout(1000);
    const createPrBtn = page.locator('#createPrBtn');
    await expect(createPrBtn).toBeHidden();
  });
});

test.describe('Prompt Lab - Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROMPT_LAB_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('chat input exists', async ({ page }) => {
    await expect(page.locator('#chatInput')).toBeAttached();
  });

  test('send button exists', async ({ page }) => {
    await expect(page.locator('#sendBtn')).toBeAttached();
  });

  test('status indicator shows initial state', async ({ page }) => {
    const status = page.locator('#statusIndicator');
    await expect(status).toBeVisible();
  });
});

test.describe('Prompt Lab - Tests Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROMPT_LAB_URL);
    await page.waitForLoadState('domcontentloaded');
    // Wait for topics to load (tests depend on topic being selected)
    await page.waitForFunction(
      () => document.querySelectorAll('#topicSelect optgroup').length > 0,
      { timeout: 10000 }
    );
  });

  test('test list container exists', async ({ page }) => {
    await expect(page.locator('#testList')).toBeAttached();
  });

  test('run tests button exists', async ({ page }) => {
    await expect(page.locator('#runTestsBtn')).toBeAttached();
  });
});

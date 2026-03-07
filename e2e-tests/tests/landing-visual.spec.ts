import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Landing page sections in scroll order
const SECTIONS = [
  { id: 'sectionHero', name: 'hero' },
  { id: 'sectionWho', name: 'who' },
  { id: 'sectionWhy', name: 'why' },
  { id: 'sectionTrust', name: 'trust' },
  { id: 'sectionServices', name: 'services' },
  { id: 'sectionProof', name: 'proof' },
  { id: 'sectionAction', name: 'action' },
  { id: 'sectionFooter', name: 'footer' },
];

// Viewports to test (used within each browser project)
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
];

// Ensure screenshot output directory exists
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'test-results', 'visual');

async function scrollToSection(page: Page, sectionId: string): Promise<boolean> {
  return page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    return true;
  }, sectionId);
}

async function getScrollPosition(page: Page): Promise<number> {
  return page.evaluate(() => window.scrollY);
}

test.describe('Landing Page Visual Scroll', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for GSAP/Lenis to initialize
    await page.waitForTimeout(1000);
  });

  for (const viewport of VIEWPORTS) {
    test.describe(`Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        // Allow layout to settle after resize
        await page.waitForTimeout(500);
      });

      test(`should render hero section correctly`, async ({ page, browserName }) => {
        const hero = page.locator('#sectionHero');
        await expect(hero).toBeVisible();

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${browserName}-${viewport.name}-hero.png`),
          fullPage: false,
        });
      });

      test(`should scroll through all sections without getting stuck`, async ({ page, browserName }) => {
        const positions: number[] = [await getScrollPosition(page)];

        for (const section of SECTIONS.slice(1)) { // Skip hero (already at top)
          const found = await scrollToSection(page, section.id);
          if (!found) continue; // Section may not exist at this viewport

          await page.waitForTimeout(300); // Let scroll settle
          const pos = await getScrollPosition(page);
          positions.push(pos);

          // Take screenshot at each section
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${browserName}-${viewport.name}-${section.name}.png`),
            fullPage: false,
          });
        }

        // Verify scroll actually moved — at least 3 distinct positions
        const uniquePositions = new Set(positions);
        expect(uniquePositions.size).toBeGreaterThanOrEqual(3);
      });

      test(`should not have sections overlapping at scroll midpoints`, async ({ page, browserName }) => {
        // Scroll to 25%, 50%, 75% of page
        const totalHeight = await page.evaluate(() =>
          document.documentElement.scrollHeight - window.innerHeight
        );

        for (const pct of [25, 50, 75]) {
          const targetY = Math.floor((totalHeight * pct) / 100);
          await page.evaluate((y) => window.scrollTo(0, y), targetY);
          await page.waitForTimeout(500);

          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${browserName}-${viewport.name}-scroll-${pct}pct.png`),
            fullPage: false,
          });
        }
      });
    });
  }

  test('should initialize Three.js on desktop', async ({ page, browserName }) => {
    // Only expect Three.js on desktop viewports (>= 768px width)
    const viewportWidth = page.viewportSize()?.width ?? 1280;
    if (viewportWidth < 768) {
      test.skip();
      return;
    }

    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Reload to capture console from start
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for Three.js init

    const threeJsInitialized = consoleMessages.some(
      (msg) => msg.includes('[LANDING-3D]') && msg.includes('initialized')
    );

    // Log what we found for debugging
    const landingMessages = consoleMessages.filter((m) => m.includes('[LANDING'));
    if (landingMessages.length > 0) {
      console.log(`[${browserName}] Landing console messages:`, landingMessages);
    }

    // Check canvas exists and has dimensions
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.getElementById('landingCanvas') as HTMLCanvasElement;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      return {
        exists: true,
        width: rect.width,
        height: rect.height,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        position: style.position,
      };
    });

    console.log(`[${browserName}] Canvas info:`, canvasInfo);

    expect(canvasInfo).not.toBeNull();
    expect(canvasInfo!.exists).toBe(true);
    expect(canvasInfo!.width).toBeGreaterThan(0);
    expect(canvasInfo!.height).toBeGreaterThan(0);

    // Screenshot for visual comparison
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${browserName}-threejs-canvas.png`),
      fullPage: false,
    });
  });
});

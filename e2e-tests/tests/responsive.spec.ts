import { test, expect } from '@playwright/test';
import { navigateToSimulation, clearSimulationParams } from '../helpers/navigation';
import { setTierViaRoute } from '../helpers/tier-control';
import { FREE_SCENARIOS, createSimulationParams } from '../fixtures/mock-data';
import { SELECTORS } from '../helpers/selectors';

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await setTierViaRoute(page, 'premium');
  });

  // ---------------------------------------------------------------------------
  // Landing Page Responsive Tests
  // ---------------------------------------------------------------------------

  test.describe('Landing Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
    });

    test('hero section is visible and readable', async ({ page }) => {
      const tagline = page.locator(SELECTORS.landing.heroTagline);
      await expect(tagline).toBeVisible();

      const cta = page.locator(SELECTORS.landing.heroPrimaryBtn);
      await expect(cta).toBeVisible();

      // CTA button should not be cut off — its bounding box must be within the viewport
      const ctaBox = await cta.boundingBox();
      const viewport = page.viewportSize()!;
      expect(ctaBox).not.toBeNull();
      expect(ctaBox!.x).toBeGreaterThanOrEqual(0);
      expect(ctaBox!.x + ctaBox!.width).toBeLessThanOrEqual(viewport.width);

      // No horizontal scrollbar
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('navigation is accessible', async ({ page }) => {
      const projectName = test.info().project.name;

      if (projectName === 'mobile') {
        // On mobile, nav links may be hidden behind a hamburger menu.
        // Check if nav links are directly visible; if not, look for a toggle.
        const navVisible = await page.locator(SELECTORS.landing.navLinksGuest).isVisible();
        if (!navVisible) {
          // Look for common hamburger/menu toggle patterns
          const hamburger = page.locator(
            '.hamburger, .menu-toggle, .nav-toggle, [aria-label="Menu"], button.mobile-menu'
          );
          const hamburgerExists = (await hamburger.count()) > 0;
          // Either the nav is visible or a hamburger exists
          expect(hamburgerExists).toBe(true);
          if (hamburgerExists) {
            await hamburger.first().click();
            // After opening, the explore button should become reachable
            await expect(page.locator(SELECTORS.landing.exploreBtn)).toBeVisible({ timeout: 5000 });
          }
        } else {
          await expect(page.locator(SELECTORS.landing.exploreBtn)).toBeVisible();
        }
      } else {
        // Desktop and tablet: full nav links should be visible
        await expect(page.locator(SELECTORS.landing.navLinksGuest)).toBeVisible();
        await expect(page.locator(SELECTORS.landing.exploreBtn)).toBeVisible();
      }
    });

    test('feature panels are visible', async ({ page }) => {
      const featuresSection = page.locator('#featuresSection');
      await featuresSection.scrollIntoViewIfNeeded();
      await expect(featuresSection).toBeVisible();

      const panels = page.locator('.accordion-panel');
      const panelCount = await panels.count();
      expect(panelCount).toBeGreaterThan(0);

      // All panels should exist and be rendered
      for (let i = 0; i < panelCount; i++) {
        await panels.nth(i).scrollIntoViewIfNeeded();
        await expect(panels.nth(i)).toBeVisible();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Simulation Room Responsive Tests
  // ---------------------------------------------------------------------------
  // Note: At viewports < 1024px, the desktop simulation layout is hidden
  // and mobile-specific elements are shown instead:
  //   Desktop: #voiceOrb, #connectBtn, #disconnectBtn, #aiStatus, #simSidebar
  //   Mobile:  #mobileVoiceOrb, #mobileConnectBtn, #mobileDisconnectBtn, #mobileAiStatus
  // Both mobile (393px) and tablet (712px) projects use mobile elements.

  test.describe('Simulation Room', () => {
    test.afterEach(async ({ page }) => {
      await clearSimulationParams(page);
    });

    test('room layout loads correctly', async ({ page }) => {
      const params = createSimulationParams(FREE_SCENARIOS.necFasc);
      await navigateToSimulation(page, params);

      await expect(page.locator(SELECTORS.simulation.room)).toBeVisible();

      // Mobile/tablet viewports use mobile-specific elements (< 1024px breakpoint)
      const mobileOrb = page.locator('#mobileVoiceOrb');
      await expect(mobileOrb).toBeVisible();

      const mobileConnectBtn = page.locator('#mobileConnectBtn');
      await expect(mobileConnectBtn).toBeVisible();
    });

    test('controls have minimum tap target size', async ({ page }) => {
      const params = createSimulationParams(FREE_SCENARIOS.necFasc);
      await navigateToSimulation(page, params);

      const connectBtn = page.locator('#mobileConnectBtn');
      await expect(connectBtn).toBeVisible();

      const box = await connectBtn.boundingBox();
      expect(box).not.toBeNull();
      // WCAG 2.5.8 minimum touch target: 44x44px
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('orb fits within viewport width', async ({ page }) => {
      const params = createSimulationParams(FREE_SCENARIOS.necFasc);
      await navigateToSimulation(page, params);

      const orb = page.locator('#mobileVoiceOrb');
      await expect(orb).toBeVisible();

      const orbBox = await orb.boundingBox();
      const viewport = page.viewportSize()!;
      expect(orbBox).not.toBeNull();
      // Orb should fit within viewport width
      expect(orbBox!.x).toBeGreaterThanOrEqual(0);
      expect(orbBox!.x + orbBox!.width).toBeLessThanOrEqual(viewport.width);
      // Orb should have reasonable dimensions
      expect(orbBox!.width).toBeGreaterThan(0);
      expect(orbBox!.height).toBeGreaterThan(0);
    });

    test('transcript area exists in layout', async ({ page }) => {
      const params = createSimulationParams(FREE_SCENARIOS.necFasc);
      await navigateToSimulation(page, params);

      // Mobile transcript exists in DOM (may be in a collapsible panel)
      const transcript = page.locator('#mobileTranscriptMessages');
      await expect(transcript).toBeAttached();

      // The transcript container should be part of the mobile layout
      const container = page.locator('.mobile-transcript-panel, .mobile-transcript-container');
      await expect(container.first()).toBeAttached();
    });

    test('mobile control dock is visible', async ({ page }) => {
      const params = createSimulationParams(FREE_SCENARIOS.necFasc);
      await navigateToSimulation(page, params);

      // On mobile/tablet, the control dock should be visible
      const controlDock = page.locator('.mobile-control-dock');
      await expect(controlDock).toBeVisible();

      // Status indicator should show "Ready"
      const mobileStatus = page.locator('#mobileAiStatus');
      await expect(mobileStatus).toBeVisible();
      await expect(mobileStatus).toContainText('Ready');
    });
  });

  // ---------------------------------------------------------------------------
  // General Layout Tests
  // ---------------------------------------------------------------------------

  test.describe('General Layout', () => {
    test.afterEach(async ({ page }) => {
      await clearSimulationParams(page);
    });

    test('no horizontal overflow on any page', async ({ page }) => {
      // Check landing page
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const landingOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(landingOverflow).toBe(false);

      // Check simulation page
      const params = createSimulationParams(FREE_SCENARIOS.necFasc);
      await navigateToSimulation(page, params);

      const simulationOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(simulationOverflow).toBe(false);
    });

    test('text is readable with minimum font size', async ({ page }) => {
      // Check landing page text
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const landingFontSizes = await page.evaluate((selectors) => {
        const elements = [
          document.querySelector(selectors.landing.heroTagline),
          document.querySelector(selectors.landing.heroPrimaryBtn),
        ].filter(Boolean) as Element[];

        return elements.map((el) => {
          const computed = window.getComputedStyle(el);
          return parseFloat(computed.fontSize);
        });
      }, SELECTORS);

      for (const size of landingFontSizes) {
        expect(size).toBeGreaterThanOrEqual(12);
      }

      // Check simulation page text (use mobile elements on < 1024px viewports)
      const params = createSimulationParams(FREE_SCENARIOS.necFasc);
      await navigateToSimulation(page, params);

      const simFontSizes = await page.evaluate(() => {
        const elements = [
          document.querySelector('#mobileAiStatus'),
          document.querySelector('#mobileConnectBtn'),
        ].filter(Boolean) as Element[];

        return elements.map((el) => {
          const computed = window.getComputedStyle(el);
          return parseFloat(computed.fontSize);
        });
      });

      for (const size of simFontSizes) {
        expect(size).toBeGreaterThanOrEqual(12);
      }
    });
  });
});

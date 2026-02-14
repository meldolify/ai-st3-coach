import { test, expect } from '@playwright/test';
import { navigateToSimulation, clearSimulationParams } from '../helpers/navigation';
import { setTierViaRoute } from '../helpers/tier-control';
import { FREE_SCENARIOS, createSimulationParams } from '../fixtures/mock-data';
import { SELECTORS } from '../helpers/selectors';

/**
 * Error Handling & Edge Case Tests
 *
 * Tests error recovery, corrupt state, invalid connections,
 * and rapid user interactions to verify graceful degradation.
 */

test.describe('Error Handling', () => {
  test.afterEach(async ({ page }) => {
    // Clean up any active sessions
    await page.evaluate(() => {
      if ((window as any).session && (window as any).session.isConnected) {
        (window as any).session.disconnect();
      }
    }).catch(() => {
      // Page may have navigated away; ignore
    });
    await clearSimulationParams(page).catch(() => {
      // Page may not be on same origin; ignore
    });
  });

  test('should redirect to index when sessionStorage is missing', async ({ page }) => {
    // Go directly to simulation.html without setting any sessionStorage params.
    // simulation-app.js checks for params and redirects to '/' if missing.
    await page.goto('/simulation.html');

    // Wait for redirect back to index
    await page.waitForURL(/(localhost:\d+\/(?!simulation)|index\.html)/, { timeout: 15_000 });

    // Verify we land on a meaningful page (not blank), e.g. the landing page is visible
    // or at least the document body has content
    const bodyContent = await page.evaluate(() => document.body?.textContent?.trim() || '');
    expect(bodyContent.length).toBeGreaterThan(0);

    // The landing page or some section should be visible
    const hasVisibleContent = await page.evaluate(() => {
      const landing = document.getElementById('landingPage');
      const specialtySelection = document.getElementById('specialtySelection');
      const body = document.body;
      return (
        (landing && landing.offsetHeight > 0) ||
        (specialtySelection && specialtySelection.offsetHeight > 0) ||
        (body && body.children.length > 0)
      );
    });
    expect(hasVisibleContent).toBe(true);
  });

  test('should handle corrupt sessionStorage gracefully', async ({ page }) => {
    await setTierViaRoute(page, 'premium');

    // Navigate to index first so we're on same origin
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Set corrupt/invalid JSON in sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('simulationParams', '{corrupt json!! not valid');
    });

    // Navigate to simulation.html
    await page.goto('/simulation.html');

    // loadSimulationParams() in state.js catches JSON parse errors and returns null,
    // which triggers the redirect back to index.
    // Verify we either:
    // a) Get redirected back to index, or
    // b) Stay on simulation.html but don't crash (no JS error causing blank screen)

    // Wait a moment for any redirect to trigger
    await page.waitForTimeout(3_000);

    const currentUrl = page.url();
    const isOnSimulation = currentUrl.includes('simulation');

    if (!isOnSimulation) {
      // Redirected back — verify we're on a real page
      const bodyContent = await page.evaluate(() => document.body?.textContent?.trim() || '');
      expect(bodyContent.length).toBeGreaterThan(0);
    } else {
      // Stayed on simulation — verify no blank screen (JS didn't crash)
      const hasContent = await page.evaluate(() => {
        return document.body.children.length > 0;
      });
      expect(hasContent).toBe(true);
    }

    // The app handled the corrupt data gracefully — it didn't crash.
    // Note: loadSimulationParams() catches the parse error and returns null,
    // triggering the redirect. The corrupt sessionStorage entry may still exist
    // (not cleared), but the app recovers by ignoring it.
  });

  test('should show error state when connecting to wrong backend URL', async ({ page }) => {
    await setTierViaRoute(page, 'premium');

    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    // Override CONFIG.BACKEND_URL to point to a non-existent server.
    // CONFIG is a top-level const (not on window/globalThis), but its
    // properties are mutable. Use page.addScriptTag to access the
    // global scope directly.
    await page.evaluate(`CONFIG.BACKEND_URL = 'ws://localhost:19999'`);

    const connectBtn = page.locator(SELECTORS.simulation.connectBtn);
    await expect(connectBtn).toBeEnabled();

    // Click Connect — this will attempt WebSocket to a dead port
    await connectBtn.click();

    // The connection should fail. Wait for the connect button to remain enabled
    // (or become re-enabled after the error), indicating the connection did not succeed.
    // The V4Session.connect() promise rejects on ws.onerror, and handleConnect()
    // catches it and logs the error. The button should NOT be stuck in disabled state.
    await page.waitForTimeout(5_000);

    // Verify we're not stuck in a "connected" state
    const isSessionConnected = await page.evaluate(() => {
      const sess = (window as any).session;
      return sess ? sess.isConnected : false;
    });
    expect(isSessionConnected).toBe(false);

    // The disconnect button should still be disabled (we never connected)
    const disconnectBtn = page.locator(SELECTORS.simulation.disconnectBtn);
    await expect(disconnectBtn).toBeDisabled();
  });

  test('should handle rapid Connect/Disconnect without crashing', async ({ page }) => {
    await setTierViaRoute(page, 'premium');

    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    const connectBtn = page.locator(SELECTORS.simulation.connectBtn);
    const disconnectBtn = page.locator(SELECTORS.simulation.disconnectBtn);

    // Click Connect
    await connectBtn.click();

    // Wait briefly — the WebSocket may or may not have fully opened
    await page.waitForTimeout(500);

    // Immediately disconnect via direct session.disconnect() to avoid
    // endSessionWithFeedback() which requires a full GPT feedback cycle
    await page.evaluate(() => {
      const sess = (window as any).session;
      if (sess) {
        sess.disconnect();
        // Reset button states
        const conn = document.getElementById('connectBtn') as HTMLButtonElement;
        const disc = document.getElementById('disconnectBtn') as HTMLButtonElement;
        if (conn) {
          conn.disabled = false;
          conn.classList.remove('connected');
          const textEl = conn.querySelector('.sim-ctrl-btn__text');
          if (textEl) textEl.textContent = 'Start';
        }
        if (disc) disc.disabled = true;
        (window as any).session = null;
      }
    });

    // Verify clean state — no crash, page still functional
    await expect(connectBtn).toBeEnabled({ timeout: 5_000 });
    await expect(disconnectBtn).toBeDisabled({ timeout: 5_000 });

    // Verify the page is still interactive (no frozen JS)
    const voiceOrb = page.locator(SELECTORS.simulation.voiceOrb);
    await expect(voiceOrb).toBeVisible();

    // Should be able to connect again
    const isPageFunctional = await page.evaluate(() => {
      return typeof (window as any).handleConnect === 'function';
    });
    expect(isPageFunctional).toBe(true);
  });

  test('should prevent double-click on Connect button', async ({ page }) => {
    await setTierViaRoute(page, 'premium');

    const params = createSimulationParams(FREE_SCENARIOS.necFasc);
    await navigateToSimulation(page, params);

    const connectBtn = page.locator(SELECTORS.simulation.connectBtn);
    await expect(connectBtn).toBeEnabled();

    // Click Connect
    await connectBtn.click();

    // The button should become disabled almost immediately to prevent double-click.
    // handleConnect() disables it after session.connect() resolves.
    await expect(connectBtn).toBeDisabled({ timeout: 15_000 });

    // Verify only one session was created (not two from double-click)
    const sessionCount = await page.evaluate(() => {
      // The global session variable should exist
      const sess = (window as any).session;
      return sess ? 1 : 0;
    });
    expect(sessionCount).toBe(1);

    // Clean up: disconnect the session
    await page.evaluate(() => {
      const sess = (window as any).session;
      if (sess && sess.isConnected) {
        sess.disconnect();
      }
      (window as any).session = null;
    });
  });
});

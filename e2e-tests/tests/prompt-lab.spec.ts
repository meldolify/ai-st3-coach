import { test, expect } from '@playwright/test';

test.describe('Prompt Lab', () => {
  // Prompt Lab tests involve REST API calls; some hit GPT — use generous timeout
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    // Clear localStorage prompt lab keys to ensure clean state between tests
    await page.goto('/prompt-lab.html');
    await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('pl_'));
      keys.forEach(k => localStorage.removeItem(k));
    });
    // Reload after clearing so init() picks up server defaults (not cached edits)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  // ──────────────────────────────────────────────────────────────────
  // 1. Page loads with correct layout
  // ──────────────────────────────────────────────────────────────────

  test('should load with correct layout', async ({ page }) => {
    // Header with title
    const header = page.locator('.pl-header');
    await expect(header).toBeVisible();
    await expect(header.locator('h1')).toHaveText('Prompt Lab');

    // Topic and difficulty dropdowns exist
    await expect(page.locator('#topicSelect')).toBeVisible();
    await expect(page.locator('#difficultySelect')).toBeVisible();

    // 4 tab buttons visible with correct labels
    const tabs = page.locator('.pl-tab');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toHaveText('Core');
    await expect(tabs.nth(1)).toHaveText('Difficulty');
    await expect(tabs.nth(2)).toHaveText('Clinical');
    await expect(tabs.nth(3)).toHaveText('Feedback');

    // Chat area visible with empty state message
    await expect(page.locator('#chatMessages')).toBeVisible();
    await expect(page.locator('#chatMessages .pl-empty')).toContainText(
      'Start a session to begin chatting'
    );

    // Chat input and send button are disabled (no session yet)
    await expect(page.locator('#chatInput')).toBeDisabled();
    await expect(page.locator('#sendBtn')).toBeDisabled();

    // 3 panels visible
    const panels = page.locator('section.pl-panel');
    await expect(panels).toHaveCount(3);
  });

  // ──────────────────────────────────────────────────────────────────
  // 2. Topic selection loads prompt
  // ──────────────────────────────────────────────────────────────────

  test('should load prompt into editor after topic selection', async ({ page }) => {
    const topicSelect = page.locator('#topicSelect');
    const promptEditor = page.locator('#promptEditor');

    // Wait for topics API to populate dropdown (init fires on load)
    await page.waitForFunction(
      () => document.querySelectorAll('#topicSelect optgroup').length > 0,
      { timeout: 10_000 }
    );

    // Verify dropdown is no longer showing "Loading topics..."
    const firstOptionText = await topicSelect.locator('option').first().textContent();
    expect(firstOptionText).not.toContain('Loading topics');

    // Default topic should be necrotising_fasciitis
    const selectedValue = await topicSelect.inputValue();
    expect(selectedValue).toContain('necrotising_fasciitis');

    // Editor should have loaded substantial prompt content
    await expect(promptEditor).not.toHaveValue('', { timeout: 10_000 });
    const content = await promptEditor.inputValue();
    expect(content.length).toBeGreaterThan(50);
  });

  // ──────────────────────────────────────────────────────────────────
  // 3. Tab switching changes editor content
  // ──────────────────────────────────────────────────────────────────

  test('should switch tabs and show different content', async ({ page }) => {
    const promptEditor = page.locator('#promptEditor');

    // Wait for initial prompt load (Core tab is active by default)
    await expect(promptEditor).not.toHaveValue('', { timeout: 10_000 });
    const coreContent = await promptEditor.inputValue();

    // Switch to Difficulty tab
    await page.locator('.pl-tab[data-tab="difficulty"]').click();
    await expect(page.locator('.pl-tab[data-tab="difficulty"]')).toHaveClass(/active/);
    const difficultyContent = await promptEditor.inputValue();

    // Switch to Clinical tab
    await page.locator('.pl-tab[data-tab="clinical"]').click();
    await expect(page.locator('.pl-tab[data-tab="clinical"]')).toHaveClass(/active/);
    const clinicalContent = await promptEditor.inputValue();

    // Switch to Feedback tab
    await page.locator('.pl-tab[data-tab="feedback"]').click();
    await expect(page.locator('.pl-tab[data-tab="feedback"]')).toHaveClass(/active/);
    const feedbackContent = await promptEditor.inputValue();

    // Core and Clinical are distinct prompt sections — they must differ
    expect(coreContent).not.toBe(clinicalContent);

    // Switch back to Core and verify content is preserved
    await page.locator('.pl-tab[data-tab="core"]').click();
    await expect(page.locator('.pl-tab[data-tab="core"]')).toHaveClass(/active/);
    await expect(promptEditor).toHaveValue(coreContent);
  });

  // ──────────────────────────────────────────────────────────────────
  // 4. New Session creates active session
  // ──────────────────────────────────────────────────────────────────

  test('should create a new session', async ({ page }) => {
    const statusIndicator = page.locator('#statusIndicator');
    const chatInput = page.locator('#chatInput');
    const sendBtn = page.locator('#sendBtn');

    // Wait for prompt to load before creating session
    await expect(page.locator('#promptEditor')).not.toHaveValue('', {
      timeout: 10_000,
    });

    // Click New Session and wait for the API response
    const sessionResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/prompt-lab/api/session') && resp.status() === 200
    );
    await page.locator('#newSessionBtn').click();
    await sessionResponsePromise;

    // Status should now show session ID (contains "Session:" or "pl_")
    await expect(statusIndicator).toContainText('Session');

    // Chat input and send button should be enabled
    await expect(chatInput).toBeEnabled();
    await expect(sendBtn).toBeEnabled();

    // System message about session creation should appear in chat
    await expect(page.locator('#chatMessages .pl-msg-system')).toContainText(
      'Session created'
    );
  });

  // ──────────────────────────────────────────────────────────────────
  // 5. Chat message send and receive
  // ──────────────────────────────────────────────────────────────────

  test('should send a chat message and receive AI response', async ({ page }) => {
    test.slow(); // GPT call — triple the default timeout

    // Wait for prompt to load, then create session
    await expect(page.locator('#promptEditor')).not.toHaveValue('', {
      timeout: 10_000,
    });
    const sessionResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/prompt-lab/api/session') && resp.status() === 200
    );
    await page.locator('#newSessionBtn').click();
    await sessionResponsePromise;

    // Type and send a message
    const chatInput = page.locator('#chatInput');
    await chatInput.fill('Hello, I am a surgical trainee here for my clinical exam.');
    await page.locator('#sendBtn').click();

    // User message should appear in chat
    await expect(page.locator('#chatMessages .pl-msg-user')).toContainText(
      'Hello, I am a surgical trainee'
    );

    // Wait for AI response (GPT call — generous timeout)
    const aiMessage = page.locator('#chatMessages .pl-msg-assistant');
    await expect(aiMessage.first()).toBeVisible({ timeout: 30_000 });

    // AI response should have meaningful content (not just empty or error)
    const responseText = await aiMessage.first().textContent();
    expect(responseText!.length).toBeGreaterThan(10);
  });

  // ──────────────────────────────────────────────────────────────────
  // 6. Feedback trigger
  // ──────────────────────────────────────────────────────────────────

  test('should request and display feedback', async ({ page }) => {
    test.slow(); // Multiple GPT calls — needs extra time

    // Create session
    await expect(page.locator('#promptEditor')).not.toHaveValue('', {
      timeout: 10_000,
    });
    const sessionResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/prompt-lab/api/session') && resp.status() === 200
    );
    await page.locator('#newSessionBtn').click();
    await sessionResponsePromise;

    // Send a message first (feedback needs at least 1 exchange)
    await page.locator('#chatInput').fill(
      'I would like to present a case of necrotising fasciitis. The patient is a 45-year-old male presenting with severe pain in his left leg.'
    );
    const chatResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/prompt-lab/api/chat') && resp.status() === 200
    );
    await page.locator('#sendBtn').click();
    await chatResponsePromise;

    // Wait for AI response to appear
    await expect(
      page.locator('#chatMessages .pl-msg-assistant').first()
    ).toBeVisible({ timeout: 30_000 });

    // Request feedback
    const feedbackResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/prompt-lab/api/feedback') && resp.status() === 200
    );
    await page.locator('#feedbackBtn').click();

    // System message about generating feedback should appear
    await expect(page.locator('#chatMessages')).toContainText(
      'Generating feedback'
    );

    // Wait for feedback API response (multiple GPT calls — can be slow)
    await feedbackResponsePromise;

    // Feedback sections should appear (class pl-msg-feedback with section labels)
    const feedbackSections = page.locator('#chatMessages .pl-msg-feedback');
    await expect(feedbackSections.first()).toBeVisible({ timeout: 10_000 });

    // Feedback section labels should be present
    await expect(
      page.locator('#chatMessages .pl-feedback-label').first()
    ).toContainText('Feedback Section');

    // Feedback summary with score should appear
    await expect(
      page.locator('#chatMessages .pl-feedback-summary')
    ).toBeVisible({ timeout: 5_000 });
  });

  // ──────────────────────────────────────────────────────────────────
  // 7. Mode switching (Manual <-> Auto)
  // ──────────────────────────────────────────────────────────────────

  test('should switch between Manual and Auto modes', async ({ page }) => {
    const manualMode = page.locator('#manualMode');
    const autoMode = page.locator('#autoMode');
    const manualBtn = page.locator('.pl-mode-btn[data-mode="manual"]');
    const autoBtn = page.locator('.pl-mode-btn[data-mode="auto"]');

    // Initially Manual mode is active
    await expect(manualMode).toBeVisible();
    await expect(autoMode).toBeHidden();
    await expect(manualBtn).toHaveClass(/active/);

    // Switch to Auto Test mode
    await autoBtn.click();
    await expect(autoMode).toBeVisible();
    await expect(manualMode).toBeHidden();
    await expect(autoBtn).toHaveClass(/active/);
    await expect(manualBtn).not.toHaveClass(/active/);

    // Switch back to Manual
    await manualBtn.click();
    await expect(manualMode).toBeVisible();
    await expect(autoMode).toBeHidden();
    await expect(manualBtn).toHaveClass(/active/);
    await expect(autoBtn).not.toHaveClass(/active/);
  });

  // ──────────────────────────────────────────────────────────────────
  // 8. Clear chat
  // ──────────────────────────────────────────────────────────────────

  test('should clear chat messages', async ({ page }) => {
    // Create a session so there are messages to clear
    await expect(page.locator('#promptEditor')).not.toHaveValue('', {
      timeout: 10_000,
    });
    const sessionResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/prompt-lab/api/session') && resp.status() === 200
    );
    await page.locator('#newSessionBtn').click();
    await sessionResponsePromise;

    // Verify system message appeared ("Session created (easy)")
    await expect(page.locator('#chatMessages .pl-msg-system')).toContainText(
      'Session created'
    );

    // Click clear chat
    await page.locator('#clearChatBtn').click();

    // Chat messages area should be empty (clearChat removes all .pl-msg elements
    // and does NOT add the empty-state placeholder when session is still active)
    const messageCount = await page.locator('#chatMessages .pl-msg').count();
    expect(messageCount).toBe(0);
  });

  // ──────────────────────────────────────────────────────────────────
  // 9. Prompt editor editing and character count
  // ──────────────────────────────────────────────────────────────────

  test('should update character count when editing prompt', async ({ page }) => {
    const promptEditor = page.locator('#promptEditor');
    const charCount = page.locator('#charCount');

    // Wait for prompt to load
    await expect(promptEditor).not.toHaveValue('', { timeout: 10_000 });

    // Get initial char count (format: "1234 chars")
    const initialCountText = await charCount.textContent();
    const initialCount = parseInt(initialCountText!.replace(/\D/g, ''), 10);
    expect(initialCount).toBeGreaterThan(0);

    // Append some text to the editor
    const appendText = ' PLAYWRIGHT_TEST_APPEND';
    await promptEditor.focus();
    await promptEditor.press('End');
    await promptEditor.type(appendText);

    // Char count should update to reflect the appended text
    const newCountText = await charCount.textContent();
    const newCount = parseInt(newCountText!.replace(/\D/g, ''), 10);
    expect(newCount).toBe(initialCount + appendText.length);
    expect(newCountText).toContain('chars');
  });

  // ──────────────────────────────────────────────────────────────────
  // 10. localStorage persistence
  // ──────────────────────────────────────────────────────────────────

  test('should persist prompt edits in localStorage across reload', async ({ page }) => {
    const promptEditor = page.locator('#promptEditor');

    // Wait for prompt to load
    await expect(promptEditor).not.toHaveValue('', { timeout: 10_000 });

    // Append a distinctive marker to the editor
    const marker = '\n--- E2E_LOCALSTORAGE_TEST_MARKER ---';
    await promptEditor.focus();
    await promptEditor.press('End');
    await promptEditor.type(marker);

    // Wait for the debounced auto-save to localStorage (1s debounce in source + buffer)
    await page.waitForFunction(
      (expectedMarker: string) => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('pl_sections_'));
        return keys.some(k => {
          const val = localStorage.getItem(k);
          return val !== null && val.includes(expectedMarker);
        });
      },
      'E2E_LOCALSTORAGE_TEST_MARKER',
      { timeout: 5_000 }
    );

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Wait for prompt editor to populate (init restores from localStorage)
    await expect(promptEditor).not.toHaveValue('', { timeout: 10_000 });

    // The editor should contain the marker (restored from localStorage)
    const restoredContent = await promptEditor.inputValue();
    expect(restoredContent).toContain('E2E_LOCALSTORAGE_TEST_MARKER');
  });
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests/tests',
  outputDir: './e2e-tests/test-results',

  // Timeouts
  timeout: 30_000,
  expect: { timeout: 10_000 },

  // Execution
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  // Reporters
  reporter: [
    ['list'],
    ['html', { outputFolder: './e2e-tests/playwright-report' }],
  ],

  use: {
    baseURL: 'http://localhost:3001',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    permissions: ['microphone'],
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
      testMatch: /responsive\.spec\.ts/,
    },
    {
      name: 'tablet',
      use: {
        ...devices['Galaxy Tab S4'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
      testMatch: /responsive\.spec\.ts/,
    },
  ],

  webServer: [
    {
      command: 'node serve.js',
      cwd: './frontend',
      port: 3001,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'node server.js',
      port: 8080,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      cwd: './backend',
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        // Override FRONTEND_URL so CORS allows the test frontend origin
        FRONTEND_URL: 'http://localhost:3001',
      },
    },
  ],
});

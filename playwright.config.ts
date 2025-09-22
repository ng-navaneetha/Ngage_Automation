import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 30 * 1000, // Reduced global timeout to 30 seconds
  expect: {
    timeout: 5000 // Reduced expect timeout to 5 seconds
  },
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only - reduced retries */
  retries: process.env.CI ? 1 : 0, // Only 1 retry instead of 2
  /* Allow some parallelism in CI for faster execution */
  workers: process.env.CI ? 2 : undefined, // Use 2 workers in CI instead of 1
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'results.json' }],
   
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    headless: process.env.CI ? true : false, // Headless in CI, headed locally
    viewport: { width: 1280, height: 1024 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Configure fake media devices for CI to avoid permission conflicts
    ...(process.env.CI && {
      launchOptions: {
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--allow-file-access-from-files',
          '--disable-web-security',
          '--use-fake-device-for-media-stream',
          '--autoplay-policy=no-user-gesture-required'
        ]
      },
      permissions: ['camera', 'microphone']
    })
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional Chrome-specific config for media tests
        ...(process.env.CI && {
          launchOptions: {
            args: [
              '--use-fake-ui-for-media-stream',
              '--use-fake-device-for-media-stream',
              '--allow-file-access-from-files',
              '--disable-web-security',
              '--autoplay-policy=no-user-gesture-required',
              '--disable-features=VizDisplayCompositor'
            ]
          }
        })
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

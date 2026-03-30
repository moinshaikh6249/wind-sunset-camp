import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Use process.env.PORT by default and fallback to 3000 if not specified.
const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;
export const USER_AUTH_FILE = path.join(__dirname, '.auth/user.json');
export const ADMIN_AUTH_FILE = path.join(__dirname, '.auth/admin.json');

export default defineConfig({
  // Timeout per test
  timeout: 30 * 1000,
  // Test directory
  testDir: path.join(__dirname, 'tests'),
  // If a test fails, retry it additional 2 times
  retries: 2,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: 'test-results/',

  // Run your local dev server before starting the tests:
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Use baseURL so to make navigation relative.
    baseURL,
    // Record trace only when retrying a test for the first time.
    trace: 'on-first-retry',
  },

  projects: [
    //-- Setup projects --//
    { name: 'setup:user', testMatch: /auth\.setup\.ts/, teardown: 'cleanup:user' },
    { name: 'setup:admin', testMatch: /auth\.setup\.ts/, teardown: 'cleanup:admin' },
    
    //-- Teardown projects --//
    { name: 'cleanup:user', testMatch: /auth\.teardown\.ts/, use: { storageState: USER_AUTH_FILE } },
    { name: 'cleanup:admin', testMatch: /auth\.teardown\.ts/, use: { storageState: ADMIN_AUTH_FILE } },

    //-- Test projects --//
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Run as a standard user by default
        storageState: USER_AUTH_FILE,
      },
      dependencies: ['setup:user', 'setup:admin'],
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: USER_AUTH_FILE,
       },
      dependencies: ['setup:user', 'setup:admin'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: USER_AUTH_FILE,
      },
      dependencies: ['setup:user', 'setup:admin'],
    },
    // Test against mobile viewports.
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: USER_AUTH_FILE,
      },
      dependencies: ['setup:user', 'setup:admin'],
    },
  ],
});

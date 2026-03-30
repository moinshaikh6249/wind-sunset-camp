import { test as teardown, expect } from '@playwright/test';

// This teardown file contains logic to clean up resources created during tests.
// For this app, it primarily handles logging out to ensure clean sessions.

teardown.describe('Auth Teardown', () => {
  teardown('logout user', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });
});

import { test, expect } from '@playwright/test';
import { USER_AUTH_FILE } from '../playwright.config';

test.describe('Security and Access Control', () => {

  test.describe('Public user access restrictions', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('26. Public user cannot access admin routes', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/\/admin\/login/);
      await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    });

    test('28. Unauthenticated user cannot access booking creation UI', async ({ page }) => {
      await page.goto('/booking');
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Standard user access restrictions', () => {
    test.use({ storageState: USER_AUTH_FILE });

    test('27. Normal user cannot access admin routes', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/\/admin\/login/);
      await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    });
  });
});

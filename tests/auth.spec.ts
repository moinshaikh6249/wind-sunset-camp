import { test, expect } from '@playwright/test';
import { USER_AUTH_FILE } from '../playwright.config';

test.describe('Authentication Flow', () => {

  test.describe('Unauthenticated actions', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('7. User can register a new account', async ({ page }) => {
      const uniqueEmail = `test-user-${Date.now()}@example.com`;

      await page.goto('/signup');
      await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

      await page.locator('input[name="name"]').fill('Test User');
      await page.locator('input[name="email"]').fill(uniqueEmail);
      await page.locator('input[name="mobileNumber"]').fill('9876543210');
      await page.locator('input[name="password"]').fill('password123');
      await page.getByRole('button', { name: 'Sign Up' }).click();

      await expect(page).toHaveURL(/\/|\/dashboard/, { timeout: 10000 });
      await expect(page.locator('body')).toBeVisible();
    });

    test('8. User can login', async ({ page }) => {
      const userEmail = process.env.TEST_USER_EMAIL || 'user@example.com';
      const userPassword = process.env.TEST_USER_PASSWORD || 'password123';

      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

      await page.locator('input[name="email"]').fill(userEmail);
      await page.locator('input[name="password"]').fill(userPassword);
      await page.locator('button[type="submit"]').click();

      await expect(page).toHaveURL(/\/|\/dashboard/, { timeout: 10000 });
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('With authenticated user', () => {
    test.use({ storageState: USER_AUTH_FILE });

    test('9. User can logout', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByText('My Booked Camps')).toBeVisible();

      await page.getByRole('main').getByRole('button', { name: 'Logout' }).click();

      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    });
  });
});

import { test, expect } from '@playwright/test';
import { USER_AUTH_FILE } from '../playwright.config';

// These tests validate the core authentication flows: registration, login, and logout.
// They run without a pre-authenticated state.
test.describe('Authentication Flow', () => {
  
  // Test case for user registration.
  test('7. User can register a new account', async ({ page }) => {
    // Use a unique email for each test run to avoid conflicts.
    const uniqueEmail = `test-user-${Date.now()}@example.com`;
    
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();

    // Fill out the registration form.
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email Address').fill(uniqueEmail);
    await page.getByLabel('Mobile No.').fill('1234567890');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // After registration, the user should be redirected to their dashboard.
    await expect(page.getByRole('heading', { name: 'My Booked Camps' })).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  // Test case for successful user login.
  test('8. User can login', async ({ page }) => {
    const userEmail = process.env.TEST_USER_EMAIL;
    const userPassword = process.env.TEST_USER_PASSWORD;
    test.skip(!userEmail || !userPassword, 'Test user credentials are not set in .env.test');

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'User Login' })).toBeVisible();

    // Fill login credentials and submit.
    await page.getByLabel('Email Address').fill(userEmail!);
    await page.getByLabel('Password').fill(userPassword!);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify redirection to the dashboard upon successful login.
    await expect(page.getByRole('heading', { name: 'My Booked Camps' })).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  // Test case for logging out. This test requires a logged-in state.
  test.describe('With authenticated user', () => {
    test.use({ storageState: USER_AUTH_FILE });

    test('9. User can logout', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'My Booked Camps' })).toBeVisible();
      
      // Click the logout button.
      await page.getByRole('button', { name: 'Logout' }).click();

      // After logout, user should be redirected to the login page.
      await expect(page.getByRole('heading', { name: 'User Login' })).toBeVisible();
      await expect(page).toHaveURL('/login');
    });
  });
});

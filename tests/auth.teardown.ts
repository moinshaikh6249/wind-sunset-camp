import { test as teardown, expect } from '@playwright/test';

// This teardown file contains logic to clean up resources created during tests.
// For this app, it primarily handles logging out to ensure clean sessions.

teardown.describe('Auth Teardown', () => {
  teardown('logout user', async ({ page }) => {
    // Navigate to a page that has the logout button
    await page.goto('/dashboard');
    
    const logoutButton = page.getByRole('button', { name: 'Logout' });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      // Verify redirection to the login page to confirm logout
      await expect(page.getByRole('heading', { name: 'User Login' })).toBeVisible();
      await expect(page).toHaveURL('/login');
    } else {
        // If logout button isn't visible, we might already be logged out or on a wrong page.
        // For teardown, we can just ensure we are not on a protected route.
        await page.goto('/login');
        await expect(page).toHaveURL('/login');
    }
  });
});

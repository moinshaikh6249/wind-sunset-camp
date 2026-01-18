import { test, expect } from '@playwright/test';
import { USER_AUTH_FILE } from '../playwright.config';

// These tests verify the application's route-based access control.
test.describe('Security and Access Control', () => {

  // Test case 26: Ensure public users cannot access admin routes.
  test('26. Public user cannot access admin routes', async ({ page }) => {
    // Attempt to navigate directly to the admin dashboard.
    await page.goto('/admin/dashboard');
    // The user should be redirected to the admin login page.
    await expect(page).toHaveURL('/admin/login');
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
  });

  // Test case 27: Ensure standard logged-in users cannot access admin routes.
  test.describe('With authenticated standard user', () => {
    // Use the standard user's auth state.
    test.use({ storageState: USER_AUTH_FILE });

    test('27. Normal user cannot access admin routes', async ({ page }) => {
      // Attempt to navigate directly to the admin dashboard as a logged-in user.
      await page.goto('/admin/dashboard');
      // The user should still be redirected to the admin login page.
      await expect(page).toHaveURL('/admin/login');
      await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    });
  });

  // Test case 28: This is a placeholder for a true backend security rule test.
  test('28. Unauthorized Firestore write is blocked (UI Navigation)', async ({ page }) => {
    // This test simulates a user trying to perform an action they aren't allowed to,
    // like creating a booking without being logged in. A robust UI should prevent this,
    // but the ultimate security lies in Firestore rules.
    
    // True validation of Firestore rules requires integration tests against the emulator
    // or direct API calls, which is beyond the scope of this UI E2E test.
    // This test verifies the UI-level safeguard.
    
    await page.goto('/camps');
    // Find a camp and click book.
    await page.locator('div.group', { hasText: 'Mountain Explorer' }).first().getByRole('link', { name: 'Book This Camp' }).click();
    
    // As a public user, they should land on the booking page but see a login prompt,
    // not the booking form itself. This prevents the attempt of an unauthorized write.
    await expect(page.getByRole('heading', { name: 'Login to Book' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Booking' })).not.toBeVisible();
  });
});

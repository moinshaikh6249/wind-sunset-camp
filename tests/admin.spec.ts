import { test, expect } from '@playwright/test';
import { ADMIN_AUTH_FILE } from '../playwright.config';

// These tests run as an authenticated admin user.
test.describe('Admin Panel Flows', () => {
  // Use the stored admin authentication state.
  test.use({ storageState: ADMIN_AUTH_FILE });

  const testCamp = {
    name: `Test Camp ${Date.now()}`,
    date: 'August 10-15, 2024',
    location: 'Cypress Hills',
    price: '999',
    description: 'A test camp for automated E2E tests.',
    activities: 'testing, debugging, reporting',
    imageUrl: 'https://picsum.photos/seed/test/600/400'
  };

  // Test case 16 & 17: Admin can log in and view bookings.
  test('16 & 17. Admin can view all bookings', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.getByRole('link', { name: 'Bookings' }).click();
    
    await expect(page).toHaveURL('/admin/bookings');
    await expect(page.getByRole('heading', { name: 'All Bookings' })).toBeVisible();
    // Check if the table has at least one row (header)
    const rows = await page.locator('table tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  // Test case 18, 19, 20: Admin can manage booking statuses.
  test('18, 19, 20. Admin can approve, cancel, and delete a booking', async ({ page }) => {
    await page.goto('/admin/bookings');
    // Find a 'Pending' booking to manage. Assumes a test booking exists.
    const pendingBookingRow = page.locator('tr', { hasText: 'Pending' }).first();
    await expect(pendingBookingRow).toBeVisible();

    // --- Approve ---
    await pendingBookingRow.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('menuitem', { name: 'Approve' }).click();
    await expect(page.getByText('Booking Approved!')).toBeVisible();
    await expect(pendingBookingRow.getByText('Approved')).toBeVisible();

    // --- Cancel ---
    await pendingBookingRow.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('menuitem', { name: 'Cancel Booking' }).click();
    await page.getByRole('button', { name: 'Yes, cancel booking' }).click();
    await expect(page.getByText('Booking Canceled')).toBeVisible();
    await expect(pendingBookingRow.getByText('Canceled')).toBeVisible();
    
    // --- Delete ---
    await pendingBookingRow.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Booking Deleted')).toBeVisible();
    await expect(pendingBookingRow).not.toBeVisible();
  });

  // Test case 21: Admin can manage camps.
  test('21. Admin can manage camps (Add and Delete)', async ({ page }) => {
    await page.goto('/admin/camps');
    await page.getByRole('button', { name: 'Add Camp' }).click();

    // Fill out the form to add a new camp.
    await page.getByLabel('Camp Name').fill(testCamp.name);
    await page.getByLabel('Date').fill(testCamp.date);
    await page.getByLabel('Location').fill(testCamp.location);
    await page.getByLabel('Price').fill(testCamp.price);
    await page.getByLabel('Description').fill(testCamp.description);
    await page.getByLabel('Activities').fill(testCamp.activities);
    await page.getByLabel('Image URL').fill(testCamp.imageUrl);
    await page.getByRole('button', { name: 'Add Camp' }).click();
    
    // Verify success toast and that the new camp appears in the table.
    await expect(page.getByText('Camp Added')).toBeVisible();
    const newCampRow = page.locator('tr', { hasText: testCamp.name });
    await expect(newCampRow).toBeVisible();

    // Now, delete the camp that was just created.
    await newCampRow.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Yes, delete camp' }).click();

    await expect(page.getByText('Camp Deleted')).toBeVisible();
    await expect(newCampRow).not.toBeVisible();
  });

  // Test cases 23, 24, 25: Admin can manage contact messages.
  test('23, 24, 25. Admin can read, mark as read, and delete messages', async ({ page }) => {
    // This test assumes a message has been sent via the contact form.
    // The public user test (5) sends one.
    await page.goto('/admin/messages');
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();

    // Find and click an unread message from 'Public Tester'.
    const messageRow = page.locator('div.cursor-pointer', { hasText: 'Public Tester' });
    await expect(messageRow).toBeVisible();
    await messageRow.click();

    // Modal should open.
    await expect(page.getByRole('heading', { name: 'Test Inquiry' })).toBeVisible();

    // Mark as unread (it was marked read on open).
    await page.getByRole('button', { name: 'Mark as Unread' }).click();
    await expect(page.getByText('Message marked as unread')).toBeVisible();
    // Close and reopen to verify
    await page.locator('body').press('Escape');
    await messageRow.click();
    await expect(page.getByRole('heading', { name: 'Test Inquiry' })).toBeVisible();

    // Mark as read again.
    await page.getByRole('button', { name: 'Mark as Read' }).click();
    await expect(page.getByText('Message marked as read')).toBeVisible();

    // Delete the message.
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Yes, delete it' }).click();
    await expect(page.getByText('Message Deleted')).toBeVisible();
    await expect(messageRow).not.toBeVisible();
  });
});

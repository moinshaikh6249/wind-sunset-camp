import { test, expect } from '@playwright/test';
import { USER_AUTH_FILE } from '../playwright.config';

// These tests run as a standard authenticated user.
test.describe('Logged-in User Flows', () => {
  // Use the stored authentication state to start tests as a logged-in user.
  test.use({ storageState: USER_AUTH_FILE });

  const bookingDetails = {
    campName: 'Mountain Explorer',
    reviewComment: `An amazing experience! The views were breathtaking. Highly recommended. Test run: ${Date.now()}`
  };

  // Test case 10: User can create a new booking.
  test('10. User can create a booking', async ({ page }) => {
    await page.goto('/camps');
    // Find the 'Mountain Explorer' camp and click its booking button.
    const campCard = page.locator('div.group', { hasText: bookingDetails.campName });
    await campCard.getByRole('link', { name: 'Book This Camp' }).click();
    
    // The user should be on the booking page for the selected camp.
    await expect(page).toHaveURL(/.*booking/);
    await expect(page.getByRole('heading', { name: bookingDetails.campName })).toBeVisible();

    // Fill in the remaining booking details.
    await page.getByLabel('Phone Number').fill('0987654321');
    await page.getByLabel('Number of People').fill('2');
    await page.getByRole('button', { name: 'Submit Booking' }).click();

    // Verify the success toast and redirection to the dashboard.
    await expect(page.getByText('Booking Submitted!')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  // Test case 11 & 12: User can see their booking and then cancel it.
  test('11 & 12. User can see and cancel own booking', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find the booking created in the previous test.
    const bookingEntry = page.locator('li', { hasText: bookingDetails.campName });
    await expect(bookingEntry).toBeVisible();
    await expect(bookingEntry.getByText('Pending')).toBeVisible();

    // Open the confirmation dialog to cancel.
    await bookingEntry.getByRole('button', { name: 'Open' }).click();
    await page.getByRole('button', { name: 'Yes, Cancel It' }).click();

    // Verify the success toast and the status update in the UI.
    await expect(page.getByText('Booking Canceled')).toBeVisible();
    await expect(bookingEntry.getByText('Canceled')).toBeVisible();
  });

  // Test case 14 & 15: User can submit a review and see it.
  test('14 & 15. User can submit and see own review', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.getByRole('heading', { name: 'Leave a Review' })).toBeVisible();

    // Fill out the review form.
    await page.locator('.flex.items-center.gap-1 > .cursor-pointer').nth(4).click(); // Click the 5th star
    await page.getByLabel('Your Comment').fill(bookingDetails.reviewComment);
    await page.getByRole('button', { name: 'Submit Review' }).click();

    // Verify the success toast.
    await expect(page.getByText('Review Submitted!')).toBeVisible();

    // The newly submitted review should now be visible on the page.
    await expect(page.getByText(bookingDetails.reviewComment)).toBeVisible();
  });
});

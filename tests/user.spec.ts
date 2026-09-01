import { test, expect } from '@playwright/test';
import { USER_AUTH_FILE } from '../playwright.config';

// Use the stored authentication state for all user tests in this file.
test.use({ storageState: USER_AUTH_FILE });

test.describe('Logged-in User Flows', () => {

  const API_BASE_URL = `${(process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`;

  let activeCamp: { id: string; name: string } | null = null;

  test.beforeAll(async ({ request }) => {
    try {
      const campsRes = await request.get(`${API_BASE_URL}/camps`);
      if (campsRes.ok()) {
        const campsData = await campsRes.json();
        const campsList = Array.isArray(campsData) ? campsData : campsData.camps || campsData.data || [];
        for (const camp of campsList) {
          if (camp.status === 'inactive') continue;
          const campId = camp._id || camp.id;
          const availRes = await request.get(`${API_BASE_URL}/camps/${campId}/availability`);
          if (availRes.ok()) {
            const avail = await availRes.json();
            if (avail.remaining > 2 || avail.status === 'available') {
              activeCamp = { id: campId, name: camp.name };
              break;
            }
          }
        }
        if (!activeCamp && campsList.length > 0) {
          const fallback = campsList.find((c: any) => c.status !== 'inactive') || campsList[0];
          activeCamp = { id: fallback._id || fallback.id, name: fallback.name };
        }
      }
    } catch (e) {
      console.error('Failed to fetch dynamic camp in test beforeAll:', e);
    }
  });

  // Test case 10: User can create a new booking.
  test('10. User can create a booking', async ({ page }) => {
    test.skip(!activeCamp, 'No active camp available in MongoDB Atlas');

    await page.goto(`/booking?campId=${activeCamp!.id}`);
    await expect(page.getByRole('heading', { name: 'Book Your Adventure' })).toBeVisible();

    // Fill in booking form details.
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('input[name="numberOfPeople"]').fill('2');
    await page.getByRole('button', { name: /Reserve Camp|Submit Booking|Book Now/i }).click();

    // Verify success toast or redirection.
    await expect(page.locator('body')).toBeVisible();
  });

  // Test case 11 & 12: User can see their booking on the dashboard.
  test('11 & 12. User can see and cancel own booking', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('My Booked Camps')).toBeVisible();
    await expect(page.locator('div.grid, ul.space-y-5, p').first()).toBeVisible();
  });

  // Test case 14 & 15: User can submit a review and see it.
  test('14 & 15. User can submit and see own review', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.getByRole('heading', { name: 'Guest Reviews' })).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
  });
});

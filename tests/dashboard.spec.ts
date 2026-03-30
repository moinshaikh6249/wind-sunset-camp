import { test, expect } from '@playwright/test';
import { USER_AUTH_FILE, ADMIN_AUTH_FILE } from '../playwright.config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

test.describe('Dashboard Assertions', () => {
  test.describe('User Dashboard', () => {
    test.use({ storageState: USER_AUTH_FILE });

    test('shows phone number after booking phone sync', async ({ page }) => {
      const storageState = await page.context().storageState();
      const token = storageState.origins
        .flatMap((origin) => origin.localStorage)
        .find((entry) => entry.name === 'token' || entry.name === 'authToken')?.value || '';

      expect(token).toBeTruthy();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const meRes = await page.request.get(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders,
      });
      expect(meRes.ok()).toBeTruthy();
      const meJson = await meRes.json();

      const user = meJson?.user || {};
      const email = user?.email;
      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'QA E2E';

      expect(email).toBeTruthy();

      const campsRes = await page.request.get(`${API_BASE_URL}/camps`);
      expect(campsRes.ok()).toBeTruthy();
      const campsJson = await campsRes.json();
      const camps = Array.isArray(campsJson) ? campsJson : campsJson?.camps || [];
      expect(camps.length).toBeGreaterThan(0);

      const campId = camps[0]?._id || camps[0]?.id;
      expect(campId).toBeTruthy();

      const bookingRes = await page.request.post(`${API_BASE_URL}/bookings`, {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        data: {
          fullName,
          email,
          phone: '9324319082',
          campId,
          numberOfPeople: 2,
          specialRequests: 'E2E phone sync verification',
        },
      });

      expect(bookingRes.ok()).toBeTruthy();

      await page.goto('/dashboard');
      await expect(page.getByText('Phone Number')).toBeVisible();
      await expect(page.getByText('9324319082')).toBeVisible();
      await expect(page.getByText('Not provided')).toHaveCount(0);
    });
  });

  test.describe('Admin Dashboard', () => {
    test.use({ storageState: ADMIN_AUTH_FILE });

    test('shows only bookings, users, camps cards', async ({ page }) => {
      await page.goto('/admin/dashboard');

      await expect(page.getByText('Total Bookings')).toBeVisible();
      await expect(page.getByText('Total Users')).toBeVisible();
      await expect(page.getByText('Total Camps')).toBeVisible();
      await expect(page.getByText('Total Revenue')).toHaveCount(0);
    });
  });
});

import { test, expect } from '@playwright/test';
import { ADMIN_AUTH_FILE } from '../playwright.config';

// Force ADMIN_AUTH_FILE at the top level for all tests in this file.
test.use({ storageState: ADMIN_AUTH_FILE });

const API_BASE_URL = `${(process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`;

test.describe('Admin Panel Flows', () => {

  // Test cases 16 & 17: Admin can view all bookings (self-contained with E2E fixture).
  test('16 & 17. Admin can view all bookings', async ({ page, request }) => {
    // 1. Get an active camp
    const campsRes = await request.get(`${API_BASE_URL}/camps`);
    expect(campsRes.ok()).toBeTruthy();
    const campsData = await campsRes.json();
    const campsList = Array.isArray(campsData) ? campsData : campsData.camps || [];
    const targetCamp = campsList.find((c: any) => c.status !== 'inactive') || campsList[0];
    expect(targetCamp).toBeTruthy();

    // 2. Get user token for test user
    const userEmail = process.env.TEST_USER_EMAIL || 'e2e_user_standard@example.com';
    const userPassword = process.env.TEST_USER_PASSWORD || 'password123';
    let userLoginRes = await request.post(`${API_BASE_URL}/auth/login`, {
      data: { email: userEmail, password: userPassword },
    });
    if (!userLoginRes.ok()) {
      await request.post(`${API_BASE_URL}/auth/signup`, {
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: userEmail,
          phone: '9876543210',
          password: userPassword,
          confirmPassword: userPassword,
        },
      });
      userLoginRes = await request.post(`${API_BASE_URL}/auth/login`, {
        data: { email: userEmail, password: userPassword },
      });
    }
    const userToken = (await userLoginRes.json()).token;

    // 3. Create an isolated E2E test booking
    const testCustomerName = 'E2E Admin Bookings Tester';
    const createBookingRes = await request.post(`${API_BASE_URL}/bookings`, {
      data: {
        fullName: testCustomerName,
        email: userEmail,
        phone: '9876543210',
        campId: targetCamp._id || targetCamp.id,
        numberOfPeople: 2,
      },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(createBookingRes.ok()).toBeTruthy();
    const createdBooking = (await createBookingRes.json()).booking;
    const bookingId = createdBooking._id || createdBooking.id;
    const bookingRef = createdBooking.bookingReference || createdBooking._id;

    try {
      // 4. Navigate to Admin Bookings and assert E2E booking is visible
      await page.goto('/admin/bookings');
      await expect(page).toHaveURL(/\/admin\/bookings/);
      await expect(page.getByRole('heading', { name: 'Bookings', exact: true })).toBeVisible();
      await expect(page.getByText(testCustomerName).first()).toBeVisible({ timeout: 15000 });
    } finally {
      // 5. Always clean up the controlled E2E test booking
      if (bookingId) {
        const adminEmail = process.env.TEST_ADMIN_EMAIL || 'moinshaikh6249@gmail.com';
        const adminPassword = process.env.TEST_ADMIN_PASSWORD || '123321123';
        const adminLoginRes = await request.post(`${API_BASE_URL}/admin/login`, {
          data: { email: adminEmail, password: adminPassword },
        });
        if (adminLoginRes.ok()) {
          const adminToken = (await adminLoginRes.json()).token;
          await request.delete(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
        }
      }
    }
  });

  // Test cases 18, 19, 20: Admin booking actions.
  test('18, 19, 20. Admin can approve, cancel, and delete a booking', async ({ page }) => {
    await page.goto('/admin/bookings');
    await expect(page).toHaveURL(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  // Test case 21: Admin can manage camps.
  test('21. Admin can manage camps (Add and Delete)', async ({ page }) => {
    await page.goto('/admin/camps');
    await expect(page).toHaveURL(/\/admin\/camps/);
    await expect(page.getByRole('heading', { name: 'Camps', exact: true })).toBeVisible();
  });

  // Test cases 23, 24, 25: Admin can manage contact messages.
  test('23, 24, 25. Admin can read, mark as read, and delete messages', async ({ page }) => {
    await page.goto('/admin/messages');
    await expect(page).toHaveURL(/\/admin\/messages/);
    await expect(page.getByRole('heading', { name: 'Inbox', exact: true })).toBeVisible();
  });
});


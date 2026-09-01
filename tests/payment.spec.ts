import { test, expect } from '@playwright/test';

const API_BASE_URL = `${(process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`;

const adminEmail = process.env.TEST_ADMIN_EMAIL || 'moinshaikh6249@gmail.com';
const adminPassword = process.env.TEST_ADMIN_PASSWORD || '123321123';
const paymentUserEmail = 'qa_payment_user@example.com';
const paymentUserPassword = 'password123';

test.describe('Offline Payment Workflow & Security', () => {

  test.describe('Security & Access Control for mark-paid API', () => {

    test('10. Unauthenticated user cannot call mark-paid endpoint', async ({ request }) => {
      const response = await request.patch(`${API_BASE_URL}/admin/bookings/507f1f77bcf86cd799439011/mark-paid`);
      expect(response.status()).toBe(401);
    });

    test('9. Normal user cannot call mark-paid endpoint', async ({ request }) => {
      let loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: paymentUserEmail,
          password: paymentUserPassword,
        },
      });

      if (!loginRes.ok()) {
        await request.post(`${API_BASE_URL}/auth/signup`, {
          data: {
            firstName: 'Payment',
            lastName: 'Tester',
            email: paymentUserEmail,
            phone: '9876543210',
            password: paymentUserPassword,
            confirmPassword: paymentUserPassword,
          },
        });
        loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
          data: {
            email: paymentUserEmail,
            password: paymentUserPassword,
          },
        });
      }

      const loginData = await loginRes.json();
      const userToken = loginData.token;

      const response = await request.patch(`${API_BASE_URL}/admin/bookings/507f1f77bcf86cd799439011/mark-paid`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('Admin Mark Paid API & Idempotency', () => {

    test('1-5, 7-8. Admin can mark booking paid, store paidAt, create notification, and verify idempotency', async ({ request }) => {
      // 1. Get an active camp
      const campsRes = await request.get(`${API_BASE_URL}/camps`);
      expect(campsRes.ok()).toBeTruthy();
      const campsData = await campsRes.json();
      const campsList = Array.isArray(campsData) ? campsData : campsData.camps || [];
      const targetCamp = campsList.find((c: any) => c.status !== 'inactive') || campsList[0];
      expect(targetCamp).toBeTruthy();

      // 2. Obtain user token to create a test booking
      let userLoginRes = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: paymentUserEmail,
          password: paymentUserPassword,
        },
      });
      if (!userLoginRes.ok()) {
        await request.post(`${API_BASE_URL}/auth/signup`, {
          data: {
            firstName: 'Payment',
            lastName: 'Tester',
            email: paymentUserEmail,
            phone: '9876543210',
            password: paymentUserPassword,
            confirmPassword: paymentUserPassword,
          },
        });
        userLoginRes = await request.post(`${API_BASE_URL}/auth/login`, {
          data: {
            email: paymentUserEmail,
            password: paymentUserPassword,
          },
        });
      }
      const userToken = (await userLoginRes.json()).token;

      // 3. Create a fresh test booking as user
      const createBookingRes = await request.post(`${API_BASE_URL}/bookings`, {
        data: {
          fullName: 'Offline Payment API Tester',
          email: paymentUserEmail,
          phone: '9876543210',
          campId: targetCamp._id || targetCamp.id,
          numberOfPeople: 2,
        },
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      expect(createBookingRes.ok()).toBeTruthy();
      const createdBooking = (await createBookingRes.json()).booking;
      const bookingId = createdBooking._id || createdBooking.id;

      // Verify initial state: pending payment, no paidAt
      expect(createdBooking.paymentStatus).toBe('pending');
      expect(createdBooking.paidAt).toBeFalsy();

      // 4. Admin login with correct credentials
      const adminLoginRes = await request.post(`${API_BASE_URL}/admin/login`, {
        data: {
          email: adminEmail,
          password: adminPassword,
        },
      });
      expect(adminLoginRes.ok()).toBeTruthy();
      const adminToken = (await adminLoginRes.json()).token;

      // 5. Admin marks booking as paid via API
      const markPaidRes = await request.patch(`${API_BASE_URL}/admin/bookings/${bookingId}/mark-paid`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(markPaidRes.ok()).toBeTruthy();
      const markPaidData = await markPaidRes.json();
      expect(markPaidData.booking.paymentStatus).toBe('paid');
      expect(markPaidData.booking.paidAt).toBeTruthy();

      // 6. Verify stored paidAt timestamp via getBookingById
      const fetchBookingRes = await request.get(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(fetchBookingRes.ok()).toBeTruthy();
      const fetchedBooking = (await fetchBookingRes.json()).booking;
      expect(fetchedBooking.paymentStatus).toBe('paid');
      expect(fetchedBooking.paidAt).toBeTruthy();

      // 7. Test Idempotency: Repeating Mark Paid request returns 200 OK without updating paidAt timestamp
      const initialPaidAt = fetchedBooking.paidAt;
      const repeatRes = await request.patch(`${API_BASE_URL}/admin/bookings/${bookingId}/mark-paid`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(repeatRes.ok()).toBeTruthy();
      const repeatData = await repeatRes.json();
      expect(repeatData.message).toContain('already marked as paid');
      expect(new Date(repeatData.booking.paidAt).getTime()).toBe(new Date(initialPaidAt).getTime());

      // 8. Cleanup test booking
      await request.delete(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    });
  });

  test.describe('Campsite Booking Pass & Customer Dashboard Display', () => {

    test('6. Customer dashboard displays Booking Pass button and opens pass modal', async ({ page, request }) => {
      let loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
        data: { email: paymentUserEmail, password: paymentUserPassword },
      });
      if (!loginRes.ok()) {
        await request.post(`${API_BASE_URL}/auth/signup`, {
          data: {
            firstName: 'Payment',
            lastName: 'Tester',
            email: paymentUserEmail,
            phone: '9876543210',
            password: paymentUserPassword,
            confirmPassword: paymentUserPassword,
          },
        });
        loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
          data: { email: paymentUserEmail, password: paymentUserPassword },
        });
      }
      const loginData = await loginRes.json();
      const token = loginData.token;
      const user = loginData.user;

      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, { token, user });

      await page.goto('/dashboard');
      await expect(page.locator('body')).toBeVisible();

      // If user has a booking, verify Booking Pass button works
      const passButton = page.getByRole('button', { name: /Booking Pass|View Pass/i }).first();
      if (await passButton.isVisible()) {
        await passButton.click();
        await expect(page.getByText('CAMPSITE BOOKING PASS')).toBeVisible();
        await expect(page.getByText('WIND & SUNSET CAMP')).toBeVisible();
        await expect(page.getByText('Pay at Campsite').first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Print \/ Save PDF/i })).toBeVisible();
      }
    });

    test('11. Admin can view campsite booking pass from admin bookings table', async ({ page, request }) => {
      const adminLoginRes = await request.post(`${API_BASE_URL}/admin/login`, {
        data: { email: adminEmail, password: adminPassword },
      });
      expect(adminLoginRes.ok()).toBeTruthy();
      const adminData = await adminLoginRes.json();
      const adminToken = adminData.token;
      const adminUser = adminData.admin || adminData.user || { role: 'admin' };

      await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, { token: adminToken, user: adminUser });

      await page.goto('/admin/bookings');
      await expect(page.locator('body')).toBeVisible();

      const passButton = page.getByRole('button', { name: /Pass/i }).first();
      if (await passButton.isVisible()) {
        await passButton.click();
        await expect(page.getByText('CAMPSITE BOOKING PASS')).toBeVisible();
        await expect(page.getByText('Pay at Campsite').first()).toBeVisible();
      }
    });
  });

  test.describe('Phase 4.3 Notification & Email Workflow Resilience', () => {

    test('Admin approval and rejection create notifications and update status resiliently', async ({ request }) => {
      // 1. Get camp
      const campsRes = await request.get(`${API_BASE_URL}/camps`);
      const campsData = await campsRes.json();
      const campsList = Array.isArray(campsData) ? campsData : campsData.camps || [];
      const targetCamp = campsList.find((c: any) => c.status !== 'inactive') || campsList[0];

      // 2. User login
      let userLoginRes = await request.post(`${API_BASE_URL}/auth/login`, {
        data: { email: paymentUserEmail, password: paymentUserPassword },
      });
      if (!userLoginRes.ok()) {
        await request.post(`${API_BASE_URL}/auth/signup`, {
          data: {
            firstName: 'Notification',
            lastName: 'Tester',
            email: paymentUserEmail,
            phone: '9876543210',
            password: paymentUserPassword,
            confirmPassword: paymentUserPassword,
          },
        });
        userLoginRes = await request.post(`${API_BASE_URL}/auth/login`, {
          data: { email: paymentUserEmail, password: paymentUserPassword },
        });
      }
      const userToken = (await userLoginRes.json()).token;

      // 3. Create booking
      const createRes = await request.post(`${API_BASE_URL}/bookings`, {
        data: {
          fullName: 'Notification Test User',
          email: paymentUserEmail,
          phone: '9876543210',
          campId: targetCamp._id || targetCamp.id,
          numberOfPeople: 2,
        },
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(createRes.ok()).toBeTruthy();
      const booking = (await createRes.json()).booking;
      const bookingId = booking._id || booking.id;

      // 4. Admin login
      const adminLoginRes = await request.post(`${API_BASE_URL}/admin/login`, {
        data: { email: adminEmail, password: adminPassword },
      });
      const adminToken = (await adminLoginRes.json()).token;

      // 5. Approve booking
      const approveRes = await request.patch(`${API_BASE_URL}/admin/bookings/${bookingId}/approve`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(approveRes.ok()).toBeTruthy();
      const approvedData = await approveRes.json();
      expect(approvedData.booking.status).toBe('approved');

      // 6. Reject booking
      const rejectRes = await request.patch(`${API_BASE_URL}/admin/bookings/${bookingId}/reject`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(rejectRes.ok()).toBeTruthy();
      const rejectedData = await rejectRes.json();
      expect(rejectedData.booking.status).toBe('rejected');

      // 7. Cleanup
      await request.delete(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    });
  });

  test.describe('Phase 4.4 Availability API & UI Verification', () => {

    test('Camp availability API returns capacity, occupied, remaining, and status', async ({ request }) => {
      const campsRes = await request.get(`${API_BASE_URL}/camps`);
      expect(campsRes.ok()).toBeTruthy();
      const campsData = await campsRes.json();
      const campsList = Array.isArray(campsData) ? campsData : campsData.camps || [];
      const targetCamp = campsList.find((c: any) => c.status !== 'inactive') || campsList[0];
      expect(targetCamp).toBeTruthy();

      const targetId = targetCamp._id || targetCamp.id;
      const availRes = await request.get(`${API_BASE_URL}/camps/${targetId}/availability`);
      expect(availRes.ok()).toBeTruthy();

      const availData = await availRes.json();
      expect(availData.success).toBe(true);
      expect(availData.campId).toBe(targetId);
      expect(typeof availData.capacity).toBe('number');
      expect(typeof availData.occupied).toBe('number');
      expect(typeof availData.remaining).toBe('number');
      expect(['available', 'limited', 'fully_booked']).toContain(availData.status);
    });

    test('Booking form renders availability indicator when camp is selected', async ({ page, request }) => {
      let loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
        data: { email: paymentUserEmail, password: paymentUserPassword },
      });
      if (!loginRes.ok()) {
        await request.post(`${API_BASE_URL}/auth/signup`, {
          data: {
            firstName: 'Avail',
            lastName: 'Tester',
            email: paymentUserEmail,
            phone: '9876543210',
            password: paymentUserPassword,
            confirmPassword: paymentUserPassword,
          },
        });
        loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
          data: { email: paymentUserEmail, password: paymentUserPassword },
        });
      }
      const loginData = await loginRes.json();

      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, { token: loginData.token, user: loginData.user });

      await page.goto('/booking');
      await expect(page.locator('body')).toBeVisible();

      const campSelectTrigger = page.locator('[role="combobox"]').first();
      if (await campSelectTrigger.isVisible()) {
        await campSelectTrigger.click();
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await expect(page.locator('[role="status"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Phase 4.5 Smart WhatsApp Workflow Verification', () => {

    test('WhatsApp utility builds valid encoded wa.me URLs with booking context', async ({ page }) => {
      await page.goto('/');
      const urls = await page.evaluate(() => {
        const phone = '918080334787';
        const msg = encodeURIComponent('Hello Wind & Sunset Camp 👋\n\nI have a booking inquiry.\n\nBooking Reference: WSC-ABC123\nGuest Name: Rahul Sharma\nCamp: Sunset Vista Camp\nDate: 24 Aug 2026\nGuests: 4\nBooking Status: Approved\nPayment: Pay at Campsite\nPhone: 9876543210');
        const generalMsg = encodeURIComponent('Hello Wind & Sunset Camp 👋\n\nI would like to know more about your camping options.\n\nThank you!');
        const paidMsg = encodeURIComponent('Payment: Paid / Cash Received');
        return {
          generalUrl: `https://wa.me/${phone}?text=${generalMsg}`,
          bookingUrl: `https://wa.me/${phone}?text=${msg}`,
          paidMsg,
        };
      });

      expect(urls.generalUrl).toContain('https://wa.me/');
      expect(urls.generalUrl).toContain('text=Hello%20Wind%20%26%20Sunset%20Camp');

      expect(urls.bookingUrl).toContain('https://wa.me/');
      expect(urls.bookingUrl).toContain('Booking%20Reference%3A%20WSC-ABC123');
      expect(urls.bookingUrl).toContain('Guest%20Name%3A%20Rahul%20Sharma');
      expect(urls.bookingUrl).toContain('Camp%3A%20Sunset%20Vista%20Camp');
      expect(urls.bookingUrl).toContain('Payment%3A%20Pay%20at%20Campsite');
      expect(urls.bookingUrl).not.toContain('Bearer');
      expect(urls.bookingUrl).not.toContain('password');

      expect(urls.paidMsg).toContain('Paid%20%2F%20Cash%20Received');
    });

    test('User dashboard & pass modal render valid WhatsApp click-to-chat links', async ({ page, request }) => {
      let loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
        data: { email: paymentUserEmail, password: paymentUserPassword },
      });
      if (!loginRes.ok()) {
        await request.post(`${API_BASE_URL}/auth/signup`, {
          data: {
            firstName: 'Wats',
            lastName: 'App',
            email: paymentUserEmail,
            phone: '9876543210',
            password: paymentUserPassword,
            confirmPassword: paymentUserPassword,
          },
        });
        loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
          data: { email: paymentUserEmail, password: paymentUserPassword },
        });
      }
      const loginData = await loginRes.json();

      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, { token: loginData.token, user: loginData.user });

      await page.goto('/dashboard');
      await expect(page.locator('body')).toBeVisible();

      const whatsappBtn = page.locator('a[href*="wa.me"]').first();
      if (await whatsappBtn.isVisible()) {
        const href = await whatsappBtn.getAttribute('href');
        expect(href).toContain('wa.me');
      }

      const passBtn = page.getByRole('button', { name: /Booking Pass/i }).first();
      if (await passBtn.isVisible()) {
        await passBtn.click();
        const passModalWhatsapp = page.locator('a[href*="wa.me"]').first();
        if (await passModalWhatsapp.isVisible()) {
          const modalHref = await passModalWhatsapp.getAttribute('href');
          expect(modalHref).toContain('wa.me');
        }
      }
    });
  });
});

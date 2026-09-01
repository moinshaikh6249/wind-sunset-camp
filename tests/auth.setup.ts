import { test as setup } from '@playwright/test';
import { USER_AUTH_FILE, ADMIN_AUTH_FILE } from '../playwright.config';

const userEmail = process.env.TEST_USER_EMAIL || 'e2e_user_standard@example.com';
const userPassword = process.env.TEST_USER_PASSWORD || 'password123';
const adminEmail = process.env.TEST_ADMIN_EMAIL || 'moinshaikh6249@gmail.com';
const adminPassword = process.env.TEST_ADMIN_PASSWORD || '123321123';

const API_BASE_URL = `${(process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`;

// Setup for standard user
setup('authenticate as standard user', async ({ page, request }, testInfo) => {
  if (!testInfo.project.name.includes('user')) {
    return;
  }

  let loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: userEmail, password: userPassword },
  });

  if (!loginRes.ok()) {
    // If test user doesn't exist yet, register them
    const signupRes = await request.post(`${API_BASE_URL}/auth/signup`, {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: userEmail,
        phone: '9876543210',
        password: userPassword,
        confirmPassword: userPassword,
      },
    });

    if (!signupRes.ok() && signupRes.status() !== 409 && signupRes.status() !== 400) {
      throw new Error(`User auth setup failed: ${signupRes.status()}`);
    }

    loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
      data: { email: userEmail, password: userPassword },
    });

    if (!loginRes.ok()) {
      throw new Error(`User API login failed after signup: ${loginRes.status()}`);
    }
  }

  const resData = await loginRes.json();
  const token = resData.token;
  const user = resData.user;

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });

  await page.context().storageState({ path: USER_AUTH_FILE });
});

// Setup for admin user
setup('authenticate as admin user', async ({ page, request }, testInfo) => {
  if (!testInfo.project.name.includes('admin')) {
    return;
  }

  const loginRes = await request.post(`${API_BASE_URL}/admin/login`, {
    data: { email: adminEmail, password: adminPassword },
  });

  if (!loginRes.ok()) {
    throw new Error(`Admin API login failed: ${loginRes.status()}`);
  }

  const resData = await loginRes.json();
  const token = resData.token;
  const adminObj = resData.admin || resData.user || { role: 'admin' };
  const admin = { ...adminObj, role: adminObj.role || 'admin' };

  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, admin }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify(admin));
  }, { token, admin });

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

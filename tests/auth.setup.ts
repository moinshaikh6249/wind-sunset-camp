import { test as setup, expect } from '@playwright/test';
import { USER_AUTH_FILE, ADMIN_AUTH_FILE } from '../playwright.config';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const userEmail = process.env.TEST_USER_EMAIL;
const userPassword = process.env.TEST_USER_PASSWORD;
const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;

const API_BASE_URL = `${(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')}/api`;

// This setup runs once to log in as a standard user and saves the authentication state.
// This allows subsequent tests to start already logged in, making them faster and more independent.
setup('authenticate as standard user', async ({ page }) => {
  setup.skip(!setup.info().project.name.includes('setup:user'), 'Only runs in setup:user project');
  setup.skip(!userEmail || !userPassword, 'Test user credentials are not set in .env.test');

  // Ensure test user exists; if already present, backend returns 400 which is fine.
  const signupResponse = await page.request.post(`${API_BASE_URL}/auth/signup`, {
    data: {
      firstName: 'QA',
      lastName: 'E2E',
      email: userEmail,
      password: userPassword,
      confirmPassword: userPassword,
    },
  });

  if (!signupResponse.ok() && signupResponse.status() !== 400) {
    throw new Error(`Failed to ensure test user exists. Status: ${signupResponse.status()}`);
  }

  await page.goto('/login');
  await page.getByLabel('Email Address').fill(userEmail!);
  await page.getByLabel('Password').fill(userPassword!);
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for dashboard URL to confirm successful login.
  await expect(page).toHaveURL(/\/dashboard/);

  // Save the authentication state to a file.
  await page.context().storageState({ path: USER_AUTH_FILE });
});

// This setup runs once to log in as an admin user and saves the authentication state.
setup('authenticate as admin user', async ({ page }) => {
  setup.skip(!setup.info().project.name.includes('setup:admin'), 'Only runs in setup:admin project');
  setup.skip(!adminEmail || !adminPassword, 'Admin credentials are not set in .env.test');

  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill(adminEmail!);
  await page.getByLabel('Password').fill(adminPassword!);
  await page.getByRole('button', { name: 'Login as Admin' }).click();

  // Wait for admin dashboard URL to confirm successful admin login.
  await expect(page).toHaveURL(/\/admin\/dashboard/);

  // Save the admin authentication state to a file.
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

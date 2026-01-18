import { test as setup, expect } from '@playwright/test';
import { USER_AUTH_FILE, ADMIN_AUTH_FILE } from '../playwright.config';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const userEmail = process.env.TEST_USER_EMAIL;
const userPassword = process.env.TEST_USER_PASSWORD;
const adminEmail = process.env.TEST_ADMIN_EMAIL;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;

// This setup runs once to log in as a standard user and saves the authentication state.
// This allows subsequent tests to start already logged in, making them faster and more independent.
setup.describe('Authentication Setup', () => {
  setup.skip(!userEmail || !userPassword, 'Test user credentials are not set in .env.test');
  
  setup('authenticate as standard user', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(userEmail!);
    await page.getByLabel('Password').fill(userPassword!);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for the main dashboard page to load, confirming successful login.
    await expect(page.getByRole('heading', { name: 'My Booked Camps' })).toBeVisible();
    
    // Save the authentication state to a file.
    await page.context().storageState({ path: USER_AUTH_FILE });
  });
});

// This setup runs once to log in as an admin user and saves the authentication state.
setup.describe('Admin Authentication Setup', () => {
    setup.skip(!adminEmail || !adminPassword, 'Admin credentials are not set in .env.test');
    
    setup('authenticate as admin user', async ({ page }) => {
      await page.goto('/admin/login');
      await page.getByLabel('Email Address').fill(adminEmail!);
      await page.getByLabel('Password').fill(adminPassword!);
      await page.getByRole('button', { name: 'Login as Admin' }).click();
  
      // Wait for the admin dashboard to load, confirming successful admin login.
      await expect(page.getByRole('heading', { name: 'Welcome back, Admin!' })).toBeVisible();
      
      // Save the admin authentication state to a file.
      await page.context().storageState({ path: ADMIN_AUTH_FILE });
    });
});

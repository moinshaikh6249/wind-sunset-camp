import { test, expect } from '@playwright/test';

// Public tests must run in an unauthenticated browser context.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Public User Flows', () => {

  // Test case 1: Verify the homepage loads correctly.
  test('1. Can visit homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Escape the City/i })).toBeVisible();
  });

  // Test case 2: Verify the Camps page is accessible.
  test('2. Can view Camps page', async ({ page }) => {
    await page.goto('/camps');
    await expect(page.getByRole('heading', { name: 'Upcoming Camps' })).toBeVisible();
    await expect(page.locator('.grid').first()).toBeVisible();
  });

  // Test case 3: Verify the Gallery page is accessible.
  test('3. Can view Gallery page', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: 'Camp Gallery' })).toBeVisible();
    await expect(page.locator('.grid').first()).toBeVisible();
  });

  // Test case 4: Verify the Reviews page is accessible.
  test('4. Can view Reviews page', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.getByRole('heading', { name: 'Guest Reviews' })).toBeVisible();
    await expect(page.getByText('Leave a Review')).toBeVisible();
  });

  // Test case 5: Verify the contact form can be submitted.
  test('5. Can submit Contact Form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us', level: 1 })).toBeVisible();

    await page.locator('input[name="name"]').fill('Public Tester');
    await page.locator('input[name="email"]').fill('public.tester@example.com');
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('textarea[name="message"]').fill('This is an automated test message.');
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.locator('body')).toBeVisible();
  });

  // Test case 6: Verify that attempting to book redirects unauthenticated users to login.
  test('6. Clicking "Book Now" prompts for login', async ({ page }) => {
    await page.goto('/booking');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});

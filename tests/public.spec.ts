import { test, expect } from '@playwright/test';

// These tests run as a public, unauthenticated user.
test.describe('Public User Flows', () => {

  // Test case 1: Verify the homepage loads correctly.
  test('1. Can visit homepage', async ({ page }) => {
    await page.goto('/');
    // Check for a key element on the homepage.
    await expect(page.getByRole('heading', { name: 'Adventure Under the Open Sky' })).toBeVisible();
  });

  // Test case 2: Verify the Camps page is accessible.
  test('2. Can view Camps page', async ({ page }) => {
    await page.goto('/camps');
    await expect(page.getByRole('heading', { name: 'Upcoming Camps' })).toBeVisible();
    // Check that at least one camp card is visible (or the empty state).
    await expect(page.locator('div.grid > .group, div.grid > .col-span-full')).toBeVisible();
  });

  // Test case 3: Verify the Gallery page is accessible.
  test('3. Can view Gallery page', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: 'Camp Gallery' })).toBeVisible();
     // Check that at least one image is visible (or the empty state).
    await expect(page.locator('div.grid > .group, div.grid > .col-span-full')).toBeVisible();
  });

  // Test case 4: Verify the Reviews page is accessible.
  test('4. Can view Reviews page', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.getByRole('heading', { name: 'Guest Reviews' })).toBeVisible();
    // Check that the review submission form shows the login prompt for public users.
    await expect(page.getByText('You must be logged in to leave a review.')).toBeVisible();
  });

  // Test case 5: Verify the contact form can be submitted.
  test('5. Can submit Contact Form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Get in Touch' })).toBeVisible();

    // Fill out and submit the contact form.
    await page.getByLabel('Full Name').fill('Public Tester');
    await page.getByLabel('Email Address').fill('public.tester@example.com');
    await page.getByLabel('Subject').fill('Test Inquiry');
    await page.getByLabel('Your Message').fill('This is an automated test message.');
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Check for the success toast message.
    await expect(page.getByText('Message Sent!')).toBeVisible();
  });

  // Test case 6: Verify that attempting to book redirects to login.
  test('6. Clicking "Book Now" prompts for login', async ({ page }) => {
    await page.goto('/booking');
    // Check for the login prompt card.
    await expect(page.getByRole('heading', { name: 'Login to Book' })).toBeVisible();
    await expect(page.getByText('You need to be logged in to book a camp.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });
});

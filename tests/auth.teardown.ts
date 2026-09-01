import { test as teardown, expect } from '@playwright/test';

// This teardown file contains logic to clean up resources created during tests.
// For this app, it primarily handles logging out to ensure clean sessions.

const API_BASE_URL = `${(process.env.PLAYWRIGHT_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`;

teardown.describe('Auth Teardown', () => {
  teardown('cleanup test data & sessions', async ({ page, request }) => {
    // 1. Clean test-generated bookings via guarded cleanup endpoint
    try {
      const res = await request.delete(`${API_BASE_URL}/test-cleanup/e2e-bookings`, {
        headers: {
          'X-E2E-Test-Cleanup': 'true',
        },
      });
      if (res.ok()) {
        const body = await res.json();
        console.log(`[Teardown] E2E Test Bookings Cleanup: ${body.message}`);
      } else {
        console.warn(`[Teardown] Cleanup status: ${res.status()}`);
      }
    } catch (err: any) {
      console.warn('[Teardown] Cleanup error:', err?.message);
    }

    // 2. Clear browser session & local storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });
});

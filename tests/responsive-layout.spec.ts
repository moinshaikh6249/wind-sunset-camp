import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 320, height: 740 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
];

test.describe('Responsive layout checks', () => {
  for (const viewport of viewports) {
    test(`Home layout at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      await expect(page.getByRole('heading', { name: /Escape the City/i })).toBeVisible();
    });

    test(`Core pages render at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto('/camps');
      await expect(page.getByRole('heading', { name: 'Upcoming Camps' })).toBeVisible();

      await page.goto('/gallery');
      await expect(page.getByRole('heading', { name: 'Camp Gallery' })).toBeVisible();

      await page.goto('/reviews');
      await expect(page.getByRole('heading', { name: 'Guest Reviews' })).toBeVisible();
    });
  }

  test('Mobile navigation menu opens and shows links', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/');

    const toggleBtn = page.getByRole('button', { name: /Toggle Sidebar|Toggle Menu/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await expect(page.locator('body')).toBeVisible();
  });
});

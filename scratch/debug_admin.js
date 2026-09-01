const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: path.join(__dirname, '../.auth/admin.json') });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', resp => {
    if (resp.status() >= 400) console.log('RESP ERROR:', resp.status(), resp.url());
  });

  console.log('Navigating to /admin/bookings...');
  await page.goto('http://localhost:3000/admin/bookings');
  await page.waitForTimeout(3000);
  console.log('Final URL:', page.url());
  console.log('Heading text:', await page.locator('h1, h2, h3').allInnerTexts());

  await browser.close();
})();

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Open Help Center modal
  const helpBtn = page.locator('#floating-help-toggle');
  await helpBtn.click();
  await page.waitForTimeout(600);

  console.log('Testing wheel scroll while modal is open...');
  const initialY = await page.evaluate(() => window.scrollY);

  // Dispatch wheel event on the backdrop
  await page.mouse.move(100, 100);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1000);

  const newY = await page.evaluate(() => window.scrollY);
  console.log(`Scroll position before wheel: ${initialY}, after wheel: ${newY}`);

  if (newY > initialY) {
    console.log('SUCCESS: Page scrolled smoothly while command modal is open!');
  } else {
    console.log('Notice: Checking Lenis scroll...');
    const lenisScroll = await page.evaluate(() => (window).__lenis ? (window).__lenis.scroll : 0);
    console.log('Lenis scroll is:', lenisScroll);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

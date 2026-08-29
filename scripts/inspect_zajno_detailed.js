import { chromium } from 'playwright';
import path from 'path';

async function captureDetailedZajno() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  const outDir = 'C:\\Users\\dwarf\\.gemini\\antigravity-ide\\brain\\95a9e117-719d-432d-b2b4-87d6765aa818';

  console.log('Navigating to https://motion.zajno.com/...');
  await page.goto('https://motion.zajno.com/', { timeout: 35000, waitUntil: 'networkidle' });

  // Wait 6 seconds for preloader and intro to complete
  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.join(outDir, 'zajno_intro_ready.png') });
  console.log('Captured zajno_intro_ready.png');

  // Scroll down incrementally
  for (let i = 1; i <= 4; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, `zajno_scroll_${i}.png`) });
    console.log(`Captured zajno_scroll_${i}.png`);
  }

  await browser.close();
}

captureDetailedZajno().catch(console.error);

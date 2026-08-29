import { chromium } from 'playwright';
import path from 'path';

async function inspectZajno() {
  console.log('Launching browser to inspect Zajno Motion...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  const outDir = 'C:\\Users\\dwarf\\.gemini\\antigravity-ide\\brain\\95a9e117-719d-432d-b2b4-87d6765aa818';

  try {
    console.log('Navigating to https://motion.zajno.com/...');
    await page.goto('https://motion.zajno.com/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Capture initial load
    await page.screenshot({ path: path.join(outDir, 'zajno_01_hero.png') });
    console.log('Captured zajno_01_hero.png');

    // Scroll down 25%
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, 'zajno_02_section2.png') });
    console.log('Captured zajno_02_section2.png');

    // Scroll down 50%
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, 'zajno_03_section3.png') });
    console.log('Captured zajno_03_section3.png');

    // Scroll down 75%
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, 'zajno_04_section4.png') });
    console.log('Captured zajno_04_section4.png');

    console.log('Zajno Motion inspection completed successfully!');
  } catch (err) {
    console.error('Error during Zajno inspection:', err);
  } finally {
    await browser.close();
  }
}

inspectZajno();

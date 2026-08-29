import { chromium } from 'playwright';
import path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  const outDir = 'C:\\Users\\dwarf\\.gemini\\antigravity-ide\\brain\\95a9e117-719d-432d-b2b4-87d6765aa818';

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');

  // Wait for preloader to finish
  await page.waitForTimeout(2000);

  // Get max scroll distance
  const maxScroll = await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    return track ? track.offsetHeight - window.innerHeight : 4500;
  });

  // 1. Scrub to Act 2: Skills (progress 0.50)
  console.log('Scrubbing to Skills Act (progress 0.50)...');
  await page.evaluate((scrollPos) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollPos, { immediate: true });
    } else {
      window.scrollTo(0, scrollPos);
    }
  }, maxScroll * 0.50);
  await page.waitForTimeout(800);

  // Click a skill card to test portal zoom on skills
  console.log('Clicking JavaScript skill card...');
  await page.click('.skill-card.legendary');
  await page.waitForTimeout(500); // Capture mid-zoom portal effect
  await page.screenshot({ path: path.join(outDir, '07_skill_portal_zoom.png') });
  console.log('Captured 07_skill_portal_zoom.png');

  // Close skill card
  await page.click('.drawer-close-btn');
  await page.waitForTimeout(1000);

  // 2. Scrub to Act 3: Arcade Row (progress 0.75)
  console.log('Scrubbing to Arcade Runway Act (progress 0.75)...');
  await page.evaluate((scrollPos) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollPos, { immediate: true });
    } else {
      window.scrollTo(0, scrollPos);
    }
  }, maxScroll * 0.75);
  await page.waitForTimeout(800);

  // Click first arcade cabinet
  console.log('Clicking arcade cabinet...');
  await page.click('#cabinet-proj-1');
  await page.waitForTimeout(400); // Capture mid-zoom portal fly-through
  await page.screenshot({ path: path.join(outDir, '08_cabinet_portal_flythrough.png') });
  console.log('Captured 08_cabinet_portal_flythrough.png');

  await page.waitForTimeout(2200); // Fully opened state
  await page.screenshot({ path: path.join(outDir, '09_cabinet_portal_docked.png') });
  console.log('Captured 09_cabinet_portal_docked.png');

  await browser.close();
  console.log('All portal zoom screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});

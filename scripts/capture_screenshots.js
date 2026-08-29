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

  // 1. Capture Hero with War Star Shooting Meteors
  await page.waitForTimeout(800); // Allow meteors to streak
  await page.screenshot({ path: path.join(outDir, '15_hero_war_stars.png') });
  console.log('Captured 15_hero_war_stars.png');

  // Get max scroll distance
  const maxScroll = await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    return track ? track.offsetHeight - window.innerHeight : 4500;
  });

  // 2. Capture Chapter 0 -> 1 Transition (Act 0 receding up, Act 1 rising from bottom)
  console.log('Scrubbing to Chapter 0->1 transition (progress 0.16)...');
  await page.evaluate((scrollPos) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollPos, { immediate: true });
    } else {
      window.scrollTo(0, scrollPos);
    }
  }, maxScroll * 0.16);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '16_fullpage_rise_act1.png') });
  console.log('Captured 16_fullpage_rise_act1.png');

  // 3. Capture Chapter 1 -> 2 Transition (Act 1 receding up, Act 2 rising from bottom)
  console.log('Scrubbing to Chapter 1->2 transition (progress 0.40)...');
  await page.evaluate((scrollPos) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollPos, { immediate: true });
    } else {
      window.scrollTo(0, scrollPos);
    }
  }, maxScroll * 0.40);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '17_fullpage_rise_act2.png') });
  console.log('Captured 17_fullpage_rise_act2.png');

  // 4. Capture Chapter 2 -> 3 Transition (Act 2 receding, Act 3 rising from bottom)
  console.log('Scrubbing to Chapter 2->3 transition (progress 0.66)...');
  await page.evaluate((scrollPos) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollPos, { immediate: true });
    } else {
      window.scrollTo(0, scrollPos);
    }
  }, maxScroll * 0.66);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '18_fullpage_rise_act3.png') });
  console.log('Captured 18_fullpage_rise_act3.png');

  // 5. Capture Chapter 3 -> 4 Transition (Act 3 receding, Act 4 rising into cosmic space)
  console.log('Scrubbing to Chapter 3->4 transition (progress 0.96)...');
  await page.evaluate((scrollPos) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollPos, { immediate: true });
    } else {
      window.scrollTo(0, scrollPos);
    }
  }, maxScroll * 0.96);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '19_fullpage_rise_act4.png') });
  console.log('Captured 19_fullpage_rise_act4.png');

  await browser.close();
  console.log('All full-page bottom-to-up motion screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});

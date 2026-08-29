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

  // 1. Capture Rich Story Hero
  await page.screenshot({ path: path.join(outDir, '10_story_hero_rich.png') });
  console.log('Captured 10_story_hero_rich.png');

  // Get max scroll distance
  const maxScroll = await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    return track ? track.offsetHeight - window.innerHeight : 4500;
  });

  const scrollScenarios = [
    { name: '11_story_terminal_comms.png', progress: 0.25 },
    { name: '12_story_skills_comms.png', progress: 0.50 },
    { name: '13_story_arcade_comms.png', progress: 0.75 },
    { name: '14_story_beacon_uplink.png', progress: 1.00 }
  ];

  for (const item of scrollScenarios) {
    console.log(`Scrubbing to progress ${item.progress}...`);
    await page.evaluate((scrollPos) => {
      if (window.__lenis) {
        window.__lenis.scrollTo(scrollPos, { immediate: true });
      } else {
        window.scrollTo(0, scrollPos);
      }
    }, maxScroll * item.progress);

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, item.name) });
    console.log(`Captured ${item.name}`);
  }

  await browser.close();
  console.log('All narrative environment screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});

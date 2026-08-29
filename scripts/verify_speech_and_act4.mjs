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

  // 1. Verify Audio Button is ON by default
  const audioText = await page.locator('#audio-label').textContent();
  console.log('Audio label on load:', audioText);

  // 2. Scroll to Act 1 (About Me & Robot Face) and click a tab to test speech trigger
  console.log('2. Scrolling to Act 1...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, (2.0 / 12.0) * maxScroll);
    }
  });
  await page.waitForTimeout(1000);

  // Click Tab 2 (Neural Specs)
  const tab2 = page.locator('#bio-tabs button[data-tab="2"]');
  await tab2.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/43_act1_speech_synthesizer.png' });

  // 3. Scroll to Act 2 and verify ONLY ONE robot is present
  console.log('3. Scrolling to Act 2 (Verify Single Robot)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, (5.0 / 12.0) * maxScroll);
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/44_act2_single_robot_verified.png' });

  // 4. Scroll to Act 4 (Quantum Satellite Constellation)
  console.log('4. Scrolling to Act 4 (Quantum Satellite Constellation)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, (10.4 / 12.0) * maxScroll);
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/45_act4_quantum_constellation.png' });

  console.log('All verification screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

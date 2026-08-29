import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. Capture Seamless Hero
  console.log('1. Capturing Seamless Hero...');
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/28_hero_modern_reference.png' });

  // 2. Open Help Center modal and verify NO duplicate welcome message
  console.log('2. Opening Help Center CLI modal...');
  const helpBtn = page.locator('#floating-help-toggle');
  await helpBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/30_floating_cli_modal_opened.png' });

  // Close modal with Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 3. Scroll to Act 1 (About Me & Robot Face) and move mouse to test pupils
  console.log('3. Scrolling to Act 1 (About Me & Robot Face)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, 0.25 * maxScroll);
    }
  });
  await page.waitForTimeout(1500);
  await page.mouse.move(400, 300);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/33_act1_robot_face_eyes.png' });

  // 4. Scroll to Act 2 (Skills Matrix)
  console.log('4. Scrolling to Act 2 (Skills Matrix)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, 0.50 * maxScroll);
    }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/34_act2_skills_matrix.png' });

  // 5. Scroll to Act 3 (Arcade Cabinets)
  console.log('5. Scrolling to Act 3 (Arcade Cabinets)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, 0.75 * maxScroll);
    }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/35_act3_arcade_cabinets.png' });

  // 6. Scroll to Act 4 (Direct Transmission Uplink)
  console.log('6. Scrolling to Act 4 (Direct Transmission Uplink)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, 1.00 * maxScroll);
    }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/36_act4_direct_uplink.png' });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

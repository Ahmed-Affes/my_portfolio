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

  // 1. Scroll to Act 2 start (0.42 scroll progress)
  console.log('1. Capturing Act 2 Runway Start...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, 0.42 * maxScroll);
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/37_act2_runway_start.png' });

  // 2. Scroll to Act 2 mid-glide (0.48 scroll progress)
  console.log('2. Capturing Act 2 Mid-Glide (Cards sliding, Robot hopping)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, 0.48 * maxScroll);
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/38_act2_runway_mid_glide.png' });

  // 3. Scroll to Act 2 end cards (0.54 scroll progress)
  console.log('3. Capturing Act 2 End Cards...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, 0.54 * maxScroll);
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/39_act2_runway_end_cards.png' });

  console.log('Screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

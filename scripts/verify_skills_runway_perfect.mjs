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

  // 1. Pristine Act 2 entry at 0.32 scroll (Beginning of Act 2, Card 0 & 1 clearly visible)
  console.log('1. Capturing Act 2 Pristine Start (Cards 0 & 1)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, (3.6 / 12.0) * maxScroll);
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/40_act2_pristine_start_cards_0_1.png' });

  // 2. Act 2 mid-scroll (Hop across mid cards)
  console.log('2. Capturing Act 2 Mid-Scroll...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, (5.2 / 12.0) * maxScroll);
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/41_act2_mid_hop.png' });

  // 3. Act 2 end cards (Docker and Figma fully revealed in center)
  console.log('3. Capturing Act 2 End Cards (Docker and Figma fully visible)...');
  await page.evaluate(() => {
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      window.scrollTo(0, (6.6 / 12.0) * maxScroll);
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/42_act2_end_cards_docker_figma.png' });

  console.log('All verification screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

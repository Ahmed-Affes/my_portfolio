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

  // 1. Act 1: Robot Face & Dossier
  console.log('1. Capturing Act 1...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, (2.2 / 12.0) * maxScroll);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/46_act1_clean_avatar.png' });

  // 2. Act 2: Skills Runway with Laser Scanner
  console.log('2. Capturing Act 2 (Smooth Skills Runway with Laser Scanner)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, (5.0 / 12.0) * maxScroll);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/47_act2_laser_scanner_runway.png' });

  // 3. Act 4: Unified Cyber Comms Station Deck
  console.log('3. Capturing Act 4 (Unified Cyber Comms Station Deck)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, (10.6 / 12.0) * maxScroll);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/48_act4_unified_comms_deck.png' });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

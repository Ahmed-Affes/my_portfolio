import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Capture Hero Section with Subtitle Typewriter
  console.log('1. Capturing Hero Section...');
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/49_hero_transforming_subtitle.png' });

  // 2. Act 1 (About Me) - Scroll and test clicking all 3 tabs
  console.log('2. Testing Act 1 Tabs and Capturing...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, (2.2 / 12.0) * maxScroll);
  });
  await page.waitForTimeout(1000);

  // Click Tab 2 (Timeline)
  const tab2 = await page.$('button[data-tab="1"]');
  if (tab2) await tab2.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/50_act1_tab2_timeline_english.png' });

  // Click Tab 3 (Specs)
  const tab3 = await page.$('button[data-tab="2"]');
  if (tab3) await tab3.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/51_act1_tab3_specs_english.png' });

  // 3. Act 2 (Skills Runway with Jumping Robot & Visible Title)
  console.log('3. Capturing Act 2 (Skills Title & Hopping Robot)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, (4.8 / 12.0) * maxScroll);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/52_act2_skills_title_and_hopper.png' });

  // 4. Act 3 (Arcade Projects with Visible Title)
  console.log('4. Capturing Act 3 (Arcade Projects Title & Cabinets)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, (8.0 / 12.0) * maxScroll);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/53_act3_projects_visible_title.png' });

  // 5. Act 4 (Contact with Visible Title)
  console.log('5. Capturing Act 4 (Contact Stage 4 Title & Comms Deck)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.offsetHeight - window.innerHeight;
    window.scrollTo(0, (10.6 / 12.0) * maxScroll);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/54_act4_contact_visible_title.png' });

  console.log('All verification screenshots captured!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to local dev server...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Hero Page: verify zero bottom robot obstruction
  console.log('Testing Hero Page (Clean bottom)...');
  await page.screenshot({ path: path.join(artifactsDir, '60_hero_clean_no_bottom_robot_obstruction.png') });

  // 2. Act 1: Terminal & Gaze Tracker with shine badges
  console.log('Testing Act 1 (About / Terminal)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (2.0 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '61_act1_clean_click_shine_badges.png') });

  // 3. Act 2: Skills Runway - Lowered cards, balanced vertical spacing, shining [CLICK TO EXPAND] badges
  console.log('Testing Act 2 (Skills Runway)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (3.8 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '62_act2_skills_lowered_cards_and_shine_badges.png') });

  // 4. Act 3: Projects (Arcade Cabinets with shining WALK UP ▲ [CLICK] badges)
  console.log('Testing Act 3 (Arcade Projects)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (8.2 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '63_act3_arcade_projects_shining_click_badges.png') });

  // 5. Act 4: Contact (Comms Deck)
  console.log('Testing Act 4 (Quantum Comms Deck)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (10.5 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '64_act4_contact_clean_conduits.png') });

  console.log('All verification screenshots captured successfully!');
  await browser.close();
})();

import { chromium } from 'playwright';
import fs from 'fs';
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

  // 1. Act 1: Terminal text - verify zero gap before "Boot sequence initiated"
  console.log('Testing Act 1 (About / Terminal)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (2.0 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '55_act1_terminal_clean_text_no_space.png') });

  // 2. Act 2: Skills Runway Start (Card 0 with perched companion robot, spacious cards, no laser scanner)
  console.log('Testing Act 2 (Skills Runway Start)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (3.8 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '56_act2_skills_clean_spacious_runway.png') });

  // 3. Act 2 mid-scroll: Robot jumping across cards
  console.log('Testing Act 2 (Skills Runway Mid Hop)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (5.2 / 12));
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactsDir, '57_act2_robot_hopping_mid_runway.png') });

  // 4. Act 3: Projects (3D Isometric Cabinets)
  console.log('Testing Act 3 (Arcade Projects)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (8.2 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '58_act3_arcade_projects_3d_stagger.png') });

  // 5. Act 4: Contact (Quantum Comms Deck)
  console.log('Testing Act 4 (Quantum Comms Deck)...');
  await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    const maxScroll = track.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * (10.5 / 12));
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(artifactsDir, '59_act4_quantum_comms_deck.png') });

  console.log('Verification screenshots captured successfully!');
  await browser.close();
})();

import { chromium } from 'playwright';
import path from 'path';

async function verifyInteractiveSystems() {
  console.log('Launching browser to verify Robot Face, CLI Terminal & Distinct Animations...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  const outDir = 'C:\\Users\\dwarf\\.gemini\\antigravity-ide\\brain\\95a9e117-719d-432d-b2b4-87d6765aa818';

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000); // Preloader finish

  const maxScroll = await page.evaluate(() => {
    const track = document.getElementById('scroll-track');
    return track ? track.offsetHeight - window.innerHeight : 4500;
  });

  // 1. Capture Hero Section (Act 0)
  console.log('Capturing 20_hero_vortex.png...');
  await page.screenshot({ path: path.join(outDir, '20_hero_vortex.png') });

  // 2. Scroll to Act 1: Robot Face & Neural Mainframe
  console.log('Scrubbing to Act 1 (About & Robot Face)...');
  await page.evaluate((pos) => {
    if (window.__lenis) window.__lenis.scrollTo(pos, { immediate: true });
    else window.scrollTo(0, pos);
  }, maxScroll * 0.22);
  await page.waitForTimeout(1000);

  // Move mouse to top-right to test eye tracking gaze
  await page.mouse.move(1300, 150);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '21_robot_face_gaze_topright.png') });
  console.log('Captured 21_robot_face_gaze_topright.png');

  // Move mouse to bottom-left to test eye tracking gaze
  await page.mouse.move(200, 800);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '22_robot_face_gaze_btmleft.png') });
  console.log('Captured 22_robot_face_gaze_btmleft.png');

  // Click Timeline Tab in Bio Dossier
  console.log('Clicking Timeline Tab...');
  const timelineTab = await page.$('.bio-tab-btn[data-tab="1"]');
  if (timelineTab) {
    await timelineTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '23_bio_timeline_tab.png') });
    console.log('Captured 23_bio_timeline_tab.png');
  }

  // 3. Scroll to Act 2: Skills 3D Orbital Fan-out
  console.log('Scrubbing to Act 2 (Skills Orbital)...');
  await page.evaluate((pos) => {
    if (window.__lenis) window.__lenis.scrollTo(pos, { immediate: true });
    else window.scrollTo(0, pos);
  }, maxScroll * 0.48);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '24_skills_orbital_matrix.png') });
  console.log('Captured 24_skills_orbital_matrix.png');

  // 4. Scroll to Act 3: Arcade Neon Highway
  console.log('Scrubbing to Act 3 (Arcade Runway)...');
  await page.evaluate((pos) => {
    if (window.__lenis) window.__lenis.scrollTo(pos, { immediate: true });
    else window.scrollTo(0, pos);
  }, maxScroll * 0.72);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '25_arcade_highway_runway.png') });
  console.log('Captured 25_arcade_highway_runway.png');

  // 5. Scroll to Act 4: Interactive Cyber CLI Terminal
  console.log('Scrubbing to Act 4 (Cyber CLI Terminal)...');
  await page.evaluate((pos) => {
    if (window.__lenis) window.__lenis.scrollTo(pos, { immediate: true });
    else window.scrollTo(0, pos);
  }, maxScroll * 0.98);
  await page.waitForTimeout(1000);

  // Type `help` command in terminal
  console.log('Typing `help` command into CLI Terminal...');
  const cliInput = await page.$('#cli-input');
  if (cliInput) {
    await cliInput.click();
    await cliInput.fill('help');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Type `skills` command
    await cliInput.fill('skills');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click `game` pill
    const gamePill = await page.$('.cli-pill-btn[data-cmd="game"]');
    if (gamePill) await gamePill.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(outDir, '26_cli_terminal_executed.png') });
    console.log('Captured 26_cli_terminal_executed.png');

    // Click `matrix` pill to activate digital matrix rain
    const matrixPill = await page.$('.cli-pill-btn[data-cmd="matrix"]');
    if (matrixPill) {
      await matrixPill.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, '27_cli_matrix_rain.png') });
      console.log('Captured 27_cli_matrix_rain.png');
    }
  }

  await browser.close();
  console.log('All interactive systems verification screenshots captured successfully!');
}

verifyInteractiveSystems().catch(console.error);

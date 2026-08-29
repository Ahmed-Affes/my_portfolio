import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Wait for preloader to vanish
  await page.waitForTimeout(2500);

  // 1. Capture Modern Hero Section
  console.log('Capturing Modern Hero Section...');
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/28_hero_modern_reference.png' });

  // 2. Hover Floating Help Center Button
  console.log('Hovering Floating Help Center Button...');
  const helpBtn = page.locator('#floating-help-toggle');
  await helpBtn.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/29_floating_help_launcher.png' });

  // 3. Click Floating Help Center Button to open modal
  console.log('Opening Help Center CLI modal...');
  await helpBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/30_floating_cli_modal_opened.png' });

  // 4. Click a quick pill (e.g. projects)
  console.log('Clicking Projects quick pill in modal...');
  const projPill = page.locator('.cli-pill-btn[data-cmd="projects"]');
  await projPill.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/31_floating_cli_command_executed.png' });

  // 5. Close modal by pressing Escape
  console.log('Closing modal with Escape...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 6. Scroll to Act 4 (Direct Neural Uplink)
  console.log('Scrolling to Act 4...');
  await page.evaluate(() => {
    const act4 = document.getElementById('act-contact');
    if (act4) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/dwarf/.gemini/antigravity-ide/brain/95a9e117-719d-432d-b2b4-87d6765aa818/32_direct_transmission_act4.png' });

  console.log('Verification screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2500);

  const diagHero = await page.evaluate(() => {
    const boot = document.querySelector('#act-boot');
    const term = document.querySelector('#act-terminal');
    return {
      bootOpacity: window.getComputedStyle(boot).opacity,
      termOpacity: window.getComputedStyle(term).opacity,
      termDisplay: window.getComputedStyle(term).display,
      termRect: term.getBoundingClientRect()
    };
  });
  console.log('Hero State:', diagHero);

  // Scroll to 25%
  const maxScroll = await page.evaluate(() => {
    return document.getElementById('scroll-track').offsetHeight - window.innerHeight;
  });
  console.log('MaxScroll:', maxScroll);

  await page.evaluate((scrollPos) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollPos, { immediate: true });
    } else {
      window.scrollTo(0, scrollPos);
    }
  }, maxScroll * 0.25);
  await page.waitForTimeout(500);

  const diag25 = await page.evaluate(() => {
    const boot = document.querySelector('#act-boot');
    const term = document.querySelector('#act-terminal');
    return {
      scrollY: window.scrollY,
      bootOpacity: window.getComputedStyle(boot).opacity,
      termOpacity: window.getComputedStyle(term).opacity,
      termTransform: window.getComputedStyle(term).transform,
      termRect: term.getBoundingClientRect()
    };
  });
  console.log('Scrolled 25% State:', diag25);

  await browser.close();
}

diagnose();

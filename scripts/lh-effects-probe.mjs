#!/usr/bin/env node
/**
 * Probe WebGL + motion budget for Lighthouse harness evidence (AC-18 follow-up).
 * Usage: node scripts/lh-effects-probe.mjs <url> <mobile|desktop> <effects-on|fallback>
 */
import { chromium, devices } from '@playwright/test';

const url = process.argv[2] || 'http://127.0.0.1:4173/';
const formFactor = process.argv[3] === 'desktop' ? 'desktop' : 'mobile';
const pathMode = process.argv[4] === 'fallback' ? 'fallback' : 'effects-on';
const forceReducedMotion = pathMode === 'fallback';

const chromePath = process.env.CHROME_PATH || '/usr/bin/google-chrome-stable';

const launchArgs = forceReducedMotion
  ? ['--disable-gpu', '--force-prefers-reduced-motion']
  : [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', ...launchArgs],
  });

  const contextOptions =
    formFactor === 'desktop'
      ? {
          viewport: { width: 1350, height: 940 },
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
          reducedMotion: forceReducedMotion ? 'reduce' : 'no-preference',
        }
      : {
          ...devices['Pixel 7'],
          reducedMotion: forceReducedMotion ? 'reduce' : 'no-preference',
        };

  const context = await browser.newContext(contextOptions);

  // Align hardware hints with A3.5.1 desktop-tier gates on desktop probes.
  if (formFactor === 'desktop' && !forceReducedMotion) {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        configurable: true,
        get: () => 8,
      });
      Object.defineProperty(navigator, 'deviceMemory', {
        configurable: true,
        get: () => 8,
      });
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        get: () => ({ saveData: false }),
      });
    });
  }

  const page = await context.newPage();
  const threeReqs = [];
  page.on('request', (req) => {
    const u = req.url();
    if (/EmeraldHorizon|threeui|EmeraldHorizonLazy/i.test(u)) threeReqs.push(u);
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  // Engagement-gated heavy mounts: synthesize a pointer so ThreeUI/Glisse/SplitText can warm.
  if (formFactor === 'desktop' && !forceReducedMotion) {
    await page.mouse.move(640, 400);
    await page.mouse.down();
    await page.mouse.up();
    await page.dispatchEvent('body', 'pointerdown', { bubbles: true });
    // load → idle (≤2s) → warmup → ThreeUI chunk
    await page.waitForTimeout(5000);
    if (new URL(url).pathname === '/' || new URL(url).pathname === '') {
      try {
        await page.waitForSelector('[data-hero-stage="threeui"] canvas, .hero-stage-canvas canvas', {
          timeout: 10_000,
        });
      } catch {
        /* recorded below as heroCanvasMounted:false */
      }
    }
  } else {
    await page.waitForTimeout(1500);
  }

  const probe = await page.evaluate(() => {
    let webgl = false;
    try {
      const c = document.createElement('canvas');
      webgl = Boolean(
        c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')
      );
    } catch {
      webgl = false;
    }
    const heroCanvas = Boolean(document.querySelector('[data-hero-stage="threeui"] canvas, .hero-stage-canvas canvas, canvas'));
    const heroThree = Boolean(document.querySelector('[data-hero-stage="threeui"]'));
    const heroFallback = Boolean(
      document.querySelector('[data-hero-stage="fallback"], [data-hero-stage="poster"]')
    );
    const routeGpu = Boolean(document.querySelector('[data-route-transition="gpu"]'));
    const budgetAttr =
      document.querySelector('[data-motion-budget]')?.getAttribute('data-motion-budget') || null;
    const vw = window.innerWidth;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      webgl,
      heroCanvasMounted: heroCanvas && heroThree,
      heroThreeStage: heroThree,
      heroFallbackStage: heroFallback,
      routeTransitionGpu: routeGpu,
      budgetAttr,
      viewportWidth: vw,
      pointerFine: fine,
      prefersReducedMotion: reduced,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
    };
  });

  // Derive budget the same way the app does when possible
  let budget = probe.budgetAttr;
  if (!budget) {
    const effectsOn =
      !probe.prefersReducedMotion &&
      probe.webgl &&
      probe.viewportWidth >= 1024 &&
      probe.pointerFine &&
      (probe.hardwareConcurrency == null || probe.hardwareConcurrency >= 6) &&
      (probe.deviceMemory == null || probe.deviceMemory >= 4);
    budget = effectsOn ? 'effects-on' : 'fallback';
  }

  await browser.close();

  const out = {
    url,
    formFactor,
    pathMode,
    forceReducedMotion,
    chromeArgs: launchArgs,
    webgl: probe.webgl,
    budget,
    heroCanvasMounted: probe.heroCanvasMounted,
    heroThreeStage: probe.heroThreeStage,
    heroFallbackStage: probe.heroFallbackStage,
    heroThreeRequested: threeReqs.length > 0,
    threeRequestCount: threeReqs.length,
    routeTransitionGpu: probe.routeTransitionGpu,
    viewportWidth: probe.viewportWidth,
    pointerFine: probe.pointerFine,
    prefersReducedMotion: probe.prefersReducedMotion,
    hardwareConcurrency: probe.hardwareConcurrency,
    deviceMemory: probe.deviceMemory,
  };
  process.stdout.write(`${JSON.stringify(out)}\n`);
}

main().catch((err) => {
  console.error(String(err?.stack || err));
  process.exit(1);
});

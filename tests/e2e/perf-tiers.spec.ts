import { test, expect } from '@playwright/test';

/**
 * AC-31: mobile profile must not request ThreeUI; desktop may after load+idle.
 * INP proxy is its own test so the waived rAF assert cannot hide it (QA A-3 / Fix-4).
 */

test.describe('perf tiers', () => {
  test('mobile 375: ThreeUI chunk is never requested; poster visible', async ({
    page,
  }) => {
    const threeReqs: string[] = [];
    page.on('request', (req) => {
      const u = req.url();
      if (/EmeraldHorizon|emerald-horizon|threeui/i.test(u) && u.endsWith('.js')) {
        threeReqs.push(u);
      }
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ media: 'screen' });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-hero"]');
    await page.waitForTimeout(2500);
    expect(threeReqs, `unexpected ThreeUI requests: ${threeReqs.join('\n')}`).toEqual(
      []
    );
    const poster = page.locator(
      '[data-hero-stage="poster"], [data-hero-poster], [data-hero-stage="fallback"]'
    );
    await expect(poster.first()).toBeVisible();
    await expect(page.locator('[data-hero-stage="threeui"]')).toHaveCount(0);
  });

  test('desktop 1280 fine pointer: canvas mounts only after load+idle; DPR ≤ 1.5', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
      });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-hero"]');

    const early = await page.evaluate(() => ({
      ready: document.readyState,
      three: Boolean(document.querySelector('[data-hero-stage="threeui"]')),
    }));
    if (early.ready !== 'complete') {
      expect(early.three).toBe(false);
    }

    // Heavy ThreeUI mount is engagement-gated (cold-load TBT); synthesize pointer after load.
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.mouse.move(640, 400);
    await page.mouse.down();
    await page.mouse.up();

    await page.waitForSelector('[data-hero-stage="threeui"] canvas', {
      timeout: 10000,
    });

    const dprCap = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-hero-stage="threeui"] canvas'
      ) as HTMLCanvasElement | null;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const ratio = canvas.width / Math.max(1, rect.width);
      return ratio;
    });
    expect(dprCap).not.toBeNull();
    expect(dprCap!).toBeLessThanOrEqual(1.5 + 0.05);
  });

  // Waiver: Cameron / plan.md Amendment 3 (QA cycle-2 t1174s4945) — desktop
  // rAF p95 ≤20 ms lab miss is accepted. Keep the assert but skip so it cannot
  // hide the INP proxy test below.
  test.skip(
    'desktop: rAF p95 ≤ 20ms over 5s after mount (WAIVED — plan.md Amendment 3 / t1174s4945)',
    async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 8,
        });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      });
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await page.waitForSelector('[data-hero-stage="threeui"] canvas', {
        timeout: 10000,
      });

      const frameStats = await page.evaluate(async () => {
        const deltas: number[] = [];
        let last = performance.now();
        await new Promise<void>((resolve) => {
          const start = performance.now();
          const tick = (now: number) => {
            deltas.push(now - last);
            last = now;
            if (now - start >= 5000) resolve();
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        const sorted = [...deltas].sort((a, b) => a - b);
        const p95 =
          sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
        const longTasks = deltas.filter((d) => d > 50).length;
        return { p95, longTasks, samples: deltas.length };
      });
      expect(frameStats.p95).toBeLessThanOrEqual(20);
      expect(frameStats.longTasks).toBeLessThanOrEqual(1);
    }
  );

  test('desktop INP proxy: theme / nav / menu ≤ 200ms at 4× CPU', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
      });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-hero"]');

    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    async function measureClick(selector: string, { preventNav = false } = {}) {
      return page.evaluate(
        async ({ sel, preventNav: blockNav }) => {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (!el) return Number.POSITIVE_INFINITY;
          const stop = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
          };
          if (blockNav) el.addEventListener('click', stop, true);
          const t0 = performance.now();
          el.dispatchEvent(
            new MouseEvent('click', { bubbles: true, cancelable: true })
          );
          await new Promise((r) => requestAnimationFrame(() => r(null)));
          await new Promise((r) => requestAnimationFrame(() => r(null)));
          const dt = performance.now() - t0;
          if (blockNav) el.removeEventListener('click', stop, true);
          return dt;
        },
        { sel: selector, preventNav }
      );
    }

    const themeMs = await measureClick(
      'button[aria-label*="theme" i], button[aria-label*="Theme" i]'
    );
    expect(themeMs).toBeLessThanOrEqual(200);

    const navMs = await measureClick('a[href="/projects"]', { preventNav: true });
    expect(navMs).toBeLessThanOrEqual(200);

    // Menu toggle is mobile-only; on desktop the control may be hidden — skip if absent.
    const menuVisible = await page.locator('.menu-toggle').isVisible();
    if (menuVisible) {
      const menuMs = await measureClick('.menu-toggle');
      expect(menuMs).toBeLessThanOrEqual(200);
    }
  });
});

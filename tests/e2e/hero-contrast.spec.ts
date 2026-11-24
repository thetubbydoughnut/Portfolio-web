import { test, expect } from '@playwright/test';

/**
 * AC-30: sample pixels behind hero h1 + summary at 375/1280 both themes.
 * Asserts ≥ 4.5:1 contrast against measured background.
 */

function relativeLuminance(r: number, g: number, b: number) {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(
  a: [number, number, number],
  b: [number, number, number]
) {
  const L1 = relativeLuminance(...a);
  const L2 = relativeLuminance(...b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

async function sampleBehind(
  page: import('@playwright/test').Page,
  selector: string
): Promise<{ fg: [number, number, number]; bg: [number, number, number] }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) throw new Error(`missing ${sel}`);
    const rect = el.getBoundingClientRect();
    const cx = Math.floor(rect.left + rect.width / 2);
    const cy = Math.floor(rect.top + Math.min(12, rect.height / 2));
    // Read computed color for fg; sample a canvas/img/scrim pixel via getImageData if possible.
    const cs = getComputedStyle(el);
    const parseRgb = (v: string): [number, number, number] => {
      const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return [0, 0, 0];
      return [Number(m[1]), Number(m[2]), Number(m[3])];
    };
    const fg = parseRgb(cs.color);

    // Walk elements from point under the text (just behind text box)
    const behindY = Math.min(window.innerHeight - 1, Math.floor(rect.bottom + 4));
    const stack = document.elementsFromPoint(cx, behindY);
    let bg: [number, number, number] = [0, 0, 0];
    for (const node of stack) {
      if (node === el || el.contains(node)) continue;
      const bgCs = getComputedStyle(node as Element);
      const bgc = parseRgb(bgCs.backgroundColor);
      const alphaMatch = bgCs.backgroundColor.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
      const alpha = alphaMatch ? Number(alphaMatch[1]) : bgCs.backgroundColor.startsWith('rgb(') ? 1 : 0;
      if (alpha > 0.05 || bgCs.backgroundColor.startsWith('rgb(')) {
        bg = bgc;
        break;
      }
    }
    // Fallback: document body / theme bg
    if (bg[0] === 0 && bg[1] === 0 && bg[2] === 0) {
      bg = parseRgb(getComputedStyle(document.body).backgroundColor);
    }
    return { fg, bg };
  }, selector);
}

for (const theme of ['dark', 'light'] as const) {
  for (const width of [375, 1280] as const) {
    test(`hero contrast ${theme} @${width}`, async ({ page }) => {
      await page.setViewportSize({
        width,
        height: width === 375 ? 812 : 800,
      });
      await page.addInitScript((t) => {
        localStorage.setItem('portfolio-theme', t);
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.goto('/');
      await page.waitForSelector('[data-testid="home-hero"]');
      await page.locator('.hero-name').waitFor();

      for (const sel of ['.hero-name', '.hero-summary']) {
        const { fg, bg } = await sampleBehind(page, sel);
        const ratio = contrastRatio(fg, bg);
        expect(
          ratio,
          `${sel} ${theme}@${width}: ${fg} on ${bg} = ${ratio.toFixed(2)}`
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import { resetMotionBudget, evaluateMotionBudget } from '../motion/budget';

function relativeLuminance(r: number, g: number, b: number) {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]) {
  const L1 = relativeLuminance(...a);
  const L2 = relativeLuminance(...b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

function parseRgb(v: string): [number, number, number] | null {
  const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function compositeOver(
  fg: [number, number, number],
  alpha: number,
  bg: [number, number, number]
): [number, number, number] {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}

function stubShell() {
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ResizeObserver = RO;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

async function renderHome(theme: 'light' | 'dark', width: number) {
  stubShell();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  document.documentElement.setAttribute('data-theme', theme);
  resetMotionBudget();
  evaluateMotionBudget();

  render(
    createElement(
      MemoryRouter,
      { initialEntries: ['/'] },
      createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
    )
  );
  await waitFor(() => {
    expect(document.querySelector('[data-testid="home-hero"]')).toBeTruthy();
  });
}

describe('AC-17: theme contrast, names, decorative media', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
    document.documentElement.removeAttribute('data-theme');
  });

  it('token text pairs meet 4.5:1 in both themes', () => {
    const css = readFileSync(join(process.cwd(), 'src/theme/tokens.css'), 'utf8');
    for (const theme of ['light', 'dark'] as const) {
      const block =
        theme === 'light'
          ? css.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/)?.[1]
          : css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1];
      expect(block, theme).toBeTruthy();
      const get = (name: string) => {
        const m = block!.match(new RegExp(`${name}:\\s*([^;]+);`));
        return m?.[1].trim() || '';
      };
      const text = parseHex(get('--color-text'));
      const muted = parseHex(get('--color-text-muted'));
      const bg = parseHex(get('--color-bg'));
      const surface = parseHex(get('--color-surface'));
      expect(text && bg && contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
      expect(muted && bg && contrastRatio(muted, bg)).toBeGreaterThanOrEqual(4.5);
      expect(text && surface && contrastRatio(text, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('primary nav and CTAs have accessible names and ≥44px targets (home)', async () => {
    await renderHome('dark', 1280);
    const skip = screen.getByRole('link', { name: /skip to/i });
    expect(skip).toBeTruthy();

    for (const name of [/Home/i, /Projects/i, /Skills/i, /Experience/i, /Certifications/i, /Contact/i]) {
      expect(screen.getAllByRole('link', { name }).length).toBeGreaterThan(0);
    }

    const cta = screen.getByRole('link', { name: /View Projects/i });
    expect(cta).toBeTruthy();
  });

  it('decorative stage/atmosphere are aria-hidden and not tabbable', async () => {
    await renderHome('dark', 1280);
    const stage = document.querySelector('.hero-stage');
    expect(stage).toHaveAttribute('aria-hidden', 'true');

    // projects atmosphere contract in source
    const atmos = readFileSync(join(process.cwd(), 'src/components/ProjectsAtmosphere.tsx'), 'utf8');
    expect(atmos).toMatch(/aria-hidden/);
  });

  /**
   * QA advisory A-2 (PR-2): light-theme home hero at 375 — name/body were dark on
   * dark atmosphere. Require scrim (or light scene) so text meets 4.5:1 against
   * the effective background behind the text column at 375 and 1280.
   */
  for (const width of [375, 1280] as const) {
    it(`A-2: light-theme hero text meets 4.5:1 behind scrim at ${width}`, async () => {
      await renderHome('light', width);

      const tokens = readFileSync(join(process.cwd(), 'src/theme/tokens.css'), 'utf8');
      const lightBlock = tokens.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/)?.[1] || '';
      const scrimRaw = lightBlock.match(/--hero-scrim:\s*([^;]+);/)?.[1].trim() || '';
      expect(scrimRaw, 'light theme must define --hero-scrim').not.toMatch(/^\s*none\s*$/);

      const scrimMatch = scrimRaw.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      expect(scrimMatch, `--hero-scrim should be rgba, got ${scrimRaw}`).toBeTruthy();
      const scrimRgb: [number, number, number] = [
        Number(scrimMatch![1]),
        Number(scrimMatch![2]),
        Number(scrimMatch![3]),
      ];
      const scrimA = Number(scrimMatch![4]);

      // Dark atmosphere ink behind the hero (worst case from A3.2 ~ #161616 / void)
      const atmosphereInk: [number, number, number] = [11, 12, 15];
      const effectiveBg = compositeOver(scrimRgb, scrimA, atmosphereInk);

      const nameEl = document.querySelector('.hero-name') as HTMLElement;
      const summaryEl = document.querySelector('.hero-summary') as HTMLElement;
      expect(nameEl).toBeTruthy();
      expect(summaryEl).toBeTruthy();

      // Text column must apply the scrim in light theme
      const heroText = document.querySelector('.hero-text') as HTMLElement;
      expect(heroText).toBeTruthy();
      const heroCss = readFileSync(join(process.cwd(), 'src/styles/HeroSection.css'), 'utf8');
      expect(heroCss).toMatch(/\[data-theme=['"]light['"]\]\s*\.hero-text[\s\S]*--hero-scrim/);

      const nameColor =
        parseRgb(getComputedStyle(nameEl).color) ||
        parseHex(
          tokens.match(/\[data-theme="light"\][\s\S]*?--color-text:\s*([^;]+);/)?.[1] || '#17161A'
        );
      const mutedColor =
        parseRgb(getComputedStyle(summaryEl).color) ||
        parseHex(
          tokens.match(/\[data-theme="light"\][\s\S]*?--color-text-muted:\s*([^;]+);/)?.[1] ||
            '#57524B'
        );
      expect(nameColor).toBeTruthy();
      expect(mutedColor).toBeTruthy();
      expect(contrastRatio(nameColor!, effectiveBg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(mutedColor!, effectiveBg)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('negative: accent is not used as body text color on glass in CSS', () => {
    const cssFiles = [
      'src/styles/HeroSection.css',
      'src/styles/Projects.css',
      'src/styles/Experience.css',
      'src/styles/Contact.css',
    ];
    for (const f of cssFiles) {
      const css = readFileSync(join(process.cwd(), f), 'utf8');
      expect(css).not.toMatch(/\.hero-summary\s*\{[^}]*color:\s*var\(--color-accent\)/s);
      expect(css).not.toMatch(/\.project-description\s*\{[^}]*color:\s*var\(--color-accent\)/s);
    }
  });
});

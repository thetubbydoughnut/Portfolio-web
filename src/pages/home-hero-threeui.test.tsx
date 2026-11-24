import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import HeroSection from '../components/HeroSection.jsx';
import { evaluateMotionBudget, resetMotionBudget } from '../motion/budget';
import { ensureSharedDist, collectDistJs } from '../test/ensure-dist-build.js';

function stubBudget(effectsOn: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce') ? !effectsOn : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() =>
    effectsOn ? ({ getExtension: vi.fn() } as unknown as RenderingContext) : null
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: { saveData: false },
  });
}

describe('AC-20: home hero ThreeUI', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
  });

  it('loads EmeraldHorizonBackground via subpath + React.lazy only', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/HeroThreeBackground.tsx'),
      'utf8'
    );
    expect(src).toMatch(
      /@designcodeio\/threeui\/components\/EmeraldHorizonBackground/
    );
    expect(src).toMatch(/React\.lazy|lazy\(/);
    expect(src).not.toMatch(/from ['"]@designcodeio\/threeui['"]/);
    expect(src).not.toMatch(/threeui-cli/);
    expect(src).not.toMatch(/lib-dist\/assets/);
  });

  it('shows static fallback under reduced-motion budget (no 3D)', () => {
    stubBudget(false);
    evaluateMotionBudget();
    render(createElement(MemoryRouter, null, createElement(HeroSection)));
    expect(document.querySelector('[data-hero-stage="fallback"]')).toBeTruthy();
    expect(document.querySelector('[data-hero-stage="threeui"]')).toBeNull();
  });

  it('marks the stage decorative with aria-hidden', () => {
    stubBudget(false);
    evaluateMotionBudget();
    render(createElement(MemoryRouter, null, createElement(HeroSection)));
    const stage = document.querySelector('.hero-stage');
    expect(stage).toHaveAttribute('aria-hidden', 'true');
  });

  it(
    'bundle: initial home graph does not include ThreeUI chunk or package root barrel',
    async () => {
      await ensureSharedDist();
      const indexHtml = readFileSync(join(process.cwd(), 'dist/index.html'), 'utf8');
      const allJs = collectDistJs(join(process.cwd(), 'dist'));

      // Entry scripts referenced from index.html should not embed ThreeUI.
      const entryMatches = [...indexHtml.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
      for (const rel of entryMatches) {
        const file = join(process.cwd(), 'dist', rel.replace(/^\//, ''));
        const body = readFileSync(file, 'utf8');
        expect(body).not.toMatch(/EmeraldHorizonBackground/);
        expect(body).not.toMatch(/@designcodeio\/threeui/);
      }

      // Package root barrel / Pro CLI must not appear; lazy chunk may exist separately.
      expect(allJs).not.toMatch(/from"@designcodeio\/threeui"/);
      expect(allJs).not.toMatch(/from"@designcodeio\/threeui'/);
      expect(allJs).not.toMatch(/threeui-cli/);

      const publicAssets = join(process.cwd(), 'public');
      const walk = (dir: string): string[] => {
        try {
          return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
            d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]
          );
        } catch {
          return [];
        }
      };
      const leaked = walk(publicAssets).filter((p) => p.includes('lib-dist'));
      expect(leaked).toEqual([]);
    },
    120_000
  );
});

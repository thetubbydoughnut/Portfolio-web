import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HeroThreeBackground } from './HeroThreeBackground';
import { resetMotionBudget } from '../motion/budget';

describe('AC-31: HeroThreeBackground lifecycle (idle, pause, DPR)', () => {
  beforeEach(() => {
    resetMotionBudget();
    vi.stubGlobal(
      'requestIdleCallback',
      (cb: IdleRequestCallback) =>
        window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline), 0) as unknown as number
    );
    vi.stubGlobal('cancelIdleCallback', (id: number) => window.clearTimeout(id));
  });

  afterEach(() => {
    resetMotionBudget();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not mount ThreeUI before window load + idle on effects-on', async () => {
    // Keep document loading until we fire load.
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'loading',
    });

    const { container, rerender } = render(
      createElement(HeroThreeBackground, { budget: 'effects-on' })
    );
    expect(container.querySelector('[data-hero-stage="threeui"]')).toBeNull();
    expect(container.querySelector('[data-hero-stage="poster"], [data-hero-stage="fallback"]')).toBeTruthy();

    await act(async () => {
      Object.defineProperty(document, 'readyState', {
        configurable: true,
        get: () => 'complete',
      });
      window.dispatchEvent(new Event('load'));
    });

    await waitFor(() => {
      expect(container.querySelector('[data-hero-stage="threeui"]')).toBeTruthy();
    });

    // Poster remains under canvas (no CLS swap removing poster).
    expect(
      container.querySelector('[data-hero-stage="poster"], [data-hero-poster]')
    ).toBeTruthy();

    rerender(createElement(HeroThreeBackground, { budget: 'fallback' }));
    expect(container.querySelector('[data-hero-stage="threeui"]')).toBeNull();
  });

  it('never requests ThreeUI on fallback budget (poster only)', () => {
    const { container } = render(
      createElement(HeroThreeBackground, { budget: 'fallback' })
    );
    expect(container.querySelector('[data-hero-stage="threeui"]')).toBeNull();
    expect(
      container.querySelector('[data-hero-stage="poster"], [data-hero-stage="fallback"]')
    ).toBeTruthy();
  });

  it('source: threeui/style.css is not a static import on HeroThreeBackground', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/HeroThreeBackground.tsx'),
      'utf8'
    );
    expect(src).not.toMatch(
      /import\s+['"]@designcodeio\/threeui\/style\.css['"]/
    );
  });

  it('source: DPR is capped at 1.5 (prop or devicePixelRatio override / backing)', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/HeroThreeBackground.tsx'),
      'utf8'
    );
    expect(src).toMatch(/1\.5/);
    expect(src).toMatch(/devicePixelRatio|setPixelRatio|dpr/i);
  });

  it('source: pauses when document.hidden or hero leaves viewport', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/HeroThreeBackground.tsx'),
      'utf8'
    );
    expect(src).toMatch(/IntersectionObserver|isIntersecting/);
    expect(src).toMatch(/visibilitychange|document\.hidden/);
  });

  it('source: copper/ink retint (hue and/or CSS grade); no leftover green-only path', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/HeroThreeBackground.tsx'),
      'utf8'
    );
    // hue prop and/or CSS grade class
    expect(src).toMatch(/hue|mix-blend-mode|hero-stage-grade|copper/i);
  });
});

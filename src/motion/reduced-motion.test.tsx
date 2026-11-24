import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import HeroSection from '../components/HeroSection.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { evaluateMotionBudget, resetMotionBudget } from './budget';
import { useMotionBudget } from './useMotionBudget';

function stubMotion(reduced: boolean, webgl = true) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce') ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() =>
    webgl ? ({ getExtension: vi.fn() } as unknown as RenderingContext) : null
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: { saveData: false },
  });
}

describe('AC-8: reduced motion / fallback budget', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
  });

  it('does not mount a ThreeUI/canvas stage when reduced motion is set', async () => {
    stubMotion(true);
    evaluateMotionBudget();
    render(createElement(MemoryRouter, null, createElement(HeroSection)));
    expect(document.querySelector('[data-hero-stage="threeui"]')).toBeNull();
    expect(document.querySelector('[data-hero-stage="fallback"]')).toBeTruthy();
    expect(document.querySelector('canvas')).toBeNull();
    expect(screen.getByRole('heading', { name: /Cameron Graham/i })).toBeInTheDocument();
  });

  it('page transition is instant (no translate/scale) under fallback', () => {
    stubMotion(true);
    evaluateMotionBudget();
    render(
      createElement(
        MemoryRouter,
        null,
        createElement(PageTransition, null, createElement('div', null, 'page'))
      )
    );
    const el = document.querySelector('[data-page-transition]');
    expect(el).toHaveAttribute('data-page-transition', 'instant');
    expect(el).toHaveAttribute('data-motion-budget', 'fallback');
  });

  it('negative: effects-on path is not used when reduced-motion matches', () => {
    stubMotion(true);
    expect(evaluateMotionBudget()).toBe('fallback');
  });

  it('R-2: button:hover translateY is gated behind prefers-reduced-motion: no-preference', () => {
    const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');
    expect(css).toMatch(
      /@media\s*\(\s*prefers-reduced-motion:\s*no-preference\s*\)\s*\{[^}]*button:hover[^}]*translateY\(-2px\)/s
    );
    // Ungated hover transform must not remain outside that media query.
    const withoutMotionMedia = css.replace(
      /@media\s*\(\s*prefers-reduced-motion:\s*no-preference\s*\)\s*\{[\s\S]*?\n\}/g,
      ''
    );
    expect(withoutMotionMedia).not.toMatch(/button:hover\s*\{[^}]*translateY\(-2px\)/s);
  });

  it('R-3: useMotionBudget resubscribes when prefers-reduced-motion changes', () => {
    let reduced = false;
    const listeners = new Set<(ev: MediaQueryListEvent) => void>();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce') ? reduced : false,
        media: query,
        addEventListener: (_type: string, cb: (ev: MediaQueryListEvent) => void) => {
          listeners.add(cb);
        },
        removeEventListener: (_type: string, cb: (ev: MediaQueryListEvent) => void) => {
          listeners.delete(cb);
        },
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ({ getExtension: vi.fn() }) as unknown as RenderingContext
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false },
    });

    function Probe() {
      const budget = useMotionBudget();
      return createElement('div', { 'data-testid': 'budget' }, budget);
    }

    render(createElement(Probe));
    expect(screen.getByTestId('budget').textContent).toBe('effects-on');

    reduced = true;
    act(() => {
      listeners.forEach((cb) =>
        cb({ matches: true } as MediaQueryListEvent)
      );
    });
    expect(screen.getByTestId('budget').textContent).toBe('fallback');
    expect(listeners.size).toBeGreaterThan(0);
  });
});

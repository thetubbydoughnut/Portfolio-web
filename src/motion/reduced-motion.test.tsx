import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from '../components/HeroSection.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { evaluateMotionBudget, resetMotionBudget } from './budget';

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
});

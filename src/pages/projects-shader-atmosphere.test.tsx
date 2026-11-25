import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import { evaluateMotionBudget, resetMotionBudget } from '../motion/budget';

const VIDEO = join(process.cwd(), 'public/images/projects/shader-lab-atmosphere.webm');
const POSTER = join(process.cwd(), 'public/images/projects/shader-lab-atmosphere-poster.webp');
const HAS_ASSET = existsSync(VIDEO) && existsSync(POSTER);

function stubBudget(effectsOn: boolean) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: effectsOn ? 1280 : 375 });
  Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: effectsOn ? 8 : 2 });
  Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: effectsOn ? 8 : 2 });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        (query.includes('prefers-reduced-motion: reduce') && !effectsOn) ||
        (query.includes('pointer: fine') && effectsOn) ||
        (query.includes('min-width: 1024') && effectsOn),
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
    value: { saveData: !effectsOn },
  });
}

async function renderProjects() {
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

  render(
    createElement(
      MemoryRouter,
      { initialEntries: ['/projects'] },
      createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
    )
  );
  await waitFor(() => {
    expect(document.querySelector('[data-projects-atmosphere]')).toBeTruthy();
  });
}

describe('AC-23: projects Shader Lab atmosphere', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
  });

  it('does not depend on @basementstudio/shader-lab or React 19', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    const all = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    expect(all['@basementstudio/shader-lab']).toBeUndefined();
    expect(String(pkg.dependencies?.react || '')).toMatch(/^[\^~]?18/);
  });

  it('renders darkened CSS fallback atmosphere (aria-hidden)', async () => {
    stubBudget(false);
    evaluateMotionBudget();
    await renderProjects();
    const root = document.querySelector('[data-projects-atmosphere]');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveAttribute('data-atmosphere-mode', 'fallback');
    expect(document.querySelector('[data-atmosphere-fallback]')).toBeTruthy();
    expect(document.querySelector('[data-atmosphere-video]')).toBeNull();
  });

  it('negative: video does not play under fallback / reduced motion', async () => {
    stubBudget(false);
    evaluateMotionBudget();
    await renderProjects();
    expect(document.querySelector('video[data-atmosphere-video]')).toBeNull();
  });

  const assetIt = HAS_ASSET ? it : it.todo;
  assetIt('lazy-loads muted looping WebM with poster when Shader Lab export is present', async () => {
    stubBudget(true);
    evaluateMotionBudget();
    await renderProjects();
    // Allow async image probe
    await waitFor(() => {
      expect(document.querySelector('[data-atmosphere-asset="present"]')).toBeTruthy();
    });
    const video = document.querySelector('video[data-atmosphere-video]') as HTMLVideoElement | null;
    expect(video).toBeTruthy();
    expect(video!.muted).toBe(true);
    expect(video!.loop).toBe(true);
    expect(video!.getAttribute('aria-hidden') || document.querySelector('[data-projects-atmosphere]')?.getAttribute('aria-hidden')).toBeTruthy();
    expect(document.querySelector('[data-atmosphere-poster]')).toBeTruthy();
  });

  if (!HAS_ASSET) {
    it('documents missing Shader Lab export (CSS fallback path active)', () => {
      expect(HAS_ASSET).toBe(false);
      expect(existsSync(VIDEO)).toBe(false);
    });
  }
});

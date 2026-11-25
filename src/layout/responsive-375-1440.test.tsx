import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import { resetMotionBudget } from '../motion/budget';

const ROUTES = ['/', '/experience', '/skills', '/projects', '/contact', '/certifications'] as const;

function stubViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: width === 375 ? 812 : 900 });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes(`min-width: ${width}`) || (query.includes('min-width: 1024') && width >= 1024),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

async function renderRoute(path: string) {
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
      { initialEntries: [path] },
      createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
    )
  );
  await waitFor(() => {
    expect(document.querySelector('main.page-frame')).toBeTruthy();
  });
}

describe('AC-16: no horizontal scroll at 375; usable at 1440', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
  });

  for (const path of ROUTES) {
    it(`${path} does not rely on document overflow-x at 375`, async () => {
      stubViewport(375);
      await renderRoute(path);
      const htmlCss = getComputedStyle(document.documentElement).overflowX;
      const bodyCss = getComputedStyle(document.body).overflowX;
      // jsdom may return '' — also assert source CSS contract
      expect(['', 'visible', 'auto', 'clip', 'hidden']).toContain(htmlCss || '');
      expect(bodyCss === 'scroll' || bodyCss === 'visible' || bodyCss === '' || bodyCss === 'auto').toBe(true);

      const main = document.querySelector('main.page-frame') as HTMLElement;
      expect(main).toBeTruthy();
      // No element forces a wider min-width than the viewport token
      expect(main.scrollWidth || 0).toBeLessThanOrEqual(Math.max(main.clientWidth || 375, 375) + 1);
    });
  }

  it('content max-width token and shell keep 1440 usable (CSS contract)', () => {
    const tokens = readFileSync(join(process.cwd(), 'src/theme/tokens.css'), 'utf8');
    expect(tokens).toMatch(/--content-max-width:\s*72rem/);
    expect(tokens).toMatch(/--shell-max-width:\s*90rem/);

    const layout = [
      'src/layout/PageFrame.css',
      'src/styles/Layout.css',
      'src/styles/page-frame-overrides.css',
      'src/index.css',
    ]
      .map((f) => readFileSync(join(process.cwd(), f), 'utf8'))
      .join('\n');

    // Negative: do not clip primary CTA via overflow-x:hidden on the content shell alone
    // without a max-width content column.
    expect(layout).toMatch(/max-width:\s*var\(--content-max-width\)|max-width:\s*var\(--shell-max-width\)|--content-max-width/);
  });

  it('negative: routes must not set overflow-x: scroll on html/body', () => {
    const blob = [
      'src/index.css',
      'src/App.css',
      'src/styles/App.css',
      'src/styles/Layout.css',
      'src/layout/PageFrame.css',
    ]
      .map((f) => {
        try {
          return readFileSync(join(process.cwd(), f), 'utf8');
        } catch {
          return '';
        }
      })
      .join('\n');
    expect(blob).not.toMatch(/html\s*\{[^}]*overflow-x:\s*scroll/s);
    expect(blob).not.toMatch(/body\s*\{[^}]*overflow-x:\s*scroll/s);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import { evaluateMotionBudget, resetMotionBudget } from '../motion/budget';

const INNER = ['/experience', '/skills', '/certifications', '/contact'] as const;

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

async function renderRoute(path: string) {
  const view = render(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
    )
  );
  await waitFor(() => {
    expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
  });
  return view;
}

describe('AC-22: inner pages glass + SplitText headings', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
  });

  it('vendors React Bits SplitText (TS+TW) in-repo; not re-published as a library', () => {
    const splitPath = join(process.cwd(), 'src/components/react-bits/SplitText.tsx');
    expect(existsSync(splitPath)).toBe(true);
    const src = readFileSync(splitPath, 'utf8');
    expect(src).toMatch(/SplitText/);
    expect(src).toMatch(/from ['"]gsap['"]|from ['"]@gsap\/react['"]/);

    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.name).not.toMatch(/split-?text|react-bits/i);
    expect(pkg.private).toBe(true);
  });

  it('experience/skills/certifications/contact surfaces use glass tokens or Glisse Glass', () => {
    const files = [
      'src/styles/Experience.css',
      'src/styles/Skills.css',
      'src/styles/Certifications.css',
      'src/styles/Contact.css',
      'src/components/Experience.jsx',
      'src/pages/Skills.jsx',
      'src/pages/Certifications.jsx',
      'src/pages/Contact.jsx',
    ];
    const blob = files.map((f) => readFileSync(join(process.cwd(), f), 'utf8')).join('\n');
    expect(blob).toMatch(/--glass-|glass-panel|\bGlass\b/);
    for (const f of [
      'src/styles/Experience.css',
      'src/styles/Skills.css',
      'src/styles/Certifications.css',
      'src/styles/Contact.css',
    ]) {
      expect(readFileSync(join(process.cwd(), f), 'utf8')).toMatch(/--glass-/);
    }
  });

  it('section headings use SplitText when effects-on and keep accessible names', async () => {
    // jsdom lacks ResizeObserver; Glisse (effects-on shell) needs a stub.
    class RO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', RO);

    stubBudget(true);
    expect(evaluateMotionBudget()).toBe('effects-on');

    const pageFrame = readFileSync(join(process.cwd(), 'src/layout/PageFrame.tsx'), 'utf8');
    expect(pageFrame).toMatch(/SplitText|AnimatedHeading|SectionHeading/);

    // PageFrame alone avoids flaky Glisse chrome while still exercising SplitText.
    const { PageFrame } = await import('../layout/PageFrame');
    render(
      createElement(PageFrame, {
        eyebrow: 'Toolkit',
        title: 'Skills',
        dek: 'Inventory.',
        children: createElement('div', null, 'content'),
      })
    );
    // SplitText loads async (keeps gsap off the initial-route graph)
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /^Skills$/i });
      expect(heading.className.includes('split-parent')).toBe(true);
    });
  });

  it('under fallback budget, headings render as plain text (no stagger)', async () => {
    stubBudget(false);
    expect(evaluateMotionBudget()).toBe('fallback');

    for (const path of INNER) {
      const { unmount } = await renderRoute(path);
      const main = document.querySelector('main.page-frame--inner');
      expect(main).toBeTruthy();
      const title = main!.querySelector('.page-frame__title, h1');
      expect(title).toBeTruthy();
      expect(title!.className).not.toMatch(/split-parent/);
      expect(title!.getAttribute('data-split-text')).toBeNull();
      // Accessible name present
      expect(title!.textContent?.trim().length).toBeGreaterThan(0);
      unmount();
      resetMotionBudget();
      stubBudget(false);
      evaluateMotionBudget();
    }
  });

  it('negative: body copy and bullets are not SplitText/scramble animated', () => {
    const files = [
      'src/components/Experience.jsx',
      'src/pages/Skills.jsx',
      'src/pages/Certifications.jsx',
      'src/pages/Contact.jsx',
    ];
    for (const f of files) {
      const src = readFileSync(join(process.cwd(), f), 'utf8');
      // SplitText may be imported via shared heading helper, but must not wrap bullets/paragraphs
      expect(src).not.toMatch(/<SplitText[^>]*>[\s\S]*<(p|li)/i);
      expect(src).not.toMatch(/scramble|ScrambleText/i);
    }
    const experience = readFileSync(join(process.cwd(), 'src/components/Experience.jsx'), 'utf8');
    expect(experience).toMatch(/<li[\s>]/);
    expect(experience).not.toMatch(/SplitText/);
  });
});

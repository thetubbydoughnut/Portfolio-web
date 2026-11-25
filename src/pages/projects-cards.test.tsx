import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import { projects } from '../data/projects.js';
import { evaluateMotionBudget, resetMotionBudget } from '../motion/budget';

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

  const view = render(
    createElement(
      MemoryRouter,
      { initialEntries: ['/projects'] },
      createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
    )
  );
  await waitFor(() => {
    expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
  });
  await waitFor(() => {
    expect(document.querySelector('[data-projects-grid]')).toBeTruthy();
  });
  return view;
}

describe('AC-15: /projects case-study cards', () => {
  beforeEach(() => {
    resetMotionBudget();
  });

  afterEach(() => {
    resetMotionBudget();
  });

  it('uses PageFrame and renders curated cards with name, description, stack', async () => {
    stubBudget(false);
    evaluateMotionBudget();
    await renderProjects();

    expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
    const grid = document.querySelector('[data-projects-grid]');
    expect(grid).toBeTruthy();

    const cards = document.querySelectorAll('[data-project-card]');
    expect(cards.length).toBe(projects.length);

    for (const project of projects) {
      const card = document.querySelector(`[data-project-card="${project.id}"]`);
      expect(card, project.id).toBeTruthy();
      expect(card!.textContent).toContain(project.name);
      expect(card!.textContent).toContain(project.description);
      expect(card!.textContent).toContain(project.stack);
    }
  });

  it('shows real links only for LPL and this portfolio; none for BOLT, SaaP, CLR', async () => {
    stubBudget(false);
    evaluateMotionBudget();
    await renderProjects();

    const lpl = document.querySelector('[data-project-card="legendary-printed-loot"]');
    expect(within(lpl as HTMLElement).getByRole('link', { name: /lpl3d|live|demo|site/i })).toHaveAttribute(
      'href',
      'https://lpl3d.com'
    );

    const portfolio = document.querySelector('[data-project-card="portfolio-web"]');
    expect(
      within(portfolio as HTMLElement).getByRole('link', { name: /github|repo|code/i })
    ).toHaveAttribute('href', 'https://github.com/thetubbydoughnut/Portfolio-web');

    for (const id of ['clr-land-asset-platform', 'bolt-2', 'saap']) {
      const card = document.querySelector(`[data-project-card="${id}"]`);
      expect(card!.querySelectorAll('a[href]').length, id).toBe(0);
    }
  });

  it('labels every visual as illustrative and vendors SpotlightCard', async () => {
    stubBudget(true);
    evaluateMotionBudget();
    await renderProjects();

    const spotlightPath = join(process.cwd(), 'src/components/react-bits/SpotlightCard.tsx');
    expect(existsSync(spotlightPath)).toBe(true);
    expect(readFileSync(spotlightPath, 'utf8')).toMatch(/SpotlightCard/);

    const visuals = document.querySelectorAll('[data-project-visual]');
    expect(visuals.length).toBe(projects.length);
    visuals.forEach((el) => {
      expect(el.textContent?.toLowerCase()).toMatch(/illustrative/);
    });

    expect(document.querySelector('[data-spotlight-card]')).toBeTruthy();
  });

  it('negative: under fallback budget spotlight does not track the pointer', async () => {
    stubBudget(false);
    evaluateMotionBudget();
    await renderProjects();

    const tracking = document.querySelectorAll('[data-spotlight-track="on"]');
    expect(tracking.length).toBe(0);
    expect(document.querySelector('[data-spotlight-track="off"]')).toBeTruthy();
  });

  it('negative: no mock stars, placeholders, or fake BOLT/SaaP public links', () => {
    const page = readFileSync(join(process.cwd(), 'src/pages/Projects.jsx'), 'utf8');
    const data = readFileSync(join(process.cwd(), 'src/data/projects.js'), 'utf8');
    const blob = page + data;
    expect(blob).not.toMatch(/stargazers_count/);
    expect(blob).not.toMatch(/via\.placeholder\.com/);
    expect(blob).not.toMatch(/github\.com\/.*bolt/i);
    expect(blob).not.toMatch(/github\.com\/.*saap/i);
  });

  it('grid is one column below 1024 and two from 1024 (CSS contract)', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/Projects.css'), 'utf8');
    expect(css).toMatch(/grid-template-columns:\s*1fr/);
    expect(css).toMatch(/@media\s*\(\s*min-width:\s*1024px\s*\)[\s\S]*grid-template-columns:\s*repeat\(2/);
  });
});

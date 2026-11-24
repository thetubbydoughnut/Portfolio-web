import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Header from './Header.jsx';
import { evaluateMotionBudget, resetMotionBudget } from '../motion/budget';

function mockMatchMedia(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('AC-21: shell Glisse glass controls', () => {
  beforeEach(() => {
    resetMotionBudget();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      getExtension: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('imports glisse Glass/Button/TabBar in the shell source', () => {
    const chrome = readFileSync(
      join(process.cwd(), 'src/components/GlisseChrome.jsx'),
      'utf8'
    );
    const header = readFileSync(join(process.cwd(), 'src/components/Header.jsx'), 'utf8');
    expect(chrome).toMatch(/from ['"]glisse['"]/);
    expect(chrome).toMatch(/\bGlass\b/);
    expect(chrome).toMatch(/\bButton\b/);
    expect(chrome).toMatch(/\bTabBar\b/);
    expect(chrome).not.toMatch(/glisse\/demo/i);
    // A3.5.6: glisse stays off the static Header graph (dynamic import only).
    expect(header).toMatch(/import\(['"]\.\/GlisseChrome/);
    expect(header).not.toMatch(/from ['"]glisse['"]/);
  });

  it('keeps all primary routes under glass/static shell', () => {
    mockMatchMedia(true);
    evaluateMotionBudget();
    render(createElement(MemoryRouter, null, createElement(Header)));
    for (const label of ['Home', 'Projects', 'Skills', 'Experience', 'Certifications', 'Contact']) {
      expect(screen.getAllByRole('link', { name: new RegExp(`^${label}$`, 'i') }).length).toBeGreaterThan(
        0
      );
    }
    const header = document.querySelector('header.header');
    expect(header?.className).toMatch(/shell-glass/);
  });

  it('under fallback budget uses static frost class (no live refraction requirement)', () => {
    mockMatchMedia(true);
    evaluateMotionBudget();
    render(createElement(MemoryRouter, null, createElement(Header)));
    const header = document.querySelector('header.header');
    expect(header).toHaveAttribute('data-motion-budget', 'fallback');
    expect(header?.className).toMatch(/shell-glass--static/);
  });

  it('theme toggle remains named and keyboard-reachable on glass', () => {
    mockMatchMedia(true);
    evaluateMotionBudget();
    render(createElement(MemoryRouter, null, createElement(Header)));
    const toggle = screen.getByRole('button', { name: /switch to (light|dark) theme/i });
    expect(toggle).toBeInTheDocument();
    toggle.focus();
    expect(document.activeElement).toBe(toggle);
  });
});

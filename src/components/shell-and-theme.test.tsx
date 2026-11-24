import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import Header from './Header.jsx';
import { THEME_STORAGE_KEY } from '../theme/theme';
import { getResumeCtaLabel } from '../data/resume.js';
import { ensureSharedDist, SHARED_DIST } from '../test/ensure-dist-build.js';

function renderShell() {
  return render(createElement(MemoryRouter, null, createElement(Header)));
}

function collectDistCss(root = SHARED_DIST) {
  const assets = join(root, 'assets');
  if (!existsSync(assets)) return '';
  return readdirSync(assets)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(assets, f), 'utf8'))
    .join('\n');
}

/** Leftover April App.css fingerprint that overrode mobile closed state (F1). */
const APP_CSS_NAV_LINKS_FLEX =
  /\.nav-links\s*\{[^}]*display\s*:\s*flex/s;

describe('AC-7: shell and theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-color-scheme: light') ? false : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exposes skip link, routes, resume, socials, and theme toggle', () => {
    renderShell();

    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute(
      'href',
      '#main-content'
    );

    for (const label of [
      'Home',
      'Projects',
      'Skills',
      'Experience',
      'Certifications',
      'Contact',
    ]) {
      expect(screen.getAllByRole('link', { name: new RegExp(`^${label}$`, 'i') }).length).toBeGreaterThan(
        0
      );
    }

    const resumeLabel = getResumeCtaLabel();
    expect(screen.getByRole('link', { name: new RegExp(resumeLabel, 'i') })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /github profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /twitter profile/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /switch to (light|dark) theme/i })
    ).toBeInTheDocument();
  });

  it('theme toggle sets data-theme and persists to localStorage', async () => {
    const user = userEvent.setup();
    document.documentElement.setAttribute('data-theme', 'dark');
    renderShell();

    const toggle = screen.getByRole('button', { name: /switch to light theme/i });
    await user.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('mobile menu panel closed on load and after open-then-close; Escape hides it and returns focus', async () => {
    const user = userEvent.setup();
    renderShell();
    const menuBtn = screen.getByRole('button', { name: /toggle navigation menu/i });
    const nav = document.getElementById(menuBtn.getAttribute('aria-controls') || '');
    expect(nav).toBeTruthy();

    // Closed on load — not the open disclosure (.active drives Header.css display)
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(nav?.classList.contains('active')).toBe(false);

    await user.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    expect(nav?.classList.contains('active')).toBe(true);
    expect(within(nav as HTMLElement).getAllByRole('link').length).toBeGreaterThan(0);

    // Move focus into the panel, then Escape must close AND restore focus to the toggle
    const firstLink = within(nav as HTMLElement).getAllByRole('link')[0];
    firstLink.focus();
    expect(document.activeElement).toBe(firstLink);
    await user.keyboard('{Escape}');
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(nav?.classList.contains('active')).toBe(false);
    expect(document.activeElement).toBe(menuBtn);

    // Open then close via toggle also leaves panel closed (not hit-testable open state)
    await user.click(menuBtn);
    expect(nav?.classList.contains('active')).toBe(true);
    await user.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(nav?.classList.contains('active')).toBe(false);
  });

  it(
    'App.css leftover .nav-links{display:flex} is gone; Header + dist keep mobile closed override',
    async () => {
      const appCss = readFileSync(join(process.cwd(), 'src/App.css'), 'utf8');
      expect(appCss).not.toMatch(APP_CSS_NAV_LINKS_FLEX);

      const headerCss = readFileSync(join(process.cwd(), 'src/styles/Header.css'), 'utf8');
      expect(headerCss).toMatch(
        /@media\s*\(\s*max-width:\s*1023px\s*\)[\s\S]*\.nav-links\s*\{[\s\S]*display:\s*none/s
      );
      expect(headerCss).toMatch(
        /@media\s*\(\s*max-width:\s*1023px\s*\)[\s\S]*\.nav-links\.active\s*\{[\s\S]*display:\s*flex/s
      );

      // Fresh build so dist reflects current App.css (shared cache may be stale).
      const readyPath = join(
        process.cwd(),
        'node_modules/.cache/portfolio-test/shared-dist.ready'
      );
      if (existsSync(readyPath)) unlinkSync(readyPath);

      await ensureSharedDist();
      const built = collectDistCss();
      expect(built.length).toBeGreaterThan(0);
      // Closed mobile disclosure survives minify (spaces optional).
      expect(built).toMatch(/\.nav-links[^{]*\{[^}]*display:\s*none/s);
      expect(built).toMatch(/\.nav-links\.active[^{]*\{[^}]*display:\s*flex/s);
      // Leftover App.css fingerprint must not appear in the bundle.
      expect(built).not.toMatch(
        /\.nav-links\s*\{[^}]*display\s*:\s*flex[^}]*gap\s*:\s*2rem/s
      );
    },
    120_000
  );
});

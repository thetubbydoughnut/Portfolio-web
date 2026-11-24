import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Header from './Header.jsx';
import { THEME_STORAGE_KEY } from '../theme/theme';
import { getResumeCtaLabel } from '../data/resume.js';

function renderShell() {
  return render(createElement(MemoryRouter, null, createElement(Header)));
}

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

  it('mobile menu is a closed disclosure until opened; Escape closes it', async () => {
    const user = userEvent.setup();
    renderShell();
    const menuBtn = screen.getByRole('button', { name: /toggle navigation menu/i });
    const nav = document.getElementById(menuBtn.getAttribute('aria-controls') || '');
    expect(nav).toBeTruthy();

    // Closed on load: not .active, aria-expanded false
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(nav?.classList.contains('active')).toBe(false);

    await user.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    expect(nav?.classList.contains('active')).toBe(true);
    expect(within(nav as HTMLElement).getAllByRole('link').length).toBeGreaterThan(0);

    await user.keyboard('{Escape}');
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(nav?.classList.contains('active')).toBe(false);

    // Toggle open then close via button also leaves panel closed
    await user.click(menuBtn);
    expect(nav?.classList.contains('active')).toBe(true);
    await user.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(nav?.classList.contains('active')).toBe(false);
  });

  it('App.css no longer forces .nav-links { display: flex } (F1 cascade)', () => {
    const appCss = readFileSync(join(process.cwd(), 'src/App.css'), 'utf8');
    expect(appCss).not.toMatch(/\.nav-links\s*\{[^}]*display\s*:\s*flex/s);
    const headerCss = readFileSync(join(process.cwd(), 'src/styles/Header.css'), 'utf8');
    expect(headerCss).toMatch(/header\.header\s+\.nav-links:not\(\.active\)/);
    expect(headerCss).toMatch(/display:\s*none\s*!important/);
  });
});

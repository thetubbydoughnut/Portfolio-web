import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import HeroSection from '../components/HeroSection.jsx';
import { resumeData } from '../data/resume.js';
import { resetMotionBudget } from '../motion/budget';

describe('AC-9: high-impact home hero', () => {
  beforeEach(() => {
    resetMotionBudget();
    vi.stubGlobal(
      'requestIdleCallback',
      (cb: IdleRequestCallback) =>
        window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline), 0) as unknown as number
    );
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion') ? true : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders full-viewport hero band with typographic stack and sized portrait', async () => {
    render(createElement(MemoryRouter, null, createElement(HeroSection)));
    const band = screen.getByTestId('home-hero');
    expect(band.className).toMatch(/hero-section/);

    const css = readFileSync(join(process.cwd(), 'src/styles/HeroSection.css'), 'utf8');
    expect(css).toMatch(/min-height:\s*calc\(100dvh\s*-\s*var\(--header-height\)\)/);
    expect(css).toMatch(/\.hero-stage[\s\S]*position:\s*absolute/);

    expect(screen.getByRole('heading', { name: resumeData.profile.name })).toBeInTheDocument();
    expect(screen.getByText(resumeData.profile.title)).toBeInTheDocument();
    expect(screen.getByText(resumeData.profile.location)).toBeInTheDocument();
    expect(screen.getByText(resumeData.profile.availability)).toBeInTheDocument();
    expect(screen.getByText(resumeData.profile.summary)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /view projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact');

    await waitFor(() => {
      const img = screen.getByRole('img', { name: resumeData.profile.name });
      expect(img).toHaveAttribute('width');
      expect(img).toHaveAttribute('height');
      expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);
    });
  });

  it('LCP candidate is static text (name), not canvas/video/SplitText', () => {
    const src = readFileSync(join(process.cwd(), 'src/components/HeroSection.jsx'), 'utf8');
    expect(src).toMatch(/hero-name/);
    expect(src).not.toMatch(/SplitText/);
    expect(src).not.toMatch(/<video/);
    const nameEl = render(
      createElement(MemoryRouter, null, createElement(HeroSection))
    ).container.querySelector('.hero-name');
    expect(nameEl?.tagName).toBe('H1');
    expect(nameEl?.textContent).toBe(resumeData.profile.name);
  });

  it('does not contain banned copy', () => {
    render(createElement(MemoryRouter, null, createElement(HeroSection)));
    const text = document.body.textContent || '';
    expect(text).not.toMatch(/High-velocity/);
    expect(text).not.toMatch(/freelance web developer/i);
  });

  it('hero bitmap is display-sized (≤960×1280), not the raw 1536×2048 source', async () => {
    const path = join(process.cwd(), 'src/assets/images/cameron-profile.webp');
    expect(existsSync(path)).toBe(true);
    const meta = await sharp(path).metadata();
    expect(meta.width).toBeLessThanOrEqual(960);
    expect(meta.height).toBeLessThanOrEqual(1280);
    expect(meta.width).not.toBe(1536);
    expect(meta.height).not.toBe(2048);
  });
});

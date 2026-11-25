import { describe, it, expect } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import Header from '../components/Header.jsx';
import { certifications } from '../data/certifications.js';

describe('AC-13: /certifications route and media well', () => {
  it('stays routed, in nav, and shows BloomTech + Michigan from data', async () => {
    const nav = render(
      createElement(MemoryRouter, { initialEntries: ['/'] }, createElement(Header))
    );
    const navCert = screen.getAllByRole('link', { name: /^Certifications$/i });
    expect(navCert.length).toBeGreaterThan(0);
    expect(navCert[0]).toHaveAttribute('href', '/certifications');
    nav.unmount();

    const { unmount } = render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/certifications'] },
        createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
      )
    );

    await waitFor(() => {
      expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
    });

    expect(screen.getByRole('heading', { name: /^Certifications$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/BloomTech/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/November 2023\s*[–-]\s*January 2025/i)).toBeInTheDocument();
    expect(screen.getAllByText(/University of Michigan/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/September 2025/i)).toBeInTheDocument();

    // Data-driven (not only hardcoded inline in the page)
    expect(certifications.length).toBeGreaterThanOrEqual(2);
    expect(certifications[0].issuer).toMatch(/BloomTech/i);
    expect(certifications[0].date).toMatch(/November 2023/i);
    expect(certifications[1].issuer).toMatch(/Michigan/i);
    expect(certifications[1].date).toMatch(/September 2025/i);

    unmount();
  });

  it('certificate images sit in a media well with explicit width and height', async () => {
    render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/certifications'] },
        createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
      )
    );

    await waitFor(() => {
      expect(document.querySelector('[data-cert-media-well]')).toBeTruthy();
    });

    const wells = document.querySelectorAll('[data-cert-media-well]');
    expect(wells.length).toBeGreaterThan(0);

    for (const well of wells) {
      const img = well.querySelector('img');
      expect(img).toBeTruthy();
      expect(img!.getAttribute('width')).toBeTruthy();
      expect(img!.getAttribute('height')).toBeTruthy();
      expect(Number(img!.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(img!.getAttribute('height'))).toBeGreaterThan(0);
    }
  });

  it('negative: sitemap still lists /certifications; no unsized cert images in source', () => {
    const sitemap = readFileSync(join(process.cwd(), 'public/sitemap.xml'), 'utf8');
    expect(sitemap).toContain('/certifications');

    const page = readFileSync(join(process.cwd(), 'src/pages/Certifications.jsx'), 'utf8');
    expect(page).toMatch(/PageFrame/);
    expect(page).toMatch(/from ['"].*certifications/);
    // Any <img for cert preview must declare width= and height=
    const imgTags = page.match(/<img[\s\S]*?>/g) || [];
    for (const tag of imgTags) {
      expect(tag).toMatch(/\bwidth=\{?\d+/);
      expect(tag).toMatch(/\bheight=\{?\d+/);
    }

    expect(existsSync(join(process.cwd(), 'src/App.jsx'))).toBe(true);
    const app = readFileSync(join(process.cwd(), 'src/App.jsx'), 'utf8');
    expect(app).toMatch(/certifications/i);
  });
});

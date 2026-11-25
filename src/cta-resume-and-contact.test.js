import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { join, extname } from 'node:path';
import { createElement } from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import sharp from 'sharp';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import Contact from './pages/Contact.jsx';
import {
  resumeData,
  getResumeHref,
  getResumeCtaLabel,
  resolveResumeHref,
  LOCAL_RESUME_HREF,
} from './data/resume.js';

const LOCAL_RESUME = '/documents/cameron-graham-resume.pdf';
const localResumePath = join(process.cwd(), 'public/documents/cameron-graham-resume.pdf');
const EXPECTED_PDF_SHA256 =
  '83dd8c32bbba517725851aae280d319e547dfd863bf7e8e600f5e6a6e277cd23';
const previewPath = join(
  process.cwd(),
  'src/assets/certs-and-resume/Cameron-Graham-Resume.webp'
);

const TEXT_EXTS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.md',
  '.json',
  '.yml',
  '.yaml',
  '.txt',
  '.svg',
]);

function renderWithRouter(node) {
  return render(createElement(MemoryRouter, null, node));
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function collectTrackedTextHits(needle) {
  const out = execSync('git ls-files', { encoding: 'utf8', cwd: process.cwd() })
    .trim()
    .split('\n')
    .filter(Boolean);
  const hits = [];
  for (const rel of out) {
    if (!TEXT_EXTS.has(extname(rel).toLowerCase())) continue;
    const abs = join(process.cwd(), rel);
    if (!existsSync(abs) || !statSync(abs).isFile()) continue;
    const body = readFileSync(abs, 'utf8');
    if (body.toLowerCase().includes(needle.toLowerCase())) {
      hits.push(rel);
    }
  }
  return hits;
}

describe('AC-5 / AC-26: Resume and Contact CTAs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('header exposes Resume/Download resume and Contact controls', () => {
    renderWithRouter(createElement(Header));
    const contacts = screen.getAllByRole('link', { name: /^Contact$/i });
    expect(contacts.length).toBeGreaterThan(0);
    expect(contacts[0]).toHaveAttribute('href', '/contact');

    const label = getResumeCtaLabel();
    const resume = screen.getByRole('link', { name: new RegExp(label, 'i') });
    expect(resume).toBeInTheDocument();
    if (!existsSync(localResumePath)) {
      expect(resume.textContent).not.toMatch(/^Download/i);
    }
  });

  it('hero exposes Resume/Download resume and Contact controls', () => {
    renderWithRouter(createElement(HeroSection));
    const contact = screen.getByRole('link', { name: /^Contact$/i });
    expect(contact).toHaveAttribute('href', '/contact');

    const label = getResumeCtaLabel();
    const resume = screen.getByRole('link', { name: new RegExp(`^${label}$`, 'i') });
    expect(resume).toBeInTheDocument();
  });

  it('Resume opens local PDF when present, otherwise the public resume URL', () => {
    const expected = existsSync(localResumePath)
      ? LOCAL_RESUME
      : resumeData.profile.links.resume;

    expect(getResumeHref()).toBe(expected);

    renderWithRouter(createElement(Header));
    const label = getResumeCtaLabel(expected);
    const resume = screen.getByRole('link', { name: new RegExp(label, 'i') });
    expect(resume.getAttribute('href')).toBe(expected);

    if (!existsSync(localResumePath)) {
      expect(resume.textContent).not.toMatch(/Download/i);
    } else {
      expect(resume.textContent).toMatch(/^Download resume$/i);
    }
  });

  it('AC-26: PDF branch labels Download resume; Doc fallback must not start with Download', () => {
    expect(resolveResumeHref(true)).toBe(LOCAL_RESUME_HREF);
    expect(getResumeCtaLabel(LOCAL_RESUME_HREF)).toBe('Download resume');
    expect(getResumeCtaLabel(LOCAL_RESUME_HREF)).toMatch(/^Download/);

    const docHref = resumeData.profile.links.resume;
    expect(resolveResumeHref(false)).toBe(docHref);
    const docLabel = getResumeCtaLabel(docHref);
    expect(docLabel).toBe('Resume');
    expect(docLabel).not.toMatch(/^Download/);
  });

  it('AC-26: shipped PDF hash matches Nov 23 resume; preview is 600×776 ≤80KB', async () => {
    expect(existsSync(localResumePath)).toBe(true);
    expect(sha256File(localResumePath)).toBe(EXPECTED_PDF_SHA256);
    expect(sha256File(localResumePath).startsWith('83dd8c32bbba')).toBe(true);

    expect(existsSync(previewPath)).toBe(true);
    const meta = await sharp(previewPath).metadata();
    expect(meta.width).toBe(600);
    expect(meta.height).toBe(776);
    const { size } = await import('fs').then((fs) => fs.promises.stat(previewPath));
    expect(size).toBeLessThanOrEqual(80 * 1024);
  });

  it('AC-26: no repo-root resume PDFs; lost domain absent from tracked text', () => {
    const rootEntries = readdirSync(process.cwd());
    const rootResumePdfs = rootEntries.filter(
      (name) =>
        name.toLowerCase().endsWith('.pdf') &&
        /resume/i.test(name)
    );
    expect(rootResumePdfs).toEqual([]);
    expect(
      existsSync(join(process.cwd(), 'Cameron Graham Full Stack Web Developer Resume (7).pdf'))
    ).toBe(false);
    expect(
      existsSync(join(process.cwd(), 'Cameron Graham QA Automation Resume (1).pdf'))
    ).toBe(false);

    const banned = ['pixel', 'perfect', 'dev'].join('');
    expect(collectTrackedTextHits(banned)).toEqual([]);
  });

  it('/contact shows email, GitHub, and LinkedIn already on the site', async () => {
    renderWithRouter(createElement(Contact));

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();
    expect(screen.getByText(resumeData.profile.email)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /thetubbydoughnut/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cameron Graham/i })).toBeInTheDocument();
  });

  it('does not introduce phone or new contact fields on /contact', async () => {
    renderWithRouter(createElement(Contact));
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.queryByRole('heading', { name: /^Phone$/i })).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/661[-.\s]?972[-.\s]?5200/);
    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
  });

  it('AC-14: /contact exposes email, GitHub, LinkedIn as glass tiles in PageFrame content', async () => {
    renderWithRouter(createElement(Contact));
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
    const content = document.querySelector('.page-frame__content');
    expect(content).toBeTruthy();

    const tiles = content.querySelectorAll('[data-contact-tile]');
    expect(tiles).toHaveLength(3);

    for (const tile of tiles) {
      expect(tile.className).toMatch(/glass/);
    }

    expect(screen.getByText(resumeData.profile.email)).toBeInTheDocument();
    const github = screen.getByRole('link', { name: /thetubbydoughnut/i });
    expect(github).toHaveAttribute('href', resumeData.profile.links.github);
    const linkedin = screen.getByRole('link', { name: /Cameron Graham/i });
    expect(linkedin).toHaveAttribute('href', resumeData.profile.links.linkedin);

    // mailto and/or copy control for email
    const mailto = document.querySelector('a[href^="mailto:"]');
    const copyBtn = screen.queryByRole('button', { name: /copy|email/i });
    expect(mailto || copyBtn || content.querySelector('[data-contact-email]')).toBeTruthy();
  });

  it('AC-14 negative: no phone, no form POST endpoint, old contact layout gone', async () => {
    renderWithRouter(createElement(Contact));
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(document.body.textContent).not.toMatch(/661[-.\s]?972[-.\s]?5200/);
    expect(document.querySelector('form')).toBeNull();
    expect(document.querySelector('form[action]')).toBeNull();

    const page = readFileSync(join(process.cwd(), 'src/pages/Contact.jsx'), 'utf8');
    const css = readFileSync(join(process.cwd(), 'src/styles/Contact.css'), 'utf8');
    expect(page).not.toMatch(/fetch\s*\(|axios|formspree|emailjs/i);
    expect(css).not.toMatch(/min-height:\s*100vh/);
    expect(css).toMatch(/--glass-/);
    expect(page).toMatch(/data-contact-tile/);
  });
});

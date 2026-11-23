import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroSection from './components/HeroSection.jsx';
import { resumeData } from './data/resume.js';

function renderHero() {
  return render(
    createElement(MemoryRouter, null, createElement(HeroSection))
  );
}

describe('AC-4: hero and meta copy', () => {
  it('presents Cameron Graham as Full-Stack Software Engineer in Oklahoma City, OK', () => {
    expect(resumeData.profile.name).toMatch(/Cameron Graham/i);
    expect(resumeData.profile.title).toMatch(/Full-Stack Software Engineer/i);
    expect(resumeData.profile.location).toMatch(/Oklahoma City,\s*OK/i);
  });

  it('states availability for full-time software engineering starting January 1, 2027', () => {
    const availability =
      resumeData.profile.availability ||
      resumeData.profile.summary ||
      '';
    const blob = `${resumeData.profile.title} ${availability} ${resumeData.profile.summary}`;
    expect(blob).toMatch(/January\s+1,?\s*2027/i);
    expect(blob).toMatch(/full-time/i);
  });

  it('summary is derived from CLR + LPL (not freelance / decentralized ERP)', () => {
    const summary = resumeData.profile.summary;
    expect(summary).toMatch(/Continental Resources|NestJS|land and asset|monorepo/i);
    expect(summary).toMatch(/Legendary Printed Loot|e-commerce|PostgreSQL/i);
    expect(summary).not.toMatch(/decentralized 3D-printing ERP/i);
    expect(summary).not.toMatch(/freelance web developer/i);
    expect(resumeData.profile.title).not.toMatch(/High-velocity/i);
  });

  it('renders hero with name, title, and availability cues', () => {
    renderHero();
    expect(screen.getByRole('heading', { name: /Cameron Graham/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Full-Stack Software Engineer/i).length).toBeGreaterThan(0);
    const heroText = document.body.textContent;
    expect(heroText).toMatch(/January\s+1,?\s*2027/i);
    expect(heroText).not.toMatch(/YOUR_WEBSITE_URL_HERE/);
    expect(heroText).not.toMatch(/YOUR_PREVIEW_IMAGE_URL_HERE/);
    expect(heroText).not.toMatch(/freelance web developer/i);
    expect(heroText).not.toMatch(/High-velocity/i);
    expect(heroText).not.toMatch(/decentralized 3D-printing ERP/i);
  });

  it('index.html title/description match Full-Stack SE + OKC + Jan 1 2027 availability', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    expect(html).toMatch(/Cameron Graham/i);
    expect(html).toMatch(/Full-Stack Software Engineer/i);
    expect(html).toMatch(/Oklahoma City/i);
    expect(html).toMatch(/January\s+1,?\s*2027/i);
    expect(html).not.toMatch(/YOUR_WEBSITE_URL_HERE/);
    expect(html).not.toMatch(/YOUR_PREVIEW_IMAGE_URL_HERE/);
    expect(html).not.toMatch(/freelance web developer/i);
    expect(html).not.toMatch(/High-velocity/i);
  });

  it('built index.html (if present) has no placeholders or banned copy', () => {
    const built = join(process.cwd(), 'dist/index.html');
    if (!existsSync(built)) return;
    const html = readFileSync(built, 'utf8');
    expect(html).not.toMatch(/YOUR_WEBSITE_URL_HERE/);
    expect(html).not.toMatch(/YOUR_PREVIEW_IMAGE_URL_HERE/);
    expect(html).not.toMatch(/freelance web developer/i);
    expect(html).not.toMatch(/High-velocity/i);
    expect(html).toMatch(/Full-Stack Software Engineer/i);
  });
});

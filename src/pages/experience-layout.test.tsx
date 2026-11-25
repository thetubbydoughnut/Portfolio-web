import { describe, it, expect } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import { resumeData } from '../data/resume.js';

const EXPECTED_COMPANIES = [
  'Continental Resources',
  'Legendary Printed Loot',
  'Tatco Construction',
  'American Dog Society',
];

describe('AC-11: /experience timeline layout', () => {
  it('renders experience in PageFrame content column as a vertical timeline', async () => {
    render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/experience'] },
        createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
      )
    );

    await waitFor(() => {
      expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
    });

    const content = document.querySelector('.page-frame__content');
    expect(content).toBeTruthy();

    const timeline = content!.querySelector('[data-experience-timeline]');
    expect(timeline).toBeTruthy();

    const entries = within(timeline as HTMLElement).getAllByRole('article');
    expect(entries).toHaveLength(EXPECTED_COMPANIES.length);

    EXPECTED_COMPANIES.forEach((company, i) => {
      expect(entries[i].textContent).toMatch(new RegExp(company, 'i'));
    });

    // Each entry: role, company, period, stack, bullets
    resumeData.experience.forEach((job, i) => {
      const entry = entries[i];
      expect(entry.textContent).toContain(job.role);
      expect(entry.textContent).toContain(job.company);
      expect(entry.textContent).toContain(job.period);
      expect(job.stack, `${job.company} must have stack`).toBeTruthy();
      expect(entry.textContent).toContain(job.stack);
      job.description.forEach((bullet) => {
        expect(entry.textContent).toContain(bullet);
      });
    });

    const clr = entries[0];
    expect(clr.textContent).toMatch(/July\s+2026/i);
    expect(clr.textContent).toMatch(/November\s+2026/i);
    expect(clr.textContent).not.toMatch(/Present/i);
    expect(clr.textContent).not.toMatch(/December\s*31,?\s*2026/i);
  });

  it('negative: does not keep the April 2026 centered card-stack layout', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/Experience.css'), 'utf8');
    // Old layout: centered 900px stack fighting the page-frame content column
    expect(css).not.toMatch(/\.experience-container\s*\{[^}]*max-width:\s*900px/s);
    expect(css).not.toMatch(/\.experience-container\s*\{[^}]*margin:\s*0\s+auto/s);

    const pageSrc = readFileSync(join(process.cwd(), 'src/pages/Experience.jsx'), 'utf8');
    const compSrc = readFileSync(join(process.cwd(), 'src/components/Experience.jsx'), 'utf8');
    expect(pageSrc + compSrc).toMatch(/PageFrame/);
    expect(pageSrc + compSrc).toMatch(/data-experience-timeline/);
  });
});

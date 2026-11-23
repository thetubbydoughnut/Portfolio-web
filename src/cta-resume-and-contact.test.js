import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { createElement } from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import Contact from './pages/Contact.jsx';
import { resumeData } from './data/resume.js';

const LOCAL_RESUME = '/documents/cameron-graham-resume.pdf';
const localResumePath = join(process.cwd(), 'public/documents/cameron-graham-resume.pdf');

function renderWithRouter(node) {
  return render(createElement(MemoryRouter, null, node));
}

describe('AC-5: Resume and Contact CTAs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('header exposes Resume and Contact controls', () => {
    renderWithRouter(createElement(Header));
    const contact = screen.getByRole('link', { name: /^Contact$/i });
    expect(contact).toHaveAttribute('href', '/contact');

    const resume = screen.getByRole('link', { name: /Resume/i });
    expect(resume).toBeInTheDocument();
    expect(resume.textContent).not.toMatch(/^Download/i);
  });

  it('hero exposes Resume and Contact controls', () => {
    renderWithRouter(createElement(HeroSection));
    const contact = screen.getByRole('link', { name: /^Contact$/i });
    expect(contact).toHaveAttribute('href', '/contact');

    const resume = screen.getByRole('link', { name: /^Resume$/i });
    expect(resume).toBeInTheDocument();
  });

  it('Resume opens local PDF when present, otherwise the public resume URL', () => {
    const expected = existsSync(localResumePath)
      ? LOCAL_RESUME
      : resumeData.profile.links.resume;

    renderWithRouter(createElement(Header));
    const resume = screen.getByRole('link', { name: /Resume/i });
    expect(resume.getAttribute('href')).toBe(expected);

    if (!existsSync(localResumePath)) {
      expect(resume.textContent).not.toMatch(/Download/i);
    }
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
});

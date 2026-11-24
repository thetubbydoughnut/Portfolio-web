import { describe, it, expect } from 'vitest';
import { createElement, Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import App from '../App.jsx';
import { PageFrame } from './PageFrame';

const ROUTES = [
  '/',
  '/projects',
  '/skills',
  '/experience',
  '/certifications',
  '/contact',
  '/this-route-does-not-exist',
];

describe('AC-25: shared page frame', () => {
  it('PageFrame exposes home vs inner intro layouts', () => {
    const { rerender } = render(
      createElement(
        PageFrame,
        { home: true, children: createElement('div', { 'data-testid': 'home-child' }, 'home') }
      )
    );
    expect(document.querySelector('main.page-frame--home')).toBeTruthy();
    expect(document.querySelector('.page-frame__intro')).toBeNull();
    expect(screen.getByTestId('home-child')).toBeInTheDocument();

    rerender(
      createElement(PageFrame, {
        eyebrow: 'Work',
        title: 'Projects',
        dek: 'Case studies.',
        children: createElement('div', { 'data-testid': 'inner-child' }, 'inner'),
      })
    );
    expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
    expect(screen.getByText('Work')).toHaveClass('page-frame__eyebrow');
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByText('Case studies.')).toBeInTheDocument();
    expect(screen.getByTestId('inner-child')).toBeInTheDocument();
  });

  it('every app route renders inside a page-frame main', async () => {
    for (const path of ROUTES) {
      const { unmount } = render(
        createElement(
          MemoryRouter,
          { initialEntries: [path] },
          createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
        )
      );
      // Allow lazy routes to resolve
      await new Promise((r) => setTimeout(r, 50));
      const main = document.querySelector('main.page-frame');
      expect(main, `expected page-frame on ${path}`).toBeTruthy();
      if (path === '/') {
        expect(main?.className).toMatch(/page-frame--home/);
        expect(main?.querySelector('.page-frame__intro')).toBeNull();
      } else {
        expect(main?.className).toMatch(/page-frame--inner/);
        expect(main?.querySelector('.page-frame__intro')).toBeTruthy();
      }
      unmount();
    }
  });

  it('dead April layout modules are removed; frame CSS uses content max-width token', () => {
    expect(existsSync(join(process.cwd(), 'src/components/Navigation.jsx'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'src/components/VantaBackground.jsx'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'src/pages/Home.jsx'))).toBe(false);

    const frameCss = readFileSync(join(process.cwd(), 'src/layout/PageFrame.css'), 'utf8');
    expect(frameCss).toMatch(/--content-max-width/);
    expect(frameCss).toMatch(/sticky/);
    expect(frameCss).not.toMatch(/1200px/);
  });
});

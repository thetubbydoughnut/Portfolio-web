import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { ensureSharedDist, SHARED_DIST } from '../test/ensure-dist-build.js';

const ROOT = process.cwd();

function collectDistCss(root = SHARED_DIST) {
  const assets = join(root, 'assets');
  if (!existsSync(assets)) return '';
  return readdirSync(assets)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(assets, f), 'utf8'))
    .join('\n');
}

/**
 * Load stylesheets in import order that reproduces the App.css override:
 * tokens → page frame → hero → App.css (still imported from App.jsx).
 */
function loadCascadeSheets() {
  document.querySelectorAll('[data-cascade-test]').forEach((n) => n.remove());
  const files = [
    'src/theme/tokens.css',
    'src/layout/PageFrame.css',
    'src/styles/HeroSection.css',
    'src/App.css',
  ];
  for (const rel of files) {
    const style = document.createElement('style');
    style.setAttribute('data-cascade-test', rel);
    style.textContent = readFileSync(join(ROOT, rel), 'utf8');
    document.head.appendChild(style);
  }
}

function mountFrameAndHero() {
  document.body.replaceChildren();
  const main = document.createElement('main');
  main.className = 'page-frame page-frame--home';
  main.id = 'main-content';
  const section = document.createElement('section');
  section.className = 'hero-section';
  const h1 = document.createElement('h1');
  h1.className = 'hero-name';
  h1.textContent = 'Name';
  const p = document.createElement('p');
  p.className = 'hero-summary';
  p.textContent = 'Summary';
  section.append(h1, p);
  main.append(section);
  document.body.append(main);
  return { main, section, h1, p };
}

describe('R-1/AI-1: App.css must not fight PageFrame / hero cascade (AC-25, AC-9)', () => {
  afterEach(() => {
    document.querySelectorAll('[data-cascade-test]').forEach((n) => n.remove());
    document.body.replaceChildren();
  });

  it('computed: main.page-frame is full-bleed (no 1200px cap, no extra header margin-top)', () => {
    loadCascadeSheets();
    const { main } = mountFrameAndHero();
    const style = getComputedStyle(main);
    expect(style.maxWidth).not.toBe('1200px');
    expect(style.maxWidth).toBe('none');
    expect(style.marginTop).toBe('0px');
  });

  it('computed: hero summary uses muted token, not legacy #4b5563; h1 not legacy 3rem', () => {
    loadCascadeSheets();
    const { h1, p, section } = mountFrameAndHero();
    // #4b5563 → rgb(75, 85, 99); --color-text-muted dark → #A8A397 → rgb(168, 163, 151)
    expect(getComputedStyle(p).color).not.toBe('rgb(75, 85, 99)');
    expect(getComputedStyle(p).color).toBe('rgb(168, 163, 151)');
    // Legacy App.css `.hero-section h1 { font-size: 3rem }` → 48px; hero-name clamp tops out higher.
    expect(getComputedStyle(h1).fontSize).not.toBe('48px');
    expect(getComputedStyle(section).textAlign).not.toBe('center');
  });

  it('computed: Vite-template #root max-width/padding does not cap the app shell', () => {
    loadCascadeSheets();
    const root = document.createElement('div');
    root.id = 'root';
    document.body.append(root);
    const style = getComputedStyle(root);
    expect(style.maxWidth).not.toBe('1280px');
    expect(style.padding).not.toMatch(/32px/); // 2rem
    expect(style.textAlign).not.toBe('center');
  });

  it(
    'source + dist: leftover App.css main/hero/#root fingerprints are gone',
    async () => {
      const appCss = readFileSync(join(ROOT, 'src/App.css'), 'utf8');
      expect(appCss).not.toMatch(/main\s*\{[^}]*max-width\s*:\s*1200px/s);
      expect(appCss).not.toMatch(/main\s*\{[^}]*margin-top\s*:\s*var\(--header-height\)/s);
      expect(appCss).not.toMatch(/\.hero-section\s+p\s*\{[^}]*#4b5563/s);
      expect(appCss).not.toMatch(/\.hero-section\s+h1\s*\{/s);
      expect(appCss).not.toMatch(/#root\s*\{[^}]*max-width\s*:\s*1280px/s);

      const readyPath = join(ROOT, 'node_modules/.cache/portfolio-test/shared-dist.ready');
      if (existsSync(readyPath)) unlinkSync(readyPath);
      await ensureSharedDist();
      const built = collectDistCss();
      expect(built.length).toBeGreaterThan(0);
      expect(built).not.toMatch(/#4b5563/);
      // Bundled CSS must keep page-frame full width token path, not a capped main.
      expect(built).toMatch(/\.page-frame[^{]*\{[^}]*width:\s*100%/s);
    },
    120_000
  );
});

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ensureSharedDist } from '../src/test/ensure-dist-build.js';

describe('AC-10: self-hosted font loading', () => {
  it('index.html does not include a render-blocking Google Fonts stylesheet', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    expect(html).not.toMatch(/fonts\.googleapis\.com/);
    expect(html).not.toMatch(/fonts\.gstatic\.com/);
    expect(html).toMatch(/rel="preload"/);
    expect(html).toMatch(/instrument-serif.*\.woff2/i);
    expect(html).toMatch(/instrument-sans.*\.woff2/i);
    expect(html).toMatch(/geist-mono.*\.woff2/i);
  });

  it('token font families are Instrument Sans / Serif and Geist Mono', () => {
    const tokens = readFileSync(join(process.cwd(), 'src/theme/tokens.css'), 'utf8');
    expect(tokens).toMatch(/--font-sans:.*Instrument Sans/);
    expect(tokens).toMatch(/--font-display:.*Instrument Serif/);
    expect(tokens).toMatch(/--font-mono:.*Geist Mono/);
  });

  it('fonts.css declares size-adjust fallbacks and self-hosted @font-face', () => {
    const fonts = readFileSync(join(process.cwd(), 'src/styles/fonts.css'), 'utf8');
    expect(fonts).toMatch(/size-adjust/);
    expect(fonts).toMatch(/Instrument Sans Fallback/);
    expect(fonts).toMatch(/Instrument Serif Fallback/);
    expect(fonts).toMatch(/Geist Mono Fallback/);
    expect(fonts).toMatch(/url\('\/fonts\/instrument-sans/);
    expect(fonts).toMatch(/url\('\/fonts\/instrument-serif/);
    expect(fonts).toMatch(/url\('\/fonts\/geist-mono/);
  });

  it('public/fonts ships the woff2 files', () => {
    const dir = join(process.cwd(), 'public/fonts');
    expect(existsSync(join(dir, 'instrument-sans-latin-400-normal.woff2'))).toBe(true);
    expect(existsSync(join(dir, 'instrument-serif-latin-400-normal.woff2'))).toBe(true);
    expect(existsSync(join(dir, 'geist-mono-latin-wght-normal.woff2'))).toBe(true);
  });

  it('built index.html has no Google Fonts link', async () => {
    await ensureSharedDist();
    const built = readFileSync(join(process.cwd(), 'dist/index.html'), 'utf8');
    expect(built).not.toMatch(/fonts\.googleapis\.com/);
    expect(built).not.toMatch(/fonts\.gstatic\.com/);
  });
});

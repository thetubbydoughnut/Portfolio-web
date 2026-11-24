import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * AC-18 / F1: hero LCP text must be in the first paint graph — not behind a
 * lazy() boundary, opacity-0 intro, or delayed font swap.
 */
describe('AC-18: hero LCP readiness', () => {
  const root = process.cwd();

  it('App statically imports HeroSection (home is not lazy)', () => {
    const src = readFileSync(join(root, 'src/App.jsx'), 'utf8');
    expect(src).toMatch(/import\s+HeroSection\s+from\s+['"]\.\/components\/HeroSection['"]/);
    expect(src).not.toMatch(
      /const\s+HeroSection\s*=\s*lazy\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"]\.\/components\/HeroSection['"]/
    );
  });

  it('hero text CSS has no opacity-0 / translate intro on name or summary', () => {
    const css = readFileSync(join(root, 'src/styles/HeroSection.css'), 'utf8');
    for (const sel of ['.hero-name', '.hero-summary', '.hero-text', '.hero-title']) {
      const block = css.match(new RegExp(`${sel.replace('.', '\\.')}\\s*\\{[^}]*\\}`, 'm'));
      expect(block, `missing ${sel}`).toBeTruthy();
      expect(block![0]).not.toMatch(/opacity\s*:\s*0/);
      expect(block![0]).not.toMatch(/translate/);
    }
  });

  it('display font uses font-display optional (or swap) and is preloaded', () => {
    const fonts = readFileSync(join(root, 'src/styles/fonts.css'), 'utf8');
    expect(fonts).toMatch(
      /font-family:\s*['"]Instrument Serif['"][\s\S]*?font-display:\s*(optional|swap)/
    );
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toMatch(
      /rel=["']preload["'][^>]+instrument-serif-latin-400-normal\.woff2/
    );
  });
});

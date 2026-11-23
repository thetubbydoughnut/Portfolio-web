import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const PAGES = join(ROOT, 'src/pages');
const COMPONENTS = join(ROOT, 'src/components');

function readPageSources() {
  return readdirSync(PAGES)
    .filter((f) => /\.(jsx?|tsx?)$/.test(f) && !f.includes('.test.'))
    .map((f) => ({
      file: `src/pages/${f}`,
      src: readFileSync(join(PAGES, f), 'utf8'),
    }));
}

describe('AC-5: no artificial PageLoader timers; styled-components removed', () => {
  it('Experience, Contact, Certifications, Skills, and Home render without PageLoader/setTimeout loaders', () => {
    const targets = [
      'Experience.jsx',
      'Contact.jsx',
      'Certifications.jsx',
      'Skills.jsx',
      'Home.jsx',
    ];
    for (const name of targets) {
      const path = join(PAGES, name);
      if (!existsSync(path)) continue;
      const src = readFileSync(path, 'utf8');
      expect(src, name).not.toMatch(/PageLoader/);
      expect(src, name).not.toMatch(/setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{?\s*set(Is)?[Ll]oading\s*\(\s*false/);
      // No 500–1000ms artificial loader timers
      expect(src, name).not.toMatch(/setTimeout\s*\([^,]+,\s*(500|800|1000)\s*\)/);
    }
  });

  it('PageLoader.jsx and Loader.jsx are removed once unused', () => {
    expect(existsSync(join(COMPONENTS, 'PageLoader.jsx'))).toBe(false);
    expect(existsSync(join(COMPONENTS, 'Loader.jsx'))).toBe(false);
  });

  it('styled-components is removed from package.json', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.dependencies?.['styled-components']).toBeUndefined();
    expect(pkg.devDependencies?.['styled-components']).toBeUndefined();
  });

  it('negative: no page file keeps a 500–1000ms loader timer or imports PageLoader', () => {
    for (const { file, src } of readPageSources()) {
      expect(src, file).not.toMatch(/import\s+PageLoader/);
      expect(src, file).not.toMatch(/setTimeout\s*\([^,]+,\s*(5\d{2}|6\d{2}|7\d{2}|8\d{2}|9\d{2}|1000)\s*\)/);
    }
  });
});

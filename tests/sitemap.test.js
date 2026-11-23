import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ORIGIN = 'https://portfolio-web-phi-navy.vercel.app';
const ROOT = process.cwd();
const OUT = join(ROOT, 'dist-sitemap-check');
const REQUIRED_PATHS = [
  '/',
  '/projects',
  '/skills',
  '/experience',
  '/certifications',
  '/contact',
];

describe('AC-2: sitemap.xml', () => {
  beforeAll(() => {
    if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
    execSync(`npx vite build --outDir ${OUT}`, { stdio: 'pipe' });
  }, 120000);

  afterAll(() => {
    if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
  });

  it('public/sitemap.xml lists required routes on the canonical origin', () => {
    const path = join(ROOT, 'public/sitemap.xml');
    expect(existsSync(path)).toBe(true);
    const xml = readFileSync(path, 'utf8');
    expect(xml.trim().startsWith('<!DOCTYPE')).toBe(false);
    expect(xml).toMatch(/<\?xml/i);
    expect(xml).toMatch(/<urlset/i);
    expect(xml).not.toMatch(/pixelperfectdev\.top/i);
    expect(xml).not.toMatch(/YOUR_|placeholder|TODO_URL/i);

    for (const route of REQUIRED_PATHS) {
      const loc =
        route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`;
      expect(xml, `missing loc for ${route}`).toContain(`<loc>${loc}</loc>`);
    }
  });

  it('dist/sitemap.xml is valid XML and includes /experience and /certifications', () => {
    const path = join(OUT, 'sitemap.xml');
    expect(existsSync(path)).toBe(true);
    const xml = readFileSync(path, 'utf8');
    expect(xml.trim().startsWith('<!DOCTYPE')).toBe(false);
    expect(xml).toContain(`<loc>${ORIGIN}/experience</loc>`);
    expect(xml).toContain(`<loc>${ORIGIN}/certifications</loc>`);
  });
});

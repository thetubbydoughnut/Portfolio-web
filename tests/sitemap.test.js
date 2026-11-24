import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  ensureSharedDist,
  SHARED_DIST,
} from '../src/test/ensure-dist-build.js';

const ORIGIN = 'https://portfolio-web-phi-navy.vercel.app';
const ROOT = process.cwd();
const REQUIRED_PATHS = [
  '/',
  '/projects',
  '/skills',
  '/experience',
  '/certifications',
  '/contact',
];

describe('AC-2: sitemap.xml', () => {
  beforeAll(async () => {
    await ensureSharedDist();
  }, 120000);

  it('public/sitemap.xml lists required routes on the canonical origin', () => {
    const path = join(ROOT, 'public/sitemap.xml');
    expect(existsSync(path)).toBe(true);
    const xml = readFileSync(path, 'utf8');
    expect(xml.trim().startsWith('<!DOCTYPE')).toBe(false);
    expect(xml).toMatch(/<\?xml/i);
    expect(xml).toMatch(/<urlset/i);
    expect(xml.toLowerCase()).not.toContain(['pixel', 'perfect', 'dev', '.top'].join(''));
    expect(xml).not.toMatch(/YOUR_|placeholder|TODO_URL/i);

    for (const route of REQUIRED_PATHS) {
      const loc =
        route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`;
      expect(xml, `missing loc for ${route}`).toContain(`<loc>${loc}</loc>`);
    }
  });

  it('dist/sitemap.xml is valid XML and includes /experience and /certifications', () => {
    const path = join(SHARED_DIST, 'sitemap.xml');
    expect(existsSync(path)).toBe(true);
    const xml = readFileSync(path, 'utf8');
    expect(xml.trim().startsWith('<!DOCTYPE')).toBe(false);
    expect(xml).toContain(`<loc>${ORIGIN}/experience</loc>`);
    expect(xml).toContain(`<loc>${ORIGIN}/certifications</loc>`);
  });
});

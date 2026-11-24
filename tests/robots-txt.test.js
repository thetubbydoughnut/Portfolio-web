import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  ensureSharedDist,
  SHARED_DIST,
} from '../src/test/ensure-dist-build.js';

const ORIGIN = 'https://portfolio-web-phi-navy.vercel.app';
const ROOT = process.cwd();

describe('AC-2: robots.txt', () => {
  beforeAll(async () => {
    await ensureSharedDist();
  }, 120000);

  it('public/robots.txt allows the site and points at the canonical sitemap', () => {
    const path = join(ROOT, 'public/robots.txt');
    expect(existsSync(path)).toBe(true);
    const text = readFileSync(path, 'utf8');
    expect(text).not.toMatch(/^<!DOCTYPE/i);
    expect(text).not.toMatch(/Disallow:\s*\//);
    expect(text).toMatch(/User-agent:\s*\*/i);
    expect(text).toMatch(/Allow:\s*\//i);
    expect(text).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    expect(text.toLowerCase()).not.toContain(['pixel', 'perfect', 'dev', '.top'].join(''));
  });

  it('dist/robots.txt is copied and is plain text (not the SPA shell)', () => {
    const path = join(SHARED_DIST, 'robots.txt');
    expect(existsSync(path)).toBe(true);
    const text = readFileSync(path, 'utf8');
    expect(text.trim().startsWith('<!DOCTYPE')).toBe(false);
    expect(text).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  });
});

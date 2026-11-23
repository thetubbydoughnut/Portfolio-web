import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ORIGIN = 'https://portfolio-web-phi-navy.vercel.app';
const ROOT = process.cwd();

describe('AC-2: robots.txt', () => {
  beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
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
    expect(text).not.toMatch(/pixelperfectdev\.top/i);
  });

  it('dist/robots.txt is copied and is plain text (not the SPA shell)', () => {
    const path = join(ROOT, 'dist/robots.txt');
    expect(existsSync(path)).toBe(true);
    const text = readFileSync(path, 'utf8');
    expect(text.trim().startsWith('<!DOCTYPE')).toBe(false);
    expect(text).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  });
});

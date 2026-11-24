import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { resumeData } from '../src/data/resume.js';
import {
  ensureSharedDist,
  SHARED_DIST,
} from '../src/test/ensure-dist-build.js';

const ORIGIN = 'https://portfolio-web-phi-navy.vercel.app';
const ROOT = process.cwd();

function extractJsonLd(html) {
  const scripts = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];
  return scripts.map((m) => JSON.parse(m[1]));
}

describe('AC-2: SEO head metadata, JSON-LD, favicon, OG image', () => {
  beforeAll(async () => {
    await ensureSharedDist();
  }, 120000);

  it('built dist/index.html has canonical, og, twitter, JSON-LD, and non-Vite favicon', () => {
    const htmlPath = join(SHARED_DIST, 'index.html');
    expect(existsSync(htmlPath)).toBe(true);
    const html = readFileSync(htmlPath, 'utf8');

    expect(html).toMatch(
      new RegExp(
        `<link[^>]+rel=["']canonical["'][^>]+href=["']${ORIGIN}/["']`,
        'i'
      )
    );
    expect(html).toMatch(
      new RegExp(
        `<meta[^>]+property=["']og:url["'][^>]+content=["']${ORIGIN}/["']`,
        'i'
      )
    );

    const ogImage = html.match(
      /property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    ) || html.match(
      /content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );
    expect(ogImage, 'og:image required').toBeTruthy();
    expect(ogImage[1]).toMatch(new RegExp(`^${ORIGIN}/`));
    expect(ogImage[1]).not.toMatch(/vite\.svg/i);
    expect(ogImage[1]).not.toMatch(/YOUR_|placeholder/i);

    expect(html).toMatch(/name=["']twitter:card["']/i);
    expect(html).toMatch(/name=["']twitter:title["']/i);
    expect(html).toMatch(/name=["']twitter:description["']/i);
    expect(html).toMatch(/name=["']twitter:image["']/i);

    expect(html).not.toMatch(/href=["']\/vite\.svg["']/);
    expect(html).toMatch(/rel=["']icon["']/i);

    const ld = extractJsonLd(html);
    expect(ld.length).toBeGreaterThan(0);
    const flat = ld.flatMap((item) =>
      Array.isArray(item) ? item : item['@graph'] ? item['@graph'] : [item]
    );
    const person = flat.find((x) => x['@type'] === 'Person');
    const website = flat.find((x) => x['@type'] === 'WebSite');
    expect(person).toBeTruthy();
    expect(website).toBeTruthy();
    expect(person.name).toBe('Cameron Graham');
    expect(website.name).toBe('Cameron Graham');
    expect(person.sameAs).toEqual(
      expect.arrayContaining([
        resumeData.profile.links.github,
        resumeData.profile.links.linkedin,
      ])
    );
    expect(html.toLowerCase()).not.toContain(['pixel', 'perfect', 'dev', '.top'].join(''));
  });

  it('public OG image and favicon files exist as real static assets', () => {
    const ogCandidates = [
      'public/og-image.png',
      'public/og-image.jpg',
      'public/og-image.webp',
    ];
    const og = ogCandidates.find((p) => existsSync(join(ROOT, p)));
    expect(og, 'public/og-image.* required').toBeTruthy();

    const faviconCandidates = [
      'public/favicon.ico',
      'public/favicon.svg',
      'public/favicon.png',
    ];
    const fav = faviconCandidates.find((p) => existsSync(join(ROOT, p)));
    expect(fav, 'non-Vite favicon required').toBeTruthy();
  });

  it('negative: og image path in dist is not HTML/404 shell', () => {
    const html = readFileSync(join(SHARED_DIST, 'index.html'), 'utf8');
    const ogImage =
      html.match(
        /property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const url = ogImage[1];
    const pathPart = url.replace(ORIGIN, '');
    const filePath = join(SHARED_DIST, pathPart.replace(/^\//, ''));
    expect(existsSync(filePath)).toBe(true);
    const buf = readFileSync(filePath);
    const head = buf.slice(0, 16).toString('utf8');
    expect(head.startsWith('<!DOCTYPE')).toBe(false);
    expect(head.startsWith('<html')).toBe(false);
    // PNG magic or JPEG/WebP
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
    const isWebp = head.includes('WEBP') || (buf[0] === 0x52 && buf[1] === 0x49);
    const isIco = buf[0] === 0x00 && buf[1] === 0x00;
    const isSvg = head.includes('<svg') || head.includes('<?xml');
    expect(isPng || isJpg || isWebp || isIco || isSvg).toBe(true);
  });
});

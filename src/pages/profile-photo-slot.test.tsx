import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import sharp from 'sharp';
import HeroSection from '../components/HeroSection.jsx';
import Header from '../components/Header.jsx';
import { resumeData } from '../data/resume.js';

const HERO_PATH = join(process.cwd(), 'src/assets/images/cameron-profile.webp');
const HEADER_PATH = join(process.cwd(), 'src/assets/images/cameron-profile-header.webp');
const HERO_MAX_BYTES = 120 * 1024;

/** WebP EXIF lives in a RIFF chunk named "EXIF"; GPS is typically inside that payload. */
function webpHasExifChunk(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return false;
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return false;
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const fourcc = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (fourcc === 'EXIF' || fourcc === 'XMP ') return true;
    // Chunks are padded to even sizes
    offset += 8 + size + (size % 2);
  }
  return false;
}

describe('AC-27: profile photo slot', () => {
  it('hero webp is exactly 960×1280 (3:4), ≤120 KB, with no EXIF/GPS RIFF chunks', async () => {
    expect(existsSync(HERO_PATH)).toBe(true);
    const meta = await sharp(HERO_PATH).metadata();
    expect(meta.width).toBe(960);
    expect(meta.height).toBe(1280);
    expect(meta.width! / meta.height!).toBeCloseTo(3 / 4, 5);
    expect(statSync(HERO_PATH).size).toBeLessThanOrEqual(HERO_MAX_BYTES);

    const buf = readFileSync(HERO_PATH);
    expect(webpHasExifChunk(buf)).toBe(false);
    expect(meta.exif).toBeFalsy();
    expect(meta.xmp).toBeFalsy();
    expect(meta.icc).toBeFalsy();
  });

  it('header webp is exactly 96×96 with no EXIF/GPS RIFF chunks', async () => {
    expect(existsSync(HEADER_PATH)).toBe(true);
    const meta = await sharp(HEADER_PATH).metadata();
    expect(meta.width).toBe(96);
    expect(meta.height).toBe(96);
    expect(webpHasExifChunk(readFileSync(HEADER_PATH))).toBe(false);
    expect(meta.exif).toBeFalsy();
    expect(meta.xmp).toBeFalsy();
    expect(meta.icc).toBeFalsy();
  });

  it('hero and header imgs use explicit width/height; alt stays Cameron’s name', () => {
    render(createElement(MemoryRouter, null, createElement(HeroSection)));
    const heroImg = screen.getByRole('img', { name: resumeData.profile.name });
    expect(heroImg).toHaveAttribute('width', '960');
    expect(heroImg).toHaveAttribute('height', '1280');
    expect(heroImg.getAttribute('alt')).toBe(resumeData.profile.name);

    render(createElement(MemoryRouter, null, createElement(Header)));
    // Header mark uses the same name as alt
    const headerImgs = screen.getAllByRole('img', { name: resumeData.profile.name });
    const headerMark = headerImgs.find((el) => el.getAttribute('width') === '32');
    expect(headerMark).toBeTruthy();
    expect(headerMark).toHaveAttribute('height', '32');
  });

  it('does not commit the raw source JPEG anywhere in the repo', () => {
    const root = process.cwd();
    const bannedNames = ['cameron-profile.jpg', 'cameron-profile.jpeg', 'cameron-profile_bdf8.jpg'];
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) out.push(...walk(full));
        else out.push(full);
      }
      return out;
    };
    const hits = walk(root).filter((p) => {
      const base = p.split('/').pop()!.toLowerCase();
      return bannedNames.some((b) => base === b) || /refs\/amend-2\/cameron-profile\./i.test(p);
    });
    expect(hits).toEqual([]);
  });

  it('CSS keeps hero well at max 320×427 with aspect-ratio 3/4 and object-fit cover', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/HeroSection.css'), 'utf8');
    expect(css).toMatch(/aspect-ratio:\s*3\s*\/\s*4/);
    expect(css).toMatch(/object-fit:\s*cover/);
    expect(css).toMatch(/max-width:\s*320px/);
    expect(css).toMatch(/max-height:\s*427px/);
  });
});

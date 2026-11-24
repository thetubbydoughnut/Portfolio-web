import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * AC-30: compute WCAG contrast floors from tokens.css (ratios, not exact hex).
 * Floors from Amendment 3 / A3.3 table.
 */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function parseRgba(raw: string): [number, number, number, number] {
  const m = raw.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/i
  );
  if (!m) throw new Error(`bad rgba: ${raw}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}

function channel(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: [number, number, number]) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

function contrast(a: [number, number, number], b: [number, number, number]) {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

function blendOver(
  fg: [number, number, number, number],
  bg: [number, number, number]
): [number, number, number] {
  const a = fg[3];
  return [
    Math.round(fg[0] * a + bg[0] * (1 - a)),
    Math.round(fg[1] * a + bg[1] * (1 - a)),
    Math.round(fg[2] * a + bg[2] * (1 - a)),
  ];
}

function extractBlock(css: string, selector: string): string {
  const re = new RegExp(
    `${selector.replace(/[[\]]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`,
    'gm'
  );
  let best = '';
  let match: RegExpExecArray | null;
  while ((match = re.exec(css)) !== null) {
    if (match[1].includes('--color-bg')) return match[1];
    if (match[1].length > best.length) best = match[1];
  }
  return best;
}

function readVar(block: string, name: string): string {
  const re = new RegExp(
    `${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`,
    'i'
  );
  const m = block.match(re);
  if (!m) throw new Error(`missing ${name}`);
  return m[1].trim();
}

function resolveColor(block: string, name: string): [number, number, number] {
  let raw = readVar(block, name);
  // Follow one-level var() aliases
  const varRef = raw.match(/^var\((--[^)]+)\)$/);
  if (varRef) raw = readVar(block, varRef[1]);
  if (raw.startsWith('#')) return parseHex(raw);
  if (raw.startsWith('rgb')) {
    const [r, g, b] = parseRgba(raw);
    return [r, g, b];
  }
  throw new Error(`unresolved ${name}: ${raw}`);
}

function themeBlocks(css: string) {
  const root = extractBlock(css, ':root');
  const dark =
    extractBlock(css, '[data-theme="dark"]') ||
    extractBlock(css, "[data-theme='dark']") ||
    root;
  const light =
    extractBlock(css, '[data-theme="light"]') ||
    extractBlock(css, "[data-theme='light']");
  return { dark, light };
}

describe('AC-30: palette contrast floors (A3.3)', () => {
  const css = readFileSync(join(process.cwd(), 'src/theme/tokens.css'), 'utf8');
  const { dark, light } = themeBlocks(css);

  it('defines new role tokens in both themes', () => {
    for (const block of [dark, light]) {
      expect(block).toMatch(/--color-border-strong\s*:/);
      expect(block).toMatch(/--color-on-accent\s*:/);
      expect(block).toMatch(/--color-link\s*:/);
      expect(block).toMatch(/--color-focus\s*:/);
    }
    expect(light).toMatch(/--hero-scrim\s*:/);
  });

  it('dark theme text / muted / accent / link / on-accent meet floors', () => {
    const bg = resolveColor(dark, '--color-bg');
    const surface = resolveColor(dark, '--color-surface');
    const surface2 = resolveColor(dark, '--color-surface-2');
    const text = resolveColor(dark, '--color-text');
    const muted = resolveColor(dark, '--color-text-muted');
    const accent = resolveColor(dark, '--color-accent');
    const accentHover = resolveColor(dark, '--color-accent-hover');
    const link = resolveColor(dark, '--color-link');
    const onAccent = resolveColor(dark, '--color-on-accent');
    const borderStrong = resolveColor(dark, '--color-border-strong');

    for (const base of [bg, surface, surface2]) {
      expect(contrast(text, base)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(muted, base)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(accent, base)).toBeGreaterThanOrEqual(3);
      expect(contrast(link, base)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(onAccent, accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(onAccent, accentHover)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(borderStrong, bg)).toBeGreaterThanOrEqual(3);
    expect(contrast(borderStrong, surface)).toBeGreaterThanOrEqual(3);
  });

  it('light theme text / muted / accent / link / on-accent meet floors', () => {
    const bg = resolveColor(light, '--color-bg');
    const surface = resolveColor(light, '--color-surface');
    const surface2 = resolveColor(light, '--color-surface-2');
    const text = resolveColor(light, '--color-text');
    const muted = resolveColor(light, '--color-text-muted');
    const accent = resolveColor(light, '--color-accent');
    const accentHover = resolveColor(light, '--color-accent-hover');
    const link = resolveColor(light, '--color-link');
    const onAccent = resolveColor(light, '--color-on-accent');
    const borderStrong = resolveColor(light, '--color-border-strong');

    for (const base of [bg, surface, surface2]) {
      expect(contrast(text, base)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(muted, base)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(accent, base)).toBeGreaterThanOrEqual(3);
      expect(contrast(link, base)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(onAccent, accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(onAccent, accentHover)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(borderStrong, bg)).toBeGreaterThanOrEqual(3);
    expect(contrast(borderStrong, surface)).toBeGreaterThanOrEqual(3);
  });

  it('light hero scrim at ≥0.82 yields text ≥4.5:1 over dark scene ink', () => {
    const text = resolveColor(light, '--color-text');
    const muted = resolveColor(light, '--color-text-muted');
    const scrimRaw = readVar(light, '--hero-scrim');
    const scrim = parseRgba(scrimRaw);
    expect(scrim[3]).toBeGreaterThanOrEqual(0.82);
    // Worst-case dark scene ink behind the column
    const sceneInk: [number, number, number] = [22, 22, 22];
    const behind = blendOver(scrim, sceneInk);
    expect(contrast(text, behind)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(muted, behind)).toBeGreaterThanOrEqual(4.5);
  });

  it('hero/header/page-frame CSS have no hard-coded hex outside tokens', () => {
    const files = [
      'src/styles/HeroSection.css',
      'src/styles/Header.css',
      'src/layout/PageFrame.css',
    ];
    for (const rel of files) {
      const body = readFileSync(join(process.cwd(), rel), 'utf8');
      expect(body, rel).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it('focus uses slate link token, not copper accent alias alone', () => {
    expect(dark).toMatch(/--color-focus\s*:\s*var\(--color-link\)/);
    expect(light).toMatch(/--color-focus\s*:\s*var\(--color-link\)/);
  });
});

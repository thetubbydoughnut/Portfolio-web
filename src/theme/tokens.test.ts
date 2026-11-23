import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();

const DARK_COLORS: Record<string, string> = {
  '--color-bg': '#07080A',
  '--color-surface': '#12141A',
  '--color-surface-2': '#1A1D24',
  '--color-text': '#F4F1EA',
  '--color-text-muted': '#A8A397',
  '--color-border': '#2A2D33',
  '--color-accent': '#D0B07A',
  '--color-accent-hover': '#E0C48C',
  '--color-danger': '#E07A6A',
};

const LIGHT_COLORS: Record<string, string> = {
  '--color-bg': '#F6F3EC',
  '--color-surface': '#FFFFFF',
  '--color-surface-2': '#EFEBE3',
  '--color-text': '#161616',
  '--color-text-muted': '#5C5852',
  '--color-border': '#DDD8CE',
  '--color-accent': '#7A5C28',
  '--color-accent-hover': '#8A6A32',
  '--color-danger': '#B04030',
};

const DARK_GLASS: Record<string, string> = {
  '--glass-bg': 'rgba(18, 20, 26, 0.62)',
  '--glass-border': 'rgba(208, 176, 122, 0.28)',
  '--glass-blur': '16px',
  '--lg-glass-bend': '0.35',
  '--lg-glass-dispersion': '0.2',
  '--lg-blur': '16px',
  '--lg-rim-shine': '0.12',
};

const LIGHT_GLASS: Record<string, string> = {
  '--glass-bg': 'rgba(255, 255, 255, 0.64)',
  '--glass-border': 'rgba(122, 92, 40, 0.22)',
  '--glass-blur': '16px',
  '--lg-glass-bend': '0.25',
  '--lg-glass-dispersion': '0.12',
  '--lg-blur': '16px',
  '--lg-rim-shine': '0.08',
};

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) collectSourceFiles(full, out);
    else if (/\.(css|js|jsx|ts|tsx|html)$/.test(extname(name))) out.push(full);
  }
  return out;
}

function readAllCss(): string {
  return collectSourceFiles(join(ROOT, 'src'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
}

function extractBlock(css: string, selector: string): string {
  const re = new RegExp(
    `${selector.replace(/[[\]]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`,
    'gm'
  );
  let best = '';
  let match: RegExpExecArray | null;
  while ((match = re.exec(css)) !== null) {
    const body = match[1];
    if (body.includes('--color-bg') || body.includes('--glass-bg')) {
      return body;
    }
    if (body.length > best.length) best = body;
  }
  return best;
}

function expectVar(block: string, name: string, value: string) {
  const pattern = new RegExp(
    `${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'i'
  );
  expect(block, `expected ${name}: ${value}`).toMatch(pattern);
}

describe('AC-1: design tokens, glass tokens, Tailwind, theme helper', () => {
  it('defines dark tokens on :root / [data-theme="dark"] and light on [data-theme="light"]', () => {
    const css = readAllCss();
    expect(css).toMatch(/\[data-theme=["']light["']\]/);
    expect(css).toMatch(/:root|\[data-theme=["']dark["']\]/);

    const darkBlock =
      extractBlock(css, ':root') ||
      extractBlock(css, '[data-theme="dark"]') ||
      extractBlock(css, "[data-theme='dark']");
    const lightBlock =
      extractBlock(css, '[data-theme="light"]') ||
      extractBlock(css, "[data-theme='light']");

    expect(darkBlock.length).toBeGreaterThan(0);
    expect(lightBlock.length).toBeGreaterThan(0);

    for (const [name, value] of Object.entries(DARK_COLORS)) {
      expectVar(darkBlock, name, value);
    }
    for (const [name, value] of Object.entries(DARK_GLASS)) {
      expectVar(darkBlock, name, value);
    }
    // focus matches accent
    expect(darkBlock).toMatch(
      /--color-focus\s*:\s*(var\(--color-accent\)|#D0B07A)/i
    );

    for (const [name, value] of Object.entries(LIGHT_COLORS)) {
      expectVar(lightBlock, name, value);
    }
    for (const [name, value] of Object.entries(LIGHT_GLASS)) {
      expectVar(lightBlock, name, value);
    }
    expect(lightBlock).toMatch(
      /--color-focus\s*:\s*(var\(--color-accent\)|#7A5C28)/i
    );
  });

  it('includes Appendix B spacing/radius/motion tokens', () => {
    const css = readAllCss();
    expect(css).toMatch(/--ease-standard\s*:\s*cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/);
    expect(css).toMatch(/--duration-fast\s*:\s*150ms/);
    expect(css).toMatch(/--duration-mid\s*:\s*250ms/);
    expect(css).toMatch(/--duration-slow\s*:\s*400ms/);
    expect(css).toMatch(/--duration-route\s*:\s*600ms/);
    expect(css).toMatch(/--radius-control\s*:\s*8px/);
    expect(css).toMatch(/--radius-glass\s*:\s*20px/);
  });

  it('wires color and glass tokens into Tailwind theme config', () => {
    const configPath = [
      join(ROOT, 'tailwind.config.js'),
      join(ROOT, 'tailwind.config.cjs'),
      join(ROOT, 'tailwind.config.ts'),
      join(ROOT, 'tailwind.config.mjs'),
    ].find((p) => existsSync(p));
    expect(configPath, 'tailwind.config.* must exist').toBeTruthy();
    const config = readFileSync(configPath!, 'utf8');
    expect(config).toMatch(/color-bg|bg.*var\(--color-bg\)|--color-bg/);
    expect(config).toMatch(/--color-accent|accent/);
    expect(config).toMatch(/--glass-bg|glass/);
  });

  it('exposes a documentElement theme helper that persists preference', async () => {
    const themeDir = join(ROOT, 'src/theme');
    expect(existsSync(themeDir)).toBe(true);
    const files = readdirSync(themeDir).filter((f) =>
      /\.(ts|tsx|js|jsx)$/.test(f) && !f.includes('.test.')
    );
    expect(files.length).toBeGreaterThan(0);

    // Dynamic import of the helper module (prefer useTheme / theme / applyTheme)
    const helperName =
      files.find((f) => /theme|useTheme/i.test(f)) || files[0];
    const mod = await import(join(themeDir, helperName));
    const applyTheme =
      mod.applyTheme ||
      mod.setTheme ||
      mod.default?.applyTheme ||
      mod.default?.setTheme;
    const resolveInitialTheme =
      mod.resolveInitialTheme ||
      mod.getInitialTheme ||
      mod.default?.resolveInitialTheme ||
      mod.default?.getInitialTheme;

    expect(typeof resolveInitialTheme).toBe('function');
    expect(typeof applyTheme).toBe('function');

    // Dark when OS dark
    expect(
      resolveInitialTheme({
        stored: null,
        prefersColorScheme: 'dark',
      })
    ).toBe('dark');
    // Dark when no preference
    expect(
      resolveInitialTheme({
        stored: null,
        prefersColorScheme: 'no-preference',
      })
    ).toBe('dark');
    // Light when OS light and no stored
    expect(
      resolveInitialTheme({
        stored: null,
        prefersColorScheme: 'light',
      })
    ).toBe('light');
    // Stored wins
    expect(
      resolveInitialTheme({
        stored: 'light',
        prefersColorScheme: 'dark',
      })
    ).toBe('light');
    expect(
      resolveInitialTheme({
        stored: 'dark',
        prefersColorScheme: 'light',
      })
    ).toBe('dark');

    const el = document.documentElement;
    const store: Record<string, string> = {};
    const ls = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    };
    applyTheme('light', { documentElement: el, localStorage: ls });
    expect(el.getAttribute('data-theme')).toBe('light');
    expect(Object.values(store)).toContain('light');
    applyTheme('dark', { documentElement: el, localStorage: ls });
    expect(el.getAttribute('data-theme')).toBe('dark');
  });

  it('does not keep competing legacy primary token hex values as sources', () => {
    // Scan runtime CSS only (exclude tests that document the banned literals)
    const blob = collectSourceFiles(join(ROOT, 'src'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(f, 'utf8'))
      .join('\n');
    const hasOldPrimary = /--color-primary\s*:\s*#2C3E50/i.test(blob);
    const hasOldSky = /--primary-color\s*:\s*#38bdf8/i.test(blob);
    expect(
      hasOldPrimary && hasOldSky,
      'competing legacy token declarations must not coexist'
    ).toBe(false);
    expect(hasOldPrimary).toBe(false);
    expect(hasOldSky).toBe(false);
  });

  it('fails closed: glass tokens must be present (negative)', () => {
    const css = readAllCss();
    expect(css).toMatch(/--glass-bg\s*:/);
    expect(css).toMatch(/--glass-border\s*:/);
    expect(css).toMatch(/--glass-blur\s*:/);
    expect(css).toMatch(/--lg-glass-bend\s*:/);
  });

  it('fails closed: light theme block must exist alongside dark (negative)', () => {
    const css = readAllCss();
    const hasLight = /\[data-theme=["']light["']\]/.test(css);
    const hasDarkTokens = /--color-bg\s*:\s*#07080A/i.test(css);
    expect(hasDarkTokens && !hasLight).toBe(false);
    expect(hasLight).toBe(true);
  });
});

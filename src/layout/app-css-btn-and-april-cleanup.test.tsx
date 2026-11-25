import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

function appCss() {
  return readFileSync(join(ROOT, 'src/App.css'), 'utf8');
}

/** Strip prefers-reduced-motion: no-preference blocks so ungated rules are visible. */
function withoutReducedMotionOk(css: string) {
  return css.replace(
    /@media\s*\(\s*prefers-reduced-motion:\s*no-preference\s*\)\s*\{[\s\S]*?\n\}/g,
    ''
  );
}

describe('R-4/AI-4: btn hover motion gate + primary CTA accent', () => {
  it('gates .btn:hover translateY behind prefers-reduced-motion: no-preference', () => {
    const css = appCss();
    expect(css).toMatch(
      /@media\s*\(\s*prefers-reduced-motion:\s*no-preference\s*\)\s*\{[^}]*\.btn:hover[^}]*translateY\(-3px\)/s
    );
    const ungated = withoutReducedMotionOk(css);
    expect(ungated).not.toMatch(/\.btn:hover\s*\{[^}]*translateY\(-3px\)/s);
  });

  it('primary CTA hover keeps a visible accent (not --color-primary/--color-bg flash)', () => {
    const css = appCss();
    // Old bug: .btn-primary:hover { background: var(--color-primary) } aliases page bg
    expect(css).not.toMatch(
      /\.btn-primary:hover\s*\{[^}]*background:\s*var\(--color-primary\)/s
    );
    expect(css).toMatch(
      /\.btn-primary:hover\s*\{[^}]*background:\s*var\(--color-accent(?:-hover)?\)/s
    );

    const hero = readFileSync(join(ROOT, 'src/styles/HeroSection.css'), 'utf8');
    expect(hero).toMatch(/\.hero-buttons\s+\.btn-primary/);
  });
});

describe('R-5: remove April leftovers from App.css', () => {
  it('drops undefined --background-color header, Inter body, Vite logo/#root overflow, unused nav/logo/card', () => {
    const css = appCss();
    expect(css).not.toMatch(/var\(--background-color\)/);
    expect(css).not.toMatch(/font-family:\s*['"]Inter['"]/);
    expect(css).not.toMatch(/\.nav-container\s*\{/);
    expect(css).not.toMatch(/^\.logo\s*\{/m);
    expect(css).not.toMatch(/^\.card\s*\{/m);
    expect(css).not.toMatch(/#root\s*\{[^}]*height:\s*100vh/s);
    expect(css).not.toMatch(/#root\s*\{[^}]*overflow:\s*hidden/s);
  });

  it('drops .section min-height 100vh and ::after hairline leftover', () => {
    const css = appCss();
    expect(css).not.toMatch(/\.section\s*\{[^}]*min-height:\s*100vh/s);
    expect(css).not.toMatch(/\.section::after\s*\{/);
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * AC-31 / F2: theme toggle must stay off the INP critical path —
 * documentElement class/attr swap first, React state via startTransition.
 */
describe('AC-31: theme toggle INP priority', () => {
  it('useTheme toggle applies theme then startTransition for React state', () => {
    const src = readFileSync(join(process.cwd(), 'src/theme/useTheme.ts'), 'utf8');
    expect(src).toMatch(/startTransition/);
    expect(src).toMatch(/toggleTheme/);
    // applyTheme (DOM) must appear before startTransition in toggleTheme body
    const toggleBody = src.match(
      /const toggleTheme\s*=\s*\(\)\s*=>\s*\{([\s\S]*?)\n  \};/
    );
    expect(toggleBody, 'toggleTheme body').toBeTruthy();
    const body = toggleBody![1];
    const applyIdx = body.search(/applyTheme|toggleThemeHelper/);
    const stIdx = body.indexOf('startTransition');
    expect(applyIdx).toBeGreaterThanOrEqual(0);
    expect(stIdx).toBeGreaterThan(applyIdx);
  });
});

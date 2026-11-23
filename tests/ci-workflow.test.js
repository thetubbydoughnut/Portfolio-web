import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const WORKFLOW = join(ROOT, '.github/workflows/ci.yml');

describe('AC-3: GitHub Actions CI workflow & TypeScript', () => {
  it('adds .github/workflows/ci.yml triggered on pull_request', () => {
    expect(existsSync(WORKFLOW)).toBe(true);
    const yml = readFileSync(WORKFLOW, 'utf8');
    expect(yml).toMatch(/on:\s*([\s\S]*?)pull_request/);
    expect(yml).toMatch(/npm ci/);
    expect(yml).toMatch(/npm test/);
    expect(yml).toMatch(/npm run build/);
  });

  it('does not mask test failures with continue-on-error or || true', () => {
    const yml = readFileSync(WORKFLOW, 'utf8');
    expect(yml).not.toMatch(/continue-on-error:\s*true/);
    expect(yml).not.toMatch(/\|\|\s*true/);
  });

  it('has tsconfig.json supporting .ts/.tsx alongside JS', () => {
    const tsconfigPath = join(ROOT, 'tsconfig.json');
    expect(existsSync(tsconfigPath)).toBe(true);
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
    const allowJs = tsconfig.compilerOptions?.allowJs;
    expect(allowJs).toBe(true);
    // Include covers src
    const include = tsconfig.include || [];
    expect(include.some((p) => String(p).includes('src'))).toBe(true);
  });

  it('package.json can run tsc --noEmit (typescript present)', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const hasTs =
      Boolean(pkg.devDependencies?.typescript) ||
      Boolean(pkg.dependencies?.typescript);
    expect(hasTs).toBe(true);
  });
});

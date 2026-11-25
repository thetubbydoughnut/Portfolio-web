import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

describe('AC-29: Diátaxis docs and TDD standard', () => {
  it('required docs exist', () => {
    for (const rel of [
      'README.md',
      'CONTRIBUTING.md',
      'docs/architecture.md',
      'CHANGELOG.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
    ]) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it('README has no VITE_GITHUB_TOKEN and says Cameron deploys', () => {
    const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
    expect(readme).not.toMatch(/VITE_GITHUB_TOKEN/);
    expect(readme).toMatch(/Cameron deploys|Cameron.*deploy/i);
    expect(readme).toMatch(/bots? do not|do not change Vercel|bots never deploy/i);
  });

  it('CONTRIBUTING requires failing-test-first TDD', () => {
    const c = readFileSync(join(ROOT, 'CONTRIBUTING.md'), 'utf8');
    expect(c).toMatch(/failing test first|write a failing test first/i);
    expect(c).toMatch(/Vitest/i);
    expect(c).toMatch(/Playwright/i);
  });

  it('architecture doc describes landed effects only', () => {
    const a = readFileSync(join(ROOT, 'docs/architecture.md'), 'utf8');
    expect(a).toMatch(/motion budget|MotionBudget/i);
    expect(a).toMatch(/ThreeUI|EmeraldHorizon/i);
    expect(a).toMatch(/Glisse/i);
    expect(a).toMatch(/Shader Lab/i);
    expect(a).toMatch(/route transition|gl-transition|directional/i);
    expect(a).not.toMatch(/coming soon|planned but not|will add later/i);
  });

  it('CHANGELOG uses Keep a Changelog with Unreleased', () => {
    const log = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
    expect(log).toMatch(/Keep a Changelog/i);
    expect(log).toMatch(/## \[Unreleased\]/);
  });

  it('PR template has AC / test-evidence / secrets / docs checklist', () => {
    const t = readFileSync(join(ROOT, '.github/PULL_REQUEST_TEMPLATE.md'), 'utf8');
    expect(t).toMatch(/AC|Acceptance/i);
    expect(t).toMatch(/fail-before|pass-after|test evidence/i);
    expect(t).toMatch(/secret/i);
    expect(t).toMatch(/docs/i);
  });

  it('coverage script exists and floor is a measured integer', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts['test:coverage'] || pkg.scripts.coverage).toBeTruthy();
    expect(pkg.devDependencies['@vitest/coverage-v8']).toBeTruthy();

    const floorPath = join(ROOT, 'coverage-floor.json');
    expect(existsSync(floorPath)).toBe(true);
    const floor = JSON.parse(readFileSync(floorPath, 'utf8'));
    expect(Number.isInteger(floor.statements)).toBe(true);
    expect(floor.statements).toBeGreaterThan(0);
    expect(floor.statements).toBeLessThanOrEqual(100);
    expect(floor.measured).toBe(true);
    // Must not be a round marketing number invented without measurement note
    expect(floor.source).toMatch(/vitest|measured/i);
  });

  it('Playwright smoke exists for an existing behavior', () => {
    const smoke = join(ROOT, 'tests/e2e/smoke.spec.ts');
    expect(existsSync(smoke)).toBe(true);
    const src = readFileSync(smoke, 'utf8');
    expect(src).toMatch(/Cameron Graham|Download resume|Resume/i);
  });
});

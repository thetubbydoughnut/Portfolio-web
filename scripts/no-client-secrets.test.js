import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import {
  runViteBuild,
  collectDistJs,
} from '../src/test/ensure-dist-build.js';

const TOKEN_PATTERNS = [/ghp_/, /github_pat_/, /gho_/, /VITE_GITHUB_TOKEN/, /Authorization:\s*bearer/i];
const MAIN_OUT = join(process.cwd(), 'dist-secrets-main');

function assertNoSecrets(blob, label) {
  for (const pattern of TOKEN_PATTERNS) {
    expect(blob, `${label} matched ${pattern}`).not.toMatch(pattern);
  }
}

describe('AC-6: no client secrets in built assets', () => {
  beforeAll(async () => {
    await runViteBuild({
      outDir: 'dist-secrets-main',
      env: { VITE_GITHUB_TOKEN: undefined },
    });
  }, 120000);

  afterAll(() => {
    if (existsSync(MAIN_OUT)) {
      rmSync(MAIN_OUT, { recursive: true, force: true });
    }
  });

  it('built dist/ JS has zero token / VITE_GITHUB_TOKEN / bearer patterns', () => {
    const blob = collectDistJs(MAIN_OUT);
    expect(blob.length).toBeGreaterThan(0);
    assertNoSecrets(blob, 'dist-secrets-main');
  });

  it('building with VITE_GITHUB_TOKEN=ghp_dummy_sentinel still leaves zero matches in dist/', async () => {
    const tmpDist = await runViteBuild({
      outDir: 'dist-secrets-check',
      env: { VITE_GITHUB_TOKEN: 'ghp_dummy_sentinel' },
    });

    const blob = collectDistJs(tmpDist);
    expect(blob.length).toBeGreaterThan(0);
    assertNoSecrets(blob, 'dist-secrets-check');
    // Explicitly ensure the dummy sentinel string did not leak
    expect(blob).not.toContain('ghp_dummy_sentinel');
    expect(blob).not.toContain('VITE_GITHUB_TOKEN');

    rmSync(tmpDist, { recursive: true, force: true });
  }, 120000);

  it('Projects.jsx source no longer references VITE_GITHUB_TOKEN or bearer auth', () => {
    const src = readFileSync(join(process.cwd(), 'src/pages/Projects.jsx'), 'utf8');
    expect(src).not.toMatch(/VITE_GITHUB_TOKEN/);
    expect(src).not.toMatch(/Authorization.*bearer/i);
    expect(src).not.toMatch(/api\.github\.com\/graphql/);
  });
});

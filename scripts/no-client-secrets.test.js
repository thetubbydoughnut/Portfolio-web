import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';

const TOKEN_PATTERNS = [/ghp_/, /github_pat_/, /gho_/, /VITE_GITHUB_TOKEN/, /Authorization:\s*bearer/i];

function collectDistJs(distDir = join(process.cwd(), 'dist')) {
  const assets = join(distDir, 'assets');
  if (!existsSync(assets)) return '';
  return readdirSync(assets)
    .filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(join(assets, f), 'utf8'))
    .join('\n');
}

function assertNoSecrets(blob, label) {
  for (const pattern of TOKEN_PATTERNS) {
    expect(blob, `${label} matched ${pattern}`).not.toMatch(pattern);
  }
}

describe('AC-6: no client secrets in built assets', () => {
  beforeAll(() => {
    // Always rebuild so dist reflects the current source (no stale token paths)
    execSync('npm run build', {
      stdio: 'pipe',
      env: { ...process.env, VITE_GITHUB_TOKEN: undefined },
    });
  }, 120000);

  it('built dist/ JS has zero token / VITE_GITHUB_TOKEN / bearer patterns', () => {
    const blob = collectDistJs();
    expect(blob.length).toBeGreaterThan(0);
    assertNoSecrets(blob, 'dist');
  });

  it('building with VITE_GITHUB_TOKEN=ghp_dummy_sentinel still leaves zero matches in dist/', () => {
    const tmpDist = join(process.cwd(), 'dist-secrets-check');
    if (existsSync(tmpDist)) {
      rmSync(tmpDist, { recursive: true, force: true });
    }

    // Build into a throwaway outDir via vite --outDir without committing the sentinel
    execSync('npx vite build --outDir dist-secrets-check', {
      stdio: 'pipe',
      env: {
        ...process.env,
        VITE_GITHUB_TOKEN: 'ghp_dummy_sentinel',
      },
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

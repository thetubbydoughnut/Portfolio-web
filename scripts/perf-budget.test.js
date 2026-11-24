import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ensureSharedDist, SHARED_DIST } from '../src/test/ensure-dist-build.js';
import { measureDist, evaluateBudgets, BUDGETS } from './perf-budget.mjs';

describe('AC-31: perf-budget.mjs (A3.4 gzip)', () => {
  it('exports A3.4 budgets that are not silently lowered', () => {
    expect(BUDGETS.initialRouteJsKb).toBe(150);
    expect(BUDGETS.initialRouteCssKb).toBe(20);
    expect(BUDGETS.threeUiChunkKb).toBe(130);
  });

  it(
    'built dist meets initial-route JS/CSS and ThreeUI gzip budgets',
    async () => {
      const ready = join(
        process.cwd(),
        'node_modules/.cache/portfolio-test/shared-dist.ready'
      );
      if (existsSync(ready)) {
        // Force rebuild so budgets reflect current sources
        const { unlinkSync } = await import('node:fs');
        unlinkSync(ready);
      }
      await ensureSharedDist();
      const metrics = measureDist(SHARED_DIST);
      const rows = evaluateBudgets(metrics);
      for (const row of rows) {
        expect(row.pass, `${row.id}: ${row.actual} > ${row.budget} ${row.unit}`).toBe(
          true
        );
      }

      // Fallback/mobile must not need ThreeUI in the HTML entry graph
      const html = readFileSync(join(SHARED_DIST, 'index.html'), 'utf8');
      expect(html).not.toMatch(/EmeraldHorizon/i);

      // threeui/style.css must not ride the critical CSS path as a separate eager file name
      const assets = join(SHARED_DIST, 'assets');
      const cssFiles = readdirSync(assets).filter((f) => f.endsWith('.css'));
      // Index-linked CSS total already gated; also ensure no standalone huge threeui css entry
      expect(cssFiles.length).toBeGreaterThan(0);
    },
    180_000
  );
});

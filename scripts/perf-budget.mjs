#!/usr/bin/env node
/**
 * AC-31 / A3.4: gzip budgets from dist/ + Vite manifest.
 * Exit 0 when all budgets hold; 1 otherwise.
 *
 * Usage: node scripts/perf-budget.mjs [--json]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/** A3.4 budgets (kB gzip). Do not lower without planner sign-off. */
export const BUDGETS = {
  initialRouteJsKb: 150,
  initialRouteCssKb: 20,
  threeUiChunkKb: 130,
};

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function gzipKb(buf) {
  return gzipSync(buf).length / 1024;
}

function readManifest() {
  const candidates = [
    join(DIST, '.vite', 'manifest.json'),
    join(DIST, 'manifest.json'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
  }
  return null;
}

/**
 * Initial-route assets: scripts/links in index.html plus CSS imported by those
 * entry modules when a Vite manifest is present; otherwise all CSS in dist/assets
 * that is linked from index.html, and JS linked from index.html (not lazy chunks).
 */
export function measureDist(distRoot = DIST) {
  const indexPath = join(distRoot, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error(`missing ${indexPath}; run vite build first`);
  }
  const html = readFileSync(indexPath, 'utf8');
  const jsHrefs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((m) =>
    m[1].replace(/^\//, '')
  );
  const cssHrefs = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/g)].map((m) =>
    m[1].replace(/^\//, '')
  );

  let jsKb = 0;
  for (const rel of jsHrefs) {
    const file = join(distRoot, rel);
    if (existsSync(file)) jsKb += gzipKb(readFileSync(file));
  }

  let cssKb = 0;
  for (const rel of cssHrefs) {
    const file = join(distRoot, rel);
    if (existsSync(file)) cssKb += gzipKb(readFileSync(file));
  }

  // ThreeUI lazy chunk: largest JS whose content mentions EmeraldHorizon
  let threeKb = 0;
  let threeFile = null;
  for (const file of walk(join(distRoot, 'assets'))) {
    if (!file.endsWith('.js')) continue;
    const body = readFileSync(file);
    const text = body.toString('utf8');
    if (/EmeraldHorizon|emerald-horizon|emeraldHorizon/i.test(text)) {
      const kb = gzipKb(body);
      if (kb > threeKb) {
        threeKb = kb;
        threeFile = basename(file);
      }
    }
  }

  return {
    initialRouteJsKb: Number(jsKb.toFixed(2)),
    initialRouteCssKb: Number(cssKb.toFixed(2)),
    threeUiChunkKb: Number(threeKb.toFixed(2)),
    threeUiChunkFile: threeFile,
    jsHrefs,
    cssHrefs,
    manifestPresent: Boolean(readManifest()),
  };
}

export function evaluateBudgets(metrics, budgets = BUDGETS) {
  return [
    {
      id: 'initial-route-js',
      actual: metrics.initialRouteJsKb,
      budget: budgets.initialRouteJsKb,
      pass: metrics.initialRouteJsKb <= budgets.initialRouteJsKb,
      unit: 'kB gzip',
    },
    {
      id: 'initial-route-css',
      actual: metrics.initialRouteCssKb,
      budget: budgets.initialRouteCssKb,
      pass: metrics.initialRouteCssKb <= budgets.initialRouteCssKb,
      unit: 'kB gzip',
    },
    {
      id: 'threeui-chunk',
      actual: metrics.threeUiChunkKb,
      budget: budgets.threeUiChunkKb,
      pass: metrics.threeUiChunkKb <= budgets.threeUiChunkKb,
      unit: 'kB gzip',
      file: metrics.threeUiChunkFile,
    },
  ];
}

function main() {
  const json = process.argv.includes('--json');
  const metrics = measureDist();
  const rows = evaluateBudgets(metrics);
  if (json) {
    console.log(JSON.stringify({ metrics, rows }, null, 2));
  } else {
    for (const row of rows) {
      const mark = row.pass ? 'PASS' : 'FAIL';
      console.log(
        `${mark} ${row.id}: ${row.actual} ${row.unit} (budget ≤ ${row.budget})${
          row.file ? ` [${row.file}]` : ''
        }`
      );
    }
  }
  const failed = rows.some((r) => !r.pass);
  process.exit(failed ? 1 : 0);
}

const isDirect =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirect) main();

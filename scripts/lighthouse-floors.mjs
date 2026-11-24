#!/usr/bin/env node
/**
 * AC-18 / AC-31: Lighthouse 12.x home-route floors (median of 3 runs).
 * Requires a running preview URL as argv[2] (default http://127.0.0.1:4173/).
 *
 * Usage:
 *   node scripts/lighthouse-floors.mjs [url] [--form-factor=mobile|desktop]
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const FLOORS = {
  mobile: {
    performance: 90,
    accessibility: 95,
    'best-practices': 95,
    seo: 95,
    lcpMs: 2500,
    tbtMs: 200,
    cls: 0.05,
  },
  desktop: {
    performance: 95,
    accessibility: 95,
    'best-practices': 95,
    seo: 95,
    lcpMs: 2500,
    tbtMs: 200,
    cls: 0.05,
  },
};

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function runOnce(url, formFactor) {
  const outDir = join(process.cwd(), 'node_modules/.cache/portfolio-lh');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `lh-${formFactor}-${Date.now()}.json`);

  // Use official presets so desktop does not inherit Slow-4G / 4× CPU.
  const preset = formFactor === 'desktop' ? 'desktop' : 'perf';
  const args = [
    'lighthouse',
    url,
    '--quiet',
    '--chrome-flags=--headless --no-sandbox --disable-gpu',
    `--preset=${preset}`,
    `--output=json`,
    `--output-path=${outPath}`,
    '--only-categories=performance,accessibility,best-practices,seo',
  ];
  const res = spawnSync('npx', ['--yes', ...args], {
    encoding: 'utf8',
    cwd: process.cwd(),
    timeout: 180_000,
  });
  if (res.status !== 0) {
    throw new Error(`lighthouse failed: ${res.stderr || res.stdout}`);
  }
  const report = JSON.parse(readFileSync(outPath, 'utf8'));
  const cats = report.categories || {};
  const audits = report.audits || {};
  return {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
    lcpMs: audits['largest-contentful-paint']?.numericValue ?? NaN,
    tbtMs: audits['total-blocking-time']?.numericValue ?? NaN,
    cls: audits['cumulative-layout-shift']?.numericValue ?? NaN,
    lcpElement: audits['largest-contentful-paint-element']?.displayValue || '',
    throttling: report.configSettings?.throttling,
    formFactor: report.configSettings?.formFactor,
  };
}

export function summarizeRuns(runs) {
  return {
    performance: median(runs.map((r) => r.performance)),
    accessibility: median(runs.map((r) => r.accessibility)),
    bestPractices: median(runs.map((r) => r.bestPractices)),
    seo: median(runs.map((r) => r.seo)),
    lcpMs: median(runs.map((r) => r.lcpMs)),
    tbtMs: median(runs.map((r) => r.tbtMs)),
    cls: median(runs.map((r) => r.cls)),
  };
}

export function evaluateFloors(summary, formFactor) {
  const f = FLOORS[formFactor];
  return [
    { id: 'performance', actual: summary.performance, budget: f.performance, pass: summary.performance >= f.performance },
    { id: 'accessibility', actual: summary.accessibility, budget: f.accessibility, pass: summary.accessibility >= f.accessibility },
    { id: 'best-practices', actual: summary.bestPractices, budget: f['best-practices'], pass: summary.bestPractices >= f['best-practices'] },
    { id: 'seo', actual: summary.seo, budget: f.seo, pass: summary.seo >= f.seo },
    { id: 'lcpMs', actual: summary.lcpMs, budget: f.lcpMs, pass: summary.lcpMs <= f.lcpMs },
    { id: 'tbtMs', actual: summary.tbtMs, budget: f.tbtMs, pass: summary.tbtMs <= f.tbtMs },
    { id: 'cls', actual: summary.cls, budget: f.cls, pass: summary.cls <= f.cls },
  ];
}

function main() {
  const url = process.argv[2] && !process.argv[2].startsWith('--')
    ? process.argv[2]
    : 'http://127.0.0.1:4173/';
  const ffArg = process.argv.find((a) => a.startsWith('--form-factor='));
  const formFactor = ffArg ? ffArg.split('=')[1] : 'mobile';
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const once = runOnce(url, formFactor);
    runs.push(once);
    console.log(`run ${i + 1}:`, JSON.stringify(once));
  }
  const summary = summarizeRuns(runs);
  const rows = evaluateFloors(summary, formFactor);
  console.log('median:', JSON.stringify(summary));
  for (const row of rows) {
    console.log(`${row.pass ? 'PASS' : 'FAIL'} ${row.id}: ${row.actual} (budget ${row.id.includes('Ms') || row.id === 'cls' ? '≤' : '≥'} ${row.budget})`);
  }
  const out = join(process.cwd(), 'node_modules/.cache/portfolio-lh', `summary-${formFactor}.json`);
  writeFileSync(out, JSON.stringify({ runs, summary, rows }, null, 2));
  process.exit(rows.some((r) => !r.pass) ? 1 : 0);
}

try {
  const self = join(process.argv[1] || '');
  if (self.endsWith('lighthouse-floors.mjs')) main();
} catch {
  /* imported as library */
}

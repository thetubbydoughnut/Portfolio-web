#!/usr/bin/env node
/**
 * AC-18: Lighthouse floors on every app route (median of 3 runs).
 * Requires a running preview URL base as argv[2] (default http://127.0.0.1:4173).
 *
 * Usage:
 *   node scripts/lighthouse-floors.mjs [baseUrl]
 *   node scripts/lighthouse-floors.mjs [baseUrl] --form-factor=mobile|desktop [--force-prefers-reduced-motion] [--route=/]
 *   node scripts/lighthouse-floors.mjs [baseUrl] --all
 *
 * Floors (Amendment 3 / A3.4 + AC-18 revised):
 *   Performance: mobile effects-on ≥90, desktop effects-on ≥95, fallback ≥95
 *   Accessibility / Best Practices / SEO ≥95 everywhere
 *
 * Lighthouse is invoked via `npx --yes lighthouse@12.6.0` (not a lockfile dep).
 * Effects-on Chrome uses Angle/SwiftShader WebGL; fallback forces prefers-reduced-motion.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const ROUTES = [
  '/',
  '/experience',
  '/skills',
  '/projects',
  '/contact',
  '/certifications',
];

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

/** A3.4 fallback-path Performance floor (mobile and desktop). */
export const FALLBACK_PERFORMANCE = 95;

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function chromeFlagsFor(forceReducedMotion) {
  if (forceReducedMotion) {
    // Fallback path: no GPU effects; reduced motion.
    return [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--force-prefers-reduced-motion',
    ].join(' ');
  }
  // Effects-on: enable WebGL via SwiftShader (lab VMs often lack a real GPU).
  return [
    '--headless=new',
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ].join(' ');
}

/**
 * Probe the live page with Playwright using the same Chrome flags as Lighthouse.
 * Records WebGL, motion budget, and whether hero canvas / GPU route overlay can mount.
 */
export function probeEffects(url, formFactor, { forceReducedMotion = false } = {}) {
  const probeScript = join(process.cwd(), 'scripts/lh-effects-probe.mjs');
  if (!existsSync(probeScript)) {
    return { error: 'missing probe script', url, formFactor, forceReducedMotion };
  }
  const res = spawnSync(
    process.execPath,
    [probeScript, url, formFactor, forceReducedMotion ? 'fallback' : 'effects-on'],
    {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 120_000,
      env: {
        ...process.env,
        CHROME_PATH: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
      },
    }
  );
  if (res.status !== 0) {
    return {
      error: (res.stderr || res.stdout || 'probe failed').slice(0, 500),
      url,
      formFactor,
      forceReducedMotion,
    };
  }
  try {
    return JSON.parse(res.stdout.trim().split('\n').filter(Boolean).pop());
  } catch (err) {
    return { error: String(err), raw: res.stdout?.slice(0, 500) };
  }
}

function runOnce(url, formFactor, { forceReducedMotion = false } = {}) {
  const outDir = join(process.cwd(), 'node_modules/.cache/portfolio-lh');
  mkdirSync(outDir, { recursive: true });
  const tag = forceReducedMotion ? 'fallback' : formFactor;
  const preset = formFactor === 'desktop' ? 'desktop' : 'perf';
  const chromeFlags = chromeFlagsFor(forceReducedMotion);

  // Match main's npx invocation style; pin 12.6.0 outside the lockfile (AC follow-up).
  // Retry transient NO_FCP / chrome flake (lab contention with preview rebuilds).
  const maxAttempts = 3;
  let lastErr = '';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const outPath = join(outDir, `lh-${tag}-${Date.now()}-${attempt}.json`);
    const args = [
      '--yes',
      'lighthouse@12.6.0',
      url,
      '--quiet',
      `--chrome-flags=${chromeFlags}`,
      `--preset=${preset}`,
      `--output=json`,
      `--output-path=${outPath}`,
      '--only-categories=performance,accessibility,best-practices,seo',
    ];
    const res = spawnSync('npx', args, {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 180_000,
      env: {
        ...process.env,
        CHROME_PATH: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
      },
    });
    if (res.status === 0 && existsSync(outPath)) {
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
        screenEmulation: report.configSettings?.screenEmulation,
        lighthouseVersion: report.lighthouseVersion,
        forceReducedMotion,
        chromeFlags,
        url,
      };
    }
    lastErr = res.stderr || res.stdout || 'lighthouse failed';
    const transient = /NO_FCP|not paint any content|ECONNREFUSED|target closed/i.test(
      lastErr
    );
    if (!transient || attempt === maxAttempts) break;
    console.warn(`lighthouse retry ${attempt}/${maxAttempts} for ${url}: ${lastErr.slice(0, 180)}`);
    spawnSync(process.execPath, ['-e', 'Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,2000)'], {
      timeout: 5000,
    });
  }
  throw new Error(`lighthouse failed: ${lastErr}`);
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

export function evaluateFloors(
  summary,
  formFactor,
  { forceReducedMotion = false, route = '/' } = {}
) {
  const f = { ...FLOORS[formFactor] };
  if (forceReducedMotion) {
    f.performance = FALLBACK_PERFORMANCE;
  }
  const rows = [
    { id: 'performance', actual: summary.performance, budget: f.performance, pass: summary.performance >= f.performance },
    { id: 'accessibility', actual: summary.accessibility, budget: f.accessibility, pass: summary.accessibility >= f.accessibility },
    { id: 'best-practices', actual: summary.bestPractices, budget: f['best-practices'], pass: summary.bestPractices >= f['best-practices'] },
    { id: 'seo', actual: summary.seo, budget: f.seo, pass: summary.seo >= f.seo },
  ];
  // A3.4 LCP/TBT/CLS lab budgets are home-route gates; AC-18 every-route gate is categories.
  if (route === '/' || route === '') {
    rows.push(
      { id: 'lcpMs', actual: summary.lcpMs, budget: f.lcpMs, pass: summary.lcpMs <= f.lcpMs },
      { id: 'tbtMs', actual: summary.tbtMs, budget: f.tbtMs, pass: summary.tbtMs <= f.tbtMs },
      { id: 'cls', actual: summary.cls, budget: f.cls, pass: summary.cls <= f.cls }
    );
  }
  return rows;
}

function runSuite(baseUrl, formFactor, forceReducedMotion, routes, evidence) {
  const results = [];
  for (const route of routes) {
    const url = new URL(route, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
    const probe = probeEffects(url, formFactor, { forceReducedMotion });
    evidence.push({ route, formFactor, forceReducedMotion, probe });
    console.log(
      `probe ${route} ${formFactor}${forceReducedMotion ? ' fallback' : ' effects-on'}:`,
      JSON.stringify(probe)
    );

    // Effects-on desktop must actually get the effects-on budget (WebGL + wide viewport).
    if (!forceReducedMotion && formFactor === 'desktop') {
      if (probe.budget !== 'effects-on' || probe.webgl !== true) {
        throw new Error(
          `effects-on desktop probe failed for ${route}: budget=${probe.budget} webgl=${probe.webgl} err=${probe.error || ''}`
        );
      }
      if (route === '/' && !probe.heroCanvasMounted && !probe.heroThreeRequested) {
        throw new Error(
          `effects-on desktop home did not mount ThreeUI/canvas: ${JSON.stringify(probe)}`
        );
      }
    }

    const runs = [];
    for (let i = 0; i < 3; i++) {
      const once = runOnce(url, formFactor, { forceReducedMotion });
      runs.push(once);
      console.log(`run ${i + 1} ${route} ${formFactor}${forceReducedMotion ? ' fallback' : ''}:`, JSON.stringify(once));
    }
    const summary = summarizeRuns(runs);
    const rows = evaluateFloors(summary, formFactor, { forceReducedMotion, route });
    console.log(`median ${route} ${formFactor}${forceReducedMotion ? ' fallback' : ''}:`, JSON.stringify(summary));
    for (const row of rows) {
      console.log(
        `${row.pass ? 'PASS' : 'FAIL'} ${route} ${row.id}: ${row.actual} (budget ${row.id.includes('Ms') || row.id === 'cls' ? '≤' : '≥'} ${row.budget})`
      );
    }
    results.push({ route, formFactor, forceReducedMotion, runs, summary, rows, probe });
  }
  return results;
}

function main() {
  const rawBase =
    process.argv[2] && !process.argv[2].startsWith('--')
      ? process.argv[2]
      : 'http://127.0.0.1:4173';
  const baseUrl = rawBase.replace(/\/$/, '') || 'http://127.0.0.1:4173';
  const ffArg = process.argv.find((a) => a.startsWith('--form-factor='));
  const routeArg = process.argv.find((a) => a.startsWith('--route='));
  const forceReducedMotion = process.argv.includes('--force-prefers-reduced-motion');
  const runAll = process.argv.includes('--all') || (!ffArg && !routeArg);

  const artifactsDir = join(process.cwd(), 'artifacts/lighthouse');
  mkdirSync(artifactsDir, { recursive: true });
  const cacheDir = join(process.cwd(), 'node_modules/.cache/portfolio-lh');
  mkdirSync(cacheDir, { recursive: true });

  const evidence = [];
  let allResults = [];
  if (runAll) {
    for (const formFactor of ['mobile', 'desktop']) {
      for (const fallback of [false, true]) {
        allResults = allResults.concat(
          runSuite(baseUrl, formFactor, fallback, ROUTES, evidence)
        );
      }
    }
  } else {
    const formFactor = ffArg ? ffArg.split('=')[1] : 'mobile';
    const routes = routeArg ? [routeArg.split('=')[1]] : ['/'];
    allResults = runSuite(baseUrl, formFactor, forceReducedMotion, routes, evidence);
  }

  const payload = { baseUrl, results: allResults, evidence };
  const out = join(artifactsDir, `summary-${Date.now()}.json`);
  writeFileSync(out, JSON.stringify(payload, null, 2));
  writeFileSync(join(cacheDir, 'summary-latest.json'), JSON.stringify(payload, null, 2));
  writeFileSync(join(artifactsDir, 'webgl-evidence.json'), JSON.stringify(evidence, null, 2));

  const failed = allResults.some((r) => r.rows.some((row) => !row.pass));
  process.exit(failed ? 1 : 0);
}

try {
  const self = join(process.argv[1] || '');
  if (self.endsWith('lighthouse-floors.mjs')) main();
} catch (err) {
  console.error(err);
  process.exit(1);
}

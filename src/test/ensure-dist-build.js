/**
 * Shared Vite build for tests.
 * Serializes every `vite build` via an exclusive lock so parallel vitest
 * files cannot emptyOutDir a sibling's output mid-read.
 */
import { execSync } from 'child_process';
import {
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  unlinkSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  rmSync,
} from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
export const SHARED_DIST = join(ROOT, 'dist');

const CACHE_DIR = join(ROOT, 'node_modules/.cache/portfolio-test');
const LOCK_PATH = join(CACHE_DIR, 'vite-build.lock');
const READY_PATH = join(CACHE_DIR, 'shared-dist.ready');
const LOCK_STALE_MS = 180_000;
const LOCK_WAIT_MS = 180_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Collect all .js under a dist root (Vite 8 / rolldown: dist/assets/*.js). */
export function collectDistJs(root = SHARED_DIST) {
  const out = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.endsWith('.js')) out.push(full);
    }
  };
  walk(root);
  return out.map((f) => readFileSync(f, 'utf8')).join('\n');
}

function distLooksComplete(root = SHARED_DIST) {
  return (
    existsSync(join(root, 'index.html')) && collectDistJs(root).length > 0
  );
}

function tryAcquireLock() {
  mkdirSync(CACHE_DIR, { recursive: true });
  try {
    return openSync(LOCK_PATH, 'wx');
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    try {
      const age = Date.now() - statSync(LOCK_PATH).mtimeMs;
      if (age > LOCK_STALE_MS) {
        unlinkSync(LOCK_PATH);
        return openSync(LOCK_PATH, 'wx');
      }
    } catch {
      /* race with another waiter — retry */
    }
    return null;
  }
}

async function withViteBuildLock(fn) {
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (Date.now() < deadline) {
    const fd = tryAcquireLock();
    if (fd != null) {
      try {
        return await fn();
      } finally {
        closeSync(fd);
        try {
          unlinkSync(LOCK_PATH);
        } catch {
          /* already gone */
        }
      }
    }
    await sleep(100);
  }
  throw new Error('Timed out waiting for vite build lock');
}

/**
 * One shared production build into dist/. Reused across AC-2 / token suites.
 * Never soft-skips: if the build cannot produce index.html + JS, throws.
 */
export async function ensureSharedDist() {
  return withViteBuildLock(async () => {
    if (distLooksComplete(SHARED_DIST) && existsSync(READY_PATH)) {
      return SHARED_DIST;
    }
    execSync('npx vite build', { stdio: 'pipe', cwd: ROOT });
    if (!distLooksComplete(SHARED_DIST)) {
      throw new Error(
        'vite build finished but dist/index.html or dist JS bundles are missing'
      );
    }
    writeFileSync(READY_PATH, `${Date.now()}\n`);
    return SHARED_DIST;
  });
}

/**
 * Isolated / env-poisoned builds (secrets, skills). Still serialized so they
 * cannot race a shared dist/ emptyOutDir or each other.
 */
export async function runViteBuild({ outDir, env } = {}) {
  if (!outDir) {
    return ensureSharedDist();
  }
  const target = join(ROOT, outDir);
  return withViteBuildLock(async () => {
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
    }
    execSync(`npx vite build --outDir ${outDir}`, {
      stdio: 'pipe',
      cwd: ROOT,
      env: env ? { ...process.env, ...env } : process.env,
    });
    if (!distLooksComplete(target)) {
      throw new Error(
        `vite build --outDir ${outDir} finished but index.html or JS missing`
      );
    }
    return target;
  });
}

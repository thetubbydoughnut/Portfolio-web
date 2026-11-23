import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { projects } from './projects.js';

const PROJECTS_PAGE = join(process.cwd(), 'src/pages/Projects.jsx');
const DIST_DIR = join(process.cwd(), 'dist');

/** Collect all .js under a dist root (Vite 8 / rolldown: dist/assets/*.js). */
function collectJsUnder(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) collectJsUnder(full, out);
    else if (name.endsWith('.js')) out.push(full);
  }
  return out;
}

function readDistJs(root = DIST_DIR) {
  return collectJsUnder(root)
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** When dist/ exists but a parallel vite build emptied assets mid-read, wait briefly. */
async function readDistJsWhenPresent(
  root = DIST_DIR,
  { attempts = 40, delayMs = 50 } = {}
) {
  if (!existsSync(root)) return { present: false, blob: '' };
  for (let i = 0; i < attempts; i++) {
    const blob = readDistJs(root);
    if (blob.length > 0) return { present: true, blob };
    await sleep(delayMs);
  }
  return { present: true, blob: '' };
}

describe('AC-3: curated projects and no client token', () => {
  it('exports exactly the curated projects list', () => {
    expect(Array.isArray(projects)).toBe(true);
    const names = projects.map((p) => p.name);
    expect(names).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Legendary Printed Loot/i),
        expect.stringMatching(/BOLT\s*2\.0/i),
        expect.stringMatching(/SaaP/i),
        expect.stringMatching(/[Pp]ortfolio/),
      ])
    );
    expect(projects.length).toBe(4);
  });

  it('includes LPL homepage https://lpl3d.com', () => {
    const lpl = projects.find((p) => /Legendary Printed Loot/i.test(p.name));
    expect(lpl).toBeTruthy();
    expect(lpl.homepage).toBe('https://lpl3d.com');
  });

  it('lists BOLT 2.0 for Tatco without a fake public repo link', () => {
    const bolt = projects.find((p) => /BOLT\s*2\.0/i.test(p.name));
    expect(bolt).toBeTruthy();
    expect(bolt.description || bolt.summary || '').toMatch(/Tatco/i);
    expect(bolt.html_url || bolt.repoUrl || '').toBeFalsy();
  });

  it('describes SaaP with intake wording only and no metrics', () => {
    const saap = projects.find((p) => /SaaP/i.test(p.name));
    expect(saap).toBeTruthy();
    const text = `${saap.description || ''} ${saap.summary || ''}`;
    expect(text).toMatch(/siteConfig/i);
    expect(text).toMatch(/local service businesses/i);
    expect(text).not.toMatch(/\d+%/);
    expect(text).not.toMatch(/\$[\d,]+/);
  });

  it('has no mock stargazers_count, placeholder images, or school-repo crawl in data/page', () => {
    const projectsSrc = readFileSync(PROJECTS_PAGE, 'utf8');
    const dataBlob = JSON.stringify(projects);
    expect(dataBlob).not.toMatch(/stargazers_count/);
    expect(projectsSrc).not.toMatch(/stargazers_count/);
    expect(projectsSrc).not.toMatch(/via\.placeholder\.com/);
    expect(dataBlob).not.toMatch(/via\.placeholder\.com/);
    expect(projectsSrc).not.toMatch(/api\.github\.com/);
    expect(projectsSrc).not.toMatch(/asylum-hrf|web-sprint-challenge|node-db3-project/i);
  });

  it('contains no Authorization bearer GitHub call or token env usage in Projects.jsx', () => {
    const projectsSrc = readFileSync(PROJECTS_PAGE, 'utf8');
    expect(projectsSrc).not.toMatch(/Authorization.*bearer/i);
    expect(projectsSrc).not.toMatch(/VITE_GITHUB_TOKEN/);
    expect(projectsSrc).not.toMatch(/ghp_/);
    expect(projectsSrc).not.toMatch(/github_pat_/);
    expect(projectsSrc).not.toMatch(/gho_/);
  });

  it('built dist JS has no token patterns when dist exists', async () => {
    const { present, blob: distJs } = await readDistJsWhenPresent();
    if (!present) {
      // Soft skip only when no dist/ at all (fail-before / no sibling build yet)
      return;
    }
    // dist/ exists: must read real Vite 8 bundles and assert (retry covers emptyOutDir race)
    expect(distJs.length, 'dist/ exists but no .js under dist/ after retries').toBeGreaterThan(0);
    expect(distJs).not.toMatch(/VITE_GITHUB_TOKEN/);
    expect(distJs).not.toMatch(/ghp_/);
    expect(distJs).not.toMatch(/github_pat_/);
    expect(distJs).not.toMatch(/gho_/);
    expect(distJs).not.toMatch(/Authorization['"`:\s]*bearer/i);
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { projects } from './projects.js';
import {
  ensureSharedDist,
  collectDistJs,
  SHARED_DIST,
} from '../test/ensure-dist-build.js';

const PROJECTS_PAGE = join(process.cwd(), 'src/pages/Projects.jsx');

function assertNoTokenPatterns(blob, label) {
  expect(blob.length, `${label}: expected JS bundles`).toBeGreaterThan(0);
  expect(blob, label).not.toMatch(/VITE_GITHUB_TOKEN/);
  expect(blob, label).not.toMatch(/ghp_/);
  expect(blob, label).not.toMatch(/github_pat_/);
  expect(blob, label).not.toMatch(/gho_/);
  expect(blob, label).not.toMatch(/Authorization['"`:\s]*bearer/i);
}

describe('AC-3: curated projects and no client token', () => {
  it('exports exactly the curated projects list', () => {
    expect(Array.isArray(projects)).toBe(true);
    const names = projects.map((p) => p.name);
    expect(names[0]).toMatch(/Internal land and asset platform/i);
    expect(names).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Internal land and asset platform/i),
        expect.stringMatching(/Legendary Printed Loot/i),
        expect.stringMatching(/BOLT\s*2\.0/i),
        expect.stringMatching(/SaaP/i),
        expect.stringMatching(/[Pp]ortfolio/),
      ])
    );
    expect(projects.length).toBe(5);
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
    await ensureSharedDist();
    assertNoTokenPatterns(collectDistJs(SHARED_DIST), 'dist');
  }, 120000);
});

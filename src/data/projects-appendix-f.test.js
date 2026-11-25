import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { projects } from './projects.js';

/** Appendix F verbatim object (AC-28). */
const APPENDIX_F = {
  id: 'clr-land-asset-platform',
  name: 'Internal land and asset platform',
  label: 'Professional work at Continental Resources (internal tool, not public)',
  period: 'July 2026 – November 2026',
  description:
    'An enterprise migration of internal land and asset workflows from a legacy low-code platform to a TypeScript monorepo. The work covered well search and overview, role-aware editing with audit metadata, reusable data grids with sorting, filtering, and server-side pagination, Excel import pipelines with column mapping and schema validation, spec-first test-driven development with Playwright end-to-end tests and Vitest integration suites, and multi-replica deploys on Azure.',
  stack: 'React, TypeScript, NestJS, SQL Server, Microsoft Entra ID, Azure, Playwright, Vitest',
  homepage: '',
  html_url: '',
};

const FORBIDDEN = [
  /\bQuorum\b/i,
  /\bSAP\b/,
  /\bJOA\b/,
  /\bzero regressions\b/i,
  /\bhigh-volume\b/i,
  // Construct lost-domain needle so this test file itself is not flagged.
  new RegExp(['pixel', 'perfect', 'dev'].join(''), 'i'),
  /github\.com\/(?!thetubbydoughnut\/Portfolio-web)/i,
];

describe('AC-28: Appendix F CLR projects card', () => {
  it('first entry equals Appendix F word for word', () => {
    const first = projects[0];
    for (const key of Object.keys(APPENDIX_F)) {
      expect(first[key], key).toEqual(APPENDIX_F[key]);
    }
    expect(first.period).toBe('July 2026 – November 2026');
    expect(first.period).not.toMatch(/Present/i);
  });

  it('has no homepage or html_url links', () => {
    expect(projects[0].homepage).toBe('');
    expect(projects[0].html_url).toBe('');
  });

  it('forbidden company terms, metrics, and end-reason clauses are absent', () => {
    const blob = JSON.stringify(projects[0]) + readFileSync(join(process.cwd(), 'src/data/projects.js'), 'utf8');
    for (const re of FORBIDDEN) {
      expect(blob, String(re)).not.toMatch(re);
    }
    // "well" only inside the Appendix F phrase
    const wells = blob.match(/\bwell\b/gi) || [];
    expect(wells.length).toBeGreaterThan(0);
    expect(blob).toMatch(/well search and overview/);
    const stripped = blob.replace(/well search and overview/g, '');
    expect(stripped).not.toMatch(/\bwell\b/i);
    expect(blob).not.toMatch(/engagement ended|contract ended|why.*(ended|left)/i);
  });

  it('list still includes LPL, BOLT, SaaP, and Portfolio after CLR', () => {
    const names = projects.map((p) => p.name);
    expect(names[0]).toBe(APPENDIX_F.name);
    expect(names).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Legendary Printed Loot/i),
        expect.stringMatching(/BOLT\s*2\.0/i),
        expect.stringMatching(/SaaP/i),
        expect.stringMatching(/[Pp]ortfolio/),
      ])
    );
    expect(projects.length).toBe(5);
  });
});

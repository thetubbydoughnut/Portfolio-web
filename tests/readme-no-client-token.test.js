import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

describe('AC-6 / R-3: README has no client GitHub token docs', () => {
  it('README.md does not instruct setting VITE_GITHUB_TOKEN', () => {
    const readmePath = join(ROOT, 'README.md');
    expect(existsSync(readmePath)).toBe(true);
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).not.toMatch(/VITE_GITHUB_TOKEN/);
    expect(readme).not.toMatch(/github_token/i);
    expect(readme).not.toMatch(/your_github_token/i);
  });
});

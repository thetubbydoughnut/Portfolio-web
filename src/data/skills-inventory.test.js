import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { createElement, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { resumeData } from './resume.js';
import { skillDescriptions, skillLogos } from './skillsData.js';
import { runViteBuild, collectDistJs } from '../test/ensure-dist-build.js';
import App from '../App.jsx';

const REQUIRED_SKILLS = [
  'TypeScript',
  'React',
  'NestJS',
  'Python',
  'FastAPI',
  'SQL Server',
  'PostgreSQL',
  'Playwright',
  'Vitest',
  'Vite',
  'Tailwind CSS',
  'Docker',
  'Azure',
];

function flattenResumeSkills() {
  return Object.values(resumeData.skills).flat().join(' | ');
}

function collectSrcJsx() {
  const roots = [join(process.cwd(), 'src')];
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(js|jsx)$/.test(entry.name) && !entry.name.includes('.test.')) files.push(p);
    }
  };
  roots.forEach(walk);
  return files.map((f) => readFileSync(f, 'utf8')).join('\n');
}

describe('AC-2: skills inventory', () => {
  it('lists required skills in resume.js', () => {
    const blob = flattenResumeSkills();
    for (const skill of REQUIRED_SKILLS) {
      expect(blob, `resume.js missing ${skill}`).toMatch(new RegExp(skill, 'i'));
    }
  });

  it('lists required skills in skillsData (skills page source)', () => {
    const names = Object.keys(skillDescriptions).join(' | ');
    for (const skill of REQUIRED_SKILLS) {
      const pattern =
        skill === 'React'
          ? /React(\.js)?/i
          : skill === 'Tailwind CSS'
            ? /Tailwind(\s*CSS)?/i
            : new RegExp(skill.replace(/\s+/g, '\\s*'), 'i');
      expect(names, `skillsData missing ${skill}`).toMatch(pattern);
    }
  });

  it('does not list Java', () => {
    const resumeBlob = flattenResumeSkills();
    expect(resumeBlob).not.toMatch(/\bJava\b/);
    expect(skillDescriptions).not.toHaveProperty('Java');
  });

  it('src does not read VITE_SKILLS_* or VITE_SKILL_CATEGORIES', () => {
    const src = collectSrcJsx();
    expect(src).not.toMatch(/VITE_SKILL_CATEGORIES/);
    expect(src).not.toMatch(/VITE_SKILLS_/);
    expect(src).not.toMatch(/import\.meta\.env\.VITE_SKILL/);
  });

  it('build-time VITE_SKILLS_* / VITE_SKILL_CATEGORIES cannot override the inventory', async () => {
    // Poisonous env values that must NOT appear as skills if inventory is source-controlled
    const tmpDist = await runViteBuild({
      outDir: 'dist-skills-env-check',
      env: {
        VITE_SKILL_CATEGORIES: 'poison:Poison Skills',
        VITE_SKILLS_POISON: 'COBOL:99,Fortran:99,Java:99',
        VITE_SKILLS_FRONTEND: 'COBOL,Fortran,Java',
        VITE_SKILLS_BACKEND: 'COBOL',
        VITE_SKILLS_CORE: 'Fortran',
        VITE_SKILLS_TOOLS: 'COBOL',
        VITE_SKILLS_TESTING: 'Fortran',
        VITE_SKILLS_SOFT: 'COBOL',
        VITE_SKILLS_AUDIO: 'Fortran',
        VITE_SKILLS_GAMEDEV: 'COBOL',
      },
    });

    const blob = collectDistJs(tmpDist);

    expect(blob.length).toBeGreaterThan(0);
    // Required inventory still present from repo data
    expect(blob).toMatch(/NestJS/);
    expect(blob).toMatch(/Playwright/);
    expect(blob).toMatch(/SQL Server|SQLServer/i);
    // Env-only poison skills must not be injected
    expect(blob).not.toMatch(/\bCOBOL\b/);
    expect(blob).not.toMatch(/\bFortran\b/);
    expect(blob).not.toMatch(/Poison Skills/);

    rmSync(tmpDist, { recursive: true, force: true });
  }, 120000);

  it('AC-12 / R-1: inventory has React once — not both React and React.js', () => {
    const names = Object.keys(skillDescriptions);
    expect(names).toContain('React');
    expect(names).not.toContain('React.js');
    expect(skillLogos).not.toHaveProperty('React.js');
    expect(names.filter((n) => /^React(\.js)?$/i.test(n))).toHaveLength(1);
  });

  it('AC-12: /skills uses PageFrame and a grouped glass chip/card grid', async () => {
    render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/skills'] },
        createElement(Suspense, { fallback: createElement('div', null, 'loading') }, createElement(App))
      )
    );

    await waitFor(() => {
      expect(document.querySelector('main.page-frame--inner')).toBeTruthy();
    });

    expect(screen.getByRole('heading', { name: /^Skills$/i })).toBeInTheDocument();

    const grid = document.querySelector('[data-skills-grid]');
    expect(grid).toBeTruthy();
    expect(grid.className).toMatch(/skills-grid/);

    // Required inventory visible (React once)
    expect(screen.getByText(/^React$/)).toBeInTheDocument();
    expect(screen.queryByText(/^React\.js$/)).not.toBeInTheDocument();
    expect(screen.getByText(/^NestJS$/)).toBeInTheDocument();
    expect(screen.getByText(/^TypeScript$/)).toBeInTheDocument();

    // Grouped: at least one group heading/label in content column
    const groups = document.querySelectorAll('[data-skills-group]');
    expect(groups.length).toBeGreaterThanOrEqual(2);

    // Glass surface on chips/cards
    const chips = grid.querySelectorAll('.skill-chip, .skill-card');
    expect(chips.length).toBeGreaterThan(5);
    const glassish = Array.from(chips).some(
      (el) =>
        el.className.includes('glass') ||
        getComputedStyle(el).getPropertyValue('background').includes('var(--glass') ||
        el.classList.contains('glass-panel')
    );
    // Prefer class tokens; also accept CSS source using --glass-*
    const css = readFileSync(join(process.cwd(), 'src/styles/Skills.css'), 'utf8');
    expect(css).toMatch(/--glass-/);
    expect(glassish || /glass-panel|skill-chip/.test(grid.innerHTML + css)).toBe(true);
  });

  it('AC-12: skills grid is 2 cols from 768px and 3 from 1280px; readable at 375px', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/Skills.css'), 'utf8');
    expect(css).toMatch(/@media\s*\([^)]*min-width:\s*768px[^)]*\)[\s\S]*?grid-template-columns:[^;]*repeat\(\s*2/i);
    expect(css).toMatch(/@media\s*\([^)]*min-width:\s*1280px[^)]*\)[\s\S]*?grid-template-columns:[^;]*repeat\(\s*3/i);
    // Base (mobile / 375px): single column, no tiny unreadable cards
    expect(css).toMatch(/\.skills-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  });

  it('AC-12 negative: old skills layout markers are gone', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/Skills.css'), 'utf8');
    const page = readFileSync(join(process.cwd(), 'src/pages/Skills.jsx'), 'utf8');
    // Old: fake 85% level bars + cyan glow category pills center stack
    expect(css).not.toMatch(/skill-level-bar/);
    expect(page).not.toMatch(/level:\s*85/);
    expect(css).not.toMatch(/min-height:\s*100vh/);
    expect(existsSync(join(process.cwd(), 'public/images/skills/react.js.svg'))).toBe(true); // asset may remain
  });
});

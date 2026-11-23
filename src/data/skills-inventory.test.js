import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { resumeData } from './resume.js';
import { skillDescriptions } from './skillsData.js';

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

  it('build-time VITE_SKILLS_* / VITE_SKILL_CATEGORIES cannot override the inventory', () => {
    const tmpDist = join(process.cwd(), 'dist-skills-env-check');
    if (existsSync(tmpDist)) rmSync(tmpDist, { recursive: true, force: true });

    // Poisonous env values that must NOT appear as skills if inventory is source-controlled
    execSync('npx vite build --outDir dist-skills-env-check', {
      stdio: 'pipe',
      env: {
        ...process.env,
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

    const assets = join(tmpDist, 'assets');
    const blob = readdirSync(assets)
      .filter((f) => f.endsWith('.js'))
      .map((f) => readFileSync(join(assets, f), 'utf8'))
      .join('\n');

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
});

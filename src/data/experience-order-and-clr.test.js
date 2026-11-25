import { describe, it, expect } from 'vitest';
import { resumeData } from './resume.js';

describe('AC-1: experience order and Continental Resources', () => {
  it('lists Continental Resources first as Software Engineer in Oklahoma City, OK', () => {
    expect(resumeData.experience.length).toBeGreaterThan(0);
    const first = resumeData.experience[0];
    expect(first.company).toMatch(/Continental Resources/i);
    expect(first.role).toMatch(/Software Engineer/i);
    expect(first.location).toMatch(/Oklahoma City,\s*OK/i);
  });

  it('uses July 2026 – November 2026 for CLR (not Present, not December 31, 2026)', () => {
    const clr = resumeData.experience[0];
    expect(clr.period).toMatch(/July\s+2026/i);
    expect(clr.period).toMatch(/November\s+2026/i);
    expect(clr.period).not.toMatch(/Present/i);
    expect(clr.period).not.toMatch(/December\s*31,?\s*2026/i);

    const clrBlob = JSON.stringify(clr);
    expect(clrBlob).not.toMatch(/Present/i);
    expect(clrBlob).not.toMatch(/December\s*31,?\s*2026/i);
  });

  it('covers TS/NestJS monorepo modernization, Excel ingestion, and Playwright/Vitest', () => {
    const bullets = resumeData.experience[0].description.join(' ');
    expect(bullets).toMatch(/TypeScript/i);
    expect(bullets).toMatch(/NestJS/i);
    expect(bullets).toMatch(/monorepo/i);
    expect(bullets).toMatch(/Excel/i);
    expect(bullets).toMatch(/Playwright/i);
    expect(bullets).toMatch(/Vitest/i);
  });

  it('does not place any later role above CLR', () => {
    const companies = resumeData.experience.map((job) => job.company);
    expect(companies[0]).toMatch(/Continental Resources/i);
    const clrIndex = companies.findIndex((c) => /Continental Resources/i.test(c));
    expect(clrIndex).toBe(0);
  });

  it('does not invent CLR clients, revenue, or headcount', () => {
    const clrBlob = JSON.stringify(resumeData.experience[0]).toLowerCase();
    expect(clrBlob).not.toMatch(/\$[\d,]+/);
    expect(clrBlob).not.toMatch(/revenue/);
    expect(clrBlob).not.toMatch(/headcount/);
    expect(clrBlob).not.toMatch(/\d+\s*(employees|engineers|clients)/);
  });

  it('AC-11: stored order is CLR → Legendary Printed Loot → Tatco → American Dog Society', () => {
    const companies = resumeData.experience.map((job) => job.company);
    expect(companies).toEqual([
      'Continental Resources',
      'Legendary Printed Loot',
      'Tatco Construction',
      'American Dog Society',
    ]);
  });

  it('AC-11: every experience entry has role, period, stack, and bullets', () => {
    for (const job of resumeData.experience) {
      expect(job.role?.length).toBeGreaterThan(0);
      expect(job.period?.length).toBeGreaterThan(0);
      expect(job.stack?.length, `${job.company} missing stack`).toBeGreaterThan(0);
      expect(Array.isArray(job.description)).toBe(true);
      expect(job.description.length).toBeGreaterThan(0);
    }
    const clr = resumeData.experience[0];
    expect(clr.period).toBe('July 2026 – November 2026');
    expect(clr.period).not.toMatch(/Present/i);
  });
});

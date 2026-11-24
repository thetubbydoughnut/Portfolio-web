import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = join(process.cwd(), 'refs/amend-2');
const SOURCE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];

function findAmend2ProfileSource(): string | null {
  if (!existsSync(SOURCE_DIR)) return null;
  const files = readdirSync(SOURCE_DIR);
  const hit = files.find((f) => {
    const lower = f.toLowerCase();
    return (
      lower.startsWith('cameron-profile.') &&
      SOURCE_EXTS.some((ext) => lower.endsWith(ext))
    );
  });
  return hit ? join(SOURCE_DIR, hit) : null;
}

const sourcePresent = Boolean(findAmend2ProfileSource());

describe('AC-27: profile photo slot', () => {
  it('ships display-sized hero webp (≤960×1280, 3:4) and 96×96 header webp', async () => {
    const heroPath = join(process.cwd(), 'src/assets/images/cameron-profile.webp');
    const headerPath = join(process.cwd(), 'src/assets/images/cameron-profile-header.webp');
    expect(existsSync(heroPath)).toBe(true);
    expect(existsSync(headerPath)).toBe(true);

    const hero = await sharp(heroPath).metadata();
    expect(hero.width).toBeLessThanOrEqual(960);
    expect(hero.height).toBeLessThanOrEqual(1280);
    if (hero.width && hero.height) {
      expect(hero.width / hero.height).toBeCloseTo(3 / 4, 2);
    }

    const header = await sharp(headerPath).metadata();
    expect(header.width).toBe(96);
    expect(header.height).toBe(96);
  });

  describe.runIf(sourcePresent)('when refs/amend-2/cameron-profile.* is present', () => {
    it('source file exists at the amend-2 slot', () => {
      expect(findAmend2ProfileSource()).toBeTruthy();
    });
  });

  describe.runIf(!sourcePresent)('pending until source file arrives', () => {
    it.todo('replace hero/header webps from refs/amend-2/cameron-profile.* when delivered');
  });
});

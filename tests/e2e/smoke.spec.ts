import { test, expect } from '@playwright/test';

/**
 * AC-29: one smoke e2e of an existing behavior (home name + resume CTA).
 */
test('home shows Cameron Graham and the resume CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Cameron Graham/i })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Download resume|Resume/i }).first()
  ).toBeVisible();
});

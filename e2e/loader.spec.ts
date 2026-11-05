import { expect, test } from '@playwright/test';

test('the day pie shows on the first load of a visit, then gives way to the list', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#loader')).toBeAttached();
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 2_000 });
  await expect(page.getByRole('textbox', { name: 'Add a task' })).toBeVisible();
});

test('a later load in the same visit skips it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 2_000 });
  await page.reload();
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 150 });
});

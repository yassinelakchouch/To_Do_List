import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

const field = (page: Page) => page.getByRole('textbox', { name: 'Add a task' });
const chip = (page: Page) => page.locator('#header .chain');

test('two ticks within 90 s show ×2 and pay double; 90 quiet seconds take the chip away', async ({ page }) => {
  await page.clock.install();
  await returning(page);
  for (const text of ['One', 'Two', 'Three']) {
    await field(page).fill(text);
    await field(page).press('Enter');
  }
  await page.getByRole('button', { name: 'Mark done: One' }).click();
  await expect(chip(page)).toHaveCount(0);
  await page.clock.fastForward(30_000);
  await page.getByRole('button', { name: 'Mark done: Two' }).click();
  await expect(chip(page)).toHaveText('×2');
  await expect(page.locator('.task-row[data-id]').filter({ hasText: 'Two' }).locator('.gain')).toHaveText(/\+20/);
  await page.clock.fastForward(60_000);
  await expect(chip(page)).toHaveText('×2');
  await page.clock.fastForward(31_000);
  await expect(chip(page)).toHaveCount(0);
  await expect(page.getByLabel('30 sparks', { exact: true })).toBeVisible();
});

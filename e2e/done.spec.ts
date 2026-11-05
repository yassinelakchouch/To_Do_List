import { expect, test } from '@playwright/test';
import { returning } from './helpers';

test('Done lists finished tasks under their day with what they earned, and a ring reopens one with Undo', async ({ page }) => {
  await returning(page);
  const field = page.getByRole('textbox', { name: 'Add a task' });
  for (const text of ['Fix the header roll', 'Buy stamps']) {
    await field.fill(text);
    await field.press('Enter');
  }
  await page.getByRole('button', { name: 'Mark done: Fix the header roll' }).click();
  await page.goto('/#/done');
  const list = page.getByRole('list', { name: 'Done' });
  await expect(list).toContainText('Today · ✦ 10');
  await expect(list.locator('.task-row')).toHaveCount(1);
  await expect(list).not.toContainText('Buy stamps');
  await list.getByRole('button', { name: 'Mark not done: Fix the header roll' }).click();
  await expect(page.getByText('Nothing finished yet')).toBeVisible();
  await page.keyboard.press('z');
  await expect(list.locator('.task-row')).toHaveCount(1);
});

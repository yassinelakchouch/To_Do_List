import { expect, test } from '@playwright/test';
import { firstVisit, returning } from './helpers';

test('a first visit asks your name, shows how it works, sets your day and adds samples', async ({ page }) => {
  await firstVisit(page);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('What should we call you?');
  await expect(page.getByRole('textbox', { name: 'Your name' })).toBeFocused();
  await page.keyboard.type('Yassine');
  await page.keyboard.press('Enter');
  await expect(dialog).toContainText('How it works, Yassine');
  await expect(dialog.getByRole('img', { name: /sized L with Tab/ })).toBeVisible();
  await dialog.getByRole('button', { name: 'Next ↵' }).click();
  await dialog.getByRole('button', { name: '3' }).click();
  await expect(dialog.getByRole('button', { name: '3' })).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('button', { name: 'Try with 5 sample tasks' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.task-row')).toHaveCount(5);
  await expect(page.getByText('0/3 today')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Yassine. Five sample tasks are in Today.');
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Esc skips it, and it never comes back', async ({ page }) => {
  await firstVisit(page);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Add a task' })).toBeFocused();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('a returning visitor goes straight to the list', async ({ page }) => {
  await returning(page, 'Yassine');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Add a task' })).toBeVisible();
});

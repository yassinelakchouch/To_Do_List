import { expect, test } from '@playwright/test';
import { returning } from './helpers';

const open = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: 'Settings' }).click();
  return page.getByRole('dialog', { name: 'Settings' });
};

test.beforeEach(async ({ page }) => {
  await returning(page, 'Yassine');
});

test('changes your name and the day’s goal, switches sound off, and Esc closes', async ({ page }) => {
  const sheet = await open(page);
  await sheet.getByRole('textbox', { name: 'Your name' }).fill('Yas');
  await sheet.getByRole('textbox', { name: 'Your name' }).press('Tab');
  await sheet.getByRole('group', { name: 'Day’s goal' }).getByRole('button', { name: '3' }).click();
  await sheet.getByRole('group', { name: 'Sound' }).getByRole('button', { name: 'Off' }).click();
  await expect(sheet.getByRole('group', { name: 'Sound' }).getByRole('button', { name: 'Off' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('0/3 today')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused();
  await page.reload();
  await expect(page.getByText('0/3 today')).toBeVisible();
});

test('Reset waits for RESET, then starts over with onboarding', async ({ page }) => {
  const field = page.getByRole('textbox', { name: 'Add a task' });
  await field.fill('Something to lose');
  await field.press('Enter');
  const sheet = await open(page);
  const reset = sheet.getByRole('button', { name: 'Reset' });
  await expect(reset).toBeDisabled();
  await sheet.getByRole('textbox', { name: /type RESET/ }).fill('RESET');
  await expect(reset).toBeEnabled();
  await reset.click();
  await expect(page.getByRole('dialog')).toContainText('What should we call you?');
  await page.keyboard.press('Escape');
  await expect(page.locator('.task-row')).toHaveCount(0);
});

test('Export hands over a JSON file of your data', async ({ page }) => {
  const sheet = await open(page);
  const download = page.waitForEvent('download');
  await sheet.getByRole('button', { name: 'Export JSON' }).click();
  expect((await download).suggestedFilename()).toMatch(/^todo-project003-\d{4}-\d{2}-\d{2}\.json$/);
});

test('Replay opens the how-to again', async ({ page }) => {
  const sheet = await open(page);
  await sheet.getByRole('button', { name: 'Replay' }).click();
  await expect(page.getByRole('dialog')).toContainText('How it works, Yassine');
});

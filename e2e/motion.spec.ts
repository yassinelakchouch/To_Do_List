import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

const sparks = (page: Page) => page.locator('[data-count="sparks"]');

async function addOne(page: Page) {
  const field = page.getByRole('textbox', { name: 'Add a task' });
  await field.fill('Water the plants');
  await field.press('Tab');
  await field.press('Enter');
}

test('a tick flies +20 to the spark pill, then the count rolls up to it', async ({ page }) => {
  await returning(page);
  await addOne(page);
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect(page.locator('.spark-flight')).toHaveText('+20');
  await expect(sparks(page)).toHaveText('0');
  await expect(page.locator('.spark-flight')).toHaveCount(0);
  await expect(sparks(page)).toHaveText('20');
  await expect(page.getByLabel('20 sparks', { exact: true })).toBeVisible();
});

test('with Motion off, nothing flies and the count changes at once', async ({ page }) => {
  await returning(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('group', { name: 'Motion' }).getByRole('button', { name: 'Off' }).click();
  await page.getByRole('button', { name: 'Close · Esc' }).click();
  await addOne(page);
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect(sparks(page)).toHaveText('20');
  await expect(page.locator('.spark-flight')).toHaveCount(0);
});

test('a reduced-motion system gets the still version too', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await returning(page);
  await addOne(page);
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect(sparks(page)).toHaveText('20');
  await expect(page.locator('.spark-flight')).toHaveCount(0);
});

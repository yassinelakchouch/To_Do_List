import { expect, test } from '@playwright/test';
import { returning } from './helpers';

test.beforeEach(async ({ page }) => {
  await returning(page);
  await page.goto('/#/rewards');
});

test('the shelf lists the suggested rewards with what each still needs', async ({ page }) => {
  const shelf = page.getByRole('list', { name: 'Rewards you set' });
  await expect(shelf.locator('.reward-card')).toHaveCount(3);
  await expect(shelf.locator('[data-reward="coffee"]')).toContainText('60 to go');
});

test('adds a reward with a name, a stepped price and an icon', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add a reward' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('A swim at the beach');
  await page.getByRole('button', { name: 'Raise the price' }).click();
  await page.getByRole('button', { name: 'Raise the price' }).click();
  await page.getByRole('button', { name: 'Book' }).click();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('A swim at the beach');
  await page.getByRole('button', { name: 'Save' }).click();
  const card = page.locator('.reward-card', { hasText: 'A swim at the beach' });
  await expect(card).toContainText('80');
  await expect(page.getByRole('status')).toContainText('Added · A swim at the beach');
});

test('edits a price, deletes a reward, and Z brings it back', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit A walk by the sea' }).click();
  await page.getByRole('button', { name: 'Lower the price' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('[data-reward="walk"]')).toContainText('110');
  await page.getByRole('button', { name: 'Edit A walk by the sea' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('[data-reward="walk"]')).toHaveCount(0);
  await page.keyboard.press('z');
  await expect(page.locator('[data-reward="walk"]')).toHaveCount(1);
});

test('Esc closes the editor without saving', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add a reward' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('Never mind');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-reward-form]')).toHaveCount(0);
  await expect(page.locator('.reward-card', { hasText: 'Never mind' })).toHaveCount(0);
});

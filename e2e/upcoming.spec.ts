import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

const field = (page: Page) => page.getByRole('textbox', { name: 'Add a task' });
const upcoming = (page: Page) => page.getByRole('list', { name: 'Upcoming' });

test.beforeEach(async ({ page }) => {
  await returning(page);
});

test('adds for tomorrow, and the detail changes size, label and day; Move to Today with Undo', async ({ page }) => {
  await page.goto('/#/upcoming');
  await field(page).fill('Send the invoice');
  await field(page).press('Enter');
  await expect(upcoming(page)).toContainText('Tomorrow');
  await expect(field(page)).toBeFocused();
  await upcoming(page).getByText('Send the invoice').click();
  const detail = page.locator('.task-detail').locator('visible=true');
  await detail.getByRole('button', { name: 'Size L, pays 30' }).click();
  await detail.getByRole('button', { name: 'Health' }).click();
  await expect(upcoming(page).locator('[title="Effort L"]')).toBeVisible();
  await expect(page.locator('.task-detail').locator('visible=true').getByRole('button', { name: 'Health' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.task-detail').locator('visible=true').getByRole('button', { name: 'Move to Today M' }).click();
  await expect(page.getByText('Nothing planned ahead')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Moved to Today · Send the invoice');
  await page.keyboard.press('z');
  await expect(upcoming(page)).toContainText('Send the invoice');
});

test('D on Today plans a task for tomorrow; M on Upcoming brings it back', async ({ page }) => {
  await field(page).fill('Renew the domain');
  await field(page).press('Enter');
  await field(page).press('Escape');
  await page.keyboard.press('k');
  await page.keyboard.press('d');
  await expect(page.locator('.task-row')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Moved to tomorrow · Renew the domain');
  await page.goto('/#/upcoming');
  await expect(upcoming(page)).toContainText('Renew the domain');
  await page.keyboard.press('j');
  await page.keyboard.press('m');
  await expect(page.getByText('Nothing planned ahead')).toBeVisible();
  await page.goto('/#/today');
  await expect(page.locator('.task-row')).toContainText(['Renew the domain']);
});

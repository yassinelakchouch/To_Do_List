import { expect, test, type Page } from '@playwright/test';

const field = (page: Page) => page.getByRole('textbox', { name: 'Add a task' });
const rows = (page: Page) => page.locator('.task-row');
const addTask = async (page: Page, text: string) => {
  await field(page).fill(text);
  await field(page).press('Enter');
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('adds with Enter, answers an empty Enter under the field, and keeps the field ready', async ({ page }) => {
  await field(page).press('Enter');
  await expect(page.getByRole('alert')).toHaveText(/Write a few words first; nothing was added\./);
  await expect(rows(page)).toHaveCount(0);
  await addTask(page, 'Buy coffee beans');
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText('Buy coffee beans');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(field(page)).toHaveValue('');
  await expect(field(page)).toBeFocused();
});

test('Tab sizes a task while typing: S, then M, then L', async ({ page }) => {
  await field(page).fill('Write the case study');
  await field(page).press('Tab');
  await field(page).press('Tab');
  await expect(page.locator('#composer-message')).toContainText('L · pays 30');
  await field(page).press('Enter');
  await expect(rows(page).first().locator('[title="Effort L"]')).toBeVisible();
});

test('ticking earns sparks, shows a toast, and Z puts it back', async ({ page }) => {
  await addTask(page, 'Record the RPS demo');
  await page.getByRole('button', { name: 'Mark done: Record the RPS demo' }).click();
  await expect(page.getByRole('button', { name: 'Mark not done: Record the RPS demo' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('10 sparks')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Done · Record the RPS demo');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('z');
  await expect(page.getByRole('button', { name: 'Mark done: Record the RPS demo' })).toBeVisible();
  await expect(page.getByLabel('0 sparks')).toBeVisible();
});

test('the keyboard alone: C, J/K, X, Backspace and Z', async ({ page }) => {
  await page.keyboard.press('c');
  await expect(field(page)).toBeFocused();
  await field(page).fill('One');
  await field(page).press('Enter');
  await field(page).fill('Two');
  await field(page).press('Enter');
  await field(page).press('Escape');
  await page.keyboard.press('k');
  await expect(rows(page).first()).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('x');
  await expect(rows(page).first().getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('j');
  await page.keyboard.press('Backspace');
  await expect(rows(page)).toHaveCount(1);
  await expect(page.getByRole('status')).toContainText('Deleted · Two');
  await page.keyboard.press('z');
  await expect(rows(page)).toHaveCount(2);
});

test('the list survives a reload', async ({ page }) => {
  await addTask(page, 'Call the bank before 5');
  await page.reload();
  await expect(rows(page)).toContainText(['Call the bank before 5']);
});

test('typed text is shown as text, never run as markup', async ({ page }) => {
  await addTask(page, '<img src=x onerror="document.title=1">');
  await expect(rows(page).first()).toContainText('<img src=x');
  await expect(page).toHaveTitle('To do, done · todo-project003');
});

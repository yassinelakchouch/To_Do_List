import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

const field = (page: Page) => page.getByRole('textbox', { name: 'Add a task' });
const rows = (page: Page) => page.locator('.task-row');
const addTask = async (page: Page, text: string) => {
  await field(page).fill(text);
  await field(page).press('Enter');
};

test.beforeEach(async ({ page }) => {
  await returning(page);
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
  await expect(page.getByLabel('10 sparks', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Done · Record the RPS demo');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('z');
  await expect(page.getByRole('button', { name: 'Mark done: Record the RPS demo' })).toBeVisible();
  await expect(page.getByLabel('0 sparks', { exact: true })).toBeVisible();
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

test('redeeming a reward spends sparks, stamps the card, and Z gives them back', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the inspector is the computer layout; phones get Rewards as a tab');
  // The reward shelf shows once the morning check-in is done or skipped.
  await page.getByRole('button', { name: 'Skip for today · Esc' }).locator('visible=true').click();
  for (const text of ['Write the case study', 'Ship the release']) {
    await field(page).fill(text);
    await field(page).press('Tab');
    await field(page).press('Tab');
    await field(page).press('Enter');
  }
  await page.getByRole('button', { name: 'Mark done: Write the case study' }).click();
  await page.getByRole('button', { name: 'Mark done: Ship the release' }).click();
  await expect(page.getByLabel('90 sparks', { exact: true })).toBeVisible();
  const panel = page.getByRole('complementary', { name: 'Your progress' });
  await panel.getByRole('button', { name: 'Redeem Coffee at Bloom for 60 sparks' }).click();
  await expect(panel.locator('[data-reward="coffee"]')).toContainText('enjoyed · today');
  await expect(page.getByLabel('30 sparks', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Coffee at Bloom · enjoy it');
  await page.keyboard.press('z');
  await expect(page.getByLabel('90 sparks', { exact: true })).toBeVisible();
});

test('on a phone the week’s challenge sits under the list', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phones only');
  await addTask(page, 'Buy coffee beans');
  await expect(page.locator('#challenge-below .challenge-card')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Your progress' })).toBeHidden();
});

import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

const card = (page: Page) => page.getByRole('region', { name: 'Morning check-in' }).locator('visible=true');

test.beforeEach(async ({ page }) => {
  await returning(page);
});

test('a mood arms I’m ready, which earns 15 XP once and leaves for the day', async ({ page }) => {
  const ready = card(page).getByRole('button', { name: /I’m ready/ });
  await expect(ready).toBeDisabled();
  await card(page).getByRole('button', { name: 'great' }).click();
  await expect(card(page).getByRole('button', { name: 'great' })).toHaveAttribute('aria-pressed', 'true');
  await card(page).getByRole('textbox', { name: 'In the way' }).fill('slow wifi');
  await ready.click();
  await expect(page.getByRole('status')).toContainText('Checked in · +15 XP');
  await expect(page.getByRole('region', { name: 'Morning check-in' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('region', { name: 'Morning check-in' })).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('todo-project003') ?? '{}'));
  expect(saved.state.checkIns[0]).toMatchObject({ mood: 'sun', blocker: 'slow wifi' });
});

test('Esc skips it until tomorrow', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a keyboard flow');
  await expect(card(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region', { name: 'Morning check-in' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('region', { name: 'Morning check-in' })).toHaveCount(0);
});

test('switched off in Settings, it does not show', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('group', { name: 'Morning check-in' }).getByRole('button', { name: 'Off' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region', { name: 'Morning check-in' })).toHaveCount(0);
});

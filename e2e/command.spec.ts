import { expect, test } from '@playwright/test';
import { returning } from './helpers';

test('⌘K lists every action, filters as you type, and Enter runs the active one', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a keyboard menu');
  await returning(page);
  await page.keyboard.press('Control+k');
  const menu = page.getByRole('dialog', { name: 'Command menu' });
  await expect(menu.getByRole('option')).toHaveCount(11);
  await page.keyboard.type('go car');
  await expect(menu.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(menu).toHaveCount(0);
  await expect(page).toHaveURL(/#\/career$/);
});

test('arrows move the choice, Esc closes, and Add a task focuses the field on Today', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a keyboard menu');
  await returning(page);
  await page.goto('/#/done');
  await page.keyboard.press('Control+k');
  const menu = page.getByRole('dialog', { name: 'Command menu' });
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('option', { name: /Go to Today/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await page.keyboard.press('Control+k');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/today$/);
  await expect(page.getByRole('textbox', { name: 'Add a task' })).toBeFocused();
});

import { expect, test } from '@playwright/test';
import { returning } from './helpers';

test('? opens the keys sheet and Esc closes it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a keyboard sheet');
  await returning(page);
  await page.keyboard.press('Shift+?');
  const sheet = page.getByRole('dialog', { name: 'Keys' });
  await expect(sheet).toContainText('Plan for tomorrow (Today)');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
});

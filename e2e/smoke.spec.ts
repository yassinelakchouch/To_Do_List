import { expect, test } from '@playwright/test';

test('the page names itself and keeps the 2022 version one link away', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('To do, done · todo-project003');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('To do, done');
  await page.getByRole('link', { name: 'Open the 2022 version' }).click();
  await expect(page).toHaveTitle('toDoApp');
  // The 2022 script binds Enter at the end of the body, after jQuery loads from its CDN.
  await page.waitForLoadState('load');
  await page.locator('input').fill('Buy coffee beans');
  await page.keyboard.press('Enter');
  await expect(page.locator('.newElement')).toHaveText(/Buy coffee beans/);
});

test('on a phone nothing scrolls sideways', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

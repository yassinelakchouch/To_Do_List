import { expect, test } from '@playwright/test';

test('the page names itself and keeps the 2022 version one link away', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('To do, done · todo-project003');
  await page.getByRole('link', { name: 'Open the 2022 version' }).click();
  await expect(page).toHaveTitle('toDoApp');
  // The 2022 script binds Enter at the end of the body, after jQuery loads from its CDN.
  await page.waitForLoadState('load');
  await page.locator('input').fill('Buy coffee beans');
  await page.keyboard.press('Enter');
  await expect(page.locator('.newElement')).toHaveText(/Buy coffee beans/);
});

test('the shell marks the current page and moves between pages', async ({ page, isMobile }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Pages' }).locator('visible=true');
  await expect(nav.getByRole('link', { name: /Today/ })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: /Career/ }).click();
  await expect(page).toHaveURL(/#\/career$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Career');
  await expect(nav.getByRole('link', { name: /Career/ })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByLabel('0 sparks')).toBeVisible();
  if (isMobile) await expect(page.locator('.tab-bar')).toBeVisible();
  else await expect(page.locator('.sidebar')).toContainText('Rookie · 0 / 1,000 XP');
});

test('on a phone nothing scrolls sideways', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

import { expect, test } from '@playwright/test';

test('the task field shows focus once, on its border, with no box inside', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('c');
  await page.keyboard.type('hello');
  await expect(page.locator('#composer')).toHaveCSS('outline-style', 'none');
  await expect(page.locator('[data-composer] label')).toHaveCSS('border-top-color', 'rgb(236, 232, 225)');
});

test('other controls keep the cream focus outline from the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard focus');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus-visible')).toHaveCSS('outline-style', 'solid');
});

test('scrollbars are thin and dark, not the browser’s light default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'thin');
  await expect(page.locator('html')).toHaveCSS('scrollbar-color', 'rgb(42, 45, 48) rgba(0, 0, 0, 0)');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});

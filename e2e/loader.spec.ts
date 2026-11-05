import { expect, test } from '@playwright/test';
import { firstVisit } from './helpers';

test('the day pie shows on the first load of a visit, then gives way to the list', async ({ page }) => {
  await firstVisit(page);
  await expect(page.locator('#loader')).toBeAttached();
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 3_500 });
  await expect(page.getByRole('dialog')).toBeVisible();
});

test("the loader keeps board T-07's proportions and says what it is loading", async ({ page }) => {
  await firstVisit(page);
  const { width, height } = page.viewportSize()!;
  const u = Math.min(width / 720, height / 420);
  const drawn = await page.evaluate(() => ({
    pie: document.querySelector('#loader svg')!.getBoundingClientRect().width,
    title: parseFloat(getComputedStyle(document.querySelector('.loader-title')!).fontSize),
    sub: parseFloat(getComputedStyle(document.querySelector('.loader-sub')!).fontSize),
  }));
  expect(drawn.pie).toBeCloseTo(Math.max(48, 64 * u), 0);
  expect(drawn.title).toBeCloseTo(Math.max(24, 30 * u), 0);
  expect(drawn.sub).toBeCloseTo(Math.max(12, 12 * u), 0);
  await expect(page.locator('#loader')).toContainText('loading your list');
});

test('the loader leaves as its animation ends, even when the app starts late', async ({ page }) => {
  await page.route((url) => url.pathname === '/src/main.ts', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.continue();
  });
  await firstVisit(page);
  await page.waitForFunction(() => {
    const loader = document.getElementById('loader');
    return !loader || loader.getAnimations({ subtree: true }).every((animation) => animation.playState === 'finished');
  });
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 500 });
});

test('with motion off in the system the loader never shows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await firstVisit(page);
  const painted = await page.evaluate(() => {
    const loader = document.getElementById('loader');
    return !!loader && getComputedStyle(loader).display !== 'none';
  });
  expect(painted).toBe(false);
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 500 });
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('a later load in the same visit skips it', async ({ page }) => {
  await firstVisit(page);
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 3_500 });
  await page.reload();
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 150 });
});

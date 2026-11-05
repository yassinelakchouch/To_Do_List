import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';
import { dayKey } from '../src/core/earn';
import { FRESH, summarize } from '../src/core/store';
import type { Task } from '../src/core/tasks';

const sparks = (page: Page) => page.locator('[data-count="sparks"]');

async function addOne(page: Page) {
  const field = page.getByRole('textbox', { name: 'Add a task' });
  await field.fill('Water the plants');
  await field.press('Tab');
  await field.press('Enter');
}

test('a tick flies +20 to the spark pill, then the count rolls up to it', async ({ page }) => {
  await returning(page);
  await addOne(page);
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect(page.locator('.spark-flight')).toHaveText('+20');
  await expect(sparks(page)).toHaveText('0');
  await expect(page.locator('.spark-flight')).toHaveCount(0);
  await expect(sparks(page)).toHaveText('20');
  await expect(page.getByLabel('20 sparks', { exact: true })).toBeVisible();
});

test('with Motion off, nothing flies and the count changes at once', async ({ page }) => {
  await returning(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('group', { name: 'Motion' }).getByRole('button', { name: 'Off' }).click();
  await page.getByRole('button', { name: 'Close · Esc' }).click();
  await addOne(page);
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect(sparks(page)).toHaveText('20');
  await expect(page.locator('.spark-flight')).toHaveCount(0);
});

test('a reduced-motion system gets the still version too', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await returning(page);
  await addOne(page);
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect(sparks(page)).toHaveText('20');
  await expect(page.locator('.spark-flight')).toHaveCount(0);
});

test('a quest’s new fifth draws clockwise when a tick reaches its tier', async ({ page, isMobile }) => {
  test.skip(isMobile, 'quests sit in the right panel on a computer');
  await returning(page);
  await page.getByRole('button', { name: 'Skip for today · Esc' }).locator('visible=true').click();
  const field = page.getByRole('textbox', { name: 'Add a task' });
  await field.fill('Write the case study');
  await field.press('Tab');
  await field.press('Tab');
  await field.press('Enter');
  await page.getByRole('button', { name: 'Mark done: Write the case study' }).click();
  const fifth = page.locator('[data-quest="focus"] .fifth[data-on="true"]');
  await expect(fifth).toHaveCount(1);
  await expect(fifth).toHaveAttribute('style', /stroke-dasharray/);
  await expect(fifth).not.toHaveAttribute('style', /stroke-dasharray/);
});

test('a tick that reaches a new league draws its crest', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the league pill shows from 640 px');
  const long = dayKey(Date.now() - 40 * 86_400_000);
  const today = dayKey(Date.now());
  // Old S tasks, two minutes apart so no chain, until the XP sits just under the 1,000 of Starter; an L task then crosses it.
  const line: Task = { id: 'line', text: 'Cross the line', effort: 3, label: null, day: today, done: false, doneAt: null };
  const old = (n: number): Task[] => Array.from({ length: n }, (_, i) => ({ id: `old${i}`, text: `Old ${i}`, effort: 1, label: null, day: long, done: true, doneAt: Date.parse(`${long}T08:00:00`) + i * 120_000 }));
  let n = 1;
  while (summarize({ ...FRESH, tasks: [...old(n), line] }, Date.now()).xp < 970) n += 1;
  const tasks = [...old(n), line];
  expect(summarize({ ...FRESH, tasks }, Date.now()).xp).toBeLessThan(1000);
  await returning(page, '', { tasks });
  await expect(page.locator('#header')).toContainText('Rookie');
  await page.getByRole('button', { name: 'Mark done: Cross the line' }).click();
  await expect(page.locator('#header')).toContainText('Starter');
  await expect(page.locator('#header .crest path').first()).toHaveAttribute('style', /stroke-dasharray/);
});

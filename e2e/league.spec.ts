import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';
import { dayKey } from '../src/core/earn';
import { FRESH, summarize } from '../src/core/store';
import type { Task } from '../src/core/tasks';
import { pose } from '../src/ui/parts/career';

// Old S tasks, two minutes apart, until the XP reaches Starter's 1,000.
function starter(): Task[] {
  const long = dayKey(Date.now() - 40 * 86_400_000);
  const old = (n: number): Task[] => Array.from({ length: n }, (_, i) => ({ id: `old${i}`, text: `Old ${i}`, effort: 1, label: null, day: long, done: true, doneAt: Date.parse(`${long}T08:00:00`) + i * 120_000 }));
  let n = 1;
  while (summarize({ ...FRESH, tasks: old(n) }, Date.now()).xp < 1_000) n += 1;
  return old(n);
}

const limbs = (page: Page) => page.locator('.career-track .athlete .limbs').locator('visible=true').first();

async function lastSeenRookie(page: Page) {
  await returning(page, '', { tasks: starter() });
  await page.evaluate(() => localStorage.setItem('todo-project003:career-league', '1'));
}

test('the first Career visit after a league up morphs the athlete into its new pose, once', async ({ page }) => {
  await lastSeenRookie(page);
  await page.goto('/#/career');
  expect(await limbs(page).getAttribute('d')).not.toBe(pose(2).limbs);
  await expect(limbs(page)).toHaveAttribute('d', pose(2).limbs);
  expect(await page.evaluate(() => localStorage.getItem('todo-project003:career-league'))).toBe('2');
  await page.reload();
  expect(await limbs(page).getAttribute('d')).toBe(pose(2).limbs);
});

test('with Motion off the new pose is simply there', async ({ page }) => {
  await lastSeenRookie(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('group', { name: 'Motion' }).getByRole('button', { name: 'Off' }).click();
  await page.keyboard.press('Escape');
  await page.goto('/#/career');
  expect(await limbs(page).getAttribute('d')).toBe(pose(2).limbs);
});

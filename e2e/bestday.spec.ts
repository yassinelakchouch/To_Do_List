import { expect, test } from '@playwright/test';
import { returning } from './helpers';
import type { Task } from '../src/core/tasks';

const done = (id: string, day: string, effort: 1 | 2 | 3): Task => ({ id, text: id, effort, label: null, day, done: true, doneAt: Date.parse(`${day}T10:00:00`) });

test('a tick that passes another day of the month says New best day and its place', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-12T10:00:00') });
  const tasks: Task[] = [done('Wed', '2026-11-04', 2), done('Tue', '2026-11-03', 1), { id: 'today', text: 'Ship it', effort: 2, label: null, day: '2026-11-12', done: false, doneAt: null }];
  await returning(page, '', { tasks });
  await page.getByRole('button', { name: 'Mark done: Ship it' }).click();
  await expect(page.getByRole('status')).toContainText('New best day · 2nd this month');
  await page.keyboard.press('z');
  await expect(page.getByRole('button', { name: 'Mark done: Ship it' })).toBeVisible();
});

test('a first tick passes no one, so it says Done', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-12T10:00:00') });
  await returning(page, '', { tasks: [{ id: 'today', text: 'Ship it', effort: 1, label: null, day: '2026-11-12', done: false, doneAt: null }] });
  await page.getByRole('button', { name: 'Mark done: Ship it' }).click();
  await expect(page.getByRole('status')).toContainText('Done · Ship it');
});

import { describe, expect, it } from 'vitest';
import { ledger } from '../../core/earn';
import type { Effort, Task } from '../../core/tasks';
import { daySummary } from '../components/daySummary';
import { donePage } from './donePage';

const at = (date: number, hour = 10) => new Date(2026, 10, date, hour).getTime();
const task = (id: string, effort: Effort, doneAt: number | null): Task => ({ id, text: id, effort, label: null, day: '2026-11-05', done: doneAt !== null, doneAt });
const NOW = at(5, 18);

const render = (tasks: Task[]) => {
  const book = ledger({ tasks, checkIns: [] });
  return donePage({ tasks, pay: book.pay, days: book.days, best: [{ day: '2026-11-05', earned: 40 }], goalFor: () => 5, now: NOW });
};

describe('done page', () => {
  it('groups finished tasks by day, newest first, with each day’s sparks; open tasks stay out', () => {
    const html = render([task('old', 2, at(4)), task('new', 3, at(5)), task('more', 1, at(5, 12)), task('open', 1, null)]);
    expect(html.indexOf('Today · ✦ 40')).toBeLessThan(html.indexOf('Wed 4 · ✦ 20'));
    expect(html.split('class="task-row').length - 1).toBe(3);
    expect(html).not.toContain('data-id="open"');
  });

  it('shows the latest day’s summary beside the list', () => {
    expect(render([task('a', 3, at(5))])).toContain('aria-label="Summary of Thu 5"');
  });

  it('says plainly when nothing is finished yet', () => {
    expect(render([task('open', 1, null)])).toContain('Nothing finished yet');
  });
});

describe('day summary', () => {
  it('says what the day earned, the goal, the check-in and its place', () => {
    const html = daySummary({ day: '2026-11-05', facts: { done: 4, earned: 95, goalMet: true, checkedIn: true }, goal: 3, place: 1 });
    expect(html).toContain('met · 4 of 3');
    expect(html).toContain('yes · +15');
    expect(html).toContain('1st this month');
  });
});

import { describe, expect, it } from 'vitest';
import { bestDays, isOnPodium } from './bestDays';
import type { Effort, Task } from './tasks';

const at = (date: number, hour = 10, month = 10) => new Date(2026, month, date, hour).getTime();
const done = (id: string, effort: Effort, doneAt: number): Task => ({ id, text: id, effort, label: null, day: '2026-11-05', done: true, doneAt });
const NOW = at(5, 18);

describe('best days', () => {
  it('ranks this month’s days by points, best first, three places', () => {
    const tasks = [done('a', 3, at(2)), done('b', 1, at(3)), done('c', 2, at(4)), done('d', 3, at(5)), done('e', 3, at(5, 14))];
    expect(bestDays({ tasks, checkIns: [] }, NOW)).toEqual([
      { day: '2026-11-05', earned: 60 },
      { day: '2026-11-02', earned: 30 },
      { day: '2026-11-04', earned: 20 },
    ]);
  });

  it('counts check-ins and goals, ignores last month, keeps the earlier day on a tie', () => {
    const tasks = [done('oct', 3, at(31, 10, 9)), done('a', 1, at(2)), done('b', 1, at(3))];
    expect(bestDays({ tasks, checkIns: ['2026-11-04'] }, NOW)).toEqual([
      { day: '2026-11-04', earned: 15 },
      { day: '2026-11-02', earned: 10 },
      { day: '2026-11-03', earned: 10 },
    ]);
  });

  it('shows fewer places when fewer days earned anything', () => {
    expect(bestDays({ tasks: [done('a', 1, at(1))], checkIns: [] }, NOW)).toHaveLength(1);
    expect(bestDays({ tasks: [], checkIns: [] }, NOW)).toEqual([]);
  });

  it('says when today is on the podium', () => {
    const before = [done('a', 3, at(1)), done('b', 3, at(2)), done('c', 3, at(3))];
    expect(isOnPodium({ tasks: [...before, done('t', 1, at(5))], checkIns: [] }, NOW)).toBe(false);
    expect(isOnPodium({ tasks: [...before, done('t', 3, at(5)), done('u', 1, at(5, 16))], checkIns: [] }, NOW)).toBe(true);
  });
});

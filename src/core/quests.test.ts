import { describe, expect, it } from 'vitest';
import { questProgress, questXp, windowKey } from './quests';
import type { Effort, Task } from './tasks';

const at = (date: number, hour = 10, month = 10) => new Date(2026, month, date, hour).getTime();
const done = (id: string, effort: Effort, doneAt: number, day = '2026-11-05'): Task => ({ id, text: id, effort, label: null, day, done: true, doneAt });
const NOW = at(5, 12);
const quest = (id: string, tasks: Task[], checkInTimes: number[] = []) => questProgress({ tasks, checkInTimes }, NOW).find((q) => q.id === id)!;

describe('windows', () => {
  it('starts weeks on Monday and keys months by year and month', () => {
    expect(windowKey('week', at(5))).toBe('2026-11-02');
    expect(windowKey('week', at(8))).toBe('2026-11-02');
    expect(windowKey('week', at(9))).toBe('2026-11-09');
    expect(windowKey('month', at(30))).toBe('2026-11');
  });
});

describe('quests', () => {
  it('Focus counts L tasks this month: three reach tier 2 of 5, next at 6', () => {
    const tasks = [done('a', 3, at(1)), done('b', 3, at(3)), done('c', 3, at(5)), done('d', 2, at(5)), done('old', 3, at(28, 10, 9))];
    expect(quest('focus', tasks)).toMatchObject({ count: 3, tier: 2, next: 6, window: '2026-11' });
  });

  it('Speed counts tasks done on the day they were planned, this week only', () => {
    const tasks = [done('a', 1, at(5), '2026-11-05'), done('late', 1, at(5), '2026-11-04'), done('b', 1, at(3), '2026-11-03'), done('c', 1, at(4), '2026-11-04'), done('prev', 1, at(1), '2026-11-01')];
    expect(quest('speed', tasks)).toMatchObject({ count: 3, tier: 1, next: 6 });
  });

  it('Rhythm counts days with something done, not tasks', () => {
    const tasks = [done('a', 1, at(1)), done('b', 1, at(1, 15)), done('c', 1, at(2)), done('d', 1, at(4))];
    expect(quest('rhythm', tasks)).toMatchObject({ count: 3, tier: 1 });
  });

  it('Early start counts check-ins before 9, once per day', () => {
    expect(quest('early-start', [], [at(3, 8), at(3, 8), at(4, 10), at(5, 7)])).toMatchObject({ count: 2, tier: 2 });
  });

  it('shows no next target once all five tiers are reached', () => {
    const tasks = Array.from({ length: 15 }, (_, i) => done(`l${i}`, 3, at(1 + (i % 5))));
    expect(quest('focus', tasks)).toMatchObject({ tier: 5, next: null });
  });
});

describe('quest xp', () => {
  it('pays 25 per tier in every window, so last month stays earned', () => {
    const tasks = [done('oct', 3, at(20, 10, 9)), done('nov1', 3, at(2)), done('nov2', 3, at(3)), done('nov3', 3, at(4))];
    // Focus: October tier 1, November tier 2; Rhythm: November tier 1; Speed: none done on their planned day.
    expect(questXp({ tasks, checkInTimes: [] })).toBe((1 + 2 + 1) * 25);
  });
});

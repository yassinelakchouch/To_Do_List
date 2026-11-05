import { describe, expect, it } from 'vitest';
import { CHALLENGES, challengeXp, weeklyChallenge } from './challenge';
import type { Effort, Task } from './tasks';

const at = (date: number, hour = 10) => new Date(2026, 10, date, hour).getTime();
const done = (id: string, effort: Effort, doneAt: number): Task => ({ id, text: id, effort, label: null, day: '2026-11-05', done: true, doneAt });

describe('weekly challenge', () => {
  it('stays the same all week and changes on Monday', () => {
    const ids = [2, 8, 9].map((date) => weeklyChallenge({ tasks: [], checkIns: [] }, at(date)).id);
    expect(ids[0]).toBe(ids[1]); // Monday 2 and Sunday 8 share a week
    expect(ids[2]).not.toBe(ids[0]);
  });

  it('cycles through every challenge, one per week', () => {
    const ids = new Set([2, 9, 16, 23].map((date) => weeklyChallenge({ tasks: [], checkIns: [] }, at(date)).id));
    expect(ids.size).toBe(CHALLENGES.length);
  });

  it('ends on Sunday', () => {
    expect(weeklyChallenge({ tasks: [], checkIns: [] }, at(5)).endsOn).toBe('2026-11-08');
  });

  it('counts this week only, capped at what it needs', () => {
    const weekOf5 = weeklyChallenge({ tasks: [], checkIns: [] }, at(5));
    const tasks = Array.from({ length: 20 }, (_, i) => done(`t${i}`, 3, at(2 + (i % 5), 8 + (i % 10))));
    const checkIns = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-10-30'];
    const result = weeklyChallenge({ tasks: [...tasks, done('old', 3, at(1))], checkIns, defaultGoal: 3 }, at(5));
    expect(result.id).toBe(weekOf5.id);
    expect(result).toMatchObject({ have: result.need, met: true });
  });
});

describe('challenge xp', () => {
  it('pays 50 for each week whose challenge was met, and nothing otherwise', () => {
    expect(challengeXp({ tasks: [], checkIns: [] })).toBe(0);
    const tasks = Array.from({ length: 20 }, (_, i) => done(`t${i}`, 3, at(2 + (i % 5), 8 + (i % 10))));
    const checkIns = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
    expect(challengeXp({ tasks, checkIns, defaultGoal: 3 })).toBe(50);
  });
});

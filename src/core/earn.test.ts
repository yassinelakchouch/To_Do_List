import { describe, expect, it } from 'vitest';
import { CHAIN_MS, dayKey, ledger } from './earn';
import type { Effort, Task } from './tasks';

const at = (hour: number, minute = 0, second = 0, date = 5) => new Date(2026, 10, date, hour, minute, second).getTime();
const task = (id: string, effort: Effort, doneAt: number | null): Task => ({ id, text: id, effort, label: null, day: '2026-11-05', done: doneAt !== null, doneAt });

describe('earning', () => {
  it('pays 10, 20 or 30 by effort, and nothing for open tasks', () => {
    const result = ledger({ tasks: [task('s', 1, at(9)), task('m', 2, at(11)), task('l', 3, at(14)), task('open', 3, null)], checkIns: [] });
    expect([...result.pay.values()].map((p) => p.amount)).toEqual([10, 20, 30]);
    expect(result.earned).toBe(60);
  });

  it('chains ticks within 90 s: ×2, then ×3 at most', () => {
    const tasks = [task('a', 1, at(9, 0, 0)), task('b', 1, at(9, 1, 0)), task('c', 1, at(9, 2, 0)), task('d', 1, at(9, 3, 0))];
    expect([...ledger({ tasks, checkIns: [] }).pay.values()].map((p) => p.chain)).toEqual([1, 2, 3, 3]);
    expect(ledger({ tasks, checkIns: [] }).earned).toBe(10 + 20 + 30 + 30);
  });

  it('breaks the chain after 90 s of quiet', () => {
    const tasks = [task('a', 2, at(9)), task('b', 2, at(9) + CHAIN_MS + 1)];
    expect([...ledger({ tasks, checkIns: [] }).pay.values()].map((p) => p.amount)).toEqual([20, 20]);
  });

  it('adds 15 for a check-in, once per day', () => {
    expect(ledger({ tasks: [], checkIns: ['2026-11-05', '2026-11-05'] }).earned).toBe(15);
  });

  it('adds 20 when the day meets its goal, using the default of 5 or the day’s own goal', () => {
    const three = [task('a', 1, at(9)), task('b', 1, at(12)), task('c', 1, at(16))];
    expect(ledger({ tasks: three, checkIns: [] }).days.get('2026-11-05')!.goalMet).toBe(false);
    const met = ledger({ tasks: three, checkIns: [], goals: { '2026-11-05': 3 } });
    expect(met.days.get('2026-11-05')).toMatchObject({ done: 3, goalMet: true, earned: 50 });
  });

  it('takes points back when a task is un-ticked', () => {
    const ticked = ledger({ tasks: [task('a', 3, at(9))], checkIns: [] }).earned;
    const unticked = ledger({ tasks: [task('a', 3, null)], checkIns: [] }).earned;
    expect([ticked, unticked]).toEqual([30, 0]);
  });

  it('files each completion under the local day it happened', () => {
    expect(dayKey(at(23, 59, 59, 4))).toBe('2026-11-04');
    expect(dayKey(at(0, 0, 0, 5))).toBe('2026-11-05');
  });
});

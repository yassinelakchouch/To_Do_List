import { describe, expect, it } from 'vitest';
import { pickTask, spinPath, tickDelay } from './pick';
import type { Task } from './tasks';

const task = (id: string): Task => ({ id, text: id, effort: 1, label: null, day: '2026-11-05', done: false, doneAt: null });

describe('pick for me', () => {
  it('picks from the open tasks, and nothing when there are none', () => {
    expect(pickTask([task('a'), task('b'), task('c')], null, () => 0.5)?.id).toBe('b');
    expect(pickTask([], null)).toBeNull();
  });

  it('never lands on the previous pick twice in a row unless it is the only task', () => {
    expect(pickTask([task('a'), task('b')], 'a', () => 0)?.id).toBe('b');
    expect(pickTask([task('a')], 'a', () => 0)?.id).toBe('a');
  });

  it('spins through the list and ends on the target, wrapping', () => {
    const path = spinPath(3, 1, 10);
    expect(path).toHaveLength(11);
    expect(path.at(-1)).toBe(1);
    expect(path.every((i) => i >= 0 && i < 3)).toBe(true);
    expect(spinPath(1, 0)).toEqual([0]);
  });

  it('slows down tick by tick, about 0.8 s over ten ticks', () => {
    const total = Array.from({ length: 10 }, (_, i) => tickDelay(i)).reduce((a, b) => a + b, 0);
    expect(tickDelay(9)).toBeGreaterThan(tickDelay(0));
    expect(total).toBeGreaterThan(700);
    expect(total).toBeLessThan(900);
  });
});

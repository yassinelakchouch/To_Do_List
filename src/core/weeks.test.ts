import { describe, expect, it } from 'vitest';
import { changeWeekStart, weekEnd, weekKey, weekStart } from './weeks';

// 2026-11-11 is a Wednesday.
const WED = new Date(2026, 10, 11, 10).getTime();

describe('weeks', () => {
  it('start on Monday and end on Sunday until changed', () => {
    expect(weekKey('2026-11-11')).toBe('2026-11-09');
    expect(weekKey('2026-11-15')).toBe('2026-11-09');
    expect(weekEnd('2026-11-11')).toBe('2026-11-15');
    expect(weekStart([])).toBe(1);
  });

  it('switching to Sunday starts at the next Sunday and keeps the days already counted in their week', () => {
    const rules = changeWeekStart([], 0, WED);
    expect(rules).toEqual([{ start: 0, since: '2026-11-15', base: '2026-11-09' }]);
    expect(weekKey('2026-11-04', rules)).toBe('2026-11-02');
    expect(weekKey('2026-11-11', rules)).toBe('2026-11-09');
    expect(weekEnd('2026-11-11', rules)).toBe('2026-11-14');
    expect(weekKey('2026-11-15', rules)).toBe('2026-11-15');
    expect(weekEnd('2026-11-15', rules)).toBe('2026-11-21');
  });

  it('switching back to Monday folds the stray Sunday into this week rather than a one-day week', () => {
    const sunday = changeWeekStart([], 0, new Date(2026, 10, 1, 10).getTime());
    const back = changeWeekStart(sunday, 1, WED);
    expect(weekKey('2026-11-11', back)).toBe('2026-11-08');
    expect(weekKey('2026-11-15', back)).toBe('2026-11-08');
    expect(weekEnd('2026-11-11', back)).toBe('2026-11-15');
    expect(weekKey('2026-11-16', back)).toBe('2026-11-16');
  });

  it('a change that has not started yet is replaced, and switching back cancels it', () => {
    const rules = changeWeekStart([], 0, WED);
    expect(changeWeekStart(rules, 1, WED)).toEqual([]);
    expect(weekStart(rules)).toBe(0);
  });
});

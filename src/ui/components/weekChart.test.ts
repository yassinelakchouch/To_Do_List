import { describe, expect, it } from 'vitest';
import type { Day } from '../../core/earn';
import { weekChart, weekDays } from './weekChart';

const day = (earned: number): Day => ({ done: 1, earned, goalMet: false, checkedIn: false });
const NOW = new Date(2026, 10, 5, 18).getTime();

describe('week chart', () => {
  it('lists Monday to Sunday with what each day earned, marking today', () => {
    const week = weekDays(new Map([['2026-11-02', day(30)], ['2026-11-05', day(60)], ['2026-10-30', day(99)]]), NOW);
    expect(week.map((d) => d.day)).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08']);
    expect(week.map((d) => d.earned)).toEqual([30, 0, 0, 60, 0, 0, 0]);
    expect(week.findIndex((d) => d.today)).toBe(3);
  });

  it('draws today in orange, quiet days as thin dim lines, and reads out every day', () => {
    const svg = weekChart(weekDays(new Map([['2026-11-05', day(60)]]), NOW));
    expect(svg.split('var(--color-accent)').length - 1).toBe(1);
    expect(svg.split('height="2.0"').length - 1).toBe(6);
    expect(svg).toContain('aria-label="This week: M 0, T 0, W 0, T 60, F 0, S 0, S 0 sparks"');
  });

  it('can start on Sunday, each bar lettered by its own day', () => {
    const week = weekDays(new Map(), NOW, '2026-11-01');
    expect(week[0].day).toBe('2026-11-01');
    expect(weekChart(week)).toContain('aria-label="This week: S 0, M 0, T 0, W 0, T 0, F 0, S 0 sparks"');
  });
});

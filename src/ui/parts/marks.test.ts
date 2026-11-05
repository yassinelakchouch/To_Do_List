import { describe, expect, it } from 'vitest';
import { dayPie, effortBars, spark, statusRing } from './marks';

const count = (svg: string, needle: string) => svg.split(needle).length - 1;

describe('marks', () => {
  it('are decoration: hidden from screen readers and never focusable', () => {
    for (const svg of [spark(), effortBars(2), dayPie(2, 5), statusRing(true)]) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
  });

  it('draw the spark filled when earned and outlined when still to earn', () => {
    expect(spark(16, true)).toContain('fill="var(--color-accent)"');
    expect(spark(16, false)).toContain('fill="none"');
  });

  it('light one, two or three bars for S, M and L', () => {
    expect(count(effortBars(1), 'currentColor')).toBe(1);
    expect(count(effortBars(2), 'currentColor')).toBe(2);
    expect(count(effortBars(3), 'currentColor')).toBe(3);
  });

  it('grow the pie with the day: empty, a wedge, more than half, then a solid orange ring', () => {
    expect(dayPie(0, 5)).not.toContain('<path');
    expect(dayPie(2, 5)).toMatch(/A6\.2 6\.2 0 0 1/);
    expect(dayPie(4, 5)).toMatch(/A6\.2 6\.2 0 1 1/);
    expect(dayPie(5, 5)).toContain('stroke="var(--color-accent)"');
    expect(dayPie(9, 5)).toEqual(dayPie(5, 5));
  });

  it('give a done task a tick as well as the colour', () => {
    expect(statusRing(true)).toContain('class="tick"');
    expect(statusRing(false)).not.toContain('class="tick"');
  });
});

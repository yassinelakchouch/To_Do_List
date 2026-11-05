import { describe, expect, it } from 'vitest';
import { podium, shortDay } from './podium';

const BEST = [
  { day: '2026-11-04', earned: 240 },
  { day: '2026-11-03', earned: 180 },
  { day: '2026-10-30', earned: 150 },
];

describe('podium', () => {
  it('puts first in the middle with the flag, second on the left, third on the right', () => {
    const svg = podium(BEST);
    const places = [...svg.matchAll(/data-place="(\d)"/g)].map((m) => m[1]);
    expect(places).toEqual(['2', '1', '3']);
    expect(svg.split('class="flag"').length - 1).toBe(1);
  });

  it('says the days and their sparks in its label', () => {
    expect(podium(BEST)).toContain('aria-label="Best days: 1. Wed 4, 240 sparks; 2. Tue 3, 180 sparks; 3. Fri 30, 150 sparks"');
    expect(shortDay('2026-11-05')).toBe('Thu 5');
  });

  it('leaves dashed places for days not earned yet', () => {
    const svg = podium(BEST.slice(0, 1));
    expect(svg.split('class="empty"').length - 1).toBe(2);
    expect(podium([])).toContain('aria-label="No best days yet this month"');
  });

  it('grows its blocks with the width and the scale', () => {
    const width = (svg: string) => Number(svg.match(/class="block" data-place="1" x="[\d.]+" y="\d+" width="([\d.]+)"/)![1]);
    expect(width(podium(BEST, 716))).toBeGreaterThan(width(podium(BEST, 300)));
    expect(podium(BEST, 716, 1.25)).toMatch(/data-place="1"[^>]*height="123"/);
  });
});

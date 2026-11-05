import { describe, expect, it } from 'vitest';
import { athlete, careerTrack } from './career';

const names = (svg: string) => [...svg.matchAll(/class="league-name"[^>]*>([^<]+)</g)].map((m) => m[1]);
const runEnd = (svg: string) => Number(svg.match(/class="run" d="M[\d.]+ \d+ H([\d.]+)"/)![1]);

describe('athlete', () => {
  it('has five different poses, one per league', () => {
    expect(new Set([1, 2, 3, 4, 5].map((tier) => athlete(tier))).size).toBe(5);
    expect(athlete(0)).toBe(athlete(1));
  });
});

describe('career track', () => {
  it('names all five leagues on a computer and says where you are', () => {
    const track = careerTrack(2_140, 1_100);
    expect(names(track)).toEqual(['Rookie', 'Starter', 'Pro', 'All-star', 'Legend']);
    expect(track).toContain('aria-label="Starter, 2140 XP, 860 to Pro"');
    expect(track).toContain('860 XP to Pro');
  });

  it('names only your league and the next on a phone, so nothing collides', () => {
    expect(names(careerTrack(2_140, 358, true))).toEqual(['Starter', 'Pro']);
    expect(names(careerTrack(0, 304, true))).toEqual(['Rookie', 'Starter']);
  });

  it('runs further along with more XP, and only shows speed lines once something is earned', () => {
    expect(runEnd(careerTrack(2_140, 1_100))).toBeGreaterThan(runEnd(careerTrack(1_000, 1_100)));
    expect(careerTrack(0, 358, true)).not.toContain('class="speed"');
    expect(careerTrack(10, 358, true)).toContain('class="speed"');
  });

  it('has no flag left to run to at Legend', () => {
    const legend = careerTrack(12_000, 1_100);
    expect(legend).not.toContain('class="flag"');
    expect(legend).toContain('aria-label="Legend, 12000 XP"');
  });
});

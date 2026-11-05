import { describe, expect, it } from 'vitest';
import { LEAGUES, standing } from './leagues';

describe('standing', () => {
  it('starts as a Rookie with 1,000 to go', () => {
    expect(standing(0)).toEqual({ tier: 1, name: 'Rookie', next: 'Starter', toNext: 1_000, share: 0 });
  });

  it('places 2,140 XP as a Starter, 860 from Pro, 57 % along', () => {
    const s = standing(2_140);
    expect([s.tier, s.name, s.next, s.toNext]).toEqual([2, 'Starter', 'Pro', 860]);
    expect(s.share).toBeCloseTo(0.57, 2);
  });

  it('changes league exactly on each line', () => {
    expect(LEAGUES.map((league) => standing(league.from).name)).toEqual(['Rookie', 'Starter', 'Pro', 'All-star', 'Legend']);
    expect(standing(2_999).name).toBe('Starter');
  });

  it('ends at Legend, with nothing after it', () => {
    expect(standing(25_000)).toEqual({ tier: 5, name: 'Legend', next: null, toNext: 0, share: 1 });
  });

  it('treats negative or fractional XP as whole points from zero', () => {
    expect(standing(-50).name).toBe('Rookie');
    expect(standing(999.9).toNext).toBe(1);
  });
});

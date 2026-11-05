import { describe, expect, it } from 'vitest';
import { COST, MAX_NAME, reduceRewards, redeemedOn, spent, SUGGESTED, type RewardState } from './rewards';

const EMPTY: RewardState = { rewards: [], redeemed: [] };
const withCoffee = reduceRewards(EMPTY, { type: 'add', id: 'c', name: ' Coffee  at Bloom ', cost: 60, icon: 'cup' });
const at = (date: number, hour = 10) => new Date(2026, 10, date, hour).getTime();

describe('setting rewards', () => {
  it('adds with a tidy name and the cost on the 10-spark grid', () => {
    expect(withCoffee.rewards).toEqual([{ id: 'c', name: 'Coffee at Bloom', cost: 60, icon: 'cup' }]);
    expect(reduceRewards(EMPTY, { type: 'add', id: 'x', name: 'Odd', cost: 57, icon: 'book' }).rewards[0].cost).toBe(60);
  });

  it('keeps costs between 10 and 2,000 and names to 40 characters', () => {
    const tiny = reduceRewards(EMPTY, { type: 'add', id: 'a', name: 'Tiny', cost: 1, icon: 'cup' });
    const huge = reduceRewards(EMPTY, { type: 'add', id: 'b', name: 'y'.repeat(60), cost: 99_999, icon: 'cup' });
    expect([tiny.rewards[0].cost, huge.rewards[0].cost]).toEqual([COST.min, COST.max]);
    expect(huge.rewards[0].name).toHaveLength(MAX_NAME);
  });

  it('refuses an empty name or a repeated id, and edits or removes by id', () => {
    expect(reduceRewards(EMPTY, { type: 'add', id: 'a', name: '   ', cost: 50, icon: 'cup' })).toBe(EMPTY);
    expect(reduceRewards(withCoffee, { type: 'add', id: 'c', name: 'Again', cost: 50, icon: 'cup' })).toBe(withCoffee);
    expect(reduceRewards(withCoffee, { type: 'edit', id: 'c', cost: 80, icon: 'walk' }).rewards[0]).toMatchObject({ name: 'Coffee at Bloom', cost: 80, icon: 'walk' });
    expect(reduceRewards(withCoffee, { type: 'edit', id: 'c', name: ' ' })).toBe(withCoffee);
    expect(reduceRewards(withCoffee, { type: 'remove', id: 'c' }).rewards).toEqual([]);
  });

  it('suggests three rewards to start from', () => {
    expect(SUGGESTED.map((r) => r.cost)).toEqual([60, 120, 300]);
  });
});

describe('redeeming', () => {
  it('spends sparks only when they cover the cost', () => {
    expect(reduceRewards(withCoffee, { type: 'redeem', id: 'r1', rewardId: 'c', at: at(5), sparks: 59 })).toBe(withCoffee);
    const redeemed = reduceRewards(withCoffee, { type: 'redeem', id: 'r1', rewardId: 'c', at: at(5), sparks: 240 });
    expect(spent(redeemed.redeemed)).toBe(60);
  });

  it('keeps the price paid even if the reward later costs more or is removed', () => {
    let state = reduceRewards(withCoffee, { type: 'redeem', id: 'r1', rewardId: 'c', at: at(5), sparks: 240 });
    state = reduceRewards(reduceRewards(state, { type: 'edit', id: 'c', cost: 200 }), { type: 'remove', id: 'c' });
    expect(spent(state.redeemed)).toBe(60);
  });

  it('knows what was enjoyed today', () => {
    const state = reduceRewards(withCoffee, { type: 'redeem', id: 'r1', rewardId: 'c', at: at(5, 9), sparks: 100 });
    expect(redeemedOn(state.redeemed, 'c', at(5, 20))).toBe(true);
    expect(redeemedOn(state.redeemed, 'c', at(6, 9))).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import type { Reward } from '../../core/rewards';
import { rewardCard, rewardState } from './rewardCard';

const coffee: Reward = { id: 'coffee', name: 'Coffee at Bloom', cost: 60, icon: 'cup' };

describe('reward card', () => {
  it('picks its state from the sparks and today’s redeems', () => {
    expect([rewardState(60, 40, false), rewardState(60, 60, false), rewardState(60, 999, true)]).toEqual(['saving', 'ready', 'redeemed']);
  });

  it('saving shows what is left; ready offers a Redeem named for its reward and price', () => {
    expect(rewardCard(coffee, 40, 'saving')).toContain('20 to go');
    const ready = rewardCard(coffee, 240, 'ready');
    expect(ready).toContain('data-redeem="coffee"');
    expect(ready).toContain('Redeem<span class="sr-only"> Coffee at Bloom for 60 sparks</span>');
    expect(ready).toContain('border-accent');
  });

  it('redeemed keeps the stamp inside the card and says so in words', () => {
    const html = rewardCard(coffee, 0, 'redeemed');
    expect(html).toContain('grid-cols-[minmax(0,1fr)_54px]');
    expect(html).toContain('class="stamp"');
    expect(html).toContain('enjoyed · today');
    expect(html).not.toContain('data-redeem');
  });
});

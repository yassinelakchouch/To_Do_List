import { describe, expect, it } from 'vitest';
import { priceHint, rewardEditor } from './rewardEditor';

describe('reward editor', () => {
  it('starts a new reward with a name field, the price and five icons, one pressed', () => {
    const html = rewardEditor({ id: null, name: '', cost: 60, icon: 'cup' });
    expect(html).toContain('New reward');
    expect(html).toContain('maxlength="40"');
    expect(html.split('data-icon=').length - 1).toBe(5);
    expect(html.split('aria-pressed="true"').length - 1).toBe(1);
    expect(html).not.toContain('data-reward-delete');
  });

  it('edits an existing reward, escaped, with Delete', () => {
    const html = rewardEditor({ id: 'r1', name: 'Coffee <3', cost: 60, icon: 'walk' });
    expect(html).toContain('Edit reward');
    expect(html).toContain('value="Coffee &lt;3"');
    expect(html).toContain('data-reward-delete="r1"');
    expect(html).toContain('data-icon="walk" aria-label="Walk" aria-pressed="true"');
  });

  it('keeps the price inside 10 to 2,000 by disabling the step past each end', () => {
    expect(rewardEditor({ id: null, name: '', cost: 10, icon: 'cup' })).toMatch(/aria-label="Lower the price" disabled/);
    expect(rewardEditor({ id: null, name: '', cost: 2000, icon: 'cup' })).toMatch(/aria-label="Raise the price" disabled/);
  });

  it('says how much work a price stands for', () => {
    expect(priceHint(120)).toBe('≈ 6 M tasks');
    expect(priceHint(10)).toBe('≈ 1 M tasks');
  });
});

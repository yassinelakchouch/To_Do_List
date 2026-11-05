import { describe, expect, it } from 'vitest';
import { slotPicker, slotReel } from './slotPicker';

describe('slot picker', () => {
  it('is a modal dialog with three names, only the middle one read out', () => {
    const html = slotPicker(['Buy coffee beans', 'Gym <legs>', 'Renew the domain'], false);
    expect(html).toContain('role="dialog" aria-modal="true" aria-label="Pick for me"');
    expect(html).toContain('Gym &lt;legs&gt;');
    expect(slotReel(['a', 'b', 'c']).split('aria-hidden="true"').length - 1).toBe(2);
  });

  it('offers Start it and Spin again only once landed, and says the pick', () => {
    const spinning = slotPicker(['a', 'b', 'c'], false);
    expect(spinning).not.toContain('data-pick-start');
    expect(spinning).toContain('aria-live="polite" data-pick-said></p>');
    const landed = slotPicker(['a', 'b', 'c'], true);
    expect(landed).toContain('data-pick-start');
    expect(landed).toContain('data-pick-again');
    expect(landed).toContain('Picked: b');
  });
});

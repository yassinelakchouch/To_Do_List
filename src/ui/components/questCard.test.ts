import { describe, expect, it } from 'vitest';
import { questCard } from './questCard';

describe('quest card', () => {
  it('shows the tier, what it counts and what the next tier needs', () => {
    const html = questCard({ id: 'focus', name: 'Focus', about: 'finish big (L) tasks', count: 3, tier: 2, next: 6, window: '2026-11' });
    expect(html).toContain('>2/5<');
    expect(html).toContain('finish big (L) tasks, this month');
    expect(html).toContain('3 of 6 for tier 3');
  });

  it('says when all five tiers are reached, and can be highlighted', () => {
    const html = questCard({ id: 'speed', name: 'Speed', about: 'done on the day you planned them', count: 21, tier: 5, next: null, window: '2026-11-02' }, true);
    expect(html).toContain('all five tiers reached');
    expect(html).toContain(', this week');
    expect(html).toContain('border-accent');
  });
});

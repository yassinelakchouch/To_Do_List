import { describe, expect, it } from 'vitest';
import type { RewardIcon } from '../../core/rewards';
import { icon, ICONS, type IconName } from './icons';

describe('icons', () => {
  it('cover every reward icon the store can hold', () => {
    const rewardIcons: RewardIcon[] = ['cup', 'pad', 'book', 'walk', 'sunrise'];
    for (const name of rewardIcons) expect(ICONS[name satisfies IconName]).toBeTruthy();
  });

  it('draw in currentColor with one stroke weight, hidden from screen readers', () => {
    for (const name of Object.keys(ICONS) as IconName[]) {
      const svg = icon(name);
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('stroke-width="1.5"');
      expect(svg).toContain('aria-hidden="true"');
    }
  });

  it('are all different drawings', () => {
    expect(new Set(Object.values(ICONS)).size).toBe(Object.keys(ICONS).length);
  });
});

import { describe, expect, it } from 'vitest';
import { QUESTS } from '../../core/quests';
import { emblem, QUEST_ICON } from './emblem';
import { ICONS } from './icons';

const lit = (svg: string) => svg.split('data-on="true"').length - 1;

describe('quest emblem', () => {
  it('closes one fifth per tier reached, from none to all five', () => {
    expect([0, 1, 3, 5].map((tier) => lit(emblem('focus', tier)))).toEqual([0, 1, 3, 5]);
    expect(lit(emblem('focus', 9))).toBe(5);
  });

  it('gives every quest its own icon inside', () => {
    expect(new Set(QUESTS.map((q) => QUEST_ICON[q.id])).size).toBe(QUESTS.length);
    expect(emblem('speed', 2)).toContain(ICONS.bolt);
  });

  it('is decoration; the quest’s name and count sit beside it', () => {
    expect(emblem('rhythm', 1)).toContain('aria-hidden="true"');
  });
});

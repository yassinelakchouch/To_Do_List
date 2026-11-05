import { describe, expect, it } from 'vitest';
import { crest } from './crest';

const count = (svg: string, needle: string) => svg.split(needle).length - 1;

describe('crest', () => {
  it('gives each of the first three leagues one more chevron', () => {
    expect([1, 2, 3].map((tier) => count(crest(tier), 'class="chevron"'))).toEqual([1, 2, 3]);
  });

  it('adds a star from All-star, and fills the crest for Legend', () => {
    expect(count(crest(4), 'class="star"')).toBe(1);
    expect(crest(4)).toContain('fill="none"');
    expect(crest(5)).toContain('rgb(255 90 44 / 0.16)');
  });

  it('draws five different crests, and clamps anything outside 1 to 5', () => {
    expect(new Set([1, 2, 3, 4, 5].map((tier) => crest(tier))).size).toBe(5);
    expect(crest(0)).toBe(crest(1));
    expect(crest(9)).toBe(crest(5));
  });

  it('is decoration, named by the league text beside it', () => {
    expect(crest(2)).toContain('aria-hidden="true"');
  });

  it('dims the marks of a league still ahead', () => {
    expect(crest(3, 20, 'var(--color-dim)')).not.toContain('var(--color-accent)"');
    expect(crest(5, 20, 'var(--color-dim)')).not.toMatch(/accent|255 90 44/);
    expect(crest(3)).toContain('stroke="var(--color-accent)"');
  });
});

import { describe, expect, it } from 'vitest';
import { MOOD_ORDER, moodIcon, MOODS } from './moods';

describe('moods', () => {
  it('run from rough to great, each with its own word', () => {
    expect(MOOD_ORDER.map((m) => MOODS[m].word)).toEqual(['rough', 'slow', 'okay', 'great']);
  });

  it('are four different weather drawings in currentColor, hidden from screen readers', () => {
    const svgs = MOOD_ORDER.map((m) => moodIcon(m));
    expect(new Set(svgs).size).toBe(4);
    expect(svgs.every((svg) => svg.includes('stroke="currentColor"') && svg.includes('aria-hidden="true"'))).toBe(true);
  });
});

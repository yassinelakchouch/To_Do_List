import { describe, expect, it } from 'vitest';
import { challengeCard } from './challengeCard';
import { progressBar } from './progressBar';

describe('challenge card', () => {
  it('shows the goal, the count and the day it ends', () => {
    const html = challengeCard({ id: 'three-l', title: 'Finish three L tasks', have: 1, need: 3, met: false, endsOn: '2026-11-08' });
    expect(html).toContain('Finish three L tasks');
    expect(html).toContain('>1/3<');
    expect(html).toContain('ends Sun 8');
  });

  it('says it is met in words, not only in orange', () => {
    const html = challengeCard({ id: 'three-l', title: 'Finish three L tasks', have: 3, need: 3, met: true, endsOn: '2026-11-08' });
    expect(html).toContain('met · new on Monday');
    expect(html).toContain('bg-accent');
  });
});

describe('progress bar', () => {
  it('is a named progressbar with its numbers, cream on the way and orange when full', () => {
    expect(progressBar(2, 5, 'Focus')).toContain('role="progressbar" aria-label="Focus" aria-valuemin="0" aria-valuemax="5" aria-valuenow="2"');
    expect(progressBar(2, 5, 'Focus')).toContain('bg-cream" style="width: 40%"');
    expect(progressBar(9, 5, 'Focus')).toContain('bg-accent" style="width: 100%"');
  });
});

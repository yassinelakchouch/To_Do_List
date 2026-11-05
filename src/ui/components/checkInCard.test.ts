import { describe, expect, it } from 'vitest';
import { checkInCard } from './checkInCard';

const NOW = new Date(2026, 10, 5, 8, 42).getTime();

describe('check-in card', () => {
  it('names the hour and offers four moods, none pressed until one is picked', () => {
    const html = checkInCard({ now: NOW, mood: null, yesterday: [], open: [] });
    expect(html).toContain('Morning check-in · 08:42');
    expect(html.split('data-check-mood=').length - 1).toBe(4);
    expect(html).not.toContain('aria-pressed="true"');
  });

  it('keeps I’m ready disabled until a mood is picked', () => {
    expect(checkInCard({ now: NOW, mood: null, yesterday: [], open: [] })).toContain('data-checkin-ready disabled');
    const html = checkInCard({ now: NOW, mood: 'sun', yesterday: [], open: [] });
    expect(html).toContain('data-check-mood="sun" aria-pressed="true"');
    expect(html).not.toContain('data-checkin-ready disabled');
    expect(html).toContain('I’m ready · +15 XP');
  });

  it('shows up to three of yesterday’s and today’s tasks, escaped, and counts the rest', () => {
    const html = checkInCard({ now: NOW, mood: null, yesterday: ['Fix <b>', 'Buy stamps'], open: ['a', 'b', 'c', 'd', 'e'], blocker: 'the <wifi>' });
    expect(html).toContain('Fix &lt;b&gt; · Buy stamps');
    expect(html).toContain('Today · 5 open');
    expect(html).toContain('a · b · c · +2');
    expect(html).toContain('value="the &lt;wifi&gt;"');
  });

  it('says so when there is nothing to show', () => {
    const html = checkInCard({ now: NOW, mood: null, yesterday: [], open: [] });
    expect(html).toContain('Nothing ticked');
    expect(html).toContain('Nothing yet, add a few');
  });
});

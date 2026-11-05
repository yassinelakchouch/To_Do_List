import { describe, expect, it } from 'vitest';
import { ledger } from '../../core/earn';
import { FRESH, summarize } from '../../core/store';
import { inspector } from './inspector';

const NOW = new Date(2026, 10, 5, 12).getTime();
const props = (sparks = 0, highlight: 'speed' | null = null) => {
  const summary = { ...summarize(FRESH, NOW), sparks };
  return { summary, rewards: FRESH.rewards, redeemed: [], days: ledger({ tasks: [], checkIns: [] }).days, now: NOW, highlight };
};

describe('inspector', () => {
  it('holds the challenge, two quests, two rewards and the week, named for screen readers', () => {
    const html = inspector(props());
    expect(html).toContain('aria-label="Your progress"');
    expect(html.split('class="challenge-card').length - 1).toBe(1);
    expect(html.split('class="quest-card').length - 1).toBe(2);
    expect(html.split('class="reward-card').length - 1).toBe(2);
    expect(html).toContain('class="week-chart"');
  });

  it('brings the quest a tick just moved to the top, highlighted', () => {
    const html = inspector(props(0, 'speed'));
    expect(html.indexOf('data-quest="speed"')).toBeLessThan(html.indexOf('data-quest="focus"'));
  });

  it('offers Redeem only on rewards the sparks cover', () => {
    expect(inspector(props(80))).toContain('data-redeem="coffee"');
    expect(inspector(props(80))).not.toContain('data-redeem="walk"');
  });

  it('opens with the morning check-in when one is due', () => {
    const base = inspector({ summary: summarize(FRESH, NOW), rewards: [], redeemed: [], days: new Map(), now: NOW });
    expect(base).not.toContain('aria-label="Morning check-in"');
    const due = inspector({ summary: summarize(FRESH, NOW), rewards: [], redeemed: [], days: new Map(), now: NOW, checkIn: { now: NOW, mood: null, yesterday: [], open: [] } });
    expect(due.indexOf('Morning check-in')).toBeLessThan(due.indexOf('This week'));
  });

  it('leaves quests and rewards out while the check-in is due, and brings them back after', () => {
    const due = inspector({ summary: summarize(FRESH, NOW), rewards: [], redeemed: [], days: new Map(), now: NOW, checkIn: { now: NOW, mood: null, yesterday: [], open: [] } });
    expect(due).not.toContain('>Quests<');
    expect(due).not.toContain('Rewards you set');
    expect(due).toContain('This week’s challenge');
    expect(inspector({ summary: summarize(FRESH, NOW), rewards: [], redeemed: [], days: new Map(), now: NOW })).toContain('>Quests<');
  });
});

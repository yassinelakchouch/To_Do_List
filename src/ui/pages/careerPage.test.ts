import { describe, expect, it } from 'vitest';
import { ledger } from '../../core/earn';
import { FRESH, summarize } from '../../core/store';
import { careerPage } from './careerPage';

const NOW = new Date(2026, 10, 5, 12).getTime();
const page = (xp: number) => {
  const summary = summarize(FRESH, NOW);
  return careerPage({ ...summary, xp, standing: { ...summary.standing, ...(xp >= 1000 ? { tier: 2, name: 'Starter', next: 'Pro', toNext: 3000 - xp, share: (xp - 1000) / 2000 } : {}) } }, ledger({ tasks: [], checkIns: [] }).days, NOW);
};

describe('career page', () => {
  it('names the league and its chapter, and how far to the next', () => {
    const html = page(2140);
    expect(html).toContain('Starter, chapter 2');
    expect(html).toContain('860 XP to Pro');
  });

  it('draws the wide track for computers and the compact one for phones', () => {
    const html = page(0);
    expect(html.split('class="career-track"').length - 1).toBe(2);
    expect(html).toContain('hidden md:block');
    expect(html).toContain('md:hidden');
  });

  it('lists all four quests, the podium and the week', () => {
    const html = page(0);
    expect(html.split('class="quest-card').length - 1).toBe(4);
    expect(html).toContain('class="podium"');
    expect(html).toContain('class="week-chart"');
  });
});

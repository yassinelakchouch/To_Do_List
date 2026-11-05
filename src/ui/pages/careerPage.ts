import type { Day } from '../../core/earn';
import type { Summary } from '../../core/store';
import { questCard } from '../components/questCard';
import { weekChart, weekDays } from '../components/weekChart';
import { num } from '../html';
import { careerTrack } from '../parts/career';
import { podium } from '../parts/podium';

const CHAPTER: Record<string, string> = { Rookie: 'chapter 1', Starter: 'chapter 2', Pro: 'chapter 3', 'All-star': 'chapter 4', Legend: 'the last chapter' };
const heading = (text: string) => `<h2 class="font-mono text-[11px] font-normal text-muted">${text}</h2>`;

// Career (boards T-05 D, T-06): the track, then the quests beside your best days and the week. The wide track on computers, the compact one on phones.
export function careerPage(summary: Summary, days: Map<string, Day>, now: number): string {
  const { standing, xp } = summary;
  const next = standing.next ? `${num(standing.toNext)} XP to ${standing.next}` : 'every league reached';
  return `<section class="career grid gap-6 px-4 py-6 lg:px-7" aria-labelledby="career-title">
    <header class="grid gap-1.5"><h2 id="career-title" class="text-2xl font-semibold tracking-[-0.02em]">${standing.name}, ${CHAPTER[standing.name]}</h2><p class="font-mono text-xs text-muted">${next}</p></header>
    <div class="rounded-[10px] border border-line px-5 pt-4 pb-2">
      <div class="hidden md:block [&>svg]:h-auto [&>svg]:w-full">${careerTrack(xp, 1100)}</div>
      <div class="md:hidden [&>svg]:h-auto [&>svg]:w-full">${careerTrack(xp, 358, true)}</div>
    </div>
    <div class="grid gap-7 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div class="grid content-start gap-2">${heading('Quests')}${summary.quests.map((q) => questCard(q)).join('')}</div>
      <div class="grid content-start gap-3.5">${heading('Your best days · this month')}<div class="[&>svg]:h-auto [&>svg]:w-full">${podium(summary.best, 716, 1.25)}</div><hr class="border-line" />${heading('This week')}<div class="[&>svg]:h-auto [&>svg]:w-full">${weekChart(weekDays(days, now), 716, 64)}</div></div>
    </div>
  </section>`;
}

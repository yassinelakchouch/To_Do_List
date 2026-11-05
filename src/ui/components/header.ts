import type { Summary } from '../../core/store';
import { num } from '../html';
import { crest } from '../parts/crest';
import { dayPie, spark } from '../parts/marks';

// The header carries the day's pie, the league, XP and sparks; a chain multiplier rides on the sparks.
export function header(title: string, summary: Summary, chain = 1): string {
  const { today, standing } = summary;
  const chip = chain > 1 ? `<span class="chain rounded-full bg-accent px-1.5 font-mono text-[11px] text-ground">×${chain}</span>` : '';
  return `<header class="flex h-12 shrink-0 items-center gap-3 border-b border-line px-4 lg:px-[18px]">
    <h1 class="text-sm font-semibold">${title}</h1>
    <span class="flex items-center gap-2 text-cream">${dayPie(today.done, today.goal)}<span class="font-mono text-xs">${today.done}/${today.goal} today</span></span>
    <span class="flex-1"></span>
    <span class="hidden items-center gap-2 rounded-full border border-line py-1 pr-2.5 pl-1.5 text-[12.5px] sm:flex"><span class="text-cream">${crest(standing.tier, 18)}</span>${standing.name}</span>
    <span class="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[12.5px] sm:flex"><span class="text-[11px] text-muted">XP</span>${num(summary.xp)}</span>
    <span class="sparks flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[13px]" aria-label="${num(summary.sparks)} sparks">${spark(14)}<span>${num(summary.sparks)}</span>${chip}</span>
  </header>`;
}

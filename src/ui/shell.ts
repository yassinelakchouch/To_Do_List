import type { Summary } from '../core/store';
import { num } from './html';
import { crest } from './parts/crest';
import { icon, type IconName } from './parts/icons';
import { dayPie, spark } from './parts/marks';

export type Page = 'today' | 'upcoming' | 'career' | 'rewards' | 'done';

export const PAGES: { page: Page; label: string; icon: IconName }[] = [
  { page: 'today', label: 'Today', icon: 'sunrise' },
  { page: 'upcoming', label: 'Upcoming', icon: 'chain' },
  { page: 'career', label: 'Career', icon: 'bolt' },
  { page: 'rewards', label: 'Rewards', icon: 'cup' },
  { page: 'done', label: 'Done', icon: 'tray' },
];

export const pageFromHash = (hash: string): Page => PAGES.find((p) => `#/${p.page}` === hash)?.page ?? 'today';

// Linear's sidebar: the current page in orange (icon and number), the league line at the foot.
export function sidebar(active: Page, summary: Summary, counts: Partial<Record<Page, number>> = {}): string {
  const items = PAGES.map(({ page, label, icon: name }) => {
    const on = page === active;
    const count = counts[page] ? `<span class="font-mono text-[11px] text-muted">${counts[page]}</span>` : '';
    return `<a href="#/${page}" class="nav-item flex h-[30px] items-center gap-2.5 rounded-md px-2.5 text-[13px] ${on ? 'bg-raised text-cream' : 'text-body hover:bg-surface hover:text-cream'}"${on ? ' aria-current="page"' : ''}><span class="${on ? 'text-accent' : 'text-muted'}">${icon(name, 16)}</span><span class="flex-1">${label}</span>${count}</a>`;
  }).join('');
  const { standing } = summary;
  const share = standing.next ? Math.round(standing.share * 100) : 100;
  const next = standing.next ? `${num(summary.xp)} / ${num(summary.xp + standing.toNext)} XP` : `${num(summary.xp)} XP`;
  return `<nav class="sidebar hidden w-[220px] shrink-0 flex-col gap-[18px] border-r border-line px-2.5 py-3.5 lg:flex" aria-label="Pages">
    <div class="flex items-center gap-2 px-2.5 text-[13px] font-semibold"><span class="text-cream">${crest(standing.tier, 20)}</span>Yassine</div>
    <div class="grid gap-0.5">${items}</div>
    <div class="grid gap-2 px-2.5"><span class="font-mono text-[11px] text-muted">${standing.name} · ${next}</span><span class="h-[3px] rounded-full bg-track"><span class="block h-[3px] rounded-full bg-accent" style="width: ${share}%"></span></span></div>
  </nav>`;
}

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

// Phones: the five pages as a tab bar above the home indicator.
export function tabBar(active: Page): string {
  const tabs = PAGES.map(({ page, label, icon: name }) => {
    const on = page === active;
    return `<a href="#/${page}" class="grid min-h-11 min-w-11 justify-items-center gap-1 font-mono text-[10px] ${on ? 'text-cream' : 'text-muted'}"${on ? ' aria-current="page"' : ''}><span class="${on ? 'text-accent' : ''}">${icon(name, 20)}</span>${label}</a>`;
  }).join('');
  return `<nav class="tab-bar fixed inset-x-0 bottom-0 flex justify-around border-t border-line bg-ground pt-2 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden" aria-label="Pages">${tabs}</nav>`;
}

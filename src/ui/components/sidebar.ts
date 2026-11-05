import type { Summary } from '../../core/store';
import { esc, num } from '../html';
import { PAGES, type Page } from '../pages';
import { crest } from '../parts/crest';
import { icon } from '../parts/icons';

// Linear's sidebar: the current page in orange (icon and number), the league line at the foot.
export function sidebar(active: Page, summary: Summary, name = '', counts: Partial<Record<Page, number>> = {}): string {
  const items = PAGES.map(({ page, label, icon: name }) => {
    const on = page === active;
    const count = counts[page] ? `<span class="font-mono text-[11px] text-muted">${counts[page]}</span>` : '';
    return `<a href="#/${page}" class="nav-item flex h-[30px] items-center gap-2.5 rounded-md px-2.5 text-[13px] ${on ? 'bg-raised text-cream' : 'text-body hover:bg-surface hover:text-cream'}"${on ? ' aria-current="page"' : ''}><span class="${on ? 'text-accent' : 'text-muted'}">${icon(name, 16)}</span><span class="flex-1">${label}</span>${count}</a>`;
  }).join('');
  const { standing } = summary;
  const share = standing.next ? Math.round(standing.share * 100) : 100;
  const next = standing.next ? `${num(summary.xp)} / ${num(summary.xp + standing.toNext)} XP` : `${num(summary.xp)} XP`;
  return `<nav class="sidebar hidden w-[220px] shrink-0 flex-col gap-[18px] border-r border-line px-2.5 py-3.5 lg:flex" aria-label="Pages">
    <div class="flex items-center gap-2 px-2.5 text-[13px] font-semibold"><span class="text-cream">${crest(standing.tier, 20)}</span>${esc(name || 'You')}</div>
    <div class="grid gap-0.5">${items}</div>
    <div class="grid gap-2 px-2.5"><span class="font-mono text-[11px] text-muted">${standing.name} · ${next}</span><span class="h-[3px] rounded-full bg-track"><span class="block h-[3px] rounded-full bg-accent" style="width: ${share}%"></span></span></div>
  </nav>`;
}

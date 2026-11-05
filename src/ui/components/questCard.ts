import type { QuestProgress } from '../../core/quests';
import { esc } from '../html';
import { emblem } from '../parts/emblem';

const windowName = (window: string) => (window.length === 7 ? 'this month' : 'this week');

// A quest (Synergy's achievements, 1/5): the emblem with its fifths, the name and tier, what it counts, and what the next tier needs.
export function questCard(quest: QuestProgress, highlight = false): string {
  const next = quest.next === null ? 'all five tiers reached' : `${quest.count} of ${quest.next} for tier ${quest.tier + 1}`;
  return `<article class="quest-card grid grid-cols-[40px_1fr] items-center gap-3 rounded-lg border bg-surface px-3 py-2.5 ${highlight ? 'border-accent' : 'border-line'}" data-quest="${quest.id}">
    <span class="text-cream">${emblem(quest.id, quest.tier)}</span>
    <span class="grid min-w-0 gap-0.5">
      <span class="flex justify-between gap-2"><span class="text-sm">${esc(quest.name)}</span><span class="font-mono text-[11px] text-cream">${quest.tier}/5</span></span>
      <span class="truncate font-mono text-[11px] text-muted">${esc(quest.about)}, ${windowName(quest.window)}</span>
      <span class="font-mono text-[10.5px] text-muted">${next}</span>
    </span>
  </article>`;
}

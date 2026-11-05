import type { Day } from '../../core/earn';
import type { QuestId } from '../../core/quests';
import type { Redemption, Reward } from '../../core/rewards';
import { redeemedOn } from '../../core/rewards';
import type { Summary } from '../../core/store';
import { challengeCard } from './challengeCard';
import { checkInCard, type CheckInProps } from './checkInCard';
import { questCard } from './questCard';
import { rewardCard, rewardState } from './rewardCard';
import { pickPrompt } from './slotPicker';
import { weekChart, weekDays } from './weekChart';

export interface InspectorProps {
  summary: Summary;
  rewards: Reward[];
  redeemed: Redemption[];
  days: Map<string, Day>;
  now: number;
  highlight?: QuestId | null;
  checkIn?: CheckInProps | null;
}

const heading = (text: string) => `<h2 class="font-mono text-[11px] font-normal text-muted">${text}</h2>`;
const rule = '<hr class="border-line" />';

// Linear's right pane holds what belongs to the moment (boards T-04 A, T-05): the week's challenge, the next two quests,
// two rewards, and the week at the foot so the column is filled, not left half empty.
export function inspector({ summary, rewards, redeemed, days, now, highlight = null, checkIn = null }: InspectorProps): string {
  const quests = [...summary.quests].sort((a, b) => Number(b.id === highlight) - Number(a.id === highlight) || a.tier - b.tier).slice(0, 2);
  const shelf = rewards.slice(0, 2).map((r) => rewardCard(r, summary.sparks, rewardState(r.cost, summary.sparks, redeemedOn(redeemed, r.id, now)))).join('');
  return `<aside class="inspector hidden w-[340px] shrink-0 flex-col gap-3.5 border-l border-line p-[18px] min-[1100px]:flex" aria-label="Your progress">
    <div class="grid gap-3.5">${checkIn ? checkInCard(checkIn) : ''}${challengeCard(summary.challenge)}${rule}${heading('Quests')}${quests.map((q) => questCard(q, q.id === highlight)).join('')}${rule}${heading('Rewards you set')}${shelf || '<p class="text-sm text-muted">No rewards yet.</p>'}</div>
    <div class="mt-auto grid gap-3 border-t border-line pt-4">${heading('This week')}${weekChart(weekDays(days, now))}${pickPrompt()}</div>
  </aside>`;
}

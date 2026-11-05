import type { Reward } from '../../core/rewards';
import { esc } from '../html';
import { icon } from '../parts/icons';
import { spark } from '../parts/marks';
import { stamp } from '../parts/stamp';
import { progressBar } from './progressBar';

export type RewardState = 'saving' | 'ready' | 'redeemed';

export const rewardState = (cost: number, sparks: number, redeemedToday: boolean): RewardState => (redeemedToday ? 'redeemed' : sparks >= cost ? 'ready' : 'saving');

// A reward you set (Synergy's shop, made personal): saving shows what is left, ready offers Redeem, redeemed takes the stamp inside the card.
export function rewardCard(reward: Reward, sparks: number, state: RewardState): string {
  if (state === 'redeemed') {
    return `<article class="reward-card grid grid-cols-[minmax(0,1fr)_54px] items-center gap-3 rounded-lg border border-line py-2.5 pr-3 pl-3.5" data-reward="${esc(reward.id)}" data-state="redeemed">
      <span class="grid min-w-0 gap-2"><span class="flex min-w-0 items-center gap-2.5 text-muted">${icon(reward.icon, 22)}<span class="truncate text-sm">${esc(reward.name)}</span></span><span class="font-mono text-xs text-accent">enjoyed · today</span></span>${stamp()}
    </article>`;
  }
  const action =
    state === 'ready'
      ? `<button type="button" class="redeem inline-flex h-7 items-center rounded-full bg-cream px-3 font-mono text-xs text-ground" data-redeem="${esc(reward.id)}">Redeem<span class="sr-only"> ${esc(reward.name)} for ${reward.cost} sparks</span></button>`
      : `<span class="font-mono text-xs text-muted">${reward.cost - sparks} to go</span>`;
  return `<article class="reward-card grid gap-2.5 rounded-lg border bg-surface px-3.5 py-3 ${state === 'ready' ? 'border-accent' : 'border-line'}" data-reward="${esc(reward.id)}" data-state="${state}">
    <span class="flex min-w-0 items-center gap-2.5">${icon(reward.icon, 22)}<span class="min-w-0 flex-1 truncate text-sm">${esc(reward.name)}</span><span class="flex items-center gap-1 font-mono text-xs text-muted">${spark(11)}${reward.cost}</span></span>
    <span class="flex items-center justify-between gap-3">${progressBar(Math.min(sparks, reward.cost), reward.cost, `Saving for ${esc(reward.name)}`)}${action}</span>
  </article>`;
}

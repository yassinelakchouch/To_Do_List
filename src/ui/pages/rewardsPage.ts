import { redeemedOn, type Redemption, type Reward } from '../../core/rewards';
import { emptyState } from '../components/emptyState';
import { rewardCard, rewardState } from '../components/rewardCard';
import { rewardEditor, type RewardDraft } from '../components/rewardEditor';
import { esc, num } from '../html';
import { spark } from '../parts/marks';

interface RewardsPageProps {
  rewards: Reward[];
  redeemed: Redemption[];
  sparks: number;
  now: number;
  draft: RewardDraft | null;
}

// Rewards (board T-06 I and O): what you can spend, the shelf with an Edit on each card, and the editor above it while adding or editing.
export function rewardsPage({ rewards, redeemed, sparks, now, draft }: RewardsPageProps): string {
  const shelf = rewards
    .map((reward) => {
      const card = rewardCard(reward, sparks, rewardState(reward.cost, sparks, redeemedOn(redeemed, reward.id, now)));
      return `<li class="grid gap-1.5">${card}<button type="button" class="justify-self-end font-mono text-[11px] text-muted underline underline-offset-4 hover:text-cream" data-reward-edit="${esc(reward.id)}">Edit<span class="sr-only"> ${esc(reward.name)}</span></button></li>`;
    })
    .join('');
  const add = `<li><button type="button" class="grid h-[86px] w-full place-items-center rounded-lg border border-dashed border-line font-mono text-xs text-muted hover:border-outline hover:text-cream" data-reward-add>+ Add a reward</button></li>`;
  const body = rewards.length
    ? `<ul class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Rewards you set">${shelf}${add}</ul>`
    : `${emptyState({ variant: 'no-match', title: 'No rewards yet', text: 'Set a treat and its price; your sparks pay for it.', action: { label: 'Add a reward', action: 'reward-add' } })}`;
  return `<section class="rewards grid gap-5 px-4 py-6 lg:px-7" aria-labelledby="rewards-title">
    <header class="flex flex-wrap items-baseline justify-between gap-3"><h2 id="rewards-title" class="text-2xl font-semibold tracking-[-0.02em]">Rewards you <span class="font-serif font-normal italic">set</span></h2><p class="flex items-center gap-1.5 font-mono text-xs text-cream">${spark(13)}${num(sparks)} to spend · XP never goes down</p></header>
    ${draft ? rewardEditor(draft) : ''}${body}
  </section>`;
}

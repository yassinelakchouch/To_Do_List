import { COST, MAX_NAME, type RewardIcon } from '../../core/rewards';
import { esc } from '../html';
import { icon } from '../parts/icons';
import { spark } from '../parts/marks';

export interface RewardDraft {
  id: string | null;
  name: string;
  cost: number;
  icon: RewardIcon;
}

const ICONS: RewardIcon[] = ['cup', 'pad', 'book', 'walk', 'sunrise'];
const ICON_NAMES: Record<RewardIcon, string> = { cup: 'Cup', pad: 'Game pad', book: 'Book', walk: 'Walk', sunrise: 'Sunrise' };

// How much work a price stands for, in M tasks (20 sparks each): it helps set a fair price for a treat.
export const priceHint = (cost: number) => `≈ ${Math.max(1, Math.round(cost / 20))} M tasks`;

// Set up a reward (board T-06 I, "Set up a reward"): a name, a price on the 10-spark grid with − / +, and an icon; editing adds Delete.
export function rewardEditor(draft: RewardDraft): string {
  const step = (delta: number, label: string) =>
    `<button type="button" class="grid size-9 place-items-center rounded-lg border border-line font-mono text-cream" data-cost-step="${delta}" aria-label="${label}"${(delta < 0 ? draft.cost <= COST.min : draft.cost >= COST.max) ? ' disabled' : ''}>${delta < 0 ? '−' : '+'}</button>`;
  const icons = ICONS.map(
    (name) =>
      `<button type="button" class="grid size-10 place-items-center rounded-lg border ${name === draft.icon ? 'border-accent text-accent' : 'border-line text-cream'}" data-icon="${name}" aria-label="${ICON_NAMES[name]}" aria-pressed="${name === draft.icon}">${icon(name, 20)}</button>`,
  ).join('');
  return `<form class="reward-editor grid gap-4 rounded-[10px] border border-line bg-raised p-5" data-reward-form aria-labelledby="reward-editor-title">
    <h2 id="reward-editor-title" class="font-mono text-[11px] font-normal text-muted">${draft.id ? 'Edit reward' : 'New reward'}</h2>
    <label class="grid gap-1.5"><span class="font-mono text-[11px] text-muted">Name</span><input name="name" class="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-cream outline-none focus-visible:border-cream focus-visible:outline-none" maxlength="${MAX_NAME}" placeholder="A walk by the sea" value="${esc(draft.name)}" required /></label>
    <div class="grid gap-1.5"><span class="font-mono text-[11px] text-muted" id="price-label">Price</span><div class="flex items-center gap-3" role="group" aria-labelledby="price-label">${step(-COST.step, 'Lower the price')}<span class="flex min-w-16 items-center gap-1.5 text-lg font-semibold" aria-live="polite">${spark(14)}${draft.cost}</span>${step(COST.step, 'Raise the price')}<span class="font-mono text-[11px] text-muted">${priceHint(draft.cost)}</span></div></div>
    <div class="grid gap-1.5"><span class="font-mono text-[11px] text-muted" id="icon-label">Icon</span><div class="flex gap-2" role="group" aria-labelledby="icon-label">${icons}</div></div>
    <div class="flex flex-wrap gap-2.5"><button type="submit" class="inline-flex h-9 items-center rounded-full bg-cream px-4 font-mono text-xs text-ground">Save</button><button type="button" class="inline-flex h-9 items-center rounded-full border border-line px-4 font-mono text-xs text-cream" data-reward-cancel>Cancel</button>${draft.id ? `<button type="button" class="ml-auto inline-flex h-9 items-center rounded-full border border-line px-4 font-mono text-xs text-cream" data-reward-delete="${esc(draft.id)}">Delete</button>` : ''}</div>
  </form>`;
}

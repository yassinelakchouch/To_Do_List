import { PAY } from '../../core/earn';
import { MAX_TEXT, type Effort } from '../../core/tasks';
import { effortBars } from '../parts/marks';

export type ComposerState = 'idle' | 'empty';

export interface ComposerProps {
  effort: Effort;
  state?: ComposerState;
}

const SIZE = { 1: 'S', 2: 'M', 3: 'L' } as const;

export const effortHint = (effort: Effort) => `${SIZE[effort]} · pays ${PAY[effort]} · Tab to change`;

// The field is always first (boards T-02, T-05): C focuses it, Tab cycles S/M/L, ↵ adds; an empty ↵ answers under the field, not in a banner.
export function composer({ effort, state = 'idle' }: ComposerProps): string {
  const empty = state === 'empty';
  const message = empty
    ? `<p id="composer-message" class="mt-1.5 font-mono text-xs text-cream" role="alert"><span class="text-accent">!</span> Write a few words first; nothing was added.</p>`
    : `<p id="composer-message" class="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-muted"><span class="text-cream">${effortBars(effort, 14)}</span>${effortHint(effort)}</p>`;
  return `<form class="composer px-4 py-3 lg:px-[18px]" data-composer novalidate>
    <label class="flex h-[38px] items-center gap-3 rounded-lg border bg-surface px-3 max-lg:h-[52px] ${empty ? 'border-accent' : 'border-line focus-within:border-cream'}">
      <span class="w-4 text-center font-mono text-muted" aria-hidden="true">+</span>
      <span class="sr-only">Add a task</span>
      <input id="composer" name="text" class="min-w-0 flex-1 bg-transparent text-sm text-cream outline-none placeholder:text-muted" placeholder="Add a task…" autocomplete="off" maxlength="${MAX_TEXT}" aria-describedby="composer-message"${empty ? ' aria-invalid="true"' : ''} />
      <kbd class="rounded border border-line px-1.5 font-mono text-[11px] text-muted" aria-hidden="true">C</kbd>
    </label>${message}
  </form>`;
}

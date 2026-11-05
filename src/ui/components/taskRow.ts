import type { Label, Task } from '../../core/tasks';
import { esc } from '../html';
import { effortBars, spark, statusRing } from '../parts/marks';

export type RowState = 'default' | 'selected' | 'just-done';

export const LABELS: Record<Label, { name: string; dot: string }> = {
  work: { name: 'Work', dot: 'bg-accent' },
  home: { name: 'Home', dot: 'bg-cream' },
  health: { name: 'Health', dot: 'bg-muted' },
};

const EFFORT_NAME = { 1: 'S', 2: 'M', 3: 'L' } as const;

export interface RowProps {
  task: Task;
  state?: RowState;
  gain?: number;
  meta?: string;
}

const kbd = (key: string) => `<kbd class="rounded border border-line px-1.5 font-mono text-[11px] text-muted">${key}</kbd>`;

// One task row (boards T-05, T-06): effort bars, the ring as its own button, the text, then gain, keys, label or day.
// Selected is a lighter surface only, never a coloured edge.
export function taskRow({ task, state = 'default', gain, meta }: RowProps): string {
  const done = task.done;
  const label = task.label ? LABELS[task.label] : null;
  let right = '';
  if (gain) right += `<span class="gain flex items-center gap-1 font-mono text-xs text-accent">${spark(12)}+${gain}</span>`;
  if (state === 'selected') right += `<span class="hidden items-center gap-1 sm:flex">${kbd('X')}${kbd('E')}${kbd('⌫')}</span>`;
  else {
    if (label) right += `<span class="flex h-5 items-center gap-1.5 rounded-full border border-line px-2 font-mono text-[11px] text-muted"><span class="size-1.5 rounded-full ${label.dot}"></span>${label.name}</span>`;
    if (meta) right += `<span class="font-mono text-[11px] text-muted">${esc(meta)}</span>`;
  }
  const text = `<span class="min-w-0 flex-1 truncate text-[13.5px] ${done ? 'text-muted line-through' : 'text-cream'}">${esc(task.text)}</span>`;
  const ring = `<button type="button" class="ring grid size-6 shrink-0 place-items-center text-muted hover:text-cream" data-toggle="${esc(task.id)}" aria-label="${done ? 'Mark not done' : 'Mark done'}: ${esc(task.text)}" aria-pressed="${done}">${statusRing(done)}</button>`;
  return `<li class="task-row flex h-[38px] items-center gap-3 px-4 max-lg:h-[52px] lg:px-[18px] ${state === 'selected' ? 'bg-surface' : 'hover:bg-surface'}" data-id="${esc(task.id)}" data-state="${state}" aria-selected="${state === 'selected'}">
    <span class="text-cream" title="Effort ${EFFORT_NAME[task.effort]}">${effortBars(task.effort)}</span>${ring}${text}<span class="flex items-center gap-2.5">${right}</span>
  </li>`;
}

// A day group's heading: the name and how many tasks it holds.
export const groupHeading = (title: string, count: number) =>
  `<li class="flex h-8 items-center gap-2 border-b border-line px-4 text-[12.5px] text-body lg:px-[18px]" role="presentation">${esc(title)}<span class="font-mono text-[11px] text-muted">${count}</span></li>`;

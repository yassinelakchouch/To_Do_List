import { PAY } from '../../core/earn';
import type { Effort, Label, Task } from '../../core/tasks';
import { esc } from '../html';
import { shortDay } from '../parts/podium';
import { LABELS } from './taskRow';

interface TaskDetailProps {
  task: Task;
  today: string;
  days: string[];
}

const SIZE: Record<Effort, string> = { 1: 'S', 2: 'M', 3: 'L' };
const chip = (on: boolean, attrs: string, label: string, name = label) =>
  `<button type="button" class="inline-flex h-8 items-center rounded-full border px-3 font-mono text-xs ${on ? 'border-cream bg-cream text-ground' : 'border-line text-cream hover:border-outline'}" ${attrs} aria-pressed="${on}" aria-label="${esc(name)}">${label}</button>`;
const row = (title: string, body: string) => `<div class="grid gap-2" role="group" aria-label="${title}"><span class="font-mono text-[11px] text-muted">${title}</span><div class="flex flex-wrap gap-1.5">${body}</div></div>`;

// One task up close (board T-06 H, flow "Plan for later"): its size, label and day, then Move to Today and Delete.
export function taskDetail({ task, today, days }: TaskDetailProps): string {
  const sizes = ([1, 2, 3] as Effort[]).map((e) => chip(task.effort === e, `data-detail-effort="${e}"`, `${SIZE[e]} · ${PAY[e]}`, `Size ${SIZE[e]}, pays ${PAY[e]}`)).join('');
  const labels = [...(Object.keys(LABELS) as Label[]).map((l) => chip(task.label === l, `data-detail-label="${l}"`, LABELS[l].name)), chip(task.label === null, 'data-detail-label=""', 'None', 'No label')].join('');
  const dayChips = [today, ...days].map((d) => chip(task.day === d, `data-detail-day="${d}"`, d === today ? 'Today' : shortDay(d), d === today ? 'Today' : shortDay(d))).join('');
  const later = task.day > today;
  return `<section class="task-detail grid gap-4" aria-labelledby="task-detail-title">
    <span class="font-mono text-[11px] text-muted">Task</span>
    <h2 id="task-detail-title" class="text-base font-semibold">${esc(task.text)}</h2>
    ${row('Size', sizes)}${row('Label', labels)}${row('Day', dayChips)}
    <div class="flex flex-wrap gap-2">${later ? `<button type="button" class="inline-flex h-8 items-center gap-2 rounded-full bg-cream px-3 font-mono text-xs text-ground" data-detail-today aria-keyshortcuts="M">Move to Today <kbd class="opacity-60">M</kbd></button>` : ''}<button type="button" class="inline-flex h-8 items-center rounded-full border border-line px-3 font-mono text-xs text-cream" data-detail-delete>Delete</button></div>
  </section>`;
}

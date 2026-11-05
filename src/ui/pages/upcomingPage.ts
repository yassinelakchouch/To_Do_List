import { dayKey } from '../../core/earn';
import type { Effort, Task } from '../../core/tasks';
import { composer } from '../components/composer';
import { emptyState } from '../components/emptyState';
import { taskDetail } from '../components/taskDetail';
import { groupHeading, taskRow } from '../components/taskRow';
import { shortDay } from '../parts/podium';

// The days after today, for the detail's day chips and the groups' names.
export function nextDays(now: number, count = 7): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i + 1);
    return dayKey(d.getTime());
  });
}

export const upcomingTasks = (tasks: Task[], today: string) => tasks.filter((t) => !t.done && t.day > today).sort((a, b) => a.day.localeCompare(b.day));

export interface UpcomingPageProps {
  tasks: Task[];
  now: number;
  selected: string | null;
  effort: Effort;
}

// Upcoming (board T-06 H and N): add for tomorrow, tasks grouped by their day, and the selected task's detail beside them.
export function upcomingPage({ tasks, now, selected, effort }: UpcomingPageProps): string {
  const today = dayKey(now);
  const [tomorrow] = nextDays(now, 1);
  const later = upcomingTasks(tasks, today);
  const groups = new Map<string, Task[]>();
  for (const task of later) groups.set(task.day, [...(groups.get(task.day) ?? []), task]);
  const list = later.length
    ? `<ul class="task-list" aria-label="Upcoming">${[...groups]
        .map(([day, list]) => groupHeading(day === tomorrow ? `Tomorrow · ${shortDay(day)}` : shortDay(day), list.length) + list.map((task) => taskRow({ task, state: task.id === selected ? 'selected' : 'default' })).join(''))
        .join('')}</ul>`
    : `<div class="px-4 py-6 lg:px-[18px]">${emptyState({ variant: 'no-match', title: 'Nothing planned ahead', text: 'Add a task for tomorrow here, or press D on a task in Today.' })}</div>`;
  const chosen = later.find((t) => t.id === selected);
  const detail = chosen ? taskDetail({ task: chosen, today, days: nextDays(now) }) : `<p class="text-sm text-muted">Pick a task to change its size, label or day.</p>`;
  return `<div class="flex min-h-full">
    <div class="min-w-0 flex-1">${composer({ effort, placeholder: 'Add a task for tomorrow…' })}<div id="list">${list}</div>
      <div class="border-t border-line px-4 py-5 min-[1100px]:hidden">${chosen ? detail : ''}</div></div>
    <aside class="hidden w-[340px] shrink-0 border-l border-line p-[18px] min-[1100px]:block" aria-label="Task detail">${detail}</aside>
  </div>`;
}

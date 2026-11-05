import type { BestDay } from '../../core/bestDays';
import { dayKey, type Day } from '../../core/earn';
import type { Task } from '../../core/tasks';
import { daySummary } from '../components/daySummary';
import { emptyState } from '../components/emptyState';
import { groupHeading, taskRow } from '../components/taskRow';
import { shortDay } from '../parts/podium';

export interface DonePageProps {
  tasks: Task[];
  pay: Map<string, { amount: number }>;
  days: Map<string, Day>;
  best: BestDay[];
  goalFor: (day: string) => number;
  now: number;
}

// Done (board T-06 J and P): finished tasks by the day they were finished, newest first, each with what it earned;
// the latest day's summary beside them. A ring reopens a task, with Undo.
export function donePage({ tasks, pay, days, best, goalFor, now }: DonePageProps): string {
  const done = tasks.filter((t) => t.done && t.doneAt !== null).sort((a, b) => b.doneAt! - a.doneAt!);
  if (!done.length) return `<div class="px-4 py-6 lg:px-[18px]">${emptyState({ variant: 'no-match', title: 'Nothing finished yet', text: 'Tasks you tick land here, by the day you finished them.' })}</div>`;
  const today = dayKey(now);
  const byDay = new Map<string, Task[]>();
  for (const task of done) {
    const key = dayKey(task.doneAt!);
    byDay.set(key, [...(byDay.get(key) ?? []), task]);
  }
  const groups = [...byDay]
    .map(([day, list]) => {
      const title = `${day === today ? 'Today' : shortDay(day)} · ✦ ${days.get(day)?.earned ?? 0}`;
      return groupHeading(title, list.length) + list.map((task) => taskRow({ task, gain: pay.get(task.id)?.amount })).join('');
    })
    .join('');
  const latest = [...byDay.keys()][0];
  const place = best.findIndex((b) => b.day === latest);
  const summary = daySummary({ day: latest, facts: days.get(latest)!, goal: goalFor(latest), place: place === -1 ? null : place + 1 });
  return `<div class="flex min-h-full">
    <ul class="task-list min-w-0 flex-1 [&_.task-row_.gain]:text-muted" aria-label="Done">${groups}</ul>
    <aside class="hidden w-[340px] shrink-0 border-l border-line p-[18px] min-[1100px]:block" aria-label="The day">${summary}</aside>
  </div>`;
}

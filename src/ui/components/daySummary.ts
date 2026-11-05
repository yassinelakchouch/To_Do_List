import type { Day } from '../../core/earn';
import { shortDay } from '../parts/podium';
import { spark } from '../parts/marks';

interface DaySummaryProps {
  day: string;
  facts: Day;
  goal: number;
  place: number | null;
}

const line = (label: string, value: string) => `<dt class="font-mono text-[11px] text-muted">${label}</dt><dd class="text-[13px]">${value}</dd>`;

// One day looked back on (board T-06 J): what it earned, how many were done, the goal, the check-in, and its place this month.
export function daySummary({ day, facts, goal, place }: DaySummaryProps): string {
  const goalText = facts.goalMet ? `met · ${facts.done} of ${goal}` : `${facts.done} of ${goal}`;
  const placeText = place ? `<span class="text-accent">${place === 1 ? '1st' : place === 2 ? '2nd' : '3rd'} this month</span>` : 'not on the podium';
  return `<section class="day-summary grid gap-3.5" aria-label="Summary of ${shortDay(day)}">
    <h2 class="font-mono text-[11px] font-normal text-muted">${shortDay(day)}</h2>
    <p class="flex items-center gap-2 text-[26px] font-semibold tracking-[-0.02em]">${spark(18)}${facts.earned}<span class="text-base font-normal text-body">· ${facts.done} done</span></p>
    <dl class="grid grid-cols-[96px_1fr] gap-x-3 gap-y-2.5">${line('Goal', goalText)}${line('Check-in', facts.checkedIn ? 'yes · +15' : 'no')}${line('Best days', placeText)}</dl>
  </section>`;
}

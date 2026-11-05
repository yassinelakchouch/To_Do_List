import { dayKey } from './earn';

export type WeekStart = 0 | 1;

// From `since` weeks start on `start` (0 Sunday, 1 Monday); the days from `base` up to `since` stay one week.
export interface WeekRule {
  start: WeekStart;
  since: string;
  base: string;
}

const noon = (day: string) => new Date(`${day}T12:00:00`);
export const shiftDay = (day: string, n: number) => {
  const d = noon(day);
  d.setDate(d.getDate() + n);
  return dayKey(d.getTime());
};
const startOf = (day: string, start: WeekStart) => shiftDay(day, -((noon(day).getDay() - start + 7) % 7));

export const weekStart = (rules: WeekRule[]): WeekStart => rules.at(-1)?.start ?? 1;

// The first day of the week a day belongs to. Monday until a rule says otherwise; a rule only reaches forward,
// so the days already counted keep their week and points earned in past weeks never move.
export function weekKey(day: string, rules: WeekRule[] = []): string {
  for (let i = rules.length - 1; i >= 0; i--) {
    if (day >= rules[i].since) return startOf(day, rules[i].start);
    if (day >= rules[i].base) return rules[i].base;
  }
  return startOf(day, 1);
}

// The last day of that week: usually six days on, shorter or longer only in the week a change happens.
export function weekEnd(day: string, rules: WeekRule[] = []): string {
  const key = weekKey(day, rules);
  let end = day;
  while (weekKey(shiftDay(end, 1), rules) === key) end = shiftDay(end, 1);
  return end;
}

// A new first day starts at its next occurrence after today; a change not yet started is simply replaced.
export function changeWeekStart(rules: WeekRule[], start: WeekStart, now: number): WeekRule[] {
  const today = dayKey(now);
  const started = rules.filter((r) => r.since <= today);
  if (weekStart(started) === start) return started;
  let since = shiftDay(today, 1);
  while (noon(since).getDay() !== start) since = shiftDay(since, 1);
  return [...started, { start, since, base: weekKey(today, started) }];
}

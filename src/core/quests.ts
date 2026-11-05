import { dayKey } from './earn';
import type { Task } from './tasks';

export type Window = 'week' | 'month';

export const QUESTS = [
  { id: 'focus', name: 'Focus', about: 'finish big (L) tasks', window: 'month', tiers: [1, 3, 6, 10, 15] },
  { id: 'speed', name: 'Speed', about: 'done on the day you planned them', window: 'week', tiers: [3, 6, 10, 15, 21] },
  { id: 'rhythm', name: 'Rhythm', about: 'days with a task done', window: 'month', tiers: [3, 7, 14, 21, 28] },
  { id: 'early-start', name: 'Early start', about: 'check in before 9', window: 'week', tiers: [1, 2, 3, 4, 5] },
] as const satisfies readonly { id: string; name: string; about: string; window: Window; tiers: readonly number[] }[];

export type QuestId = (typeof QUESTS)[number]['id'];
export const TIER_XP = 25;
const EARLY_HOUR = 9;

export interface QuestProgress {
  id: QuestId;
  name: string;
  about: string;
  count: number;
  tier: number;
  next: number | null;
  window: string;
}

export interface QuestInput {
  tasks: Task[];
  checkInTimes: number[];
}

// Weeks start on Monday; the key is that Monday's day key. Months are keyed YYYY-MM.
export function windowKey(window: Window, ms: number): string {
  if (window === 'month') return dayKey(ms).slice(0, 7);
  const d = new Date(ms);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(d.getTime());
}

// What each quest counts, filed by the window it falls in.
function events(id: QuestId, { tasks, checkInTimes }: QuestInput): { at: number; key?: string }[] {
  const done = tasks.filter((t) => t.done && t.doneAt !== null);
  switch (id) {
    case 'focus':
      return done.filter((t) => t.effort === 3).map((t) => ({ at: t.doneAt! }));
    case 'speed':
      return done.filter((t) => dayKey(t.doneAt!) === t.day).map((t) => ({ at: t.doneAt! }));
    case 'rhythm':
      return [...new Map(done.map((t) => [dayKey(t.doneAt!), t.doneAt!])).values()].map((at) => ({ at }));
    case 'early-start':
      return checkInTimes.filter((at) => new Date(at).getHours() < EARLY_HOUR).map((at) => ({ at, key: dayKey(at) }));
  }
}

function counts(quest: (typeof QUESTS)[number], input: QuestInput): Map<string, number> {
  const byWindow = new Map<string, Set<string>>();
  events(quest.id, input).forEach((event, i) => {
    const key = windowKey(quest.window, event.at);
    const seen = byWindow.get(key) ?? byWindow.set(key, new Set()).get(key)!;
    seen.add(event.key ?? String(i));
  });
  return new Map([...byWindow].map(([key, seen]) => [key, seen.size]));
}

const tierOf = (tiers: readonly number[], count: number) => tiers.filter((need) => count >= need).length;

export function questProgress(input: QuestInput, now: number): QuestProgress[] {
  return QUESTS.map((quest) => {
    const window = windowKey(quest.window, now);
    const count = counts(quest, input).get(window) ?? 0;
    const tier = tierOf(quest.tiers, count);
    return { id: quest.id, name: quest.name, about: quest.about, count, tier, next: quest.tiers[tier] ?? null, window };
  });
}

// Tiers reached in every window so far, each worth 25 XP: XP never drops when a new week or month starts.
export function questXp(input: QuestInput): number {
  return QUESTS.reduce((sum, quest) => sum + [...counts(quest, input).values()].reduce((s, count) => s + tierOf(quest.tiers, count) * TIER_XP, 0), 0);
}

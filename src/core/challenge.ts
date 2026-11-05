import { dayKey, ledger, type EarnInput } from './earn';
import { windowKey } from './quests';
import { weekEnd, type WeekRule } from './weeks';

const CHALLENGE_XP = 50;
const WEEK_MS = 7 * 86_400_000;

interface WeekFacts {
  bigDone: number;
  done: number;
  checkIns: number;
  goalDays: number;
}

export const CHALLENGES = [
  { id: 'three-l', title: 'Finish three L tasks', need: 3, count: (w: WeekFacts) => w.bigDone },
  { id: 'fifteen', title: 'Tick fifteen tasks', need: 15, count: (w: WeekFacts) => w.done },
  { id: 'five-mornings', title: 'Check in five mornings', need: 5, count: (w: WeekFacts) => w.checkIns },
  { id: 'goal-thrice', title: 'Meet your goal on three days', need: 3, count: (w: WeekFacts) => w.goalDays },
] as const;

export interface Challenge {
  id: (typeof CHALLENGES)[number]['id'];
  title: string;
  have: number;
  need: number;
  met: boolean;
  endsOn: string;
}

// The week's index from its first day, in whole UTC days so a clock change can't skip a challenge.
function weekIndex(first: string): number {
  const [y, m, d] = first.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / WEEK_MS);
}

const challengeFor = (first: string) => CHALLENGES[((weekIndex(first) % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];

function facts(input: EarnInput, rules: WeekRule[]): Map<string, WeekFacts> {
  const weeks = new Map<string, WeekFacts>();
  const week = (key: string) => weeks.get(key) ?? weeks.set(key, { bigDone: 0, done: 0, checkIns: 0, goalDays: 0 }).get(key)!;
  const atNoon = (day: string) => new Date(`${day}T12:00:00`).getTime();
  for (const task of input.tasks) {
    if (!task.done || task.doneAt === null) continue;
    const w = week(windowKey('week', task.doneAt, rules));
    w.done += 1;
    if (task.effort === 3) w.bigDone += 1;
  }
  for (const day of new Set(input.checkIns)) week(windowKey('week', atNoon(day), rules)).checkIns += 1;
  for (const [day, d] of ledger(input).days) if (d.goalMet) week(windowKey('week', atNoon(day), rules)).goalDays += 1;
  return weeks;
}

// One challenge a week, the same for everyone with the same calendar, new on the week's first day.
export function weeklyChallenge(input: EarnInput, now: number, weeks: WeekRule[] = []): Challenge {
  const first = windowKey('week', now, weeks);
  const challenge = challengeFor(first);
  const have = Math.min(challenge.count(facts(input, weeks).get(first) ?? { bigDone: 0, done: 0, checkIns: 0, goalDays: 0 }), challenge.need);
  return { id: challenge.id, title: challenge.title, have, need: challenge.need, met: have >= challenge.need, endsOn: weekEnd(dayKey(now), weeks) };
}

// Every week's challenge that was met pays 50 XP, past weeks included.
export function challengeXp(input: EarnInput, weeks: WeekRule[] = []): number {
  return [...facts(input, weeks)].reduce((sum, [first, w]) => {
    const challenge = challengeFor(first);
    return sum + (challenge.count(w) >= challenge.need ? CHALLENGE_XP : 0);
  }, 0);
}

import type { Effort, Task } from './tasks';

export const PAY: Record<Effort, number> = { 1: 10, 2: 20, 3: 30 };
export const CHAIN_MS = 90_000;
const CHAIN_CAP = 3;
export const CHECK_IN_XP = 15;
const GOAL_XP = 20;
const DEFAULT_GOAL = 5;

export interface Day {
  done: number;
  earned: number;
  goalMet: boolean;
  checkedIn: boolean;
}

// `earned` counts as both XP and sparks; quest tiers add XP only and redeeming spends sparks only (later modules).
interface Ledger {
  earned: number;
  pay: Map<string, { amount: number; chain: number }>;
  days: Map<string, Day>;
}

export interface EarnInput {
  tasks: Task[];
  checkIns: string[];
  goals?: Record<string, number>;
  defaultGoal?: number;
}

export const dayKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Everything is worked out from the list itself, so un-ticking or undoing takes the points back with no bookkeeping.
export function ledger({ tasks, checkIns, goals = {}, defaultGoal = DEFAULT_GOAL }: EarnInput): Ledger {
  const done = tasks.filter((t) => t.done && t.doneAt !== null).sort((a, b) => a.doneAt! - b.doneAt!);
  const pay = new Map<string, { amount: number; chain: number }>();
  const days = new Map<string, Day>();
  const dayOf = (key: string) => days.get(key) ?? days.set(key, { done: 0, earned: 0, goalMet: false, checkedIn: false }).get(key)!;

  let chain = 0;
  let last = -Infinity;
  for (const task of done) {
    chain = task.doneAt! - last <= CHAIN_MS ? Math.min(chain + 1, CHAIN_CAP) : 1;
    last = task.doneAt!;
    const amount = PAY[task.effort] * chain;
    pay.set(task.id, { amount, chain });
    const day = dayOf(dayKey(task.doneAt!));
    day.done += 1;
    day.earned += amount;
  }

  for (const key of new Set(checkIns)) {
    const day = dayOf(key);
    day.checkedIn = true;
    day.earned += CHECK_IN_XP;
  }

  for (const [key, day] of days) {
    if (day.done >= (goals[key] ?? defaultGoal)) {
      day.goalMet = true;
      day.earned += GOAL_XP;
    }
  }

  const earned = [...days.values()].reduce((sum, day) => sum + day.earned, 0);
  return { earned, pay, days };
}

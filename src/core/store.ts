import { bestDays } from './bestDays';
import { challengeXp, weeklyChallenge, type Challenge } from './challenge';
import { dayKey, ledger, type EarnInput } from './earn';
import { standing, type Standing } from './leagues';
import { questProgress, questXp, type QuestProgress } from './quests';
import { reduceRewards, spent, SUGGESTED, type Redemption, type Reward, type RewardAction } from './rewards';
import { SAMPLES } from './samples';
import { reduceTasks, type Task, type TaskAction } from './tasks';

export type Mood = 'storm' | 'rain' | 'cloud' | 'sun';
export type Goal = 3 | 5 | 8;

export interface CheckIn {
  day: string;
  at: number;
  mood: Mood;
  blocker: string;
}

export interface Settings {
  name: string;
  onboarded: boolean;
  goal: Goal;
  checkIn: boolean;
  sound: boolean;
  motion: boolean;
}

export interface AppState {
  tasks: Task[];
  rewards: Reward[];
  redeemed: Redemption[];
  checkIns: CheckIn[];
  goals: Record<string, Goal>;
  settings: Settings;
}

export interface Store {
  state: AppState;
  past: AppState[];
}

export type AppAction =
  | { type: 'task'; action: TaskAction }
  | { type: 'reward'; action: RewardAction }
  | { type: 'check-in'; at: number; mood: Mood; blocker?: string }
  | { type: 'goal'; day: string; goal: Goal }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'samples'; day: string; ids: string[] }
  | { type: 'undo' }
  | { type: 'reset' };

const UNDO_DEPTH = 30;
export const MAX_NAME = 24;

// A name is kept as typed, tidied: spaces folded, 24 characters at most; empty means "you".
export const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME);

export const FRESH: AppState = {
  tasks: [],
  rewards: SUGGESTED,
  redeemed: [],
  checkIns: [],
  goals: {},
  settings: { name: '', onboarded: false, goal: 5, checkIn: true, sound: true, motion: true },
};

export const createStore = (state: AppState = FRESH): Store => ({ state, past: [] });

function next(state: AppState, action: Exclude<AppAction, { type: 'undo' } | { type: 'reset' }>): AppState {
  switch (action.type) {
    case 'task': {
      const tasks = reduceTasks(state.tasks, action.action);
      return tasks === state.tasks ? state : { ...state, tasks };
    }
    case 'reward': {
      const redeem = action.action.type === 'redeem' ? { ...action.action, sparks: summarize(state, action.action.at).sparks } : action.action;
      const result = reduceRewards({ rewards: state.rewards, redeemed: state.redeemed }, redeem);
      return result.rewards === state.rewards && result.redeemed === state.redeemed ? state : { ...state, ...result };
    }
    case 'check-in': {
      const day = dayKey(action.at);
      if (state.checkIns.some((c) => c.day === day)) return state;
      return { ...state, checkIns: [...state.checkIns, { day, at: action.at, mood: action.mood, blocker: (action.blocker ?? '').trim().slice(0, 80) }] };
    }
    case 'samples':
      return { ...state, tasks: SAMPLES.reduce((tasks, sample, i) => reduceTasks(tasks, { type: 'add', id: action.ids[i], text: sample.text, day: action.day, effort: sample.effort, label: sample.label }), state.tasks) };
    case 'goal':
      return state.goals[action.day] === action.goal ? state : { ...state, goals: { ...state.goals, [action.day]: action.goal } };
    case 'settings': {
      const patch = action.patch.name === undefined ? action.patch : { ...action.patch, name: cleanName(action.patch.name) };
      return { ...state, settings: { ...state.settings, ...patch } };
    }
  }
}

// One history for the whole app: Z undoes the last tick, edit, redeem or check-in alike. Settings never enter it.
export function dispatch(store: Store, action: AppAction): Store {
  if (action.type === 'undo') {
    if (!store.past.length) return store;
    // The snapshot predates later setting changes; the current settings stay.
    return { state: { ...store.past[store.past.length - 1], settings: store.state.settings }, past: store.past.slice(0, -1) };
  }
  if (action.type === 'reset') return createStore();
  const state = next(store.state, action);
  if (state === store.state) return store;
  if (action.type === 'settings') return { ...store, state };
  return { state, past: [...store.past, store.state].slice(-UNDO_DEPTH) };
}

export interface Summary {
  xp: number;
  sparks: number;
  standing: Standing;
  today: { done: number; goal: Goal; goalMet: boolean; checkedIn: boolean };
  quests: QuestProgress[];
  challenge: Challenge;
  best: { day: string; earned: number }[];
}

const earnInput = (state: AppState): EarnInput => ({ tasks: state.tasks, checkIns: state.checkIns.map((c) => c.day), goals: state.goals, defaultGoal: state.settings.goal });

// Everything the header, the inspector and Career show, worked out from the state; nothing is stored twice.
export function summarize(state: AppState, now: number): Summary {
  const input = earnInput(state);
  const questInput = { tasks: state.tasks, checkInTimes: state.checkIns.map((c) => c.at) };
  const book = ledger(input);
  const xp = book.earned + questXp(questInput) + challengeXp(input);
  const today = dayKey(now);
  const day = book.days.get(today);
  return {
    xp,
    sparks: book.earned - spent(state.redeemed),
    standing: standing(xp),
    today: { done: day?.done ?? 0, goal: state.goals[today] ?? state.settings.goal, goalMet: day?.goalMet ?? false, checkedIn: day?.checkedIn ?? false },
    quests: questProgress(questInput, now),
    challenge: weeklyChallenge(input, now),
    best: bestDays(input, now),
  };
}

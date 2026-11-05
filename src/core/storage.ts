import { FRESH, type AppState } from './store';

export const KEY = 'todo-project003';
export const VERSION = 1;

export type LoadStatus = 'fresh' | 'loaded' | 'blocked' | 'unreadable';

interface Saved {
  version: number;
  state: AppState;
}

type Area = Pick<Storage, 'getItem' | 'setItem'>;

// Private windows and blocked site data throw on access: the list then lasts until the tab closes, and the page says so once.
function area(): Area | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const isState = (value: unknown): value is AppState => {
  const s = value as AppState;
  return !!s && Array.isArray(s.tasks) && Array.isArray(s.rewards) && Array.isArray(s.redeemed) && Array.isArray(s.checkIns) && typeof s.goals === 'object' && typeof s.settings === 'object';
};

export function load(storage: Area | null = area()): { state: AppState; status: LoadStatus } {
  let raw: string | null;
  try {
    if (!storage) return { state: FRESH, status: 'blocked' };
    raw = storage.getItem(KEY);
  } catch {
    return { state: FRESH, status: 'blocked' };
  }
  if (raw === null) return { state: FRESH, status: 'fresh' };
  try {
    const saved = JSON.parse(raw) as Saved;
    if (saved.version !== VERSION || !isState(saved.state)) return { state: FRESH, status: 'unreadable' };
    // Settings added in a later release fall back to their defaults.
    return { state: { ...saved.state, settings: { ...FRESH.settings, ...saved.state.settings } }, status: 'loaded' };
  } catch {
    return { state: FRESH, status: 'unreadable' };
  }
}

export function save(state: AppState, storage: Area | null = area()): boolean {
  try {
    storage?.setItem(KEY, JSON.stringify({ version: VERSION, state } satisfies Saved));
    return !!storage;
  } catch {
    return false;
  }
}

// The file the Settings sheet hands over: readable JSON with the date it was taken.
export function exportJson(state: AppState, now: number): string {
  return JSON.stringify({ app: KEY, version: VERSION, exportedAt: new Date(now).toISOString(), state }, null, 2);
}

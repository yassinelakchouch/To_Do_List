import { describe, expect, it } from 'vitest';
import { exportJson, KEY, load, save, VERSION } from './storage';
import { createStore, dispatch, FRESH } from './store';

const memory = () => {
  const items = new Map<string, string>();
  return { getItem: (k: string) => items.get(k) ?? null, setItem: (k: string, v: string) => void items.set(k, v), items };
};
const blocked = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};
const withTask = dispatch(createStore(), { type: 'task', action: { type: 'add', id: 'a', text: 'Buy coffee beans', day: '2026-11-05' } }).state;

describe('saving and loading', () => {
  it('starts fresh when nothing was saved', () => {
    expect(load(memory())).toEqual({ state: FRESH, status: 'fresh' });
  });

  it('brings back what was saved', () => {
    const area = memory();
    expect(save(withTask, area)).toBe(true);
    expect(load(area)).toEqual({ state: withTask, status: 'loaded' });
  });

  it('fills settings added later with their defaults', () => {
    const area = memory();
    const old = { ...withTask, settings: { goal: 8 } };
    area.setItem(KEY, JSON.stringify({ version: VERSION, state: old }));
    expect(load(area).state.settings).toEqual({ ...FRESH.settings, goal: 8 });
  });

  it('starts fresh, and says so, when storage is blocked or the save is unreadable', () => {
    expect(load(blocked)).toEqual({ state: FRESH, status: 'blocked' });
    expect(load(null).status).toBe('blocked');
    expect(save(withTask, blocked)).toBe(false);
    for (const raw of ['{not json', JSON.stringify({ version: 99, state: withTask }), JSON.stringify({ version: VERSION, state: { tasks: 'x' } })]) {
      const area = memory();
      area.setItem(KEY, raw);
      expect(load(area).status).toBe('unreadable');
    }
  });
});

describe('export', () => {
  it('hands over readable JSON with the app, version and date', () => {
    const file = JSON.parse(exportJson(withTask, new Date(Date.UTC(2026, 10, 5, 12)).getTime()));
    expect(file).toMatchObject({ app: KEY, version: VERSION, exportedAt: '2026-11-05T12:00:00.000Z' });
    expect(file.state.tasks[0].text).toBe('Buy coffee beans');
  });
});

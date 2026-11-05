import { describe, expect, it } from 'vitest';
import { createStore, dispatch, FRESH, summarize, type AppAction, type Store } from './store';

const at = (date: number, hour = 10, minute = 0) => new Date(2026, 10, date, hour, minute).getTime();
const NOW = at(5, 18);
const run = (...actions: AppAction[]) => actions.reduce<Store>(dispatch, createStore());
const add = (id: string, effort: 1 | 2 | 3 = 1): AppAction => ({ type: 'task', action: { type: 'add', id, text: id, day: '2026-11-05', effort } });
const tick = (id: string, when: number): AppAction => ({ type: 'task', action: { type: 'toggle', id, at: when } });

describe('the store', () => {
  it('starts with the three suggested rewards and the default settings', () => {
    expect(FRESH.rewards).toHaveLength(3);
    expect(FRESH.settings).toEqual({ goal: 5, checkIn: true, sound: true, motion: true });
  });

  it('keeps the same store for a refused change, so nothing redraws', () => {
    const store = createStore();
    expect(dispatch(store, { type: 'task', action: { type: 'add', id: 'a', text: '  ', day: '2026-11-05' } })).toBe(store);
  });

  it('checks in once a day, with the mood and a short blocker', () => {
    const store = run({ type: 'check-in', at: at(5, 8), mood: 'sun', blocker: '  waiting on the client  ' }, { type: 'check-in', at: at(5, 9), mood: 'rain' });
    expect(store.state.checkIns).toEqual([{ day: '2026-11-05', at: at(5, 8), mood: 'sun', blocker: 'waiting on the client' }]);
  });
});

describe('one undo for everything', () => {
  it('undoes a tick, a redeem and a check-in in turn, and leaves settings alone', () => {
    let store = run(add('a', 3), add('b', 3), tick('a', at(5, 9)), tick('b', at(5, 11)), { type: 'check-in', at: at(5, 8), mood: 'cloud' });
    store = dispatch(store, { type: 'reward', action: { type: 'redeem', id: 'r1', rewardId: 'coffee', at: at(5, 12), sparks: 0 } });
    store = dispatch(store, { type: 'settings', patch: { sound: false } });
    expect(store.state.redeemed).toHaveLength(1);

    store = dispatch(store, { type: 'undo' });
    expect(store.state.redeemed).toHaveLength(0);
    expect(store.state.settings.sound).toBe(false);
    store = dispatch(store, { type: 'undo' });
    expect(store.state.checkIns).toHaveLength(0);
    store = dispatch(store, { type: 'undo' });
    expect(store.state.tasks.find((t) => t.id === 'b')!.done).toBe(false);
  });

  it('does nothing when there is nothing to undo, and keeps 30 steps', () => {
    const store = createStore();
    expect(dispatch(store, { type: 'undo' })).toBe(store);
    const many = run(...Array.from({ length: 40 }, (_, i) => add(`t${i}`)));
    expect(many.past).toHaveLength(30);
  });

  it('resets to a fresh start with no history', () => {
    const store = dispatch(run(add('a')), { type: 'reset' });
    expect(store).toEqual(createStore());
  });
});

describe('the summary', () => {
  it('adds quest and challenge XP to what was earned; sparks are earned minus spent', () => {
    let store = run(add('a', 3), add('b', 1), tick('a', at(5, 9)), tick('b', at(5, 9, 1)), { type: 'check-in', at: at(5, 8), mood: 'sun' });
    // a: L 30 · b: S ×2 = 20 · check-in 15 → earned 65; Focus tier 1 +25; Early start tier 1 +25; Speed: 2 on their day, none yet.
    expect(summarize(store.state, NOW)).toMatchObject({ xp: 115, sparks: 65, today: { done: 2, goal: 5, goalMet: false, checkedIn: true } });
    store = dispatch(store, { type: 'reward', action: { type: 'redeem', id: 'r1', rewardId: 'coffee', at: at(5, 12), sparks: 0 } });
    expect(summarize(store.state, NOW)).toMatchObject({ xp: 115, sparks: 5 });
  });

  it('refuses a redeem the sparks can’t cover, whatever the caller claims', () => {
    const store = run(add('a'), tick('a', at(5, 9)));
    expect(dispatch(store, { type: 'reward', action: { type: 'redeem', id: 'r1', rewardId: 'coffee', at: at(5, 12), sparks: 9999 } })).toBe(store);
  });

  it('uses the day’s own goal when one was set', () => {
    const store = run({ type: 'goal', day: '2026-11-05', goal: 3 });
    expect(summarize(store.state, NOW).today.goal).toBe(3);
  });
});

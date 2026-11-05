import { describe, expect, it } from 'vitest';
import { EMPTY_TASKS, isTaskText, MAX_TEXT, reduceTasks, type TaskAction, type TaskState } from './tasks';

const DAY = '2026-11-05';
const run = (...actions: TaskAction[]) => actions.reduce<TaskState>(reduceTasks, EMPTY_TASKS);
const add = (id: string, text: string, extra: Partial<Extract<TaskAction, { type: 'add' }>> = {}): TaskAction => ({ type: 'add', id, text, day: DAY, ...extra });

describe('adding', () => {
  it('trims and folds spaces, and starts small, unlabelled and not done', () => {
    const { tasks } = run(add('a', '  Buy   coffee beans  '));
    expect(tasks).toEqual([{ id: 'a', text: 'Buy coffee beans', effort: 1, label: null, day: DAY, done: false, doneAt: null }]);
  });

  it('keeps the effort and label given', () => {
    expect(run(add('a', 'Write the case study', { effort: 3, label: 'work' })).tasks[0]).toMatchObject({ effort: 3, label: 'work' });
  });

  it('refuses text without a letter or digit, and returns the same state', () => {
    for (const text of ['', '   ', '...', '—']) expect(reduceTasks(EMPTY_TASKS, add('a', text))).toBe(EMPTY_TASKS);
    expect(isTaskText('Call mum')).toBe(true);
    expect(isTaskText('٣')).toBe(true);
  });

  it(`cuts text at ${MAX_TEXT} characters`, () => {
    expect(run(add('a', 'x'.repeat(200))).tasks[0].text).toHaveLength(MAX_TEXT);
  });

  it('ignores an id that already exists', () => {
    const once = run(add('a', 'First'));
    expect(reduceTasks(once, add('a', 'Again'))).toBe(once);
  });
});

describe('changing', () => {
  const base = run(add('a', 'Reply to the client'), add('b', 'Gym'));

  it('toggles done with the time, and back', () => {
    const done = reduceTasks(base, { type: 'toggle', id: 'a', at: 1000 });
    expect(done.tasks[0]).toMatchObject({ done: true, doneAt: 1000 });
    expect(reduceTasks(done, { type: 'toggle', id: 'a', at: 2000 }).tasks[0]).toMatchObject({ done: false, doneAt: null });
  });

  it('edits text, refusing empty or unchanged text', () => {
    expect(reduceTasks(base, { type: 'edit', id: 'a', text: 'Reply about the deck' }).tasks[0].text).toBe('Reply about the deck');
    expect(reduceTasks(base, { type: 'edit', id: 'a', text: '  ' })).toBe(base);
    expect(reduceTasks(base, { type: 'edit', id: 'a', text: 'Reply to the client' })).toBe(base);
  });

  it('changes effort and day, and removes', () => {
    expect(reduceTasks(base, { type: 'effort', id: 'b', effort: 2 }).tasks[1].effort).toBe(2);
    expect(reduceTasks(base, { type: 'move', id: 'b', day: '2026-11-08' }).tasks[1].day).toBe('2026-11-08');
    expect(reduceTasks(base, { type: 'remove', id: 'a' }).tasks.map((t) => t.id)).toEqual(['b']);
  });

  it('returns the same state for an unknown id', () => {
    for (const action of [{ type: 'toggle', id: 'z', at: 1 }, { type: 'remove', id: 'z' }, { type: 'move', id: 'z', day: DAY }] as TaskAction[]) {
      expect(reduceTasks(base, action)).toBe(base);
    }
  });
});

describe('undo', () => {
  it('puts back each step in turn, then does nothing', () => {
    let state = run(add('a', 'One'), add('b', 'Two'), { type: 'toggle', id: 'a', at: 5 }, { type: 'remove', id: 'b' });
    state = reduceTasks(state, { type: 'undo' });
    expect(state.tasks.map((t) => t.id)).toEqual(['a', 'b']);
    state = reduceTasks(state, { type: 'undo' });
    expect(state.tasks[0].done).toBe(false);
    state = reduceTasks(reduceTasks(state, { type: 'undo' }), { type: 'undo' });
    expect(state.tasks).toEqual([]);
    expect(reduceTasks(state, { type: 'undo' })).toBe(state);
  });

  it('keeps the last 30 steps', () => {
    const many = Array.from({ length: 40 }, (_, i) => add(`t${i}`, `Task ${i}`));
    expect(run(...many).past).toHaveLength(30);
  });
});

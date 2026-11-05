import { describe, expect, it } from 'vitest';
import { isTaskText, MAX_TEXT, reduceTasks, type Task, type TaskAction } from './tasks';

const DAY = '2026-11-05';
const NONE: Task[] = [];
const run = (...actions: TaskAction[]) => actions.reduce<Task[]>(reduceTasks, NONE);
const add = (id: string, text: string, extra: Partial<Extract<TaskAction, { type: 'add' }>> = {}): TaskAction => ({ type: 'add', id, text, day: DAY, ...extra });

describe('adding', () => {
  it('trims and folds spaces, and starts small, unlabelled and not done', () => {
    const tasks = run(add('a', '  Buy   coffee beans  '));
    expect(tasks).toEqual([{ id: 'a', text: 'Buy coffee beans', effort: 1, label: null, day: DAY, done: false, doneAt: null }]);
  });

  it('keeps the effort and label given', () => {
    expect(run(add('a', 'Write the case study', { effort: 3, label: 'work' }))[0]).toMatchObject({ effort: 3, label: 'work' });
  });

  it('refuses text without a letter or digit, and returns the same state', () => {
    for (const text of ['', '   ', '...', '—']) expect(reduceTasks(NONE, add('a', text))).toBe(NONE);
    expect(isTaskText('Call mum')).toBe(true);
    expect(isTaskText('٣')).toBe(true);
  });

  it(`cuts text at ${MAX_TEXT} characters`, () => {
    expect(run(add('a', 'x'.repeat(200)))[0].text).toHaveLength(MAX_TEXT);
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
    expect(done[0]).toMatchObject({ done: true, doneAt: 1000 });
    expect(reduceTasks(done, { type: 'toggle', id: 'a', at: 2000 })[0]).toMatchObject({ done: false, doneAt: null });
  });

  it('edits text, refusing empty or unchanged text', () => {
    expect(reduceTasks(base, { type: 'edit', id: 'a', text: 'Reply about the deck' })[0].text).toBe('Reply about the deck');
    expect(reduceTasks(base, { type: 'edit', id: 'a', text: '  ' })).toBe(base);
    expect(reduceTasks(base, { type: 'edit', id: 'a', text: 'Reply to the client' })).toBe(base);
  });

  it('changes effort and day, and removes', () => {
    expect(reduceTasks(base, { type: 'effort', id: 'b', effort: 2 })[1].effort).toBe(2);
    expect(reduceTasks(base, { type: 'move', id: 'b', day: '2026-11-08' })[1].day).toBe('2026-11-08');
    expect(reduceTasks(base, { type: 'remove', id: 'a' }).map((t) => t.id)).toEqual(['b']);
  });

  it('returns the same state for an unknown id', () => {
    for (const action of [{ type: 'toggle', id: 'z', at: 1 }, { type: 'remove', id: 'z' }, { type: 'move', id: 'z', day: DAY }] as TaskAction[]) {
      expect(reduceTasks(base, action)).toBe(base);
    }
  });
});

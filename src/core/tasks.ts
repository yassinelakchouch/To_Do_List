export type Effort = 1 | 2 | 3;
export type Label = 'work' | 'home' | 'health';

export interface Task {
  id: string;
  text: string;
  effort: Effort;
  label: Label | null;
  day: string;
  done: boolean;
  doneAt: number | null;
}

export type TaskAction =
  | { type: 'add'; id: string; text: string; day: string; effort?: Effort; label?: Label | null }
  | { type: 'toggle'; id: string; at: number }
  | { type: 'edit'; id: string; text: string }
  | { type: 'effort'; id: string; effort: Effort }
  | { type: 'move'; id: string; day: string }
  | { type: 'remove'; id: string };

export const MAX_TEXT = 140;

// A task needs a letter or a digit: the 2022 list refused empty text; spaces or dots alone are refused too.
export const isTaskText = (text: string) => /[\p{L}\p{N}]/u.test(text);

const clean = (text: string) => text.trim().replace(/\s+/g, ' ').slice(0, MAX_TEXT);

function update(tasks: Task[], id: string, change: (task: Task) => Task | null): Task[] {
  const task = tasks.find((t) => t.id === id);
  const next = task && change(task);
  if (!task || !next || next === task) return tasks;
  return tasks.map((t) => (t.id === id ? next : t));
}

// A refused change returns the same list, so the page can answer in place; undo lives in the store, across the whole app.
export function reduceTasks(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'add': {
      const text = clean(action.text);
      if (!isTaskText(text) || tasks.some((t) => t.id === action.id)) return tasks;
      return [...tasks, { id: action.id, text, effort: action.effort ?? 1, label: action.label ?? null, day: action.day, done: false, doneAt: null }];
    }
    case 'toggle':
      return update(tasks, action.id, (t) => ({ ...t, done: !t.done, doneAt: t.done ? null : action.at }));
    case 'edit': {
      const text = clean(action.text);
      return update(tasks, action.id, (t) => (isTaskText(text) && text !== t.text ? { ...t, text } : null));
    }
    case 'effort':
      return update(tasks, action.id, (t) => (t.effort === action.effort ? null : { ...t, effort: action.effort }));
    case 'move':
      return update(tasks, action.id, (t) => (t.day === action.day ? null : { ...t, day: action.day }));
    case 'remove':
      return tasks.some((t) => t.id === action.id) ? tasks.filter((t) => t.id !== action.id) : tasks;
  }
}

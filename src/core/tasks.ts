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

export interface TaskState {
  tasks: Task[];
  past: Task[][];
}

export type TaskAction =
  | { type: 'add'; id: string; text: string; day: string; effort?: Effort; label?: Label | null }
  | { type: 'toggle'; id: string; at: number }
  | { type: 'edit'; id: string; text: string }
  | { type: 'effort'; id: string; effort: Effort }
  | { type: 'move'; id: string; day: string }
  | { type: 'remove'; id: string }
  | { type: 'undo' };

export const MAX_TEXT = 140;
const UNDO_DEPTH = 30;

export const EMPTY_TASKS: TaskState = { tasks: [], past: [] };

// A task needs a letter or a digit: the 2022 list refused empty text; spaces or dots alone are refused too.
export const isTaskText = (text: string) => /[\p{L}\p{N}]/u.test(text);

const clean = (text: string) => text.trim().replace(/\s+/g, ' ').slice(0, MAX_TEXT);

function commit(state: TaskState, tasks: Task[]): TaskState {
  return { tasks, past: [...state.past, state.tasks].slice(-UNDO_DEPTH) };
}

function update(state: TaskState, id: string, change: (task: Task) => Task | null): TaskState {
  const task = state.tasks.find((t) => t.id === id);
  const next = task && change(task);
  if (!task || !next || next === task) return state;
  return commit(state, state.tasks.map((t) => (t.id === id ? next : t)));
}

// Every change keeps the list it replaced, so Z can put any step back; a refused change returns the same state.
export function reduceTasks(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'add': {
      const text = clean(action.text);
      if (!isTaskText(text) || state.tasks.some((t) => t.id === action.id)) return state;
      const task: Task = { id: action.id, text, effort: action.effort ?? 1, label: action.label ?? null, day: action.day, done: false, doneAt: null };
      return commit(state, [...state.tasks, task]);
    }
    case 'toggle':
      return update(state, action.id, (t) => ({ ...t, done: !t.done, doneAt: t.done ? null : action.at }));
    case 'edit': {
      const text = clean(action.text);
      return update(state, action.id, (t) => (isTaskText(text) && text !== t.text ? { ...t, text } : null));
    }
    case 'effort':
      return update(state, action.id, (t) => (t.effort === action.effort ? null : { ...t, effort: action.effort }));
    case 'move':
      return update(state, action.id, (t) => (t.day === action.day ? null : { ...t, day: action.day }));
    case 'remove':
      return state.tasks.some((t) => t.id === action.id) ? commit(state, state.tasks.filter((t) => t.id !== action.id)) : state;
    case 'undo':
      return state.past.length ? { tasks: state.past[state.past.length - 1], past: state.past.slice(0, -1) } : state;
  }
}

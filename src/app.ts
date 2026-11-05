import { CHAIN_MS, dayKey, ledger } from './core/earn';
import { load, save } from './core/storage';
import { createStore, dispatch, summarize, type AppAction, type Store } from './core/store';
import type { Effort, Task } from './core/tasks';
import { composer, type ComposerState } from './ui/components/composer';
import { emptyState } from './ui/components/emptyState';
import { header } from './ui/components/header';
import { sidebar } from './ui/components/sidebar';
import { tabBar } from './ui/components/tabBar';
import { groupHeading, taskRow } from './ui/components/taskRow';
import { toast, TOAST_MS } from './ui/components/toast';
import { pageFromHash, PAGES, type Page } from './ui/pages';

const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);
const isTyping = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
const JUST_DONE_MS = 1_800;

// Today holds what is due by today and still open, plus what was finished today, in the order it was added.
export function todayTasks(tasks: Task[], now: number): Task[] {
  const today = dayKey(now);
  return tasks.filter((t) => (!t.done && t.day <= today) || (t.done && t.doneAt !== null && dayKey(t.doneAt) === today));
}

export function start(root: HTMLElement) {
  const loaded = load();
  let store: Store = createStore(loaded.state);
  let page: Page = pageFromHash(location.hash);
  let selected: string | null = null;
  let effort: Effort = 1;
  let justDone: { id: string; gain: number } | null = null;
  let toastTimer = 0;

  const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
  const label = () => PAGES.find((p) => p.page === page)!.label;

  const showToast = (text: string, undoable = false) => {
    const slot = $('#toast-slot');
    if (!slot) return;
    slot.innerHTML = toast({ text, action: undoable ? { label: 'Undo', key: 'Z', id: 'undo' } : undefined });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (slot.innerHTML = ''), TOAST_MS);
  };

  // The chain still running: the last tick's multiplier while it is within 90 s.
  const chainNow = (now: number) => {
    const pay = ledger({ tasks: store.state.tasks, checkIns: [] }).pay;
    const lastId = [...pay.keys()].at(-1);
    const doneAt = lastId ? store.state.tasks.find((t) => t.id === lastId)?.doneAt : null;
    return lastId && doneAt && now - doneAt <= CHAIN_MS ? pay.get(lastId)!.chain : 1;
  };

  function list(): string {
    const tasks = todayTasks(store.state.tasks, Date.now());
    if (!tasks.length) return `<div class="px-4 py-6 lg:px-[18px]">${emptyState({ variant: 'first-run', action: { label: 'Open the 2022 version', href: './legacy/index.html' } })}</div>`;
    const rows = tasks.map((task) => taskRow({ task, state: task.id === selected ? 'selected' : 'default', gain: justDone?.id === task.id ? justDone.gain : undefined })).join('');
    return `<ul class="task-list" aria-label="Today">${groupHeading('Today', tasks.length)}${rows}</ul>`;
  }

  function pageBody(): string {
    if (page === 'today') return `${composer({ effort })}<div id="list">${list()}</div>`;
    return `<div class="px-4 py-6 lg:px-[18px]">${emptyState({ variant: 'soon', title: label() })}</div>`;
  }

  function renderPage() {
    const summary = summarize(store.state, Date.now());
    root.innerHTML = `<div class="flex min-h-dvh">${sidebar(page, summary)}<div class="flex min-w-0 flex-1 flex-col"><div id="header">${header(label(), summary, chainNow(Date.now()))}</div><main class="flex-1 pb-28 lg:pb-6">${pageBody()}</main></div></div>${tabBar(page)}<div id="toast-slot" class="pointer-events-none fixed inset-x-0 bottom-24 flex justify-center px-4 lg:bottom-8 [&>*]:pointer-events-auto"></div>`;
  }

  // A change redraws the header, the list and the sidebar; the field stays mounted so typing is never interrupted.
  function renderState() {
    if (page !== 'today') return renderPage();
    const summary = summarize(store.state, Date.now());
    $('#header')!.innerHTML = header(label(), summary, chainNow(Date.now()));
    $('#list')!.innerHTML = list();
    const nav = $('.sidebar');
    if (nav) nav.outerHTML = sidebar(page, summary);
  }

  // Redraws the field in a new state or size, keeping what was typed and the focus.
  function redrawComposer(state: ComposerState = 'idle') {
    const field = $<HTMLInputElement>('#composer');
    const value = field?.value ?? '';
    const form = $('[data-composer]');
    if (!form) return;
    form.outerHTML = composer({ effort, state });
    const next = $<HTMLInputElement>('#composer')!;
    next.value = value;
    next.focus();
  }

  function apply(action: AppAction): boolean {
    const next = dispatch(store, action);
    if (next === store) return false;
    store = next;
    save(store.state);
    renderState();
    return true;
  }

  function add(field: HTMLInputElement) {
    const id = newId();
    if (!apply({ type: 'task', action: { type: 'add', id, text: field.value, day: dayKey(Date.now()), effort } })) {
      redrawComposer('empty');
      $('[data-composer] label')?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }], { duration: 180, iterations: 2 });
      return;
    }
    field.value = '';
    selected = id;
    // Each new task starts small; Tab sizes it up while typing.
    if (effort !== 1) {
      effort = 1;
      redrawComposer();
    }
    renderState();
  }

  function toggle(id: string) {
    const task = store.state.tasks.find((t) => t.id === id);
    if (!task || !apply({ type: 'task', action: { type: 'toggle', id, at: Date.now() } })) return;
    if (task.done) return showToast(`Not done · ${task.text}`, true);
    justDone = { id, gain: ledger({ tasks: store.state.tasks, checkIns: [] }).pay.get(id)?.amount ?? 0 };
    renderState();
    showToast(`Done · ${task.text}`, true);
    window.setTimeout(() => {
      if (justDone?.id !== id) return;
      justDone = null;
      if (page === 'today') renderState();
    }, JUST_DONE_MS);
  }

  function remove(id: string) {
    const tasks = todayTasks(store.state.tasks, Date.now());
    const index = tasks.findIndex((t) => t.id === id);
    const task = tasks[index];
    if (!task || !apply({ type: 'task', action: { type: 'remove', id } })) return;
    selected = tasks[index + 1]?.id ?? tasks[index - 1]?.id ?? null;
    renderState();
    showToast(`Deleted · ${task.text}`, true);
  }

  function undo() {
    if (apply({ type: 'undo' })) showToast('Undone');
  }

  function move(step: number) {
    const tasks = todayTasks(store.state.tasks, Date.now());
    if (!tasks.length) return;
    const index = tasks.findIndex((t) => t.id === selected);
    selected = tasks[Math.min(tasks.length - 1, Math.max(0, index === -1 ? 0 : index + step))].id;
    renderState();
    $(`[data-id="${CSS.escape(selected)}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  root.addEventListener('submit', (event) => {
    const form = event.target as HTMLElement;
    if (!form.matches('[data-composer]')) return;
    event.preventDefault();
    add(form.querySelector<HTMLInputElement>('#composer')!);
  });

  root.addEventListener('keydown', (event) => {
    const field = event.target as HTMLInputElement;
    if (field.id !== 'composer') return;
    // Tab sizes the task while there is text; on an empty field Tab moves on as usual, and Esc leaves the field.
    if (event.key === 'Tab' && !event.shiftKey && field.value.trim()) {
      event.preventDefault();
      effort = ((effort % 3) + 1) as Effort;
      redrawComposer();
    } else if (event.key === 'Escape') field.blur();
  });

  root.addEventListener('input', (event) => {
    if ((event.target as HTMLElement).id === 'composer' && $('#composer[aria-invalid="true"]')) redrawComposer();
  });

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const ring = target.closest<HTMLElement>('[data-toggle]');
    if (ring) return toggle(ring.dataset.toggle!);
    if (target.closest('[data-toast-action="undo"]')) return undo();
    const row = target.closest<HTMLElement>('.task-row');
    if (row) {
      selected = row.dataset.id!;
      renderState();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (page !== 'today' || isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const keys: Record<string, () => void> = {
      c: () => $<HTMLInputElement>('#composer')?.focus(),
      j: () => move(1),
      ArrowDown: () => move(1),
      k: () => move(-1),
      ArrowUp: () => move(-1),
      x: () => selected && toggle(selected),
      ' ': () => selected && toggle(selected),
      Backspace: () => selected && remove(selected),
      Delete: () => selected && remove(selected),
      z: () => undo(),
      Escape: () => {
        selected = null;
        renderState();
      },
    };
    if (!keys[key]) return;
    event.preventDefault();
    keys[key]();
  });

  window.addEventListener('hashchange', () => {
    page = pageFromHash(location.hash);
    renderPage();
  });

  renderPage();
  if (loaded.status === 'blocked') showToast('This list lasts until the tab closes: this browser blocks saving');
}

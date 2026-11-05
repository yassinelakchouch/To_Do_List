import { CHAIN_MS, dayKey, ledger } from './core/earn';
import { load, save } from './core/storage';
import { createStore, dispatch, summarize, type AppAction, type Goal, type Store } from './core/store';
import type { QuestId } from './core/quests';
import type { Effort, Task } from './core/tasks';
import { composer, type ComposerState } from './ui/components/composer';
import { emptyState } from './ui/components/emptyState';
import { challengeCard } from './ui/components/challengeCard';
import { header } from './ui/components/header';
import { inspector } from './ui/components/inspector';
import { onboarding, type OnboardingStep } from './ui/components/onboarding';
import { sidebar } from './ui/components/sidebar';
import { tabBar } from './ui/components/tabBar';
import { groupHeading, taskRow } from './ui/components/taskRow';
import { toast, TOAST_MS } from './ui/components/toast';
import { dismissLoader } from './ui/loader';
import { careerPage } from './ui/pages/careerPage';
import { donePage } from './ui/pages/donePage';
import { rewardsPage } from './ui/pages/rewardsPage';
import { nextDays, upcomingPage, upcomingTasks } from './ui/pages/upcomingPage';
import type { Label } from './core/tasks';
import type { RewardDraft } from './ui/components/rewardEditor';
import { COST } from './core/rewards';
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
  let highlight: QuestId | null = null;
  let rewardDraft: RewardDraft | null = null;
  // The first visit only: no name asked yet and nothing in the list (board T-07).
  let onboard: { step: OnboardingStep; name: string; goal: Goal } | null =
    !store.state.settings.onboarded && store.state.tasks.length === 0 ? { step: 1, name: '', goal: store.state.settings.goal } : null;
  let toastTimer = 0;

  const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
  const book = () => ledger({ tasks: store.state.tasks, checkIns: store.state.checkIns.map((c) => c.day), goals: store.state.goals, defaultGoal: store.state.settings.goal });
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

  function side(): string {
    const now = Date.now();
    const summary = summarize(store.state, now);
    const days = book().days;
    return inspector({ summary, rewards: store.state.rewards, redeemed: store.state.redeemed, days, now, highlight });
  }

  // Below 1100 px the inspector folds away; the week's challenge stays under the list (board T-05 E).
  const challengeBelow = () => `<div id="challenge-below" class="px-4 py-4 min-[1100px]:hidden">${challengeCard(summarize(store.state, Date.now()).challenge)}</div>`;

  function pageBody(): string {
    if (page === 'upcoming') return upcomingPage({ tasks: store.state.tasks, now: Date.now(), selected, effort });
    if (page === 'done') {
      const now = Date.now();
      const { pay, days } = book();
      return donePage({ tasks: store.state.tasks, pay, days, best: summarize(store.state, now).best, goalFor: (day) => store.state.goals[day] ?? store.state.settings.goal, now });
    }
    if (page === 'rewards') {
      const now = Date.now();
      return rewardsPage({ rewards: store.state.rewards, redeemed: store.state.redeemed, sparks: summarize(store.state, now).sparks, now, draft: rewardDraft });
    }
    if (page === 'career') {
      const now = Date.now();
      return careerPage(summarize(store.state, now), book().days, now);
    }
    if (page === 'today') return `<div class="flex min-h-full"><div class="min-w-0 flex-1">${composer({ effort })}<div id="list">${list()}</div>${challengeBelow()}</div>${side()}</div>`;
    return `<div class="px-4 py-6 lg:px-[18px]">${emptyState({ variant: 'soon', title: label() })}</div>`;
  }

  function renderPage() {
    const summary = summarize(store.state, Date.now());
    root.innerHTML = `<div class="flex min-h-dvh">${sidebar(page, summary, store.state.settings.name)}<div class="flex min-w-0 flex-1 flex-col"><div id="header">${header(label(), summary, chainNow(Date.now()))}</div><main class="flex-1 pb-28 lg:pb-6">${pageBody()}</main></div></div>${tabBar(page)}<div id="toast-slot" class="pointer-events-none fixed inset-x-0 bottom-24 flex justify-center px-4 lg:bottom-8 [&>*]:pointer-events-auto"></div>${onboard ? onboarding(onboard.step, onboard.name, onboard.goal) : ''}`;
    if (onboard) focusOnboarding();
  }

  function focusOnboarding() {
    const target = $<HTMLElement>('#onboard-name') ?? $<HTMLElement>('.onboarding [data-onboard="next"], .onboarding [data-onboard="samples"]');
    target?.focus();
  }

  function renderOnboarding() {
    const sheet = $('.onboarding');
    if (!sheet) return;
    if (!onboard) return sheet.remove();
    sheet.outerHTML = onboarding(onboard.step, onboard.name, onboard.goal);
    focusOnboarding();
  }

  const partOfDay = (hour: number) => (hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening');

  function finishOnboarding(choice: 'skip' | 'empty' | 'samples') {
    if (!onboard) return;
    const { name, goal } = onboard;
    onboard = null;
    renderOnboarding();
    store = dispatch(store, { type: 'settings', patch: { onboarded: true, ...(choice === 'skip' ? {} : { name, goal }) } });
    if (choice === 'samples') store = dispatch(store, { type: 'samples', day: dayKey(Date.now()), ids: Array.from({ length: 5 }, newId) });
    save(store.state);
    renderState();
    const who = store.state.settings.name;
    showToast(choice === 'samples' ? `${partOfDay(new Date().getHours())}${who ? `, ${who}` : ''}. Five sample tasks are in Today.` : `${partOfDay(new Date().getHours())}${who ? `, ${who}` : ''}.`);
    $<HTMLInputElement>('#composer')?.focus();
  }

  function onboardAction(action: string) {
    if (!onboard) return;
    const field = $<HTMLInputElement>('#onboard-name');
    if (field) onboard.name = field.value;
    if (action === 'next' && onboard.step < 3) onboard.step = (onboard.step + 1) as OnboardingStep;
    else if (action === 'back' && onboard.step > 1) onboard.step = (onboard.step - 1) as OnboardingStep;
    else if (action === 'skip' || action === 'empty' || action === 'samples') return finishOnboarding(action);
    renderOnboarding();
  }

  // A change redraws the header, the list and the sidebar; the field stays mounted so typing is never interrupted.
  function renderState() {
    if (page !== 'today') return renderPage();
    const summary = summarize(store.state, Date.now());
    $('#header')!.innerHTML = header(label(), summary, chainNow(Date.now()));
    $('#list')!.innerHTML = list();
    const aside = $('.inspector');
    if (aside) aside.outerHTML = side();
    const below = $('#challenge-below');
    if (below) below.outerHTML = challengeBelow();
    const nav = $('.sidebar');
    if (nav) nav.outerHTML = sidebar(page, summary, store.state.settings.name);
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
    const day = page === 'upcoming' ? nextDays(Date.now(), 1)[0] : dayKey(Date.now());
    if (!apply({ type: 'task', action: { type: 'add', id, text: field.value, day, effort } })) {
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
    // Other pages redraw whole, so the new field takes the focus back for the next task.
    if (page !== 'today') $<HTMLInputElement>('#composer')?.focus();
  }

  function toggle(id: string) {
    const task = store.state.tasks.find((t) => t.id === id);
    const before = summarize(store.state, Date.now()).quests;
    if (!task || !apply({ type: 'task', action: { type: 'toggle', id, at: Date.now() } })) return;
    const after = summarize(store.state, Date.now()).quests;
    highlight = after.find((q, i) => q.count > before[i].count)?.id ?? null;
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
    const tasks = listed();
    const index = tasks.findIndex((t) => t.id === id);
    const task = tasks[index];
    if (!task || !apply({ type: 'task', action: { type: 'remove', id } })) return;
    selected = tasks[index + 1]?.id ?? tasks[index - 1]?.id ?? null;
    renderState();
    showToast(`Deleted · ${task.text}`, true);
  }

  function redeemReward(rewardId: string) {
    const reward = store.state.rewards.find((r) => r.id === rewardId);
    if (reward && apply({ type: 'reward', action: { type: 'redeem', id: newId(), rewardId, at: Date.now(), sparks: 0 } })) showToast(`${reward.name} · enjoy it`, true);
  }

  // The editor keeps what was typed when a price step or an icon redraws it.
  function readDraft() {
    const field = $<HTMLInputElement>('[data-reward-form] input[name="name"]');
    if (rewardDraft && field) rewardDraft.name = field.value;
  }

  function openEditor(draft: RewardDraft | null) {
    rewardDraft = draft;
    renderPage();
    $<HTMLInputElement>('[data-reward-form] input[name="name"]')?.focus();
  }

  function saveReward() {
    if (!rewardDraft) return;
    readDraft();
    const { id, name, cost, icon } = rewardDraft;
    const action = id ? { type: 'edit' as const, id, name, cost, icon } : { type: 'add' as const, id: newId(), name, cost, icon };
    rewardDraft = null;
    if (apply({ type: 'reward', action })) showToast(id ? `Saved · ${name.trim()}` : `Added · ${name.trim()}`, true);
    else openEditor({ id, name, cost, icon });
  }

  function moveTo(id: string, day: string, label: string) {
    const task = store.state.tasks.find((t) => t.id === id);
    if (task && apply({ type: 'task', action: { type: 'move', id, day } })) showToast(`Moved to ${label} · ${task.text}`, true);
  }

  function detailAction(button: HTMLElement) {
    const id = selected!;
    const { detailEffort, detailLabel, detailDay } = button.dataset;
    if (detailEffort) apply({ type: 'task', action: { type: 'effort', id, effort: Number(detailEffort) as Effort } });
    else if (detailLabel !== undefined) apply({ type: 'task', action: { type: 'label', id, label: (detailLabel || null) as Label | null } });
    else if (detailDay) moveTo(id, detailDay, detailDay === dayKey(Date.now()) ? 'Today' : detailDay);
    else if (button.hasAttribute('data-detail-today')) moveTo(id, dayKey(Date.now()), 'Today');
    else if (button.hasAttribute('data-detail-delete')) remove(id);
  }

  function undo() {
    if (apply({ type: 'undo' })) showToast('Undone');
  }

  const listed = () => (page === 'upcoming' ? upcomingTasks(store.state.tasks, dayKey(Date.now())) : todayTasks(store.state.tasks, Date.now()));

  function move(step: number) {
    const tasks = listed();
    if (!tasks.length) return;
    const index = tasks.findIndex((t) => t.id === selected);
    selected = tasks[Math.min(tasks.length - 1, Math.max(0, index === -1 ? 0 : index + step))].id;
    renderState();
    $(`[data-id="${CSS.escape(selected)}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  root.addEventListener('submit', (event) => {
    const form = event.target as HTMLElement;
    if (form.matches('[data-reward-form]')) {
      event.preventDefault();
      return saveReward();
    }
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
    const step = target.closest<HTMLElement>('[data-onboard]');
    if (step) return onboardAction(step.dataset.onboard!);
    const goal = target.closest<HTMLElement>('[data-goal]');
    if (goal && onboard) {
      onboard.goal = Number(goal.dataset.goal) as Goal;
      return renderOnboarding();
    }
    const detail = target.closest<HTMLElement>('[data-detail-effort], [data-detail-label], [data-detail-day], [data-detail-today], [data-detail-delete]');
    if (detail && selected) return detailAction(detail);
    const ring = target.closest<HTMLElement>('[data-toggle]');
    if (ring) return toggle(ring.dataset.toggle!);
    if (target.closest('[data-toast-action="undo"]')) return undo();
    if (target.closest('[data-reward-add], [data-action="reward-add"]')) return openEditor({ id: null, name: '', cost: 60, icon: 'cup' });
    const edit = target.closest<HTMLElement>('[data-reward-edit]');
    if (edit) {
      const reward = store.state.rewards.find((r) => r.id === edit.dataset.rewardEdit);
      return reward && openEditor({ id: reward.id, name: reward.name, cost: reward.cost, icon: reward.icon });
    }
    const stepButton = target.closest<HTMLElement>('[data-cost-step]');
    if (stepButton && rewardDraft) {
      readDraft();
      rewardDraft.cost = Math.min(COST.max, Math.max(COST.min, rewardDraft.cost + Number(stepButton.dataset.costStep)));
      renderPage();
      return $<HTMLElement>(`[data-cost-step="${stepButton.dataset.costStep}"]`)?.focus();
    }
    const iconButton = target.closest<HTMLElement>('[data-icon]');
    if (iconButton && rewardDraft) {
      readDraft();
      rewardDraft.icon = iconButton.dataset.icon as RewardDraft['icon'];
      renderPage();
      return $<HTMLElement>(`[data-icon="${rewardDraft.icon}"]`)?.focus();
    }
    if (target.closest('[data-reward-cancel]')) return openEditor(null);
    const del = target.closest<HTMLElement>('[data-reward-delete]');
    if (del) {
      const reward = store.state.rewards.find((r) => r.id === del.dataset.rewardDelete);
      rewardDraft = null;
      if (reward && apply({ type: 'reward', action: { type: 'remove', id: reward.id } })) showToast(`Deleted · ${reward.name}`, true);
      return;
    }
    const redeem = target.closest<HTMLElement>('[data-redeem]');
    if (redeem) return redeemReward(redeem.dataset.redeem!);
    const row = target.closest<HTMLElement>('.task-row');
    if (row) {
      selected = row.dataset.id!;
      renderState();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (onboard) {
      if (event.key === 'Escape') {
        event.preventDefault();
        finishOnboarding('skip');
      } else if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        onboardAction(onboard.step === 3 ? 'samples' : 'next');
      }
      return;
    }
    const plain = !isTyping(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey;
    // Z undoes on every page, as the toasts promise; Esc closes the reward editor even from its fields.
    if (plain && (event.key === 'z' || event.key === 'Z')) {
      event.preventDefault();
      return undo();
    }
    if (event.key === 'Escape' && rewardDraft) {
      event.preventDefault();
      return openEditor(null);
    }
    if ((page !== 'today' && page !== 'upcoming') || !plain) return;
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
      d: () => page === 'today' && selected && moveTo(selected, nextDays(Date.now(), 1)[0], 'tomorrow'),
      m: () => page === 'upcoming' && selected && moveTo(selected, dayKey(Date.now()), 'Today'),
      Delete: () => selected && remove(selected),
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
  dismissLoader(store.state.settings.motion);
  if (loaded.status === 'blocked') showToast('This list lasts until the tab closes: this browser blocks saving');
}

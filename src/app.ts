import { CHAIN_MS, dayKey, ledger } from './core/earn';
import { load, save } from './core/storage';
import { createStore, dispatch, summarize, type AppAction, type Goal, type Mood, type Store, type Summary } from './core/store';
import type { QuestId } from './core/quests';
import type { Effort, Task } from './core/tasks';
import { composer, type ComposerState } from './ui/components/composer';
import { emptyState } from './ui/components/emptyState';
import { challengeCard } from './ui/components/challengeCard';
import { header } from './ui/components/header';
import { inspector } from './ui/components/inspector';
import { onboarding, STEPS, type OnboardingStep } from './ui/components/onboarding';
import { settingsSheet, type Toggle } from './ui/components/settingsSheet';
import { keysSheet } from './ui/components/keysSheet';
import { commandMenu, filterCommands, type Command } from './ui/components/commandMenu';
import { checkInCard, type CheckInProps } from './ui/components/checkInCard';
import { rememberSkip, skippedDay } from './ui/checkInSkip';
import { pickPrompt, slotActions, slotPicker, slotReel, type Reel } from './ui/components/slotPicker';
import { pickTask, spinPath, tickDelay } from './core/pick';
import { createSound, type Cue } from './ui/sound';
import { canMove, createCounter, drawStrokes, dropStamp, flySpark, pulse, slideIn } from './ui/motion';
import { gsap } from 'gsap';
import { newBestPlace } from './core/bestDays';
import { num } from './ui/html';
import { CHECK_IN_XP } from './core/earn';
import { exportJson } from './core/storage';
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
const ORDINAL = ['1st', '2nd', '3rd'];

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
  let editing: string | null = null;
  let checkInDraft: { mood: Mood | null; blocker: string } = { mood: null, blocker: '' };
  let skipped = skippedDay();
  let pick: { id: string; landed: boolean } | null = null;
  let lastPick: string | null = null;
  let pickTimer = 0;
  const sound = createSound(() => store.state.settings.sound);
  const counter = createCounter(num);
  const moving = () => canMove(store.state.settings.motion);
  let headerHtml = '';
  let flightNext = false;
  let settingsOpen = false;
  let keysOpen = false;
  let menu: { query: string; active: number } | null = null;
  let resetTyped = '';
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
  const lastTick = () => {
    const pay = ledger({ tasks: store.state.tasks, checkIns: [] }).pay;
    const lastId = [...pay.keys()].at(-1);
    const doneAt = lastId ? store.state.tasks.find((t) => t.id === lastId)?.doneAt : null;
    return lastId && doneAt ? { chain: pay.get(lastId)!.chain, doneAt } : null;
  };
  const chainNow = (now: number) => {
    const last = lastTick();
    return last && now - last.doneAt <= CHAIN_MS ? last.chain : 1;
  };
  let chainTimer = 0;

  // The ×2 chip leaves after 90 quiet seconds (use case 4): only the header redraws, so open sheets stay open.
  function endChainLater() {
    window.clearTimeout(chainTimer);
    const last = lastTick();
    const left = last && last.chain > 1 ? last.doneAt + CHAIN_MS - Date.now() : 0;
    if (left <= 0) return;
    chainTimer = window.setTimeout(() => {
      const redraw = () => {
        headerHtml = header(label(), summarize(store.state, Date.now()), chainNow(Date.now()));
        $('#header')!.innerHTML = headerHtml;
      };
      const chip = $('.chain');
      if (chip && moving()) gsap.to(chip, { opacity: 0, x: -4, duration: 0.3, onComplete: redraw });
      else redraw();
    }, left + 50);
  }

  function list(): string {
    const tasks = todayTasks(store.state.tasks, Date.now());
    if (!tasks.length) return `<div class="px-4 py-6 lg:px-[18px]">${emptyState({ variant: 'first-run', action: { label: 'Open the 2022 version', href: './legacy/index.html' } })}</div>`;
    const rows = tasks.map((task) => taskRow({ task, state: task.id === editing ? 'editing' : task.id === selected ? 'selected' : 'default', gain: justDone?.id === task.id ? justDone.gain : undefined })).join('');
    return `<ul class="task-list" aria-label="Today">${groupHeading('Today', tasks.length)}${rows}</ul>`;
  }

  function side(): string {
    const now = Date.now();
    const summary = summarize(store.state, now);
    const days = book().days;
    return inspector({ summary, rewards: store.state.rewards, redeemed: store.state.redeemed, days, now, highlight, checkIn: checkInProps() });
  }

  // Due once a day on Today, after onboarding, unless it is switched off, done or skipped.
  function checkInProps(): CheckInProps | null {
    const now = Date.now();
    const today = dayKey(now);
    const { settings, checkIns, tasks } = store.state;
    if (!settings.checkIn || onboard || skipped === today || checkIns.some((c) => c.day === today)) return null;
    const before = new Date(now);
    before.setHours(12, 0, 0, 0);
    before.setDate(before.getDate() - 1);
    const yesterday = dayKey(before.getTime());
    return {
      now,
      ...checkInDraft,
      yesterday: tasks.filter((t) => t.done && t.doneAt !== null && dayKey(t.doneAt) === yesterday).map((t) => t.text),
      open: todayTasks(tasks, now).filter((t) => !t.done).map((t) => t.text),
    };
  }

  function pickMood(mood: Mood) {
    checkInDraft = { ...checkInDraft, mood };
    renderState();
    [...root.querySelectorAll<HTMLElement>(`[data-check-mood="${mood}"]`)].find((b) => b.offsetParent)?.focus();
  }

  function checkInReady() {
    if (!checkInDraft.mood) return;
    if (apply({ type: 'check-in', at: Date.now(), mood: checkInDraft.mood, blocker: checkInDraft.blocker })) showToast(`Checked in · +${CHECK_IN_XP} XP`, true);
    checkInDraft = { mood: null, blocker: '' };
    $<HTMLInputElement>('#composer')?.focus();
  }

  function skipCheckIn() {
    skipped = dayKey(Date.now());
    rememberSkip(skipped);
    checkInDraft = { mood: null, blocker: '' };
    renderState();
    $<HTMLInputElement>('#composer')?.focus();
  }

  // Below 1100 px the inspector folds away; the week's challenge stays under the list (board T-05 E).
  const challengeBelow = () => {
    const due = checkInProps();
    return `<div id="challenge-below" class="grid gap-3 px-4 py-4 min-[1100px]:hidden">${due ? checkInCard(due) : ''}${challengeCard(summarize(store.state, Date.now()).challenge)}${pickPrompt()}</div>`;
  };

  function pageBody(): string {
    if (page === 'upcoming') return upcomingPage({ tasks: store.state.tasks, now: Date.now(), selected, effort, editing });
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

  // Pick for me (use case 6): the slot spins about 0.8 s through today's open tasks, or lands at once with motion off.
  function openPick() {
    const open = todayTasks(store.state.tasks, Date.now()).filter((t) => !t.done);
    const target = pickTask(open, lastPick);
    if (!target) {
      showToast('Add a task first');
      return $<HTMLInputElement>('#composer')?.focus();
    }
    const n = open.length;
    const rows = (i: number): Reel => (n === 1 ? ['', open[0].text, ''] : [open[(i - 1 + n) % n].text, open[i].text, open[(i + 1) % n].text]);
    const path = spinPath(n, open.indexOf(target));
    const moving = store.state.settings.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    stopPick();
    pick = { id: target.id, landed: false };
    root.insertAdjacentHTML('beforeend', slotPicker(rows(path[0]), false));
    $<HTMLElement>('.pick section')?.focus();
    const land = () => {
      if (!pick) return;
      pick.landed = true;
      $('[data-reel]')!.innerHTML = slotReel(rows(path.at(-1)!));
      $('[data-pick-actions]')!.innerHTML = slotActions(true);
      $('[data-pick-said]')!.textContent = `Picked: ${target.text}`;
      $<HTMLElement>('[data-pick-start]')?.focus();
      sound.play('click');
    };
    if (!moving) return land();
    const step = (k: number) => {
      if (k >= path.length) return land();
      $('[data-reel]')!.innerHTML = slotReel(rows(path[k]));
      sound.play('ratchet');
      pickTimer = window.setTimeout(() => step(k + 1), tickDelay(k - 1));
    };
    pickTimer = window.setTimeout(() => step(1), tickDelay(0));
  }

  function stopPick() {
    window.clearTimeout(pickTimer);
    pick = null;
    $('.pick')?.remove();
  }

  function startPick() {
    if (!pick?.landed) return;
    const { id } = pick;
    lastPick = id;
    stopPick();
    selected = id;
    renderState();
    $(`.task-row[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  function renderPage() {
    stopPick();
    const summary = summarize(store.state, Date.now());
    headerHtml = header(label(), summary, chainNow(Date.now()));
    root.innerHTML = `<div class="flex min-h-dvh">${sidebar(page, summary, store.state.settings.name)}<div class="flex min-w-0 flex-1 flex-col"><div id="header">${headerHtml}</div><main class="flex-1 pb-28 lg:pb-6">${pageBody()}</main></div></div>${tabBar(page)}<div id="toast-slot" class="pointer-events-none fixed inset-x-0 bottom-24 flex justify-center px-4 lg:bottom-8 [&>*]:pointer-events-auto"></div>${onboard ? onboarding(onboard.step, onboard.name, onboard.goal) : ''}${settingsOpen ? settingsSheet(store.state.settings, resetTyped) : ''}`;
    counter.sync(summary, moving());
    if (onboard) focusOnboarding();
  }

  // Settings change the app, never the undo history; the sheet redraws in place and keeps the focus where it was.
  function renderSettings(focus?: string) {
    const sheet = $('.settings');
    if (sheet) sheet.remove();
    if (settingsOpen) root.insertAdjacentHTML('beforeend', settingsSheet(store.state.settings, resetTyped));
    if (focus) $<HTMLElement>(focus)?.focus();
  }

  const COMMANDS: Command[] = [
    { id: 'add', label: 'Add a task', keys: 'C' },
    ...PAGES.map(({ page: p, label: l }) => ({ id: `go-${p}`, label: `Go to ${l}` })),
    { id: 'undo', label: 'Undo the last step', keys: 'Z' },
    { id: 'settings', label: 'Open settings' },
    { id: 'keys', label: 'Show the keys', keys: '?' },
    { id: 'pick', label: 'Pick for me', keys: 'P' },
    { id: 'replay', label: 'Replay the how-to' },
    { id: 'export', label: 'Export your data' },
  ];

  function renderMenu() {
    $('.command-menu')?.remove();
    if (!menu) return;
    root.insertAdjacentHTML('beforeend', commandMenu(COMMANDS, menu.query, menu.active));
    const input = $<HTMLInputElement>('[data-command-input]')!;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  function runCommand(id: string) {
    menu = null;
    renderMenu();
    if (id.startsWith('go-')) location.hash = `#/${id.slice(3)}`;
    else if (id === 'add') {
      if (page !== 'today') location.hash = '#/today';
      window.setTimeout(() => $<HTMLInputElement>('#composer')?.focus());
    } else if (id === 'undo') undo();
    else if (id === 'settings') openSettings(true);
    else if (id === 'keys') openKeys(true);
    else if (id === 'pick') {
      if (page !== 'today') location.hash = '#/today';
      window.setTimeout(openPick);
    }
    else if (id === 'export') exportData();
    else if (id === 'replay') {
      onboard = { step: 2, name: store.state.settings.name, goal: store.state.settings.goal };
      renderPage();
    }
  }

  function openKeys(open: boolean) {
    keysOpen = open;
    $('.keys')?.remove();
    if (open) {
      root.insertAdjacentHTML('beforeend', keysSheet());
      $<HTMLElement>('[data-keys-close]')?.focus();
    }
  }

  function openSettings(open: boolean) {
    settingsOpen = open;
    resetTyped = '';
    renderSettings(open ? '[data-settings-close]' : undefined);
    if (!open) $<HTMLElement>('[data-open-settings]')?.focus();
  }

  function setSettings(patch: Partial<typeof store.state.settings>, focus?: string) {
    store = dispatch(store, { type: 'settings', patch });
    save(store.state);
    renderState();
    renderSettings(focus);
  }

  function exportData() {
    const url = URL.createObjectURL(new Blob([exportJson(store.state, Date.now())], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: `todo-project003-${dayKey(Date.now())}.json` });
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported · your data is in Downloads');
  }

  function resetAll() {
    store = dispatch(store, { type: 'reset' });
    save(store.state);
    settingsOpen = false;
    resetTyped = '';
    selected = null;
    onboard = { step: 1, name: '', goal: store.state.settings.goal };
    renderPage();
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
    if (action === 'next' && onboard.step < STEPS) onboard.step = (onboard.step + 1) as OnboardingStep;
    else if (action === 'back' && onboard.step > 1) onboard.step = (onboard.step - 1) as OnboardingStep;
    else if (action === 'skip' || action === 'empty' || action === 'samples') return finishOnboarding(action);
    renderOnboarding();
  }

  // A change redraws the header, the list and the sidebar; the field stays mounted so typing is never interrupted.
  function renderState() {
    if (page !== 'today') return renderPage();
    const summary = summarize(store.state, Date.now());
    // Only a changed header is redrawn: a tick renders twice, and a second redraw would cut the roll short.
    const head = header(label(), summary, chainNow(Date.now()));
    if (head !== headerHtml) {
      const chainBefore = headerHtml.includes('class="chain');
      $('#header')!.innerHTML = head;
      headerHtml = head;
      if (moving() && !chainBefore && head.includes('class="chain')) slideIn($('.chain'));
    }
    counter.sync(summary, moving(), flightNext ? 0.55 : 0);
    flightNext = false;
    endChainLater();
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
    const was = summarize(store.state, Date.now());
    flightNext = !task?.done && moving();
    if (!task || !apply({ type: 'task', action: { type: 'toggle', id, at: Date.now() } })) return;
    const is = summarize(store.state, Date.now());
    highlight = is.quests.find((q, i) => q.count > was.quests[i].count)?.id ?? null;
    if (task.done) return showToast(`Not done · ${task.text}`, true);
    sound.play(tickCue(was, is));
    const crossed = is.quests.find((q, i) => q.tier > was.quests[i].tier);
    const best = newBestPlace(was.best, is.best, dayKey(Date.now()));
    justDone = { id, gain: ledger({ tasks: store.state.tasks, checkIns: [] }).pay.get(id)?.amount ?? 0 };
    renderState();
    const from = $(`.task-row[data-id="${id}"] .gain`) ?? $(`.task-row[data-id="${id}"] .toggle`);
    const pill = $('.sparks');
    if (moving() && justDone.gain && from && pill) flySpark(`+${justDone.gain}`, from, pill, () => pulse($('.sparks')));
    if (moving()) celebrate(crossed?.id ?? null, is.standing.tier > was.standing.tier);
    showToast(best ? `New best day · ${ORDINAL[best - 1]} this month` : `Done · ${task.text}`, true);
    window.setTimeout(() => {
      if (justDone?.id !== id) return;
      justDone = null;
      if (page === 'today') renderState();
    }, JUST_DONE_MS);
  }

  // A quest's new fifth draws clockwise; a new league draws its crest and the league pill pulses (board T-05).
  function celebrate(quest: string | null, leagueUp: boolean) {
    const fifth = quest ? [...root.querySelectorAll<SVGPathElement>(`[data-quest="${quest}"] .fifth[data-on="true"]`)].at(-1) : undefined;
    if (fifth) drawStrokes([fifth]);
    const crest = root.querySelector<SVGSVGElement>('#header .crest');
    if (leagueUp && crest) {
      drawStrokes([...crest.querySelectorAll<SVGGeometryElement>('path, polyline, polygon, circle')], 0.6);
      pulse(crest.closest('span')?.parentElement ?? null);
    }
  }

  // The biggest thing a tick did picks the sound: a league, a quest tier, a chain, or a plain tick.
  function tickCue(was: Summary, is: Summary): Cue {
    if (is.standing.tier > was.standing.tier) return 'fanfare';
    if (is.quests.some((q, i) => q.tier > was.quests[i].tier)) return 'tier';
    return chainNow(Date.now()) > 1 ? 'chain' : 'tick';
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
    if (reward && apply({ type: 'reward', action: { type: 'redeem', id: newId(), rewardId, at: Date.now(), sparks: 0 } })) {
      sound.play('thud');
      if (moving()) dropStamp($(`[data-reward="${rewardId}"] .stamp`));
      showToast(`${reward.name} · enjoy it`, true);
    }
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

  // Edit in place (board T-02 frame 08): E or a double click; Enter or leaving the field saves, Esc puts the text back.
  const canEdit = (id: string) => store.state.tasks.some((t) => t.id === id && !t.done);

  function startEdit(id: string) {
    editing = id;
    selected = id;
    renderState();
    const input = $<HTMLInputElement>('[data-edit-input]');
    input?.focus();
    input?.select();
  }

  function endEdit(save: boolean) {
    const input = $<HTMLInputElement>('[data-edit-input]');
    const id = editing;
    editing = null;
    if (save && id && input) apply({ type: 'task', action: { type: 'edit', id, text: input.value } });
    renderState();
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
    if (field.matches('[data-checkin-blocker]')) {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkInReady();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        skipCheckIn();
      }
      return;
    }
    if (field.matches('[data-edit-input]')) {
      if (event.key === 'Enter') {
        event.preventDefault();
        endEdit(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        endEdit(false);
      }
      return;
    }
    if (field.id !== 'composer') return;
    // Tab sizes the task while there is text; on an empty field Tab moves on as usual, and Esc leaves the field.
    if (event.key === 'Tab' && !event.shiftKey && field.value.trim()) {
      event.preventDefault();
      effort = ((effort % 3) + 1) as Effort;
      redrawComposer();
    } else if (event.key === 'Escape') field.blur();
  });

  root.addEventListener('change', (event) => {
    const field = event.target as HTMLInputElement;
    if (field.matches('[data-setting-name]')) setSettings({ name: field.value });
  });

  root.addEventListener('input', (event) => {
    const field = event.target as HTMLInputElement;
    if (field.matches('[data-checkin-blocker]')) {
      checkInDraft = { ...checkInDraft, blocker: field.value };
      return;
    }
    if (field.matches('[data-command-input]') && menu) {
      menu = { query: field.value, active: 0 };
      return renderMenu();
    }
    if (field.matches('[data-reset-input]')) {
      resetTyped = field.value;
      return renderSettings('[data-reset-input]');
    }
    if (field.id === 'composer' && $('#composer[aria-invalid="true"]')) redrawComposer();
  });

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const command = target.closest<HTMLElement>('[data-command]');
    if (command) return runCommand(command.dataset.command!);
    if (menu && !target.closest('.command-menu section')) {
      menu = null;
      return renderMenu();
    }
    if (target.closest('[data-keys-close]')) return openKeys(false);
    if (target.closest('[data-open-settings]')) return openSettings(true);
    if (target.closest('[data-settings-close]')) return openSettings(false);
    const goalSetting = target.closest<HTMLElement>('[data-setting-goal]');
    if (goalSetting) return setSettings({ goal: Number(goalSetting.dataset.settingGoal) as Goal }, `[data-setting-goal="${goalSetting.dataset.settingGoal}"]`);
    const toggleSetting = target.closest<HTMLElement>('[data-setting-toggle]');
    if (toggleSetting) {
      const key = toggleSetting.dataset.settingToggle as Toggle;
      return setSettings({ [key]: toggleSetting.dataset.value === 'true' }, `[data-setting-toggle="${key}"][data-value="${toggleSetting.dataset.value}"]`);
    }
    if (target.closest('[data-export]')) return exportData();
    if (target.closest('[data-reset]') && resetTyped === 'RESET') return resetAll();
    if (target.closest('[data-replay]')) {
      settingsOpen = false;
      onboard = { step: 2, name: store.state.settings.name, goal: store.state.settings.goal };
      return renderPage();
    }
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
    if (target.closest('[data-pick-open]')) return openPick();
    if (target.closest('[data-pick-start]')) return startPick();
    if (target.closest('[data-pick-again]')) {
      lastPick = pick?.id ?? lastPick;
      return openPick();
    }
    if (pick && !target.closest('.pick section')) return stopPick();
    const mood = target.closest<HTMLElement>('[data-check-mood]');
    if (mood) return pickMood(mood.dataset.checkMood as Mood);
    if (target.closest('[data-checkin-ready]')) return checkInReady();
    if (target.closest('[data-checkin-skip]')) return skipCheckIn();
    if (target.closest('[data-edit-input]')) return;
    const row = target.closest<HTMLElement>('.task-row');
    if (!row) return;
    // The first click redraws the list, so Chrome sends no dblclick; the click count still reaches 2.
    if (event.detail === 2 && target.closest('[data-edit-text]') && canEdit(row.dataset.id!)) return startEdit(row.dataset.id!);
    selected = row.dataset.id!;
    renderState();
  });

  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !onboard) {
      event.preventDefault();
      menu = menu ? null : { query: '', active: 0 };
      return renderMenu();
    }
    if (menu) {
      const shown = filterCommands(COMMANDS, menu.query);
      if (event.key === 'Escape') {
        event.preventDefault();
        menu = null;
        renderMenu();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        menu.active = (menu.active + (event.key === 'ArrowDown' ? 1 : -1) + shown.length) % Math.max(1, shown.length);
        renderMenu();
      } else if (event.key === 'Enter' && shown[menu.active]) {
        event.preventDefault();
        runCommand(shown[menu.active].id);
      }
      return;
    }
    if (pick) {
      const key = event.key.toLowerCase();
      if (event.key === 'Escape') {
        event.preventDefault();
        stopPick();
        $<HTMLElement>('[data-pick-open]')?.focus();
      } else if (event.key === 'Enter' && pick.landed) {
        event.preventDefault();
        startPick();
      } else if (key === 'p' && pick.landed) {
        event.preventDefault();
        lastPick = pick.id;
        openPick();
      }
      return;
    }
    if (keysOpen) {
      if (event.key === 'Escape' || event.key === '?') {
        event.preventDefault();
        openKeys(false);
      }
      return;
    }
    if (settingsOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        openSettings(false);
      }
      return;
    }
    if (onboard) {
      if (event.key === 'Escape') {
        event.preventDefault();
        finishOnboarding('skip');
      } else if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        onboardAction(onboard.step === STEPS ? 'samples' : 'next');
      }
      return;
    }
    const plain = !isTyping(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey;
    // Z undoes on every page, as the toasts promise; Esc closes the reward editor even from its fields.
    if (plain && event.key === '?') {
      event.preventDefault();
      return openKeys(true);
    }
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
      e: () => selected && canEdit(selected) && startEdit(selected),
      p: () => page === 'today' && openPick(),
      d: () => page === 'today' && selected && moveTo(selected, nextDays(Date.now(), 1)[0], 'tomorrow'),
      m: () => page === 'upcoming' && selected && moveTo(selected, dayKey(Date.now()), 'Today'),
      Delete: () => selected && remove(selected),
      Escape: () => {
        if (!selected && checkInProps()) return skipCheckIn();
        selected = null;
        renderState();
      },
    };
    if (!keys[key]) return;
    event.preventDefault();
    keys[key]();
  });

  root.addEventListener('focusout', (event) => {
    if ((event.target as HTMLElement).matches('[data-edit-input]') && editing) endEdit(true);
  });

  window.addEventListener('hashchange', () => {
    page = pageFromHash(location.hash);
    renderPage();
  });

  renderPage();
  dismissLoader(store.state.settings.motion);
  if (loaded.status === 'blocked') showToast('This list lasts until the tab closes: this browser blocks saving');
}

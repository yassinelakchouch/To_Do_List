import { MAX_NAME, type Goal } from '../../core/store';
import { esc } from '../html';
import { PAGES } from '../pages';
import { athlete } from '../parts/career';
import { icon } from '../parts/icons';

export type OnboardingStep = 1 | 2 | 3 | 4;
export const STEPS = 4;

const GOALS: Goal[] = [3, 5, 8];

const dots = (step: OnboardingStep) =>
  `<div class="flex gap-1.5" aria-hidden="true">${[1, 2, 3, 4].map((n) => `<span class="h-1.5 rounded-full ${n === step ? 'w-[18px] bg-accent' : 'w-1.5 bg-outline'}"></span>`).join('')}</div>`;

const primary = (label: string, action: string) =>
  `<button type="button" class="inline-flex h-9 items-center rounded-full bg-cream px-4 font-mono text-[12.5px] text-ground" data-onboard="${action}">${label}</button>`;
const quiet = (label: string, action: string) =>
  `<button type="button" class="inline-flex h-9 items-center rounded-full border border-line px-4 font-mono text-[12.5px] text-cream" data-onboard="${action}">${label}</button>`;

// What each page is for, in the words the tour uses.
const PURPOSE: Record<string, string> = {
  today: 'what you are doing now: add, size, tick',
  upcoming: 'plan ahead; D sends a task to tomorrow',
  career: 'your league, quests and best days',
  rewards: 'treats you set and buy with sparks',
  done: 'look back, day by day',
};

// The first visit (board T-07): a dialog over the real app in four steps (your name, how it works, your pages, your day); every step can be skipped.
export function onboarding(step: OnboardingStep, name = '', goal: Goal = 5): string {
  let body = '';
  if (step === 1) {
    body = `<h2 id="onboard-title" class="text-2xl font-semibold tracking-[-0.02em]">Hi. What should we <span class="font-serif font-normal italic">call</span> you?</h2>
      <label class="grid gap-1.5"><span class="sr-only">Your name</span><input id="onboard-name" class="h-11 rounded-lg border border-line bg-surface px-3.5 text-[15px] text-cream outline-none placeholder:text-muted focus-visible:border-cream focus-visible:outline-none" maxlength="${MAX_NAME}" autocomplete="given-name" placeholder="Your name" value="${esc(name)}" /></label>
      <p class="font-mono text-[11px] text-muted">Kept only on this device. You can change it later.</p>
      <div class="flex items-center justify-between">${quiet('Skip · Esc', 'skip')}${primary('Next ↵', 'next')}</div>`;
  } else if (step === 2) {
    body = `<h2 id="onboard-title" class="text-2xl font-semibold tracking-[-0.02em]">How it <span class="font-serif font-normal italic">works</span>${name ? `, ${esc(name)}` : ''}</h2>
      <picture class="block overflow-hidden rounded-lg border border-line"><source srcset="./how-to.webp" type="image/webp" /><img src="./how-to.gif" width="720" height="270" class="block h-auto w-full" alt="A task is typed, sized L with Tab, added with Enter, then ticked with X, earning 30 sparks." /></picture>
      <ol class="grid gap-2 font-mono text-[11px] text-cream sm:grid-cols-3"><li>1 · type, ↵ adds</li><li>2 · Tab sizes S M L</li><li>3 · X ticks, sparks fly</li></ol>
      <div class="flex items-center justify-between">${quiet('Back', 'back')}${primary('Next ↵', 'next')}</div>`;
  } else if (step === 3) {
    const pages = PAGES.map(({ page, label, icon: name }) => `<li class="flex items-center gap-3"><span class="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-accent">${icon(name, 18)}</span><span class="grid gap-0.5"><span class="text-sm">${label}</span><span class="font-mono text-[11px] text-muted">${PURPOSE[page]}</span></span></li>`).join('');
    body = `<h2 id="onboard-title" class="text-2xl font-semibold tracking-[-0.02em]">Your <span class="font-serif font-normal italic">pages</span></h2>
      <ul class="grid gap-3" aria-label="The five pages">${pages}</ul>
      <p class="font-mono text-[11px] text-muted">In the sidebar on a computer, in the tab bar on a phone.</p>
      <div class="flex items-center justify-between">${quiet('Back', 'back')}${primary('Next ↵', 'next')}</div>`;
  } else {
    const choices = GOALS.map((g) => `<button type="button" class="h-10 w-14 rounded-[10px] border font-mono text-sm ${g === goal ? 'border-cream bg-cream text-ground' : 'border-line text-cream'}" data-goal="${g}" aria-pressed="${g === goal}">${g}</button>`).join('');
    body = `<h2 id="onboard-title" class="text-2xl font-semibold tracking-[-0.02em]">How many <span class="font-serif font-normal italic">today</span>?</h2>
      <div class="flex gap-2" role="group" aria-label="Tasks to finish each day">${choices}</div>
      <p class="flex items-center gap-3 font-mono text-xs text-cream"><span class="text-accent">${athlete(1, 48)}</span>You start as a Rookie. Every task moves you along.</p>
      <div class="flex flex-wrap items-center justify-between gap-3">${quiet('Start empty', 'empty')}${primary('Try with 5 sample tasks', 'samples')}</div>`;
  }
  return `<div class="onboarding fixed inset-0 z-40 grid place-items-center bg-black/60 p-4">
    <section class="grid w-full max-w-[560px] gap-4 rounded-[14px] border border-line bg-raised p-6 sm:p-7" role="dialog" aria-modal="true" aria-labelledby="onboard-title" data-step="${step}">
      ${dots(step)}<p class="sr-only">Step ${step} of ${STEPS}</p>${body}
    </section>
  </div>`;
}

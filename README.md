# To do, done · todo-project003

A 2022 to-do list, rebuilt in the open: Linear's calm rows, and a career you grow by finishing what you planned. Every piece was released as it landed; the 2022 version stays at [`/legacy/`](https://yassinelakchouch.github.io/To_Do_List/legacy/).

**Live:** [yassinelakchouch.github.io/To_Do_List](https://yassinelakchouch.github.io/To_Do_List/)

Designed on boards T-01 to T-07 (study, storyboard, hi-fi, play from Synergy, components, site map and flows, the loader and onboarding). The plan and its tasks are in [`docs/PLAN.md`](docs/PLAN.md).

## The pages

| Page | For |
|---|---|
| Today | add, size (S · M · L), tick; the morning check-in, the week's challenge, quests and rewards beside the list |
| Upcoming | plan ahead by day; a task's size, label and day in its detail |
| Career | your league on the track, every quest, your best days on a podium, the week |
| Rewards | treats you set and price in sparks; redeem, with Undo |
| Done | finished tasks by day, with what each day earned |

A first visit asks your name, shows how it works, tours the five pages and offers five sample tasks. Settings hold the day's goal, the week's first day (Monday or Sunday), the check-in, sound, motion, export and a reset you confirm by typing.

## How it pays

- **A task:** S 10 · M 20 · L 30, as XP (your league) and sparks (what rewards cost).
- **A chain:** two ticks within 90 s pay ×2, three or more ×3.
- **Bonuses:** the morning check-in +15; the day's goal +20; each quest tier +25 XP; the week's challenge +50.
- **Unticking or undoing** takes back exactly what it gave: points are worked out from the list, never kept as a running total.

## Keys

| Key | Does |
|---|---|
| C | add a task (Tab sizes it while typing) |
| X · E · ⌫ | done / not done · edit in place · delete |
| J · K | move through the list |
| D · M | plan for tomorrow (Today) · move to Today (Upcoming) |
| P | pick for me: a slot lands on an open task |
| Z | undo, on every page |
| ⌘K · ? | every action by name · this list |

## Motion and sound

GSAP and Web Audio, after board T-05:
- **Tick:** the gain flies to the spark pill as the counts roll, with a bright tick.
- **Chain:** ×2 slides out and fades after 90 quiet seconds.
- **Quest tier:** the next fifth of the emblem draws clockwise.
- **Pick for me:** the slot spins about 0.8 s.
- **Redeem:** the stamp drops with a small overshoot.
- **League up:** the crest draws in with a short fanfare; on your next Career visit the athlete morphs into its new pose.

The Motion and Sound switches turn each off; a reduced-motion system gets the still version.

## Run

```sh
npm ci
npm run dev        # http://localhost:5182
npm test           # unit tests (189)
npm run test:e2e   # 57 flows, every use case on board T-06, on desktop and phone (keyboard-only ones skip the phone), in the installed Chrome
npm run build
```

## Stack

Vite 8 · TypeScript 7 (strict) · Tailwind CSS v4 (`@theme` tokens) · GSAP · Web Audio · `localStorage` · Vitest and Playwright. No framework: string components, one store with an undo history, event delegation.

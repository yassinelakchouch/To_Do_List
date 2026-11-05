# To do, done · todo-project003

A 2022 to-do list, rebuilt in the open: Linear's calm rows, and a career you grow by finishing what you planned. Every piece is released as it lands; the 2022 version stays at [`/legacy/`](https://yassinelakchouch.github.io/To_Do_List/legacy/).

Designed on boards T-01 to T-06 (study, storyboard, hi-fi, play from Synergy, components, site map and flows). The plan and its tasks are in [`docs/PLAN.md`](docs/PLAN.md).

## Stack

Vite 8 · TypeScript 7 (strict) · Tailwind CSS v4 (`@theme` tokens) · GSAP · Web Audio · `localStorage` · Vitest and Playwright.

## Run

```sh
npm ci
npm run dev        # http://localhost:5182
npm test           # unit tests
npm run test:e2e   # flows on desktop and phone, in the installed Chrome
npm run build
```

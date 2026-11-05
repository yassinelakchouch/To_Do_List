# Plan: To do, done (todo-project003)

From boards T-04 (play from Synergy), T-05 (storyboard and components) and T-06 (site map, flows, every screen). Each change is committed on `dev` and released alone through a `dev` → `main` PR; every merge redeploys GitHub Pages.

## Foundation

- [x] Setup: Vite, TypeScript, Tailwind tokens, CI, Pages, the 2022 version under `legacy/`
- [x] Tasks: add (S, M, L effort, label, day), tick, edit, delete, move, undo with Z

## T-04 · rules and parts

- [x] Earning: S 10 · M 20 · L 30 as XP and sparks; check-in +15; day goal +20; chain ×2 within 90 s (×3 cap); un-tick takes back
- [x] Leagues (0 · 1,000 · 3,000 · 6,000 · 10,000 XP), quests (4 × 5 tiers, +25 XP), weekly challenge, best days
- [x] Rewards you set: redeem spends sparks, never XP; undo; never below zero
- [x] Storage: versioned, blocked-storage fallback, export, reset
- [x] Parts: spark, effort bars, day pie, crests, athlete poses, quest emblem, weather moods, podium, slot, stamp, icons, career track

## T-05 · screens and motion

- [x] Shell: sidebar 220 · list · inspector 340; header with pie, league, XP, sparks; phone tab bar and sheets; active in orange
- [x] Today: composer (C, Tab effort, empty ↵ answered in place), rows, J/K, X, E, ⌫, toasts with Undo; inspector
- [x] Morning check-in: weather moods, yesterday, today's picks, I'm ready (+15), Esc skips
- [x] Career: the track, quests, podium, week
- [x] Motion and sound: spark flight, digit roll, chain chip, quest fifth, stamp, slot, league crest; Motion and Sound switches
- [ ] League up: the athlete morphing to its next pose (today it swaps pose on Career; the crest draws in on Today)
- [x] ⌘K command menu

## T-06 · missing pages and flows

- [x] Upcoming and task detail (D to tomorrow, a day in the detail, M to Today)
- [x] Rewards page and editor (add, edit, delete), redeem with Undo
- [x] Done by day with the day's summary; reopen
- [x] Settings (goal, check-in, sound, motion, export, reset), first run with sample tasks and a page tour, keys sheet
- [ ] Week start in Settings (weeks start on Monday for now)
- [x] End-to-end flows for every use case, desktop and phone; README; final release

## Rules for every change

- 44 px targets on touch, 4.5:1 text contrast (checked by `src/lib/contrast.test.ts`), visible focus, Motion off path.
- Orange only for what you earned; no coloured left edges on rows.
- One concern per commit; tests with each change; CI green before the release merges.

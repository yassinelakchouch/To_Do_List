import type { Effort, Label } from './tasks';

// Five realistic tasks of mixed sizes for a first visit (board T-07 frame 04): enough to tick, size and earn within a minute.
export const SAMPLES: { text: string; effort: Effort; label: Label }[] = [
  { text: 'Reply to the client about the deck', effort: 1, label: 'work' },
  { text: 'Write the case study intro', effort: 3, label: 'work' },
  { text: 'Buy coffee beans', effort: 1, label: 'home' },
  { text: 'Gym · legs', effort: 2, label: 'health' },
  { text: 'Plan the weekend trip', effort: 2, label: 'home' },
];

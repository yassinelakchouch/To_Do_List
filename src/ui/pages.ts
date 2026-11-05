import type { IconName } from './parts/icons';

export type Page = 'today' | 'upcoming' | 'career' | 'rewards' | 'done';

export const PAGES: { page: Page; label: string; icon: IconName }[] = [
  { page: 'today', label: 'Today', icon: 'sunrise' },
  { page: 'upcoming', label: 'Upcoming', icon: 'chain' },
  { page: 'career', label: 'Career', icon: 'bolt' },
  { page: 'rewards', label: 'Rewards', icon: 'cup' },
  { page: 'done', label: 'Done', icon: 'tray' },
];

export const pageFromHash = (hash: string): Page => PAGES.find((p) => `#/${p.page}` === hash)?.page ?? 'today';

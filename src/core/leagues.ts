export const LEAGUES = [
  { name: 'Rookie', from: 0 },
  { name: 'Starter', from: 1_000 },
  { name: 'Pro', from: 3_000 },
  { name: 'All-star', from: 6_000 },
  { name: 'Legend', from: 10_000 },
] as const;

export type LeagueName = (typeof LEAGUES)[number]['name'];

export interface Standing {
  tier: number;
  name: LeagueName;
  next: LeagueName | null;
  toNext: number;
  // How far along the current stretch, 0 to 1: where the athlete stands on the career track.
  share: number;
}

// XP only grows, so the league never drops; Legend has no next stretch.
export function standing(xp: number): Standing {
  const total = Math.max(0, Math.floor(xp));
  const tier = LEAGUES.reduce((found, league, i) => (total >= league.from ? i : found), 0);
  const current = LEAGUES[tier];
  const next = LEAGUES[tier + 1];
  if (!next) return { tier: tier + 1, name: current.name, next: null, toNext: 0, share: 1 };
  return { tier: tier + 1, name: current.name, next: next.name, toNext: next.from - total, share: (total - current.from) / (next.from - current.from) };
}

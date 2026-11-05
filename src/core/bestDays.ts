import { dayKey, ledger, type EarnInput } from './earn';

export interface BestDay {
  day: string;
  earned: number;
}

// Your three best days this month by points earned, first in front; on a tie the earlier day keeps its place.
export function bestDays(input: EarnInput, now: number, places = 3): BestDay[] {
  const month = dayKey(now).slice(0, 7);
  return [...ledger(input).days]
    .filter(([day, d]) => day.startsWith(month) && d.earned > 0)
    .map(([day, d]) => ({ day, earned: d.earned }))
    .sort((a, b) => b.earned - a.earned || a.day.localeCompare(b.day))
    .slice(0, places);
}

// Today climbs onto the podium when it beats the day in third place, or fills an empty place.
export function isOnPodium(input: EarnInput, now: number): boolean {
  return bestDays(input, now).some((best) => best.day === dayKey(now));
}

import { dayKey } from './earn';

export type RewardIcon = 'cup' | 'pad' | 'book' | 'walk' | 'sunrise';

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: RewardIcon;
}

export interface Redemption {
  id: string;
  rewardId: string;
  cost: number;
  at: number;
}

export interface RewardState {
  rewards: Reward[];
  redeemed: Redemption[];
}

export type RewardAction =
  | { type: 'add'; id: string; name: string; cost: number; icon: RewardIcon }
  | { type: 'edit'; id: string; name?: string; cost?: number; icon?: RewardIcon }
  | { type: 'remove'; id: string }
  | { type: 'redeem'; id: string; rewardId: string; at: number; sparks: number };

export const MAX_NAME = 40;
export const COST = { min: 10, max: 2_000, step: 10 } as const;

// What a new list suggests on its first run; each one can be edited or removed.
export const SUGGESTED: Reward[] = [
  { id: 'coffee', name: 'Coffee at Bloom', cost: 60, icon: 'cup' },
  { id: 'walk', name: 'A walk by the sea', cost: 120, icon: 'walk' },
  { id: 'episode', name: 'An episode of One Piece', cost: 300, icon: 'pad' },
];

const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME);
const cleanCost = (cost: number) => Math.min(COST.max, Math.max(COST.min, Math.round(cost / COST.step) * COST.step));

// A redeem is refused unless the sparks cover it, so the balance never goes below zero; a removed reward keeps its past redeems.
export function reduceRewards(state: RewardState, action: RewardAction): RewardState {
  switch (action.type) {
    case 'add': {
      const name = cleanName(action.name);
      if (!name || state.rewards.some((r) => r.id === action.id)) return state;
      return { ...state, rewards: [...state.rewards, { id: action.id, name, cost: cleanCost(action.cost), icon: action.icon }] };
    }
    case 'edit': {
      const reward = state.rewards.find((r) => r.id === action.id);
      if (!reward) return state;
      const name = action.name === undefined ? reward.name : cleanName(action.name);
      if (!name) return state;
      const next = { ...reward, name, cost: action.cost === undefined ? reward.cost : cleanCost(action.cost), icon: action.icon ?? reward.icon };
      return { ...state, rewards: state.rewards.map((r) => (r.id === reward.id ? next : r)) };
    }
    case 'remove':
      return state.rewards.some((r) => r.id === action.id) ? { ...state, rewards: state.rewards.filter((r) => r.id !== action.id) } : state;
    case 'redeem': {
      const reward = state.rewards.find((r) => r.id === action.rewardId);
      if (!reward || action.sparks < reward.cost) return state;
      return { ...state, redeemed: [...state.redeemed, { id: action.id, rewardId: reward.id, cost: reward.cost, at: action.at }] };
    }
  }
}

export const spent = (redeemed: Redemption[]) => redeemed.reduce((sum, r) => sum + r.cost, 0);

export const redeemedOn = (redeemed: Redemption[], rewardId: string, now: number) => redeemed.some((r) => r.rewardId === rewardId && dayKey(r.at) === dayKey(now));

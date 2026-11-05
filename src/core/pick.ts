import type { Task } from './tasks';

// A random open task, never the one picked just before when there is another to land on.
export function pickTask(open: Task[], previous: string | null = null, random = Math.random): Task | null {
  const pool = open.length > 1 ? open.filter((t) => t.id !== previous) : open;
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}

// The reel's positions for a spin that ends on `target`, one per tick, wrapping round the list.
export function spinPath(count: number, target: number, ticks = 10): number[] {
  if (count < 2) return [target];
  return Array.from({ length: ticks + 1 }, (_, i) => (((target - ticks + i) % count) + count) % count);
}

// Each tick a little slower than the last, about 0.8 s in all, so the reel settles instead of stopping dead.
export const tickDelay = (tick: number) => 40 + tick * 9;

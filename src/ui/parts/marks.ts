import type { Effort } from '../../core/tasks';

// Small marks drawn for this app (boards T-04, T-05); colours come from the theme through CSS variables and currentColor.
const ACCENT = 'var(--color-accent)';
const GROUND = 'var(--color-ground)';
const DIM = 'var(--color-dim)';

const svg = (size: number, viewBox: string, body: string, extra = '') =>
  `<svg width="${size}" height="${size}" viewBox="${viewBox}" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;

const SPARK = 'M12 1.5 L14.2 9.8 L22.5 12 L14.2 14.2 L12 22.5 L9.8 14.2 L1.5 12 L9.8 9.8 Z';

// The point you earn: filled once earned, an outline while it is still to earn.
export function spark(size = 16, earned = true): string {
  const paint = earned ? `fill="${ACCENT}" stroke="${ACCENT}"` : `fill="none" stroke="${DIM}"`;
  return svg(size, '0 0 24 24', `<path d="${SPARK}" ${paint} stroke-width="1.2" stroke-linejoin="round"/>`, ' class="spark"');
}

// Linear's estimate, as three rising bars: S lights one, M two, L three.
export function effortBars(effort: Effort, size = 16): string {
  const bars = [0, 1, 2]
    .map((i) => `<rect x="${1 + i * 5}" y="${11 - i * 4}" width="3.4" height="${4 + i * 4}" rx="1" fill="${i < effort ? 'currentColor' : DIM}"/>`)
    .join('');
  return svg(size, '0 0 16 16', bars, ' class="effort"');
}

// The day's goal as Linear's cycle pie: the wedge grows with each task done, and the ring turns orange when it is met.
export function dayPie(done: number, goal: number, size = 18): string {
  const share = goal > 0 ? Math.min(1, Math.max(0, done / goal)) : 0;
  const r = 6.2;
  let wedge = '';
  if (share >= 1) wedge = `<circle cx="9" cy="9" r="${r}" fill="${ACCENT}"/>`;
  else if (share > 0) {
    const angle = 2 * Math.PI * share - Math.PI / 2;
    const x = (9 + r * Math.cos(angle)).toFixed(2);
    const y = (9 + r * Math.sin(angle)).toFixed(2);
    wedge = `<path d="M9 9 L9 ${(9 - r).toFixed(2)} A${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${x} ${y} Z" fill="${ACCENT}"/>`;
  }
  const ring = `<circle cx="9" cy="9" r="8" fill="none" stroke="${share >= 1 ? ACCENT : 'currentColor'}" stroke-width="1.4" opacity="${share >= 1 ? 1 : 0.6}"/>`;
  return svg(size, '0 0 18 18', ring + wedge, ' class="day-pie"');
}

// A task's ring: hollow to do, orange with an ink tick once done (shape and tick, never colour alone).
export function statusRing(done: boolean, size = 16): string {
  const body = done
    ? `<circle cx="8" cy="8" r="7" fill="${ACCENT}"/><path class="tick" d="M4.6 8.2 L7 10.4 L11.4 5.8" fill="none" stroke="${GROUND}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>`;
  return svg(size, '0 0 16 16', body, ` class="status-ring" data-done="${done}"`);
}

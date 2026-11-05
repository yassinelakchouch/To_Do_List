import type { BestDay } from '../../core/bestDays';

const HEIGHTS = [98, 70, 52];

export const shortDay = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return `${new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'short' })} ${d}`;
};

// Your best days on a podium (Synergy's leaderboard with one player): first in the middle, a flag on it; blocks grow with the width.
export function podium(best: BestDay[], width = 300, scale = 1): string {
  const gap = 14;
  const block = Math.min(170, Math.max(80, ((width - 2 * gap) / 3) * 0.72));
  const base = 130 + Math.round(98 * (scale - 1));
  const x0 = (width - (3 * block + 2 * gap)) / 2;
  const slots = [1, 0, 2];
  const parts = slots.map((place, column) => {
    const day = best[place];
    const height = Math.round(HEIGHTS[place] * scale);
    const x = x0 + column * (block + gap);
    const y = base - height;
    const mid = (x + block / 2).toFixed(1);
    const first = place === 0;
    if (!day) return `<rect class="empty" x="${x.toFixed(1)}" y="${y}" width="${block.toFixed(1)}" height="${height}" rx="4" fill="none" stroke="var(--color-dim)" stroke-width="1.2" stroke-dasharray="4 4"/>`;
    return [
      `<rect class="block" data-place="${place + 1}" x="${x.toFixed(1)}" y="${y}" width="${block.toFixed(1)}" height="${height}" rx="4" fill="var(--color-surface)" stroke="${first ? 'var(--color-accent)' : 'currentColor'}" stroke-width="1.4"/>`,
      `<text x="${mid}" y="${y + 26}" text-anchor="middle" font-size="20" font-weight="600" fill="${first ? 'var(--color-accent)' : 'currentColor'}">${place + 1}</text>`,
      `<text x="${mid}" y="${y - 22}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="currentColor">${shortDay(day.day)}</text>`,
      `<text x="${mid}" y="${y - 8}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" fill="var(--color-muted)">✦ ${day.earned}</text>`,
      first ? `<path class="flag" d="M${mid} ${y - 56} V${y - 36} M${mid} ${y - 56} L${(x + block / 2 + 14).toFixed(1)} ${y - 51} L${mid} ${y - 46}" fill="var(--color-accent)" stroke="var(--color-accent)" stroke-width="1.4" stroke-linejoin="round"/>` : '',
    ].join('');
  });
  const label = best.length ? `Best days: ${best.map((d, i) => `${i + 1}. ${shortDay(d.day)}, ${d.earned} sparks`).join('; ')}` : 'No best days yet this month';
  return `<svg class="podium" width="${width}" height="${base + 66}" viewBox="0 -64 ${width} ${base + 66}" role="img" aria-label="${label}" font-family="var(--font-display)" style="overflow: visible">${parts.join('')}<path d="M4 ${base + 0.5} H${width - 4}" stroke="var(--color-line)"/></svg>`;
}

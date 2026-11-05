import type { QuestId } from '../../core/quests';
import { ICONS, type IconName } from './icons';

export const QUEST_ICON: Record<QuestId, IconName> = { focus: 'weight', speed: 'bolt', rhythm: 'chain', 'early-start': 'sunrise' };

const TIERS = 5;
const R = 17;
const GAP = 0.08;

// A quest's badge: a circle cut in five, each tier reached closes a fifth in orange, the quest's icon inside.
export function emblem(quest: QuestId, tier: number, size = 40): string {
  const reached = Math.min(TIERS, Math.max(0, Math.round(tier)));
  const arcs = Array.from({ length: TIERS }, (_, i) => {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / TIERS + GAP;
    const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / TIERS - GAP;
    const [x0, y0, x1, y1] = [20 + R * Math.cos(a0), 20 + R * Math.sin(a0), 20 + R * Math.cos(a1), 20 + R * Math.sin(a1)].map((n) => n.toFixed(2));
    const on = i < reached;
    return `<path class="fifth" data-on="${on}" d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}" fill="none" stroke="${on ? 'var(--color-accent)' : 'var(--color-dim)'}" stroke-width="2.4" stroke-linecap="round"/>`;
  }).join('');
  const inner = `<g transform="translate(11 11) scale(0.75)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[QUEST_ICON[quest]]}</g>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" focusable="false" class="emblem" data-tier="${reached}">${arcs}${inner}</svg>`;
}

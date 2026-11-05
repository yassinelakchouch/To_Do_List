// A hexagon crest per league (Synergy's mark, redrawn): a chevron for each of the first three, then a star, then a filled crest for Legend.
const ACCENT = 'var(--color-accent)';

const chevron = (i: number, mark: string) =>
  `<path class="chevron" d="M7.5 ${17 - i * 3.4} L12 ${14 - i * 3.4} L16.5 ${17 - i * 3.4}" fill="none" stroke="${mark}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;

const STAR = 'M12 4.2 L13 6.4 L15.3 6.6 L13.6 8.1 L14.1 10.4 L12 9.2 L9.9 10.4 L10.4 8.1 L8.7 6.6 L11 6.4 Z';

// `mark` colours the chevrons and star: orange for a league you hold, dim for one still ahead.
export function crest(tier: number, size = 20, mark = ACCENT): string {
  const level = Math.min(5, Math.max(1, Math.round(tier)));
  const chevrons = Array.from({ length: level <= 3 ? level : 2 }, (_, i) => chevron(i, mark)).join('');
  const star = level >= 4 ? `<path class="star" d="${STAR}" fill="${mark}"/>` : '';
  const legend = level === 5;
  const hexagon = `<path d="M12 1.8 L20.8 6.9 V17.1 L12 22.2 L3.2 17.1 V6.9 Z" fill="${legend && mark === ACCENT ? 'rgb(255 90 44 / 0.16)' : 'none'}" stroke="${legend ? mark : 'currentColor'}" stroke-width="1.4" stroke-linejoin="round"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="crest" data-tier="${level}">${hexagon}${chevrons}${star}</svg>`;
}

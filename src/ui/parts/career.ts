import { LEAGUES, standing } from '../../core/leagues';
import { crest } from './crest';

const ACCENT = 'var(--color-accent)';
const MUTED = 'var(--color-muted)';

// Synergy's athlete who becomes a legend, as our own pictogram: warm-up, jog, sprint, the tape, the podium.
const POSES = [
  '<circle cx="50" cy="20" r="7"/><path d="M50 29 V58 M50 34 L38 22 M50 34 L62 22 M50 58 L42 84 M50 58 L58 84"/>',
  '<circle cx="54" cy="20" r="7"/><path d="M52 29 L46 56 M50 35 L38 46 L32 40 M50 35 L62 42 L70 36 M46 56 L58 70 L54 86 M46 56 L36 72 L26 74"/>',
  '<circle cx="62" cy="22" r="7"/><path d="M58 30 L44 54 M54 36 L38 40 L30 32 M54 36 L70 46 L76 40 M44 54 L62 64 L66 84 M44 54 L28 66 L14 62"/><path d="M6 30 H22 M2 42 H16 M8 54 H20" stroke-dasharray="1 4"/>',
  `<circle cx="50" cy="18" r="7"/><path d="M50 27 V56 M50 32 L36 14 M50 32 L64 14 M50 56 L40 82 M50 56 L62 80"/><path d="M8 40 Q50 48 92 40" stroke="${ACCENT}"/>`,
  `<circle cx="50" cy="16" r="7"/><path d="M50 25 V50 M50 30 L38 18 M50 30 L62 18 M50 50 L44 70 M50 50 L56 70"/><rect x="30" y="72" width="40" height="16" rx="2"/><path d="M36 9 Q50 -3 64 9" stroke="${ACCENT}"/>`,
];

export function athlete(tier: number, size = 64, attrs = ''): string {
  const pose = POSES[Math.min(5, Math.max(1, Math.round(tier))) - 1];
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" focusable="false" class="athlete"${attrs}><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${pose}</g></svg>`;
}

const text = (x: number, y: number, body: string, attrs: string) => `<text x="${x.toFixed(1)}" y="${y}" ${attrs}>${body}</text>`;

// One track, equal stretches per league, the athlete at your XP; compact names only your league and the next, so names never collide.
export function careerTrack(xp: number, width: number, compact = false): string {
  const you = standing(xp);
  const size = compact ? 56 : 86;
  const lane = compact ? size + 26 : 112;
  const [x0, x1] = compact ? [size / 2 + 10, width - 18] : [30, width - 30];
  const step = (x1 - x0) / 4;
  const ax = x0 + (you.tier - 1 + (you.next ? you.share : 0)) * step;
  const parts = [
    `<path d="M${x0} ${lane} H${x1}" stroke="var(--color-track)" stroke-width="6" stroke-linecap="round"/>`,
    `<path class="run" d="M${x0} ${lane} H${ax.toFixed(1)}" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/>`,
  ];
  LEAGUES.forEach((league, i) => {
    const x = x0 + i * step;
    const reached = i < you.tier;
    const crestSize = compact ? 18 : 22;
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${lane}" r="${compact ? 6 : 7}" fill="${reached ? ACCENT : 'var(--color-ground)'}" stroke="${reached ? ACCENT : MUTED}" stroke-width="2"/>`);
    parts.push(crest(i + 1, crestSize, reached ? ACCENT : 'var(--color-dim)').replace('<svg ', `<svg x="${(x - crestSize / 2).toFixed(1)}" y="${lane + (compact ? 16 : 26)}" color="${reached ? 'var(--color-cream)' : MUTED}" `));
    const named = !compact || i === you.tier - 1 || i === you.tier;
    if (!named) return;
    const anchor = compact ? 'middle' : i === 0 ? 'start' : i === 4 ? 'end' : 'middle';
    const fill = compact && i === you.tier - 1 ? ACCENT : reached || compact ? 'var(--color-cream)' : MUTED;
    const tx = compact ? Math.min(Math.max(x, 26), width - 26) : x;
    parts.push(text(tx, lane + (compact ? 50 : 66), league.name, `class="league-name" text-anchor="${anchor}" fill="${fill}" font-size="${compact ? 12 : 13}"`));
    if (!compact) parts.push(text(x, lane + 82, `${league.from.toLocaleString('en')} XP`, `text-anchor="${anchor}" fill="${MUTED}" font-size="10.5" font-family="var(--font-mono)"`));
  });
  if (you.next) {
    const fx = x0 + you.tier * step;
    const flag = compact ? 30 : 38;
    parts.push(`<path class="flag" d="M${fx.toFixed(1)} ${lane - 8} V${lane - 8 - flag} L${(fx + 16).toFixed(1)} ${lane - 2 - flag} L${fx.toFixed(1)} ${lane + 4 - flag}" fill="none" stroke="var(--color-cream)" stroke-width="1.6" stroke-linejoin="round" stroke-dasharray="3 3"/>`);
    if (!compact) parts.push(text(fx + 24, lane - 38, `${you.toNext.toLocaleString('en')} XP to ${you.next}`, `fill="var(--color-cream)" font-size="11" font-family="var(--font-mono)"`));
  }
  // Speed lines trail behind the athlete, so they only show once there is room behind it on the track.
  if (xp > 0 && ax - size * 0.9 >= x0) parts.push(`<path class="speed" d="M${(ax - size * 0.9).toFixed(1)} ${lane - size * 0.35} H${(ax - size * 0.45).toFixed(1)} M${(ax - size * 0.8).toFixed(1)} ${lane - size * 0.2} H${(ax - size * 0.42).toFixed(1)}" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 5"/>`);
  const pose = xp > 0 ? Math.min(you.tier, 3) : 1;
  parts.push(athlete(pose, size, ` x="${(ax - size / 2).toFixed(1)}" y="${lane - size + 4}" color="${ACCENT}"`));
  parts.push(text(Math.min(Math.max(ax, 30), width - 30), lane - size - 6, `${Math.floor(Math.max(0, xp)).toLocaleString('en')} XP`, `class="your-xp" text-anchor="middle" fill="${ACCENT}" font-size="11" font-family="var(--font-mono)"`));
  const height = lane + (compact ? 58 : 90);
  const top = compact ? 18 : 0;
  return `<svg class="career-track" width="${width}" height="${height + top}" viewBox="0 ${-top} ${width} ${height + top}" role="img" aria-label="${you.name}, ${Math.floor(Math.max(0, xp))} XP${you.next ? `, ${you.toNext} to ${you.next}` : ''}" font-family="var(--font-display)" style="overflow: visible">${parts.join('')}</svg>`;
}

// The mark a redeemed reward gets for the day: a tilted orange ring stamped inside its card (54 px, never spilling out).
export function stamp(size = 54, word = 'REDEEMED'): string {
  const ring = '<circle cx="43" cy="43" r="38" fill="none" stroke="var(--color-accent)" stroke-width="2.2"/><circle cx="43" cy="43" r="31" fill="none" stroke="var(--color-accent)" stroke-width="1" stroke-dasharray="2 3"/>';
  const text = `<text x="43" y="47" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" font-weight="500" fill="var(--color-accent)" letter-spacing="1">${word}</text>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 86 86" aria-hidden="true" focusable="false" class="stamp"><g transform="rotate(-14 43 43)">${ring}${text}</g></svg>`;
}

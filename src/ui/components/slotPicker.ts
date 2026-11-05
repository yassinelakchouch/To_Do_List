import { esc } from '../html';

export type Reel = [string, string, string];

// The three names in view: the one between the orange lines is the pick, its neighbours fade.
export const slotReel = (rows: Reel) =>
  rows
    .map((name, i) => `<div class="flex h-[34px] items-center justify-center truncate px-3 ${i === 1 ? 'text-sm text-cream' : 'text-[12.5px] text-muted opacity-50'}"${i === 1 ? '' : ' aria-hidden="true"'}>${esc(name)}</div>`)
    .join('');

const pill = (label: string, attr: string, strong: boolean) =>
  `<button type="button" class="inline-flex h-[26px] items-center rounded-full px-2.5 font-mono text-xs ${strong ? 'bg-cream text-ground' : 'border border-line text-cream'}" ${attr}>${label}</button>`;

export const slotActions = (landed: boolean) => (landed ? pill('Again · P', 'data-pick-again', false) + pill('Start it ↵', 'data-pick-start', true) : '');

// Pick for me (board T-05 frame 07, site map: overlay): a slot over the page, spinning, then landed with Start it.
export function slotPicker(rows: Reel, landed: boolean): string {
  return `<div class="pick fixed inset-0 z-40 grid place-items-center bg-black/50 p-4">
    <section class="grid w-full max-w-[320px] gap-2 rounded-[10px] border border-line bg-surface p-2 outline-none" role="dialog" aria-modal="true" aria-label="Pick for me" tabindex="-1">
      <div class="relative overflow-hidden rounded-md"><div data-reel>${slotReel(rows)}</div><div class="pointer-events-none absolute inset-x-0 top-[34px] h-[34px] border-y border-accent" aria-hidden="true"></div></div>
      <p class="sr-only" aria-live="polite" data-pick-said>${landed ? `Picked: ${esc(rows[1])}` : ''}</p>
      <div class="flex items-center justify-between gap-2 px-1"><span class="font-mono text-[11px] text-muted">Pick for me · P</span><span class="flex gap-1.5" data-pick-actions>${slotActions(landed)}</span></div>
    </section>
  </div>`;
}

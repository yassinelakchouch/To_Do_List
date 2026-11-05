export const KEYS: { action: string; keys: string }[] = [
  { action: 'Add a task', keys: 'C' },
  { action: 'Size it while typing', keys: 'Tab' },
  { action: 'Done / not done', keys: 'X' },
  { action: 'Edit the text', keys: 'E' },
  { action: 'Move through the list', keys: 'J K' },
  { action: 'Delete', keys: '⌫' },
  { action: 'Plan for tomorrow (Today)', keys: 'D' },
  { action: 'Move to Today (Upcoming)', keys: 'M' },
  { action: 'Undo', keys: 'Z' },
  { action: 'Command menu', keys: '⌘K' },
  { action: 'This sheet', keys: '?' },
];

const kbd = (keys: string) => keys.split(' ').map((k) => `<kbd class="rounded border border-line px-1.5 font-mono text-[11px] text-muted">${k}</kbd>`).join(' ');

// Every key in one place (board T-06 M): single letters work when no field has the focus.
export function keysSheet(): string {
  const rows = KEYS.map(({ action, keys }) => `<div class="flex h-8 items-center justify-between text-[13px]"><dt>${action}</dt><dd class="flex gap-1">${kbd(keys)}</dd></div>`).join('');
  return `<div class="keys fixed inset-0 z-40 grid place-items-center bg-black/60 p-4">
    <section class="grid w-full max-w-[420px] gap-2 rounded-[14px] border border-line bg-raised px-6 py-5" role="dialog" aria-modal="true" aria-labelledby="keys-title">
      <div class="mb-1 flex items-center justify-between"><h2 id="keys-title" class="text-lg font-semibold">Keys</h2><button type="button" class="inline-flex h-8 items-center rounded-full border border-line px-3 font-mono text-xs" data-keys-close>Close · Esc</button></div>
      <dl class="grid">${rows}</dl>
      <p class="font-mono text-[11px] text-muted">Letters work when no field has the focus.</p>
    </section>
  </div>`;
}

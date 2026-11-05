import { esc } from '../html';

interface ToastProps {
  text: string;
  action?: { label: string; key: string; id: string };
}

export const TOAST_MS = 5_000;

// What just happened, with one way back (boards T-02, T-05): a status read out politely, its action named with its key.
export function toast({ text, action }: ToastProps): string {
  const button = action
    ? `<button type="button" class="toast-action inline-flex h-7 items-center gap-2 rounded-full bg-cream px-2.5 font-mono text-xs text-ground" data-toast-action="${esc(action.id)}" aria-keyshortcuts="${esc(action.key)}">${esc(action.label)} <span class="opacity-60" aria-hidden="true">${esc(action.key)}</span></button>`
    : '';
  return `<div class="toast inline-flex h-10 max-w-[calc(100vw-32px)] items-center gap-3.5 rounded-full border border-outline bg-raised pr-2 pl-4 text-sm whitespace-nowrap" role="status" aria-live="polite"><span class="truncate">${esc(text)}</span>${button}</div>`;
}

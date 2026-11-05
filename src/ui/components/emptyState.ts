import { esc } from '../html';

export type EmptyVariant = 'first-run' | 'soon' | 'all-done' | 'no-match';

export interface EmptyAction {
  label: string;
  href?: string;
  action?: string;
}

export interface EmptyProps {
  variant: EmptyVariant;
  title?: string;
  text?: string;
  action?: EmptyAction;
}

// Each variant's words, from boards T-02, T-05 and T-06; a caller can override any of them.
const COPY: Record<EmptyVariant, { title: string; accent: string; text: string }> = {
  'first-run': { title: 'Nothing here', accent: 'yet', text: 'Type your first task and press ↵.' },
  soon: { title: 'On its', accent: 'way', text: 'This page arrives in a later release.' },
  'all-done': { title: 'All', accent: 'done', text: 'Everything planned for today is finished.' },
  'no-match': { title: 'Nothing', accent: 'here', text: 'No task matches this view.' },
};

const actionHtml = ({ label, href, action }: EmptyAction) =>
  href
    ? `<a class="empty-action justify-self-start font-mono text-xs text-cream underline underline-offset-4" href="${esc(href)}">${esc(label)}</a>`
    : `<button type="button" class="empty-action min-h-9 justify-self-start rounded-full bg-cream px-3.5 font-mono text-xs text-ground" data-action="${esc(action ?? '')}">${esc(label)}</button>`;

// One empty state for every list and page: a title with one italic word, a line of help, and at most one way forward.
export function emptyState({ variant, title, text, action }: EmptyProps): string {
  const copy = COPY[variant];
  const heading = title ? esc(title) : `${copy.title} <span class="font-serif font-normal italic">${copy.accent}</span>.`;
  return `<section class="empty-state grid max-w-[640px] gap-3" data-variant="${variant}">
    <h2 class="text-[22px] font-semibold tracking-[-0.02em]">${heading}</h2>
    <p class="text-sm leading-relaxed text-body">${esc(text ?? copy.text)}</p>${action ? actionHtml(action) : ''}
  </section>`;
}

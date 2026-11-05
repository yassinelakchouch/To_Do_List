import { PAGES, type Page } from '../pages';
import { icon } from '../parts/icons';

// Phones: the five pages as a tab bar above the home indicator.
export function tabBar(active: Page): string {
  const tabs = PAGES.map(({ page, label, icon: name }) => {
    const on = page === active;
    return `<a href="#/${page}" class="grid min-h-11 min-w-11 justify-items-center gap-1 font-mono text-[10px] ${on ? 'text-cream' : 'text-muted'}"${on ? ' aria-current="page"' : ''}><span class="${on ? 'text-accent' : ''}">${icon(name, 20)}</span>${label}</a>`;
  }).join('');
  return `<nav class="tab-bar fixed inset-x-0 bottom-0 flex justify-around border-t border-line bg-ground pt-2 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden" aria-label="Pages">${tabs}</nav>`;
}

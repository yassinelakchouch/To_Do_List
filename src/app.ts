import { load } from './core/storage';
import { createStore, summarize } from './core/store';
import { emptyState } from './ui/components/emptyState';
import { header, pageFromHash, PAGES, sidebar, tabBar, type Page } from './ui/shell';

// Pages land one release at a time; until a page arrives it says so, and Today keeps the 2022 list one link away.
function body(page: Page): string {
  if (page === 'today') {
    return emptyState({ variant: 'first-run', text: 'The list itself arrives in the next release. Until then, the original still works.', action: { label: 'Open the 2022 version', href: './legacy/index.html' } });
  }
  return emptyState({ variant: 'soon', title: PAGES.find((p) => p.page === page)!.label });
}

export function start(root: HTMLElement) {
  const store = createStore(load().state);
  const render = () => {
    const page = pageFromHash(location.hash);
    const summary = summarize(store.state, Date.now());
    const { label } = PAGES.find((p) => p.page === page)!;
    root.innerHTML = `<div class="flex min-h-dvh">${sidebar(page, summary)}<div class="flex min-w-0 flex-1 flex-col">${header(label, summary)}<main class="flex-1 px-4 pt-6 pb-28 lg:px-[18px] lg:pb-6">${body(page)}</main></div></div>${tabBar(page)}`;
  };
  window.addEventListener('hashchange', render);
  render();
}

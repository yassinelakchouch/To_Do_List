import { load } from './core/storage';
import { createStore, summarize } from './core/store';
import { header, pageFromHash, PAGES, sidebar, tabBar, type Page } from './ui/shell';

// Pages land one release at a time; until a page arrives it says so plainly and keeps the 2022 list one link away.
function body(page: Page): string {
  const legacy = '<a class="font-mono text-xs text-cream underline underline-offset-4" href="./legacy/index.html">Open the 2022 version</a>';
  if (page === 'today') {
    return `<section class="grid max-w-[640px] gap-3"><h2 class="text-[22px] font-semibold tracking-[-0.02em]">Nothing here <span class="font-serif font-normal italic">yet</span>.</h2>
      <p class="text-sm leading-relaxed text-body">The list itself arrives in the next release. Until then, the original still works.</p>${legacy}</section>`;
  }
  const { label } = PAGES.find((p) => p.page === page)!;
  return `<section class="grid max-w-[640px] gap-3"><h2 class="text-[22px] font-semibold tracking-[-0.02em]">${label}</h2><p class="text-sm leading-relaxed text-body">This page arrives in a later release.</p></section>`;
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

import { esc } from '../html';

export interface Command {
  id: string;
  label: string;
  keys?: string;
}

// Matches every word typed, in any order, anywhere in the label: "go car" finds "Go to Career".
export function filterCommands(commands: Command[], query: string): Command[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return commands.filter((c) => words.every((w) => c.label.toLowerCase().includes(w)));
}

// ⌘K (board T-05 frame 12): a combobox over a list of every action by name; arrows move, Enter runs, Esc closes.
export function commandMenu(commands: Command[], query: string, active: number): string {
  const shown = filterCommands(commands, query);
  const index = Math.min(active, Math.max(0, shown.length - 1));
  const options = shown
    .map(
      (c, i) =>
        `<li id="command-${esc(c.id)}" role="option" aria-selected="${i === index}" class="flex h-9 cursor-pointer items-center justify-between rounded-md px-2.5 text-[13px] ${i === index ? 'bg-surface text-cream' : 'text-body'}" data-command="${esc(c.id)}">${esc(c.label)}${c.keys ? `<kbd class="rounded border border-line px-1.5 font-mono text-[11px] text-muted">${esc(c.keys)}</kbd>` : ''}</li>`,
    )
    .join('');
  const activeId = shown[index] ? ` aria-activedescendant="command-${esc(shown[index].id)}"` : '';
  return `<div class="command-menu fixed inset-0 z-50 grid items-start justify-items-center bg-black/50 px-4 pt-[12vh]">
    <section class="w-full max-w-[460px] rounded-xl border border-line bg-raised p-2" role="dialog" aria-modal="true" aria-label="Command menu">
      <input class="h-10 w-full border-b border-line bg-transparent px-2.5 text-sm text-cream outline-none placeholder:text-muted focus-visible:outline-none" data-command-input role="combobox" aria-expanded="true" aria-controls="command-list" aria-autocomplete="list"${activeId} placeholder="Type a command…" value="${esc(query)}" />
      <ul id="command-list" role="listbox" aria-label="Commands" class="mt-1.5 grid max-h-[50vh] gap-0.5 overflow-y-auto">${options || '<li class="px-2.5 py-2 text-sm text-muted" role="presentation">No command matches.</li>'}</ul>
    </section>
  </div>`;
}

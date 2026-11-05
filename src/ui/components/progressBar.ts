// One thin progress bar for every card: cream while on the way, orange once complete; the numbers stay as text beside it.
export function progressBar(have: number, need: number, label: string): string {
  const share = need > 0 ? Math.min(1, Math.max(0, have / need)) : 0;
  const done = share >= 1;
  return `<span class="progress block h-1 flex-1 rounded-full bg-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${need}" aria-valuenow="${Math.min(have, need)}"><span class="block h-1 rounded-full ${done ? 'bg-accent' : 'bg-cream'}" style="width: ${Math.round(share * 100)}%"></span></span>`;
}

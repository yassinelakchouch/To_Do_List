import { MAX_NAME, type Goal, type Settings } from '../../core/store';
import { esc } from '../html';

export type Toggle = 'checkIn' | 'sound' | 'motion';

const TOGGLES: { key: Toggle; label: string }[] = [
  { key: 'checkIn', label: 'Morning check-in' },
  { key: 'sound', label: 'Sound' },
  { key: 'motion', label: 'Motion' },
];

const pill = (on: boolean, attrs: string, label: string) =>
  `<button type="button" class="inline-flex h-7 items-center rounded-full border px-2.5 font-mono text-xs ${on ? 'border-cream bg-cream text-ground' : 'border-line text-cream'}" ${attrs} aria-pressed="${on}">${label}</button>`;
const line = (label: string, control: string) =>
  `<div class="flex min-h-11 items-center justify-between gap-4 border-b border-line text-sm"><span>${label}</span>${control}</div>`;

// Settings (board T-06 K and Q): your name, the day's goal, the check-in, sound and motion, your data, and a reset you confirm by typing.
export function settingsSheet(settings: Settings, resetTyped = ''): string {
  const goals = ([3, 5, 8] as Goal[]).map((g) => pill(settings.goal === g, `data-setting-goal="${g}"`, String(g))).join('');
  const toggles = TOGGLES.map(({ key, label }) => line(label, `<span class="flex gap-1" role="group" aria-label="${label}">${pill(settings[key], `data-setting-toggle="${key}" data-value="true"`, 'On')}${pill(!settings[key], `data-setting-toggle="${key}" data-value="false"`, 'Off')}</span>`)).join('');
  const armed = resetTyped === 'RESET';
  return `<div class="settings fixed inset-0 z-40 grid items-end bg-black/60 sm:place-items-center sm:p-4">
    <section class="grid w-full max-w-[520px] gap-1 rounded-t-2xl border border-line bg-raised px-6 pt-5 pb-7 sm:rounded-[14px]" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="mb-2 flex items-center justify-between"><h2 id="settings-title" class="text-xl font-semibold">Settings</h2><button type="button" class="inline-flex h-8 items-center rounded-full border border-line px-3 font-mono text-xs" data-settings-close>Close · Esc</button></div>
      ${line('Your name', `<input class="h-8 w-40 rounded-md border border-line bg-surface px-2.5 text-sm text-cream outline-none focus-visible:border-cream focus-visible:outline-none" data-setting-name maxlength="${MAX_NAME}" aria-label="Your name" placeholder="You" value="${esc(settings.name)}" />`)}
      ${line('Day’s goal', `<span class="flex gap-1" role="group" aria-label="Day’s goal">${goals}</span>`)}
      ${toggles}
      ${line('How it works', '<button type="button" class="font-mono text-xs underline underline-offset-4" data-replay>Replay</button>')}
      ${line('Your data', '<button type="button" class="font-mono text-xs underline underline-offset-4" data-export>Export JSON</button>')}
      <div class="mt-3 grid gap-2"><label class="font-mono text-[11px] text-muted" for="reset-confirm">Start over: type RESET to clear the list, rewards and progress on this device</label>
        <div class="flex gap-2"><input id="reset-confirm" class="h-9 min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 font-mono text-sm text-cream outline-none focus-visible:border-cream focus-visible:outline-none" data-reset-input autocomplete="off" value="${esc(resetTyped)}" />
        <button type="button" class="inline-flex h-9 items-center rounded-full px-3.5 font-mono text-xs ${armed ? 'bg-accent text-ground' : 'border border-line text-muted'}" data-reset${armed ? '' : ' disabled'}>Reset</button></div></div>
      <p class="mt-2 font-mono text-[11px] text-muted">Everything stays on this device.</p>
    </section>
  </div>`;
}

import { CHECK_IN_XP } from '../../core/earn';
import type { Mood } from '../../core/store';
import { esc } from '../html';
import { MOOD_ORDER, MOODS, moodIcon } from '../parts/moods';

export interface CheckInProps {
  now: number;
  mood: Mood | null;
  yesterday: string[];
  open: string[];
  blocker?: string;
}

const clock = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const names = (list: string[], none: string) =>
  list.length ? list.slice(0, 3).map(esc).join(' · ') + (list.length > 3 ? ` · +${list.length - 3}` : '') : `<span class="text-muted">${none}</span>`;
const fact = (title: string, body: string) => `<div class="grid gap-1"><span class="font-mono text-[11px] text-muted">${title}</span><span class="text-[13px] text-cream">${body}</span></div>`;

// The morning check-in (board T-04, inspector "checkin"): a mood, yesterday, today, what's in the way, then I'm ready for +15 XP.
export function checkInCard({ now, mood, yesterday, open, blocker = '' }: CheckInProps): string {
  const moods = MOOD_ORDER.map(
    (m) =>
      `<button type="button" class="grid justify-items-center gap-1 rounded-[10px] border py-2 font-mono text-[11px] ${m === mood ? 'border-cream bg-surface text-cream' : 'border-line text-muted hover:text-cream'}" data-check-mood="${m}" aria-pressed="${m === mood}">${moodIcon(m, 26)}${MOODS[m].word}</button>`,
  ).join('');
  return `<section class="check-in grid gap-3 rounded-xl border border-line p-4" aria-label="Morning check-in">
    <span class="font-mono text-[11px] text-muted">Morning check-in · ${clock(now)}</span>
    <h2 class="text-base font-semibold">How’s the day starting?</h2>
    <div class="grid grid-cols-4 gap-1.5" role="group" aria-label="Mood">${moods}</div>
    ${fact('Yesterday · done', names(yesterday, 'Nothing ticked'))}
    ${fact(`Today · ${open.length} open`, names(open, 'Nothing yet, add a few'))}
    <label class="grid gap-1"><span class="font-mono text-[11px] text-muted">In the way</span><input class="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-cream outline-none placeholder:text-muted focus-visible:border-cream focus-visible:outline-none" data-checkin-blocker maxlength="80" placeholder="Nothing, or a word…" value="${esc(blocker)}" /></label>
    <button type="button" class="h-10 rounded-full font-mono text-[12.5px] ${mood ? 'bg-cream text-ground' : 'border border-line text-muted'}" data-checkin-ready${mood ? '' : ' disabled'}>I’m ready · +${CHECK_IN_XP} XP</button>
    <button type="button" class="justify-self-center font-mono text-[11px] text-muted underline underline-offset-4" data-checkin-skip>Skip for today · Esc</button>
  </section>`;
}

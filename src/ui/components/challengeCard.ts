import type { Challenge } from '../../core/challenge';
import { esc } from '../html';
import { shortDay } from '../parts/podium';
import { progressBar } from './progressBar';

// This week's challenge (Synergy's weekly wins): the goal, how far along, and when it ends; met says so in words and orange.
export function challengeCard(challenge: Challenge): string {
  const ends = challenge.met ? 'met · new on Monday' : `ends ${shortDay(challenge.endsOn)}`;
  return `<article class="challenge-card grid gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3" data-met="${challenge.met}">
    <div class="flex justify-between font-mono text-[11px] text-muted"><span>This week’s challenge</span><span class="${challenge.met ? 'text-accent' : ''}">${ends}</span></div>
    <h3 class="text-sm font-normal">${esc(challenge.title)}</h3>
    <div class="flex items-center gap-2.5">${progressBar(challenge.have, challenge.need, esc(challenge.title))}<span class="font-mono text-xs text-cream">${challenge.have}/${challenge.need}</span></div>
  </article>`;
}

import type { Mood } from '../../core/store';

// The morning check-in asks with weather, not faces (board T-04: no borrowed faces); each mood keeps its word beside it.
export const MOODS: Record<Mood, { word: string; paths: string }> = {
  storm: { word: 'rough', paths: '<path d="M7 14 A4 4 0 0 1 7.5 6 A5.5 5.5 0 0 1 18 7.5 A3.5 3.5 0 0 1 17.5 14 Z"/><path d="M12 15 L10 19 H13 L11 22.5"/>' },
  rain: { word: 'slow', paths: '<path d="M7 13 A4 4 0 0 1 7.5 5 A5.5 5.5 0 0 1 18 6.5 A3.5 3.5 0 0 1 17.5 13 Z"/><path d="M8.5 16 L7.5 19 M12.5 16 L11.5 19 M16.5 16 L15.5 19"/>' },
  cloud: { word: 'okay', paths: '<circle cx="9" cy="8" r="3"/><path d="M8 18 A4 4 0 0 1 8.5 10 A5.5 5.5 0 0 1 19 11.5 A3.5 3.5 0 0 1 18.5 18 Z"/>' },
  sun: { word: 'great', paths: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.3 5.3 L7 7 M17 17 L18.7 18.7 M5.3 18.7 L7 17 M17 7 L18.7 5.3"/>' },
};

export const MOOD_ORDER: Mood[] = ['storm', 'rain', 'cloud', 'sun'];

export function moodIcon(mood: Mood, size = 24): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="mood" data-mood="${mood}"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${MOODS[mood].paths}</g></svg>`;
}

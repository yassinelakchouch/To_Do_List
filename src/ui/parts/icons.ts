// Line icons drawn for this app in one weight (1.5 on a 24 grid): rewards, quests and the sidebar share them.
export const ICONS = {
  cup: '<path d="M5 9 H17 V15 A5 5 0 0 1 12 20 H10 A5 5 0 0 1 5 15 Z"/><path d="M17 11 H19 A2 2 0 0 1 19 15 H17"/><path d="M8 3 Q9 5 8 7 M12 3 Q13 5 12 7"/>',
  pad: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 10.5 V14.5 M5 12.5 H9"/><circle cx="16" cy="11.5" r="0.9"/><circle cx="18" cy="13.5" r="0.9"/>',
  book: '<path d="M3 5 Q8 3.5 12 6 Q16 3.5 21 5 V19 Q16 17.5 12 20 Q8 17.5 3 19 Z"/><path d="M12 6 V20"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="M13 7 L11 13 L7 20 M11 13 L15 16 L16 21 M12 9 L16 11 M12 9 L8 11"/>',
  sunrise: '<path d="M3 17 H21"/><path d="M7 17 A5 5 0 0 1 17 17"/><path d="M12 6 V9 M5.5 9.5 L7.5 11.5 M18.5 9.5 L16.5 11.5"/><path d="M6 21 H18"/>',
  tray: '<path d="M3 13 L6 5 H18 L21 13 V19 H3 Z"/><path d="M3 13 H8 L9.5 15.5 H14.5 L16 13 H21"/>',
  chain: '<rect x="2.5" y="9" width="10" height="6" rx="3" transform="rotate(-30 7.5 12)"/><rect x="11.5" y="9" width="10" height="6" rx="3" transform="rotate(-30 16.5 12)"/>',
  weight: '<path d="M6 9 H18 L20.5 20 H3.5 Z"/><circle cx="12" cy="6" r="2.5"/>',
  bolt: '<path d="M13 2.5 L5 13.5 H11 L10 21.5 L19 9.5 H13 Z"/>',
} as const;

export type IconName = keyof typeof ICONS;

export function icon(name: IconName, size = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="icon"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g></svg>`;
}

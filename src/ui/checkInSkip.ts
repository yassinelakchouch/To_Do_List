const KEY = 'todo-project003:check-in-skipped';

// The day the check-in was skipped, so it stays away until tomorrow; private windows may refuse storage, then it shows next visit.
export function skippedDay(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function rememberSkip(day: string): void {
  try {
    localStorage.setItem(KEY, day);
  } catch {
    // Kept in memory for this visit only.
  }
}

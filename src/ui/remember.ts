const PREFIX = 'todo-project003:';

// Small notes kept on this device beside the saved state (a skipped check-in, the last league seen on Career).
// Private windows may refuse storage; then the note lasts for this visit only.
export function recall(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function remember(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Kept in memory by the caller for this visit.
  }
}

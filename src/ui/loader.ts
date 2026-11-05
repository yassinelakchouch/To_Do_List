const SEEN = 'todo-project003:loaded';
const MIN_MS = 1_650;
const FADE_MS = 300;

// Once per visit, long enough to enjoy (the spark lands at 1.6 s, then a 0.3 s fade); a later load in the visit, or Motion off, skips it.
export function dismissLoader(motion: boolean, startedAt = performance.now()) {
  const loader = document.getElementById('loader');
  if (!loader) return;
  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN) === '1';
    sessionStorage.setItem(SEEN, '1');
  } catch {
    // Storage blocked: show it every time, it is short.
  }
  if (seen || !motion) return loader.remove();
  const wait = Math.max(0, MIN_MS - (performance.now() - startedAt));
  window.setTimeout(() => {
    loader.setAttribute('data-leaving', '');
    window.setTimeout(() => loader.remove(), FADE_MS);
  }, wait);
}

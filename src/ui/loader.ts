const SEEN = 'todo-project003:loaded';
const MIN_MS = 600;
const FADE_MS = 200;

// The day pie fills once per visit, never longer than 0.9 s; a later load in the same visit, or Motion off, removes it at once.
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

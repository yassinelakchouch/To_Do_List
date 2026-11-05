const SEEN = 'todo-project003:loaded';
const FADE_MS = 300;

// Once per visit, it leaves when its own animation ends (the spark lands at 1.6 s), then fades for 0.3 s; a later load in the visit, or Motion off, skips it.
export function dismissLoader(motion: boolean) {
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
  // Counting from this call held the finished loader still while the app booted (about 3 s on screen); its animations know when it is done.
  void Promise.allSettled(loader.getAnimations({ subtree: true }).map((animation) => animation.finished)).then(() => {
    loader.setAttribute('data-leaving', '');
    window.setTimeout(() => loader.remove(), FADE_MS);
  });
}

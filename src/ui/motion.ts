import { gsap } from 'gsap';

export const canMove = (setting: boolean) => setting && !matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface Counts {
  xp: number;
  sparks: number;
}

// The header's XP and sparks roll to a new value; painting by query keeps a roll going if the header is redrawn mid-way.
export function createCounter(format: (n: number) => string) {
  const shown: Counts = { xp: 0, sparks: 0 };
  let goal: Counts | null = null;
  let tween: gsap.core.Tween | null = null;
  const paint = () => {
    for (const key of ['xp', 'sparks'] as const) {
      const el = document.querySelector(`[data-count="${key}"]`);
      if (el) el.textContent = format(Math.round(shown[key]));
    }
  };
  return {
    sync(next: Counts, animate: boolean, delay = 0) {
      if (goal && goal.xp === next.xp && goal.sparks === next.sparks) {
        if (tween && tween.progress() < 1) paint();
        return;
      }
      const first = goal === null;
      goal = { ...next };
      tween?.kill();
      tween = null;
      if (first || !animate) return void Object.assign(shown, next);
      paint();
      tween = gsap.to(shown, { xp: next.xp, sparks: next.sparks, duration: 0.6, delay, ease: 'power3.out', onUpdate: paint });
    },
  };
}

// +N rises along a curve to the spark pill (board T-05 "Tick"): x eases in while y eases out, so the path bows.
export function flySpark(text: string, from: Element, to: Element, onLand: () => void) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const chip = Object.assign(document.createElement('span'), { className: 'spark-flight pointer-events-none fixed top-0 left-0 z-50 font-mono text-xs text-accent', textContent: text });
  chip.setAttribute('aria-hidden', 'true');
  document.body.append(chip);
  gsap.set(chip, { x: a.left + a.width / 2, y: a.top + a.height / 2, xPercent: -50, yPercent: -50 });
  gsap
    .timeline({
      onComplete: () => {
        chip.remove();
        onLand();
      },
    })
    .to(chip, { x: b.left + b.width / 2, duration: 0.62, ease: 'power1.in' }, 0)
    .to(chip, { y: b.top + b.height / 2, duration: 0.62, ease: 'power3.out' }, 0)
    .to(chip, { scale: 0.7, opacity: 0, duration: 0.14 }, 0.5);
}

export const pulse = (el: Element | null) => el && gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });

// The stamp drops from 1.3× with a small overshoot (board T-05 "Redeem").
export const dropStamp = (el: Element | null) => el && gsap.from(el, { scale: 1.3, opacity: 0, rotate: -6, duration: 0.45, ease: 'back.out(2.2)', transformOrigin: '50% 50%' });

// The ×2 chip slides out of the spark pill (board T-05 "Chain").
export const slideIn = (el: Element | null) => el && gsap.from(el, { x: -6, opacity: 0, duration: 0.3, ease: 'power2.out' });

// Strokes draw from their start, so a clockwise arc closes clockwise: a quest's new fifth (0.5 s), a new crest.
export function drawStrokes(shapes: SVGGeometryElement[], duration = 0.5) {
  shapes.forEach((shape, i) => {
    const length = shape.getTotalLength();
    gsap.fromTo(shape, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration, delay: i * 0.08, ease: 'power2.out', clearProps: 'strokeDasharray,strokeDashoffset' });
  });
}


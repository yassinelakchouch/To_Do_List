import { dayKey, type Day } from '../../core/earn';
import { shiftDay, weekKey } from '../../core/weeks';

// Sunday first, as Date.getDay counts; each bar takes the letter of its own day.
const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const letter = (day: string) => LETTERS[new Date(`${day}T12:00:00`).getDay()];

// Seven days from the week's first day (Monday unless chosen otherwise), with what each earned; days ahead count as nothing.
export function weekDays(days: Map<string, Day>, now: number, first = weekKey(dayKey(now))): { day: string; earned: number; today: boolean }[] {
  const today = dayKey(now);
  return Array.from({ length: 7 }, (_, i) => {
    const key = shiftDay(first, i);
    return { day: key, earned: days.get(key)?.earned ?? 0, today: key === today };
  });
}

// Linear's pulse for the week: one bar per day, today in orange; a quiet day is a thin line and nothing more.
export function weekChart(week: { day: string; earned: number; today: boolean }[], width = 304, height = 44): string {
  const top = Math.max(1, ...week.map((d) => d.earned));
  const gap = 8;
  const bar = (width - gap * 6) / 7;
  const bars = week
    .map((d, i) => {
      const h = d.earned ? Math.max(3, ((height - 8) * d.earned) / top) : 2;
      const fill = d.today ? 'var(--color-accent)' : d.earned ? 'var(--color-cream)' : 'var(--color-dim)';
      return `<rect x="${(i * (bar + gap)).toFixed(1)}" y="${(height - 4 - h).toFixed(1)}" width="${bar.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${fill}" opacity="${d.today ? 1 : 0.8}"/>` +
        `<text x="${(i * (bar + gap) + bar / 2).toFixed(1)}" y="${height + 12}" text-anchor="middle" font-family="var(--font-mono)" font-size="10" fill="var(--color-muted)">${letter(d.day)}</text>`;
    })
    .join('');
  const label = `This week: ${week.map((d) => `${letter(d.day)} ${d.earned}`).join(', ')} sparks`;
  return `<svg class="week-chart" width="${width}" height="${height + 16}" viewBox="0 0 ${width} ${height + 16}" role="img" aria-label="${label}">${bars}</svg>`;
}

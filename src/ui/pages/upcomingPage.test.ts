import { describe, expect, it } from 'vitest';
import type { Task } from '../../core/tasks';
import { nextDays, upcomingPage, upcomingTasks } from './upcomingPage';

const NOW = new Date(2026, 10, 5, 12).getTime();
const task = (id: string, day: string, done = false): Task => ({ id, text: id, effort: 1, label: null, day, done, doneAt: done ? NOW : null });

describe('upcoming page', () => {
  it('lists the next seven days after today', () => {
    expect(nextDays(NOW)).toEqual(['2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12']);
  });

  it('keeps open tasks planned after today, soonest first', () => {
    const tasks = [task('fri', '2026-11-07'), task('today', '2026-11-05'), task('thu', '2026-11-06'), task('done', '2026-11-06', true)];
    expect(upcomingTasks(tasks, '2026-11-05').map((t) => t.id)).toEqual(['thu', 'fri']);
  });

  it('groups by day with tomorrow named, and shows the selected task’s detail', () => {
    const html = upcomingPage({ tasks: [task('thu', '2026-11-06'), task('fri', '2026-11-07')], now: NOW, selected: 'fri', effort: 1 });
    expect(html).toContain('Tomorrow · Fri 6');
    expect(html).toContain('placeholder="Add a task for tomorrow…"');
    expect(html.split('class="task-detail').length - 1).toBe(2);
  });

  it('shows the row being edited as a field', () => {
    expect(upcomingPage({ tasks: [task('thu', '2026-11-06')], now: NOW, selected: 'thu', effort: 1, editing: 'thu' })).toContain('data-edit-input');
  });

  it('says how to plan ahead when nothing is planned', () => {
    expect(upcomingPage({ tasks: [], now: NOW, selected: null, effort: 1 })).toContain('Nothing planned ahead');
  });
});

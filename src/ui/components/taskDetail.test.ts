import { describe, expect, it } from 'vitest';
import type { Task } from '../../core/tasks';
import { taskDetail } from './taskDetail';

const task = (extra: Partial<Task> = {}): Task => ({ id: 't', text: 'Write the <case> study', effort: 3, label: 'work', day: '2026-11-08', done: false, doneAt: null, ...extra });
const DAYS = ['2026-11-06', '2026-11-07', '2026-11-08'];

describe('task detail', () => {
  it('names the task, escaped, and presses its size, label and day', () => {
    const html = taskDetail({ task: task(), today: '2026-11-05', days: DAYS });
    expect(html).toContain('Write the &lt;case&gt; study');
    expect(html).toContain('data-detail-effort="3" aria-pressed="true" aria-label="Size L, pays 30"');
    expect(html).toContain('data-detail-label="work" aria-pressed="true"');
    expect(html).toContain('data-detail-day="2026-11-08" aria-pressed="true" aria-label="Sun 8"');
    expect(html.split('aria-pressed="true"').length - 1).toBe(3);
  });

  it('offers Move to Today (M) only for a task planned later', () => {
    expect(taskDetail({ task: task(), today: '2026-11-05', days: DAYS })).toContain('aria-keyshortcuts="M"');
    expect(taskDetail({ task: task({ day: '2026-11-05' }), today: '2026-11-05', days: DAYS })).not.toContain('data-detail-today');
  });

  it('can clear the label', () => {
    expect(taskDetail({ task: task({ label: null }), today: '2026-11-05', days: DAYS })).toContain('data-detail-label="" aria-pressed="true" aria-label="No label"');
  });
});

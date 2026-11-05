import { describe, expect, it } from 'vitest';
import type { Task } from '../../core/tasks';
import { groupHeading, taskRow } from './taskRow';

const task = (extra: Partial<Task> = {}): Task => ({ id: 't1', text: 'Reply to the Hermex client', effort: 2, label: 'work', day: '2026-11-05', done: false, doneAt: null, ...extra });

describe('task row', () => {
  it('names its ring button for what it does, and says whether the task is done', () => {
    expect(taskRow({ task: task() })).toContain('aria-label="Mark done: Reply to the Hermex client" aria-pressed="false"');
    expect(taskRow({ task: task({ done: true, doneAt: 1 }) })).toContain('aria-label="Mark not done: Reply to the Hermex client" aria-pressed="true"');
  });

  it('strikes and dims a done task as well as filling its ring', () => {
    const html = taskRow({ task: task({ done: true, doneAt: 1 }) });
    expect(html).toContain('line-through');
    expect(html).toContain('class="tick"');
  });

  it('shows the keys when selected, on a lighter surface with no coloured edge', () => {
    const html = taskRow({ task: task(), state: 'selected' });
    expect(html).toContain('bg-surface');
    expect(html).toContain('aria-selected="true"');
    expect(html).not.toMatch(/border-l-\d|border-l |inset|box-shadow/);
    expect(html).toContain('⌫');
    expect(html).not.toContain('Work');
  });

  it('shows the label and the day otherwise, and what a tick just earned', () => {
    const html = taskRow({ task: task(), meta: 'Fri', gain: 30 });
    expect(html).toContain('Work');
    expect(html).toContain('>Fri<');
    expect(html).toContain('+30');
  });

  it('escapes typed text everywhere it appears', () => {
    const html = taskRow({ task: task({ text: '<b>bold</b> & "quoted"' }) });
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt; &amp; &quot;quoted&quot;');
  });

  it('turns the text into a labelled field while editing, with how to save or cancel', () => {
    const html = taskRow({ task: task(), state: 'editing' });
    expect(html).toContain('data-edit-input value="Reply to the Hermex client" maxlength="140" aria-label="Edit: Reply to the Hermex client"');
    expect(html).toContain('↵ saves · Esc cancels');
    expect(html).not.toContain('data-edit-text');
  });

  it('heads a group with its name and count', () => {
    expect(groupHeading('This week', 3)).toContain('This week<span class="font-mono text-[11px] text-muted">3</span>');
  });
});

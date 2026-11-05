import { describe, expect, it } from 'vitest';
import { MAX_TEXT } from '../../core/tasks';
import { composer, effortHint } from './composer';

describe('composer', () => {
  it('is a labelled field that keeps typed text to the task limit', () => {
    const html = composer({ effort: 1 });
    expect(html).toContain('<span class="sr-only">Add a task</span>');
    expect(html).toContain(`maxlength="${MAX_TEXT}"`);
    expect(html).toContain('aria-describedby="composer-message"');
  });

  it('says what the chosen size pays and how to change it', () => {
    expect(effortHint(3)).toBe('L · pays 30 · Tab to change');
    expect(composer({ effort: 2 })).toContain('M · pays 20 · Tab to change');
  });

  it('answers an empty ↵ under the field, with an orange border and an alert', () => {
    const html = composer({ effort: 1, state: 'empty' });
    expect(html).toContain('role="alert"');
    expect(html).toContain('Write a few words first; nothing was added.');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('border-accent');
  });
});

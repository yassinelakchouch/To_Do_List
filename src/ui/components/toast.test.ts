import { describe, expect, it } from 'vitest';
import { toast, TOAST_MS } from './toast';

describe('toast', () => {
  it('is read out politely and offers its way back with the key', () => {
    const html = toast({ text: 'Done · Record the RPS demo', action: { label: 'Undo', key: 'Z', id: 'undo' } });
    expect(html).toContain('role="status" aria-live="polite"');
    expect(html).toContain('data-toast-action="undo" aria-keyshortcuts="Z"');
    expect(html).toContain('>Undo <span class="opacity-60" aria-hidden="true">Z</span>');
  });

  it('can say something with no action, and escapes it', () => {
    const html = toast({ text: 'Saved on this device <b>' });
    expect(html).not.toContain('toast-action');
    expect(html).toContain('Saved on this device &lt;b&gt;');
  });

  it('stays five seconds, as the boards promise', () => {
    expect(TOAST_MS).toBe(5_000);
  });
});

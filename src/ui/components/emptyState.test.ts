import { describe, expect, it } from 'vitest';
import { emptyState, type EmptyVariant } from './emptyState';

describe('empty state', () => {
  it('has its own words for each variant, with one italic word', () => {
    const variants: EmptyVariant[] = ['first-run', 'soon', 'all-done', 'no-match'];
    const html = variants.map((variant) => emptyState({ variant }));
    expect(new Set(html).size).toBe(4);
    expect(html[0]).toContain('Nothing here <span class="font-serif font-normal italic">yet</span>.');
    expect(html.every((h) => h.split('italic').length - 1 === 1)).toBe(true);
  });

  it('offers at most one way forward: a link or a button', () => {
    const link = emptyState({ variant: 'first-run', action: { label: 'Open the 2022 version', href: './legacy/index.html' } });
    expect(link).toContain('<a class="empty-action');
    const button = emptyState({ variant: 'first-run', action: { label: 'Try with sample tasks', action: 'samples' } });
    expect(button).toContain('data-action="samples"');
    expect(emptyState({ variant: 'soon' })).not.toContain('empty-action');
  });

  it('lets a caller change the words, escaped', () => {
    const html = emptyState({ variant: 'soon', title: 'Career <soon>', text: 'Arrives after the list & its keys.' });
    expect(html).toContain('Career &lt;soon&gt;');
    expect(html).toContain('Arrives after the list &amp; its keys.');
  });
});

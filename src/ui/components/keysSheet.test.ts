import { describe, expect, it } from 'vitest';
import { KEYS, keysSheet } from './keysSheet';

describe('keys sheet', () => {
  it('is a modal dialog listing every key with what it does', () => {
    const html = keysSheet();
    expect(html).toContain('role="dialog" aria-modal="true" aria-labelledby="keys-title"');
    expect(html.split('<dt>').length - 1).toBe(KEYS.length);
    expect(html).toContain('<dt>Plan for tomorrow (Today)</dt>');
  });

  it('splits two-key moves into two key caps', () => {
    expect(keysSheet()).toContain('>J</kbd> <kbd');
  });
});

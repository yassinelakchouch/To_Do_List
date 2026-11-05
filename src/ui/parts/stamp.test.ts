import { describe, expect, it } from 'vitest';
import { stamp } from './stamp';

describe('stamp', () => {
  it('fits its 54 px column by default and keeps its word inside the ring', () => {
    const svg = stamp();
    expect(svg).toContain('width="54" height="54"');
    expect(svg).toContain('>REDEEMED</text>');
    expect(svg).toContain('rotate(-14 43 43)');
  });

  it('is decoration; the card says "enjoyed · today" in words', () => {
    expect(stamp()).toContain('aria-hidden="true"');
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';

// The colours come from the theme itself, so a token change that breaks the floor fails here.
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const token = (name: string) => css.match(new RegExp(`--color-${name}: (#[0-9a-f]{6});`))![1];

describe('contrast', () => {
  it('matches known pairs', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it.each(['cream', 'body', 'muted', 'accent'])('%s text reads at 4.5:1 or more on the ground and the surface', (name) => {
    expect(contrast(token(name), token('ground'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token(name), token('surface'))).toBeGreaterThanOrEqual(4.5);
  });
});

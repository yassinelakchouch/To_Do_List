import { describe, expect, it } from 'vitest';
import { FRESH, summarize } from '../core/store';
import { esc } from './html';
import { header, pageFromHash, sidebar, tabBar } from './shell';

const summary = summarize(FRESH, new Date(2026, 10, 5, 10).getTime());

describe('shell', () => {
  it('marks only the current page, in orange, for sight and for screen readers', () => {
    const nav = sidebar('career', summary);
    expect(nav.split('aria-current="page"').length - 1).toBe(1);
    expect(nav).toMatch(/text-accent">[^]*?Career/);
    expect(tabBar('done').split('aria-current="page"').length - 1).toBe(1);
  });

  it('shows the league line at the sidebar’s foot', () => {
    expect(sidebar('today', summary)).toContain('Rookie · 0 / 1,000 XP');
  });

  it('puts the day, league, XP and sparks in the header, and the chain only when it runs', () => {
    const plain = header('Today', summary);
    expect(plain).toContain('0/5 today');
    expect(plain).toContain('aria-label="0 sparks"');
    expect(plain).not.toContain('class="chain');
    expect(header('Today', summary, 2)).toContain('×2');
  });

  it('reads the page from the address, Today by default', () => {
    expect(pageFromHash('#/rewards')).toBe('rewards');
    expect(pageFromHash('')).toBe('today');
    expect(pageFromHash('#/nope')).toBe('today');
  });

  it('escapes typed text before it reaches the page', () => {
    expect(esc('<img src=x onerror="alert(1)"> & \'q\'')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;q&#39;');
  });
});

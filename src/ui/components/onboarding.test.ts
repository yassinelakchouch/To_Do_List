import { describe, expect, it } from 'vitest';
import { onboarding } from './onboarding';

describe('onboarding', () => {
  it('is a modal dialog named by its heading, saying which step of four it is', () => {
    const html = onboarding(1);
    expect(html).toContain('role="dialog" aria-modal="true" aria-labelledby="onboard-title"');
    expect(html).toContain('Step 1 of 4');
  });

  it('asks the name first, kept to 24 characters, with a way to skip', () => {
    const html = onboarding(1, 'Yas<b>');
    expect(html).toContain('maxlength="24"');
    expect(html).toContain('value="Yas&lt;b&gt;"');
    expect(html).toContain('data-onboard="skip"');
  });

  it('shows the recorded how-to with a GIF fallback and words for screen readers, using the name', () => {
    const html = onboarding(2, 'Yassine');
    expect(html).toContain('<source srcset="./how-to.webp" type="image/webp" />');
    expect(html).toContain('alt="A task is typed, sized L with Tab, added with Enter, then ticked with X, earning 30 sparks."');
    expect(html).toContain('works</span>, Yassine');
  });

  it('shows the five pages with what each is for', () => {
    const html = onboarding(3);
    expect(html).toContain('aria-label="The five pages"');
    expect(html.split('<li class="flex items-center gap-3">').length - 1).toBe(5);
    expect(html).toContain('plan ahead; D sends a task to tomorrow');
  });

  it('ends with the day’s goal (one pressed) and the choice to start empty or with samples', () => {
    const html = onboarding(4, '', 8);
    expect(html).toContain('data-goal="8" aria-pressed="true"');
    expect(html.split('aria-pressed="true"').length - 1).toBe(1);
    expect(html).toContain('data-onboard="samples"');
    expect(html).toContain('data-onboard="empty"');
  });
});

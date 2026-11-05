import { describe, expect, it } from 'vitest';
import { FRESH } from '../../core/store';
import { settingsSheet } from './settingsSheet';

describe('settings sheet', () => {
  it('is a modal dialog with the name, the goal pressed, and each switch on or off', () => {
    const html = settingsSheet({ ...FRESH.settings, name: 'Yas<b>', goal: 8, sound: false });
    expect(html).toContain('role="dialog" aria-modal="true" aria-labelledby="settings-title"');
    expect(html).toContain('value="Yas&lt;b&gt;"');
    expect(html).toContain('data-setting-goal="8" aria-pressed="true"');
    expect(html).toContain('data-setting-toggle="sound" data-value="false" aria-pressed="true"');
    expect(html).toContain('data-setting-toggle="motion" data-value="true" aria-pressed="true"');
  });

  it('arms Reset only once RESET is typed', () => {
    expect(settingsSheet(FRESH.settings, 'reset')).toContain('data-reset disabled');
    expect(settingsSheet(FRESH.settings, 'RESET')).not.toContain('data-reset disabled');
  });

  it('offers export and a replay of the how-to', () => {
    const html = settingsSheet(FRESH.settings);
    expect(html).toContain('data-export');
    expect(html).toContain('data-replay');
  });
});

import { describe, expect, it } from 'vitest';
import { commandMenu, filterCommands, type Command } from './commandMenu';

const COMMANDS: Command[] = [
  { id: 'add', label: 'Add a task', keys: 'C' },
  { id: 'go-career', label: 'Go to Career' },
  { id: 'go-rewards', label: 'Go to Rewards' },
  { id: 'settings', label: 'Open settings' },
];

describe('command menu', () => {
  it('matches every typed word in any order', () => {
    expect(filterCommands(COMMANDS, 'go car').map((c) => c.id)).toEqual(['go-career']);
    expect(filterCommands(COMMANDS, 'SETTINGS open').map((c) => c.id)).toEqual(['settings']);
    expect(filterCommands(COMMANDS, '')).toHaveLength(4);
  });

  it('is a combobox pointing at the active option, which is the only one selected', () => {
    const html = commandMenu(COMMANDS, 'go', 1);
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-activedescendant="command-go-rewards"');
    expect(html.split('aria-selected="true"').length - 1).toBe(1);
  });

  it('keeps the active option inside the list, and says when nothing matches', () => {
    expect(commandMenu(COMMANDS, 'go', 9)).toContain('aria-activedescendant="command-go-rewards"');
    expect(commandMenu(COMMANDS, 'zzz', 0)).toContain('No command matches.');
  });
});

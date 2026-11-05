import { describe, expect, it, vi } from 'vitest';
import { createSound, CUES } from './sound';

function fakeContext() {
  const tones: number[] = [];
  const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const ctx = {
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    createGain: () => ({ gain: param(), connect: (to: unknown) => to }),
    createOscillator: () => {
      const frequency = { ...param(), setValueAtTime: vi.fn((f: number) => tones.push(f)) };
      return { type: '', frequency, connect: (to: unknown) => to, start: vi.fn(), stop: vi.fn() };
    },
  };
  return { ctx: ctx as unknown as AudioContext, tones };
}

describe('sound', () => {
  it('stays silent, without even making a context, while Sound is off', () => {
    const make = vi.fn(() => fakeContext().ctx);
    createSound(() => false, make).play('tick');
    expect(make).not.toHaveBeenCalled();
  });

  it('plays one oscillator per note, and makes the context once', () => {
    const { ctx, tones } = fakeContext();
    const make = vi.fn(() => ctx);
    const sound = createSound(() => true, make);
    sound.play('tier');
    sound.play('fanfare');
    expect(make).toHaveBeenCalledTimes(1);
    expect(tones).toEqual([660, 990, 523.25, 659.25, 783.99, 1046.5]);
  });

  it('pitches a chain above a tick, keeps every cue short, and does nothing without audio', () => {
    expect(CUES.chain[0].freq).toBeGreaterThan(CUES.tick[0].freq);
    for (const notes of Object.values(CUES)) expect(Math.max(...notes.map((n) => n.at + n.dur))).toBeLessThan(0.7);
    expect(() => createSound(() => true, () => null).play('tick')).not.toThrow();
  });
});

export type Cue = 'tick' | 'chain' | 'tier' | 'ratchet' | 'click' | 'thud' | 'fanfare';

interface Note {
  freq: number;
  at: number;
  dur: number;
  wave: OscillatorType;
  gain: number;
  to?: number;
}

const note = (freq: number, at: number, dur: number, wave: OscillatorType, gain: number, to?: number): Note => ({ freq, at, dur, wave, gain, to });

// Board T-05's sound column: a bright tick, a higher one for a chain, a two-note rise, a ratchet then a click, a soft thud, a short fanfare.
export const CUES: Record<Cue, Note[]> = {
  tick: [note(1320, 0, 0.07, 'triangle', 0.12)],
  chain: [note(1760, 0, 0.07, 'triangle', 0.12)],
  tier: [note(660, 0, 0.12, 'sine', 0.14), note(990, 0.11, 0.18, 'sine', 0.14)],
  ratchet: [note(2200, 0, 0.018, 'square', 0.025)],
  click: [note(1500, 0, 0.04, 'square', 0.05)],
  thud: [note(140, 0, 0.18, 'sine', 0.3, 70)],
  fanfare: [note(523.25, 0, 0.1, 'triangle', 0.12), note(659.25, 0.1, 0.1, 'triangle', 0.12), note(783.99, 0.2, 0.1, 'triangle', 0.12), note(1046.5, 0.3, 0.32, 'triangle', 0.14)],
};

export interface Sound {
  play(cue: Cue): void;
}

const newContext = (): AudioContext | null => {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
};

// The context is made on the first cue, which always follows a tap or a key, so browsers let it play.
export function createSound(enabled: () => boolean, make: () => AudioContext | null = newContext): Sound {
  let ctx: AudioContext | null = null;
  return {
    play(cue) {
      if (!enabled()) return;
      ctx ??= make();
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume();
      const t0 = ctx.currentTime;
      for (const n of CUES[cue]) {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = n.wave;
        osc.frequency.setValueAtTime(n.freq, t0 + n.at);
        if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + n.at + n.dur);
        amp.gain.setValueAtTime(0.0001, t0 + n.at);
        amp.gain.exponentialRampToValueAtTime(n.gain, t0 + n.at + 0.005);
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
        osc.connect(amp).connect(ctx.destination);
        osc.start(t0 + n.at);
        osc.stop(t0 + n.at + n.dur + 0.02);
      }
    },
  };
}

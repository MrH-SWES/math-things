// The film's sound cues, in film seconds, taken from the same timings the scenes act on (and, where
// the app itself sets the timing, from the app). Writes out/cues.json for sound.py.
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { OUT } from './capture.mjs';
import { TAPS, MEET } from './scenes/rekenrek.mjs';
import { BEATS, LAST_PIECE } from './scenes/pattern-blocks.mjs';
import { DRAG } from './scenes/solids.mjs';
import { PULLS } from './scenes/volume-space.mjs';
import { FOLDS } from './scenes/nets.mjs';
import { SLIDES } from './scenes/slicing-solids.mjs';

// where each shot sits in the film
export const AT = { rekenrek: 0, placeValue: 5, pattern: 20, solids: 32, volume: 38, nets: 50, slicing: 57, ret: 65, card: 70, end: 75 };

// the eased progress the scenes use, and its inverse
const ease = u => (1 - Math.cos(Math.PI * u)) / 2;
const unease = e => Math.acos(1 - 2 * e) / Math.PI;

const cues = [];
const cue = (t, kind, extra = {}) => cues.push({ t: +t.toFixed(4), kind, ...extra });

// Rekenrek: each tap sends a group of beads; the sound is them meeting the others
for (const [t, n] of TAPS.opener) cue(AT.rekenrek + t + MEET, 'beads', { n });
for (const [t, n] of TAPS.closer) cue(AT.ret + t + MEET, 'beads', { n, last: true });

// Place Value: the app waits 700 ms, then gathers ten rods into a flat (28% of 2.8 s), flies it
// (to 66%), lands it with a bounce (to 78%), and turns it the hundreds' colour
const carry = AT.placeValue + 0.1 + 0.7, DUR = 2.8;
for (let k = 0; k < 10; k++) cue(carry + DUR * 0.28 * ease((k + 1) / 11), 'rod', { k });
cue(carry + DUR * 0.28, 'gather');
cue(carry + DUR * 0.66, 'land');
cue(carry + DUR * 0.78, 'exchange');
// the flight: out 4.0–7.6 s, a breath, back 8.0–12.7 s into the scene
cue(AT.placeValue + 4.0, 'rush', { dur: 4.0 });
cue(AT.placeValue + 8.0, 'return', { dur: 4.7 });
cue(AT.placeValue + 12.7, 'arrive');

// Pattern Blocks: every piece that lands, then the last trapezoid's fumble and fit
let i = 0;
for (const [tray, beats] of Object.entries(BEATS)) for (const t of beats) cue(AT.pattern + t, 'place', { tray, i: i++ });
cue(AT.pattern + LAST_PIECE.press, 'lift');
cue(AT.pattern + LAST_PIECE.refused, 'refuse');
cue(AT.pattern + (LAST_PIECE.turn[0] + LAST_PIECE.turn[1]) / 2, 'turn');
cue(AT.pattern + LAST_PIECE.press2, 'lift');
cue(AT.pattern + LAST_PIECE.seated, 'seat');

// Solids: the cube is lifted, carried, and set down on the box
cue(AT.solids + DRAG.press, 'lift', { deep: true });
cue(AT.solids + DRAG.release, 'stack');

// Volume Space: a face is grabbed, and each whole number it passes adds or takes away a layer
for (const [t0, t1, axis, from, to] of PULLS) {
  cue(AT.volume + t0, 'grab');
  const n = Math.abs(to - from);
  for (let k = 0; k < n; k++) cue(AT.volume + t0 + (t1 - t0) * unease((k + 0.5) / n), 'layer', { axis, grow: to > from, v: from + Math.sign(to - from) * (k + 1) });
}

// Nets: the faces swing open (ticks as they go), lie flat, swing shut
for (const [t0, t1, a, b] of FOLDS) {
  for (const e of [0.2, 0.45, 0.7]) cue(AT.nets + t0 + (t1 - t0) * unease(e), 'hinge', { open: b > a, e });
  cue(AT.nets + t1, b > a ? 'flat' : 'shut');
}

// Slicing: one clean swish down through the prism, a lighter one back, then the tilt settles
for (const [t0, t1, id, a, b] of SLIDES) cue(AT.slicing + t0, id === 'tilt' ? 'tilt' : 'swish', { dur: t1 - t0, strength: Math.abs(b - a) / 100 });
cue(AT.slicing + SLIDES[2][1], 'set');

// End card
cue(AT.card + 0.65, 'card');

cues.sort((a, b) => a.t - b.t);
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'cues.json'), JSON.stringify({ at: AT, cues }, null, 1));
console.log(cues.length, 'cues →', join(OUT, 'cues.json'));

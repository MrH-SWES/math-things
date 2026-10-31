// 00:00–00:05 and 01:05–01:10: the rekenrek opens and closes the film from one frame.
import { ORIGIN, hide } from '../capture.mjs';

const CSS = `
  header, .controls { display: none !important; }
  body { background: #F5F5F7; }
  /* a closer look at the rack: big enough to feel each bead, wide enough to read the row */
  .workspace { padding: 0 !important; }
  .rack-container { transform: scale(1.95); transform-origin: 50% 50%; }
`;

const bead = (page, row, i) => page.evaluate(([r, i]) => {
  const b = document.querySelectorAll('#rack .row')[r].querySelectorAll('.bead')[i].getBoundingClientRect();
  return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
}, [row, i]);

// A tap is a real press on the bead; the app moves it and its neighbours with its own spring.
const tap = (row, i) => async page => {
  const p = await bead(page, row, i);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.up();
};

async function open(page, { rowOneFull }) {
  await page.goto(ORIGIN + '/apps/rekenrek/');
  await hide(page, CSS);
  // continuity seed: the second row has nine beads across and one waiting
  await tap(1, 8)(page);
  if (rowOneFull) await tap(0, 9)(page);
}

// taps; the beads meet about 0.2 s later (measured from the captured footage)
export const TAPS = { opener: [[0.5, 3], [1.6, 2], [2.8, 5]], closer: [[1.3, 1]] };   // [time, beads moved]
export const MEET = 0.18;

export const opener = {
  name: '01-rekenrek-open', seconds: 5,
  setup: page => open(page, { rowOneFull: false }),
  actions: [
    [0.5, tap(0, 2)],   // three red beads
    [1.6, tap(0, 4)],   // the red five
    [2.8, tap(0, 9)],   // ten
  ],
};

export const closer = {
  name: '08-rekenrek-return', seconds: 5,
  setup: page => open(page, { rowOneFull: true }),
  actions: [
    [1.3, tap(1, 9)],   // the last bead closes the gap
  ],
};

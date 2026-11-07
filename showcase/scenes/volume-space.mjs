// 00:38–00:50: Volume Space. A compact prism is pulled tall, out wide, pressed low and drawn out
// in depth, each by grabbing a face (the app's own push/pull), while the camera circles it like
// a drone and finally rises to the exact view the Nets shot opens on.
import { ORIGIN, hide } from '../capture.mjs';
import { along, cameraPath, safe } from './path.mjs';

const CSS = 'header, footer, .record { display: none !important; }';
const START = { x: 3, y: 2, z: 2 };

// Nets opens on a 6 × 4 × 3 box seen from 54.4° up, turned 0.5 rad: the same view, by the box's
// symmetry, from behind and to the left here (z is up, y runs back).
export const NETS_VIEW = { target: [3, 2, 0.6], az: 180 + 0.5 * 180 / Math.PI, el: 0.95 * 180 / Math.PI, dist: 14 * 0.58 / Math.tan(17.5 * Math.PI / 180) };

export const cam = cameraPath([
  [0, { target: [1.5, 1, 1], az: -32, el: 21, dist: 11.5 }],
  [0.7, { target: [1.5, 1, 1], az: -29, el: 21, dist: 11.6 }],
  [1.9, { target: [1.5, 1, 3], az: -24, el: 18, dist: 14 }],      // pulled tall
  [3.2, { target: [2, 1, 3], az: 42, el: 24, dist: 15 }],
  [4.3, { target: [3, 1, 3], az: 52, el: 26, dist: 15.5 }],       // pulled wide
  [5.6, { target: [3, 1, 1.6], az: 62, el: 30, dist: 14 }],       // pressed low
  [7.0, { target: [3, 1, 1.5], az: 138, el: 28, dist: 14 }],
  [8.3, { target: [3, 2, 1.5], az: 150, el: 28, dist: 14.5 }],    // drawn out in depth
  [10.8, NETS_VIEW],
], true);

const DIR = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
// the middle of the face that pulls each axis: the end (x), the back (y), the top (z)
const FACE = { x: ({ a, b, c }) => [a, b / 2, c / 2], y: ({ a, b, c }) => [a / 2, b, c / 2], z: ({ a, b, c }) => [a / 2, b / 2, c] };
const project = (page, p) => page.evaluate(p => window.__cap.project(...p), p);

// Grab a face, pull it from one whole number to another, let go, and move the hand away.
function pull(t0, t1, axis, from, to) {
  return [
    [t0, async (page, ctx) => {
      const dims = await page.evaluate(() => window.__volume.eff());
      ctx.grab = { origin: FACE[axis](dims), from };
      const p = safe(await project(page, ctx.grab.origin));
      await page.mouse.move(p.x, p.y); await page.mouse.down();
    }],
    ...along(t0, t1, async (page, ctx, u) => {
      const s = (to - from) * u, o = ctx.grab.origin;
      const p = safe(await project(page, o.map((v, i) => v + DIR[axis][i] * s)));
      await page.mouse.move(p.x, p.y);
    }),
    [t1 + 0.05, async page => { await page.mouse.up(); await page.mouse.move(6, 6); }],
  ];
}

// [start, end, axis, from, to]: tall and narrow; wide; and low; longer in depth
export const PULLS = [[0.7, 1.9, 'z', 2, 6], [3.2, 4.3, 'x', 3, 6], [4.5, 5.5, 'z', 6, 3], [7.0, 8.2, 'y', 2, 4]];

export const scene = {
  name: '05-volume-space', seconds: 12, settle: 0.3,
  async setup(page) {
    await page.goto(ORIGIN + '/apps/volume-space/');
    await hide(page, CSS);
    for (let i = 0; i < 200 && !(await page.evaluate(() => !!window.__volume)); i++) await page.clock.runFor(50);
    await page.evaluate(({ x, y, z }) => {
      const v = window.__volume;
      // capture-only: where a world point is on screen, and the camera's place
      window.__cap = {
        project(x, y, z) {
          const q = v.camera.position.clone().set(x, y, z).project(v.camera), r = v.renderer.domElement.getBoundingClientRect();
          return { x: r.left + (q.x + 1) / 2 * r.width, y: r.top + (1 - q.y) / 2 * r.height };
        },
        look(p, t) { v.camera.position.set(...p); v.controls.target.set(...t); v.controls.update(); v.camera.updateMatrixWorld(); v.requestRender(); },
      };
      v.setValue('x', x); v.setValue('y', y); v.setValue('z', z);
    }, START);
    const c = cam(0);
    await page.evaluate(c => window.__cap.look(c.position, c.target), c);
    for (let i = 0; i < 20; i++) await page.clock.runFor(100);   // the starting cubes finish popping in
  },
  before: (t, page) => { const c = cam(t); return page.evaluate(c => window.__cap.look(c.position, c.target), c); },
  actions: [
    ...PULLS.flatMap(p => pull(...p)),
  ],
  async verify(page) {
    const d = await page.evaluate(() => window.__volume.eff());
    if (d.a !== 6 || d.b !== 4 || d.c !== 3) throw new Error('prism is ' + JSON.stringify(d));
    console.log('  prism finished at 6 × 4 × 3');
  },
};

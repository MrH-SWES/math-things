// 00:32–00:38: Solids. Seen from straight above, the shapes read as flat faces; a cube is carried
// onto a box (a real drag, stacked by the app), then the camera comes down to show they are solid.
import { ORIGIN, hide } from '../capture.mjs';
import { along, cameraPath, safe } from './path.mjs';

const CSS = '#dock, #footer { display: none !important; }';

// Capture-only handle (never part of the app): arranges shapes, places the camera, and reports
// where things are on screen. The stacking itself is the app's own drag and settle.
const PATCH = { '/apps/solids/index.html': [[
  'window.__solids = { solids, camera };',
  `window.__solids = { solids, camera };
window.__cap = {
  clear() { while (solids.length) remove(solids[0]); },
  add(kind, x, z) { const s = make(kind, x, z); settle(s); draw(); },
  state: () => solids.map(s => ({ kind: s.kind, x: s.x, y: s.y, z: s.z, h: s.h })),
  project(x, y, z) {
    const v = camera.position.clone().set(x, y, z).project(camera), r = canvas.getBoundingClientRect();
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  },
  // where the pointer must be for the shape being dragged to come down at (x, z)
  aim(x, z) { return drag ? this.project(x - drag.ox, drag.s.y, z - drag.oz) : null; },
  look(p, t) { camera.position.set(...p); camera.lookAt(...t); camera.updateProjectionMatrix(); draw(); },
};`]] };

const BOX = [0.7, 0.1], CUBE = [-2.1, 0.9];
export const DRAG = { press: 0.5, release: 1.55 };   // the cube is picked up, carried, set on the box
const ARRANGEMENT = [['box', ...BOX], ['cube', ...CUBE], ['cylinder', 2.8, -0.9]];

// from straight above (flat faces) down to a low three-quarter view of the stack
const cam = cameraPath([
  [0, { target: [0.35, 0, 0], az: 0, el: 82, dist: 7.4 }],
  [1.7, { target: [0.35, 0, 0], az: 0, el: 82, dist: 7.4 }],
  [5.2, { target: [0.75, 0.85, 0.1], az: -32, el: 21, dist: 5.6 }],
]);

export const scene = {
  name: '04-solids', seconds: 6, patch: PATCH,
  async setup(page) {
    await page.goto(ORIGIN + '/apps/solids/');
    await hide(page, CSS);
    for (let i = 0; i < 100 && !(await page.evaluate(() => !!window.__cap)); i++) await page.clock.runFor(50);
    await page.evaluate(a => { window.__cap.clear(); for (const [k, x, z] of a) window.__cap.add(k, x, z); }, ARRANGEMENT);
  },
  before: (t, page) => { const c = cam(t); return page.evaluate(c => window.__cap.look(c.position, c.target), c); },
  actions: [
    // press the cube's top face, carry it over the box, let go: the app stacks it
    [DRAG.press, async (page, ctx) => {
      const p = safe(await page.evaluate(([x, z]) => window.__cap.project(x, 1, z), CUBE));
      await page.mouse.move(p.x, p.y); await page.mouse.down();
    }],
    ...along(0.5, 1.45, async (page, ctx, u) => {
      const x = CUBE[0] + (BOX[0] - CUBE[0]) * u, z = CUBE[1] + (BOX[1] - CUBE[1]) * u;
      const p = await page.evaluate(([x, z]) => window.__cap.aim(x, z), [x, z]);
      if (p) await page.mouse.move(safe(p).x, p.y);
    }),
    [DRAG.release, page => page.mouse.up()],
  ],
  async verify(page) {
    const s = await page.evaluate(() => window.__cap.state());
    const cube = s.find(o => o.kind === 'cube'), box = s.find(o => o.kind === 'box');
    if (Math.abs(cube.y - box.h) > 1e-6 || Math.hypot(cube.x - box.x, cube.z - box.z) > 0.05) throw new Error('cube not stacked: ' + JSON.stringify(s));
    console.log('  cube stacked on the box at height', box.h);
  },
};

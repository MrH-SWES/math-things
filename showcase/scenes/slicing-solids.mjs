// 00:57–01:05: Slicing Solids. From the view Nets ends on, the camera settles to the app's own; the
// cutting plane sweeps down through the prism and back, then tilts, and the section holds still.
import { ORIGIN, hide } from '../capture.mjs';
import { along, cameraPath } from './path.mjs';

// a larger cross-section card, inset from the corner, so the payoff reads on a film frame
const CSS = `#dock, #footer { display: none !important; }
  #flat { width: 300px !important; height: 300px !important; left: 64px !important; bottom: 64px !important; }`;

// Capture-only camera handle (never part of the app).
const PATCH = { '/apps/slicing-solids/index.html': [[
  'window.__slice = {',
  `window.__cap = { look(p, t) { camera.position.set(...p); camera.lookAt(...t); camera.updateProjectionMatrix(); draw(); } };
window.__slice = {`]] };

const deg = r => r * 180 / Math.PI;
// Nets' closing view of its 6 × 4 × 3 box, scaled to this 2.4-wide prism (0.4 ×) …
const FROM_NETS = { target: [0, -0.8 + 0.6 * 0.4, 0], az: deg(0.5), el: deg(0.95), dist: 14 * 0.58 / Math.tan(17.5 * Math.PI / 180) * 0.4 };
// … and the app's own view (yaw 0.6, raised 0.55 of its 7.5 distance)
const APP = { target: [0, 0, 0], az: deg(0.6), el: deg(Math.atan(0.55)), dist: Math.hypot(7.5, 7.5 * 0.55) };
const cam = cameraPath([[0.3, FROM_NETS], [2.6, APP]]);

const slide = (id, from, to) => (page, ctx, u) => page.evaluate(([id, v]) => {
  const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input'));
}, [id, from + (to - from) * u]);

// [start, end, slider, from, to]: sweep down through the prism, come back up partway, tilt
export const SLIDES = [[0.7, 3.1, 'height', 100, 12], [3.3, 4.3, 'height', 12, 50], [4.5, 6.3, 'tilt', 0, 40]];

export const scene = {
  name: '07-slicing-solids', seconds: 8, patch: PATCH,
  async setup(page) {
    await page.goto(ORIGIN + '/apps/slicing-solids/');
    await hide(page, CSS);
    await page.clock.runFor(100);
    await page.evaluate(() => {
      // capture-only: the sliders glide instead of stepping
      for (const id of ['height', 'tilt']) document.getElementById(id).step = 'any';
      window.__slice.set(100, 0);   // the plane starts resting at the top
    });
  },
  before: (t, page) => { const c = cam(t); return page.evaluate(c => window.__cap.look(c.position, c.target), c); },
  actions: [
    ...SLIDES.flatMap(([t0, t1, id, a, b]) => along(t0, t1, slide(id, a, b))),
  ],
  async verify(page) {
    const n = await page.evaluate(() => window.__slice.sides());
    if (n !== 4) throw new Error('section has ' + n + ' sides');
    console.log('  tilted section: a rectangle, 4 sides');
  },
};

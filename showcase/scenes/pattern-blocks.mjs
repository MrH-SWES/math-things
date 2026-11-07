// 00:20–00:32: Pattern Blocks. Stop-motion through richer and richer trays, then one real
// fumble: the last trapezoid comes in turned 30° the wrong way, is refused and slides back,
// is turned with the app's own handle, and fits.
import { ORIGIN, FPS, hide } from '../capture.mjs';
import { PATTERN_PATCH } from './pattern-hook.mjs';

const CSS = '#dock { position: fixed !important; top: 100% !important; } #footer { display: none !important; }';

const H = Math.sqrt(3) / 2;
const at = (deg, r) => [Math.cos(deg * Math.PI / 180) * r, -Math.sin(deg * Math.PI / 180) * r];

// The two simple trays have no stored tiling, so their pieces are given by their exact corners
// (tray-local edge units); the app's own test still has to accept every one.
const HEXAGON = [
  { type: 'trapezoid', pts: [[-1, 0], [1, 0], [0.5, -H], [-0.5, -H]] },
  { type: 'rhombus', pts: [[0, 0], [1, 0], [0.5, H], [-0.5, H]] },
  { type: 'triangle', pts: [[-1, 0], [0, 0], [-0.5, H]] },
];
const STAR = [
  { type: 'hexagon', pts: [0, 60, 120, 180, 240, 300].map(d => at(d, 1)) },
  ...[1, 0, 5, 4, 3, 2].map(k => ({ type: 'triangle', pts: [at(60 * k, 1), at(60 * k + 30, Math.sqrt(3)), at(60 * k + 60, 1)] })),
];
// the richer trays use the tiling each one ships with
const solved = (tray, ks) => ks.map(k => ({ tray, k }));
const range = (a, b) => [...Array(b - a)].map((_, i) => a + i);

const LAST = 13;   // the butterfly's upper right trapezoid: rim above, triangles beside it
const BUTTERFLY = solved('butterfly', range(0, 25).filter(k => k !== LAST));
const STAGE = { x: 5.6, rot: 30 };   // where the last piece waits, turned the wrong way

const put = spec => page => page.evaluate(spec => {
  const pb = window.__pb;
  const p = spec.pts ? pb.fit(spec.type, spec.pts) : pb.OUTLINES[pb.trayIndex(spec.tray)].solution[spec.k];
  return pb.add(p.type, p.x, p.y, p.rot);
}, spec);

// One stationary shot: a fresh tray at a camera distance, some pieces already down, then one
// piece per beat.
function shot(t, tray, s, specs, already, beats) {
  const out = [[t, async page => {
    await page.evaluate(([tray, s]) => { const pb = window.__pb; pb.clear(); pb.tray(pb.trayIndex(tray), s); }, [tray, s]);
    for (const spec of specs.slice(0, already)) await put(spec)(page);
  }]];
  beats.forEach((b, i) => out.push([b, put(specs[already + i])]));
  return out;
}
const every = (t0, step, n) => [...Array(n)].map((_, i) => +(t0 + i * step).toFixed(3));

// when each piece lands, shot by shot (the sound follows these too)
export const BEATS = {
  hexagon: [0.25, 0.6, 0.95], star: every(1.4, 0.15, 7), flower: every(2.65, 0.2, 5),
  crystal: every(3.85, 0.2, 5), butterfly: every(5.0, 0.12, 9),
};
// the last trapezoid: picked up, let go and refused, turned one step, picked up, let go and seated
export const LAST_PIECE = { press: 8.0, refused: 8.7, turn: [9.25, 9.55], press2: 9.8, seated: 10.35 };

// pointer moves, one per frame, with a hand's ease in and out
const ease = u => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, u)))) / 2;
function along(t0, t1, pos) {
  const out = [];
  for (let f = Math.floor(t0 * FPS) + 1; f <= Math.ceil(t1 * FPS); f++) {
    const u = ease((f / FPS - t0) / (t1 - t0));
    out.push([f / FPS, async (page, ctx) => { const p = pos(u, ctx); await page.mouse.move(p.x, p.y); }]);
  }
  return out;
}
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });

// where things are on screen right now
const look = (page, ctx) => page.evaluate(id => {
  const pb = window.__pb, p = pb.piece(id), gap = pb.OUTLINES[pb.trayIndex('butterfly')].solution[13];
  return { p, at: pb.px(p.x, p.y), gap: pb.px(gap.x, gap.y), S: pb.S };
}, ctx.last);
async function press(page, pt) { await page.mouse.move(pt.x, pt.y); await page.mouse.down(); }
async function tap(page, pt) { await press(page, pt); await page.mouse.up(); }

export const scene = {
  name: '03-pattern-blocks', seconds: 12, scale: 1.5, patch: PATTERN_PATCH,
  async setup(page) {
    await page.goto(ORIGIN + '/apps/pattern-blocks/');
    await hide(page, CSS);
    await page.clock.runFor(300);
  },
  actions: [
    // 00:20–00:22.5: two very simple trays
    ...shot(0, 'hexagon', 150, HEXAGON, 0, BEATS.hexagon),
    ...shot(1.25, 'star', 104, STAR, 0, BEATS.star),
    // 00:22.5–00:26: richer silhouettes, each at its own stage of completion
    ...shot(2.5, 'flower', null, solved('flower', range(0, 18)), 5, BEATS.flower),
    ...shot(3.7, 'branching crystal', null, solved('branching crystal', range(0, 25)), 9, BEATS.crystal),
    ...shot(4.9, 'butterfly', null, BUTTERFLY, 15, BEATS.butterfly),
    // the last trapezoid waits to the right, outside the tray, turned 30° the wrong way
    [4.9, async (page, ctx) => {
      ctx.last = await page.evaluate(({ x, rot }) => {
        const pb = window.__pb, gap = pb.OUTLINES[pb.trayIndex('butterfly')].solution[13];
        return pb.add('trapezoid', x, gap.y, rot);
      }, STAGE);
    }],
    // 00:28–00:29.1: into the gap the wrong way; the app refuses and slides it back (320 ms)
    [LAST_PIECE.press, async (page, ctx) => { ctx.a = await look(page, ctx); await press(page, ctx.a.at); }],
    ...along(8.0, 8.55, (u, ctx) => lerp(ctx.a.at, ctx.a.gap, u)),
    [LAST_PIECE.refused, page => page.mouse.up()],
    [9.05, async (page, ctx) => {
      const now = await look(page, ctx);
      if (Math.hypot(now.at.x - ctx.a.at.x, now.at.y - ctx.a.at.y) > 0.5) throw new Error('the wrong turn was not refused');
    }],
    // 00:29.1–00:30.5: tap it, turn it with the aluminum handle, let go of it, and fit it
    [9.15, async (page, ctx) => tap(page, (await look(page, ctx)).at)],
    [9.25, async (page, ctx) => {
      const { p, at, S } = await look(page, ctx);
      ctx.turn = { o: at, L: p.reach * S + 0.8 * S, d0: p.rot + 90 };
      await press(page, { x: at.x + Math.cos(ctx.turn.d0 * Math.PI / 180) * ctx.turn.L, y: at.y - Math.sin(ctx.turn.d0 * Math.PI / 180) * ctx.turn.L });
    }],
    ...along(9.25, 9.55, (u, { turn: { o, L, d0 } }) => {
      const d = (d0 + (90 - d0) * u) * Math.PI / 180;
      return { x: o.x + Math.cos(d) * L, y: o.y - Math.sin(d) * L };
    }),
    [9.6, page => page.mouse.up()],
    [9.7, page => tap(page, { x: 60, y: 660 })],   // the bare mat: let go of the selection
    [LAST_PIECE.press2, async (page, ctx) => { ctx.b = await look(page, ctx); await press(page, ctx.b.at); }],
    // let go a little short and high: the app's own snap seats it
    ...along(9.8, 10.3, (u, { b }) => lerp(b.at, { x: b.gap.x + 0.1 * b.S, y: b.gap.y - 0.07 * b.S }, u)),
    [LAST_PIECE.seated, page => page.mouse.up()],
  ],
  async verify(page, ctx) {
    const r = await page.evaluate(id => {
      const pb = window.__pb, p = pb.piece(id), gap = pb.OUTLINES[pb.trayIndex('butterfly')].solution[13];
      return { n: pb.pieces().length, d: Math.hypot(p.x - gap.x, p.y - gap.y), rot: p.rot, selected: pb.selected() };
    }, ctx.last);
    if (r.n !== 25 || r.d > 1e-6 || r.rot % 360 !== 0 || r.selected) throw new Error('butterfly not finished: ' + JSON.stringify(r));
    console.log('  butterfly complete: 25 pieces, last trapezoid seated');
  },
};

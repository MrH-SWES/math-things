// 00:00–00:09, the prologue: the real rekenrek, buried under the usual edtech clutter. A finger
// flicks every piece of it away, the calm mat and the doctrine are all that is left, the rack takes
// its place, and the words untype themselves. The film then begins on the same frame.
import { open } from './rekenrek.mjs';
import { FONTS, CSS, WALL, HTML, RUNTIME } from './slop.mjs';

export const DOCTRINE = 'No words. No directions.';
const SMALL = 1.2;   // the rack, crowded into the middle of the clutter (it is 1.95 in the film)

// [time, piece, direction x, y, spin°, heavy, grab x, grab y]: slow at first, then clearing the desk
export const FLINGS = [
  [1.6, 'go', 1, 0.35, 40],
  [2.1, 'bubble', -1, -0.25, -24],
  [2.45, 'owl', -0.55, 1, -30],
  [2.8, 'points', -0.75, -1, -18],
  [3.1, 'timer', 0.6, -1, 24],
  [3.35, 'level', 1, 0.12, 16],
  [3.58, 'card', -1, 0.15, -34],
  [3.78, 'hint', -1, 0.55, -40],
  [3.98, 'score', 0.12, 1, 8],
  [4.18, 'badge', 1, -0.7, 45],
  [4.4, 'banner', -0.05, -1, -6],
  [4.7, 'slop-wall', -1, 0.04, -3, true, 1640, 560],   // the wallpaper itself, in one long swipe
  [5.05, 'directions', -0.18, 1, -12],                   // the last one, and under it the doctrine
];
export const COUNTDOWN = [[0.6, 29], [1.6, 28], [2.6, 27]];   // the timer ticks until it is flicked away
export const GROW = [5.3, 0.8];                         // the rack takes the screen
export const UNTYPE = { start: 7.6, step: 0.045 };      // one character every 45 ms, right to left
export const SECONDS = 9;

export const scene = {
  name: '00-prologue', seconds: SECONDS,
  async setup(page) {
    await open(page, { rowOneFull: false });            // exactly the film's first frame, under it all
    await page.addStyleTag({ url: FONTS });
    await page.addStyleTag({ content: CSS });
    await page.evaluate(([wall, html, small]) => {
      document.body.insertAdjacentHTML('afterbegin', wall);
      document.body.insertAdjacentHTML('beforeend', html);
      document.getElementById('rack').style.transform = `scale(${small})`;
    }, [WALL, HTML, SMALL]);
    await page.addScriptTag({ content: RUNTIME });
    const ok = await page.evaluate(async () => {
      const faces = ['700 78px Fredoka', '600 34px Fredoka', '700 40px "Comic Neue"', '600 64px Lexend'];
      await Promise.all(faces.map(f => document.fonts.load(f)));
      return faces.every(f => document.fonts.check(f));
    });
    if (!ok) throw new Error('prologue fonts did not load');
    await page.evaluate(t => window.__slop.say(t), DOCTRINE);
  },
  actions: [
    ...FLINGS.map(([t, id, dx, dy, spin, heavy = false, gx = null, gy = null]) =>
      [t, page => page.evaluate(a => window.__slop.fling(...a), [id, dx, dy, spin, heavy, gx, gy])]),
    ...COUNTDOWN.map(([t, s]) => [t, page => page.evaluate(s => window.__slop.tick(s), s)]),
    [GROW[0], page => page.evaluate(([small, ms]) => {
      // back to the film's own framing (the capture stylesheet's scale), eased
      const r = document.getElementById('rack');
      r.style.transform = '';
      r.animate([{ transform: `scale(${small})` }, { transform: 'scale(1.95)' }], { duration: ms, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
    }, [SMALL, GROW[1] * 1000])],
    ...[...DOCTRINE].map((_, k) => [UNTYPE.start + k * UNTYPE.step, page => page.evaluate(() => window.__slop.untype())]),
    [UNTYPE.start + DOCTRINE.length * UNTYPE.step + 0.08, page => page.evaluate(() => window.__slop.rest())],
    [SECONDS - 0.12, page => page.evaluate(() => window.__slop.clear())],
  ],
  async verify(page) {
    const left = await page.evaluate(() => ({ slop: !!document.getElementById('slop'), inline: document.getElementById('rack').style.transform }));
    if (left.slop || left.inline) throw new Error('prologue did not clear: ' + JSON.stringify(left));
    console.log('  cleared to the bare rekenrek');
  },
};

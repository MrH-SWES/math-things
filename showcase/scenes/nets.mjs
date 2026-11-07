// 00:50–00:57: Nets. The box Volume Space finished on (6 × 4 × 3) unfolds into its net under the
// app's own rising camera, rests flat for a second, and folds back up.
import { ORIGIN, hide } from '../capture.mjs';
import { along } from './path.mjs';

const CSS = '#dock, #footer, #record { display: none !important; }';

// the app's own fold control, moved continuously
const fold = (from, to) => (page, ctx, u) => page.evaluate(v => {
  const f = document.getElementById('fold'); f.value = v; f.dispatchEvent(new Event('input'));
}, from + (to - from) * u);

export const FOLDS = [[0.5, 2.7, 0, 100], [3.9, 6.0, 100, 0]];   // open flat, then close

export const scene = {
  name: '06-nets', seconds: 7,
  async setup(page) {
    await page.goto(ORIGIN + '/apps/nets/');
    await hide(page, CSS);
    await page.clock.runFor(100);
    await page.evaluate(() => {
      // 6 × 4 × 3, set with the app's own + knobs before the take
      const knob = (k, d) => document.querySelector(`#dims .knob[data-k="${k}"][data-d="${d}"]`).click();
      knob('L', 1); knob('L', 1); knob('W', 1); knob('W', 1);
      // capture-only: the slider glides instead of stepping by hundredths
      document.getElementById('fold').step = 'any';
    });
  },
  actions: [
    ...FOLDS.flatMap(([t0, t1, a, b]) => along(t0, t1, fold(a, b))),
  ],
  async verify(page) {
    const v = await page.evaluate(() => +document.getElementById('fold').value);
    if (v !== 0) throw new Error('net not folded back: ' + v);
    console.log('  unfolded flat and folded back');
  },
};

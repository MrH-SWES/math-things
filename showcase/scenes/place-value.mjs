// 00:05–00:20: the original Place Value Blocks. A real carry (390 + 10 → 400), then a flight out
// to trillions and back in to tenths and hundredths, through a world that is already built.
import { ORIGIN, hide } from '../capture.mjs';

// 1,234,567,890,390.12, set digit by digit (trillions … thousandths), never parsed from a float
const SEED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 3, 9, 0, 1, 2, 0];
const TENS = 11;

const CSS = '#topBar, #numBar, #pmBar, #hint, #animStatus, #footer { display: none !important; }';

// The camera is the app's own pan and zoom. Its focus is a "place position" p (0 = trillions,
// 15 = thousandths); the zoom is tied to p so each place passes at about the same apparent size.
// Positions are read from the app's layout at the current zoom, not assumed linear.
const KEYS = [[0, 0.035], [10.45, 2.5], [13.25, 9]];   // [place position, zoom]
const zoomAt = p => {
  const k = p <= KEYS[1][0] ? [KEYS[0], KEYS[1]] : [KEYS[1], KEYS[2]];
  const f = (p - k[0][0]) / (k[1][0] - k[0][0]);
  return Math.exp(Math.log(k[0][1]) + f * (Math.log(k[1][1]) - Math.log(k[0][1])));
};

// eased travel: gentle start, long even middle, gentle arrival
const travel = (u, ramp = 0.22) => {
  u = Math.min(1, Math.max(0, u));
  const v = 1 / (1 - ramp);   // cruise speed for unit distance
  if (u < ramp) return v * u * u / (2 * ramp);
  if (u > 1 - ramp) return 1 - v * (1 - u) * (1 - u) / (2 * ramp);
  return v * (u - ramp / 2);
};

const P_START = 10.45, P_FAR = 0.3, P_LAND = 13.25;   // lands with the tenth rod and the hundredths centred
// out 00:09–00:12.6, a breath at trillions, back 00:13.0–00:17.7, then settle
const T_OUT = 4.0, T_FAR = 7.6, T_TURN = 8.0, T_BACK = 12.7;

function placeAt(t) {
  if (t <= T_OUT) return P_START;
  if (t <= T_FAR) return P_START + (P_FAR - P_START) * travel((t - T_OUT) / (T_FAR - T_OUT));
  if (t <= T_TURN) return P_FAR;
  if (t <= T_BACK) return P_FAR + (P_LAND - P_FAR) * travel((t - T_TURN) / (T_BACK - T_TURN));
  return P_LAND;
}

export const scene = {
  name: '02-place-value', seconds: 15,
  async setup(page) {
    await page.goto(ORIGIN + '/apps/place-value-blocks-original/');
    await hide(page, CSS);
    await page.clock.runFor(300);
    await page.evaluate(seed => {
      digits = seed.slice(); enteredStr = digitsToStr(); highlightedPlace = null;
      renderNum(); updateMultDivBtns(); updatePMBar(); render();
    }, SEED);
  },
  actions: [
    // the tens place's own + button: the tenth rod, then the real carry into a fourth flat
    // (the button is hidden for the film; its click runs the same handler, and is not awaited)
    [0.1, page => page.evaluate(i => { document.querySelector(`#pmBar [onclick="incrementPlace(${i})"]`).click(); }, TENS)],
  ],
  async camera(t, page) {
    const p = placeAt(t);
    await page.evaluate(([p, z]) => {
      zoomLvl = z;
      const i = Math.min(14, Math.floor(p)), f = p - i;
      // the middle of the blocks themselves, not of the column's empty room
      const mid = k => worldX(k) + secDims(unitForPlace(k), P[k].shape).w / 2;
      panX = (mid(i) + (mid(i + 1) - mid(i)) * f) * zoomLvl;
      if (!animating) render();
      // the carry's overlay canvas is blank between carries; keep the compositor from holding
      // on to its last frame once the camera moves
      document.getElementById('animCanvas').style.visibility = animating ? 'visible' : 'hidden';
    }, [p, zoomAt(p)]);
  },
};

// Camera and pointer paths shared by the scenes: smooth keyframed curves and hand-like moves.
import { FPS } from '../capture.mjs';

// a hand's ease in and out
export const ease = u => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, u)))) / 2;
export const lerp = (a, b, u) => a + (b - a) * u;

// A smooth curve through keyframes [t, value] (value a number or an array of numbers): cubic Hermite
// with tangents from the neighbouring keys, at rest at the first and last key. Keys placed close
// in value slow the camera down; keys far apart carry it along.
export function curve(keys) {
  const n = keys.length, arr = Array.isArray(keys[0][1]);
  const val = k => arr ? keys[k][1] : [keys[k][1]];
  const tan = k => {
    if (k === 0 || k === n - 1) return val(k).map(() => 0);
    const a = val(k - 1), b = val(k + 1), dt = keys[k + 1][0] - keys[k - 1][0];
    // a key that is a turning point in a channel holds still there
    return val(k).map((v, i) => (a[i] - v) * (b[i] - v) > 0 ? 0 : (b[i] - a[i]) / dt);
  };
  return t => {
    if (t <= keys[0][0]) return arr ? val(0).slice() : val(0)[0];
    if (t >= keys[n - 1][0]) return arr ? val(n - 1).slice() : val(n - 1)[0];
    let k = 0; while (t > keys[k + 1][0]) k++;
    const t0 = keys[k][0], t1 = keys[k + 1][0], h = t1 - t0, s = (t - t0) / h;
    const p0 = val(k), p1 = val(k + 1), m0 = tan(k), m1 = tan(k + 1);
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    const out = p0.map((_, i) => h00 * p0[i] + h10 * h * m0[i] + h01 * p1[i] + h11 * h * m1[i]);
    return arr ? out : out[0];
  };
}

// one action per frame from t0 to t1, each given the eased progress u
export function along(t0, t1, fn, shape = ease) {
  const out = [];
  for (let f = Math.floor(t0 * FPS) + 1; f <= Math.ceil(t1 * FPS); f++) {
    const u = shape((f / FPS - t0) / (t1 - t0));
    out.push([f / FPS, (page, ctx) => fn(page, ctx, u)]);
  }
  return out;
}

// an orbiting camera: target [x, y, z], azimuth and elevation in degrees, distance
export function orbit({ target, az, el, dist }, upZ = false) {
  const a = az * Math.PI / 180, e = el * Math.PI / 180;
  // y-up worlds: azimuth turns from +z (in front) toward +x; z-up worlds: from -y toward +x
  const off = upZ
    ? [Math.sin(a) * Math.cos(e) * dist, -Math.cos(a) * Math.cos(e) * dist, Math.sin(e) * dist]
    : [Math.sin(a) * Math.cos(e) * dist, Math.sin(e) * dist, Math.cos(a) * Math.cos(e) * dist];
  return { position: target.map((v, i) => v + off[i]), target };
}

// a press that stays within the part of the frame where the app does not pan on its own
export function safe(p, { left = 70, right = 1850, top = 135, bottom = 1010 } = {}) {
  if (p.x < left || p.x > right || p.y < top || p.y > bottom) throw new Error(`pointer left the safe frame: ${Math.round(p.x)}, ${Math.round(p.y)}`);
  return p;
}

// a camera move through poses [t, { target, az, el, dist }]: a smooth curve through each
export function cameraPath(keys, upZ = false) {
  const c = curve(keys.map(([t, p]) => [t, [...p.target, p.az, p.el, p.dist]]));
  return t => { const v = c(t); return orbit({ target: v.slice(0, 3), az: v[3], el: v[4], dist: v[5] }, upZ); };
}

// Deterministic capture of one scene: the page runs on a virtual clock, and every frame is
// stepped, seeked and photographed in turn, so timing is exact however slowly a frame renders.
// Frames go straight into ffmpeg as a lossless-quality H.264 intermediate.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

// Playwright is used where it is installed (globally is fine); nothing here is a package to install.
const { chromium } = createRequire(import.meta.url)('playwright');

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const OUT = join(ROOT, 'showcase', 'out');
export const FPS = 60, W = 1920, H = 1080;
export const ORIGIN = 'http://mt.local';
// Three.js comes from the CDN in the apps; a local copy of the same version keeps captures offline.
const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.169.0/';
const THREE_DIR = process.env.THREE_DIR || '';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };

// Keeps CSS transitions and Web Animations on the virtual clock: each is paused when first seen
// and seeked every frame; one that reaches its end is finished, so its events still fire.
const CLOCK_SYNC = `
  window.__anims = new Map();
  window.__done = new WeakSet();
  window.__syncAnims = now => {
    for (const a of document.getAnimations()) {
      if (window.__done.has(a)) continue;
      let base = window.__anims.get(a);
      if (base === undefined) { base = now - (a.currentTime || 0) / (a.playbackRate || 1); window.__anims.set(a, base); a.pause(); }
      const t = (now - base) * (a.playbackRate || 1);
      const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
      if (t >= end) { window.__done.add(a); window.__anims.delete(a); a.finish(); }
      else a.currentTime = Math.max(0, t);
    }
  };
`;

export async function openBrowser() {
  return chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
}

// A page that serves the repo from disk at ${ORIGIN}, optionally patching an app's HTML first.
// A smaller CSS viewport at a higher pixel ratio still photographs at W × H: a closer, crisper camera
// for 2D apps without transforming the page, so pointer input stays in the app's own coordinates.
export async function openPage(browser, { patch = {}, scale = 1 } = {}) {
  const context = await browser.newContext({ viewport: { width: Math.round(W / scale), height: Math.round(H / scale) }, deviceScaleFactor: scale, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', e => console.error('  page error:', e.message));
  await page.route(ORIGIN + '/**', async route => {
    let path = decodeURIComponent(new URL(route.request().url()).pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = join(ROOT, path);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: '' });
    let body = await readFile(file);
    if (extname(file) === '.html') {
      let html = String(body);
      if (THREE_DIR) html = html.replaceAll(THREE_CDN, ORIGIN + '/__three/');
      for (const [find, replace] of (patch[path] || [])) {
        if (!html.includes(find)) throw new Error(`patch for ${path} did not apply: ${find.slice(0, 60)}`);
        html = html.replace(find, replace);
      }
      body = html;
    }
    return route.fulfill({ status: 200, contentType: TYPES[extname(file)] || 'application/octet-stream', body });
  });
  if (THREE_DIR) await page.route(ORIGIN + '/__three/**', async route => {
    const rel = new URL(route.request().url()).pathname.slice('/__three/'.length);
    return route.fulfill({ status: 200, contentType: 'text/javascript', body: await readFile(join(THREE_DIR, rel)) });
  });
  // frozen: from here on, time moves only when the capture steps it
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.addInitScript(CLOCK_SYNC);
  return page;
}

// Advance the page's world to virtual time ms (integer), keeping CSS/WAAPI animation in step.
export async function advanceTo(page, state, ms) {
  const step = ms - state.now;
  // anything started since the last frame starts now, not when it is first noticed
  await page.evaluate(now => window.__syncAnims(now), state.now);
  if (step > 0) await page.clock.runFor(step);
  state.now = Math.max(state.now, ms);
  await page.evaluate(now => window.__syncAnims(now), state.now);
}

// Capture-only presentation: hide words and chrome without touching what the app does.
export const hide = (page, css) => page.addStyleTag({ content: css + '\n[aria-label="Back to Math Things app menu"]{display:none!important}' });

/**
 * Render a scene. `actions` are [timeSeconds, async fn(page, ctx)] run once, in order, when the
 * scene clock reaches them; `camera(tSeconds, page, ctx)` runs every frame before the photo.
 * `before(tSeconds, page, ctx)` runs every frame before the page's clock steps, so an app that
 * draws on its next animation frame draws what it was just given.
 * The page clock keeps running while the scene sets up; `settle` seconds pass before frame 0.
 * `verify(page, ctx)` runs after a full take.
 */
export async function renderScene({ name, page, seconds, actions = [], before = null, camera = null, verify = null, settle = 1, from = 0, to = null }) {
  await mkdir(OUT, { recursive: true });
  const frames = Math.round(seconds * FPS);
  const first = Math.round(from * FPS), last = to == null ? frames : Math.round(to * FPS);
  const state = { now: 0 };
  // let the page start and settle on virtual time
  await page.clock.runFor(10);
  state.now = 10;
  const t0 = state.now + Math.round(settle * 1000);
  await advanceTo(page, state, t0);
  const out = join(OUT, `${name}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  const queue = actions.slice().sort((a, b) => a[0] - b[0]);
  const ctx = {};
  const started = Date.now();
  for (let f = 0; f < last; f++) {
    const t = f / FPS;
    while (queue.length && queue[0][0] <= t + 1e-6) await queue.shift()[1](page, ctx);
    if (before) await before(t, page, ctx);
    await advanceTo(page, state, t0 + Math.round(t * 1000));
    if (camera) await camera(t, page, ctx);
    if (f < first) continue;
    const jpg = await page.screenshot({ type: 'jpeg', quality: 94, timeout: 180000 });
    if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write(`  ${name} ${(f / FPS).toFixed(0)}s/${seconds}s (${((Date.now() - started) / 1000).toFixed(0)}s elapsed)\r`);
  }
  ff.stdin.end();
  await done;
  console.log(`  ${name}: ${last - first} frames → ${out}                    `);
  // the scene's own check that the mathematics really happened on camera
  if (verify && last === frames) await verify(page, ctx);
  return out;
}

// Real pointer input at an element's centre (or an offset from it), in page coordinates.
export async function centre(page, selector, index = 0) {
  return page.evaluate(([s, i]) => { const r = document.querySelectorAll(s)[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, [selector, index]);
}

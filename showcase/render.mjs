// Render scenes: node showcase/render.mjs [scene-name-fragment …] [--from=s --to=s]
import { openBrowser, openPage, renderScene } from './capture.mjs';
import { SCENES } from './scenes/index.mjs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const pick = args.filter(a => !a.startsWith('--'));
const chosen = SCENES.filter(s => !pick.length || pick.some(p => s.name.includes(p)));

const browser = await openBrowser();
try {
  for (const s of chosen) {
    console.log('scene', s.name);
    const page = await openPage(browser, { patch: s.patch || {}, scale: s.scale || 1 });
    await s.setup(page);
    await renderScene({ ...s, page, from: Number(opt.from || 0), to: opt.to != null ? Number(opt.to) : null });
    await page.context().close();
  }
} finally {
  await browser.close();
}

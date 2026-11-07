// 01:10–01:15: the end card, the film's only words. One gentle reveal, readable to the last frame.
import { ORIGIN } from '../capture.mjs';

export const scene = {
  name: '09-end-card', seconds: 5,
  async setup(page) {
    await page.goto(ORIGIN + '/showcase/card/');
    await page.evaluate(() => document.fonts.ready);
    const ok = await page.evaluate(() => document.fonts.check('700 116px Lexend') && document.getElementById('last').complete && document.getElementById('last').naturalWidth > 0);
    if (!ok) throw new Error('end card font or last frame missing');
  },
  actions: [[0, page => page.evaluate(() => document.body.classList.add('go'))]],
};

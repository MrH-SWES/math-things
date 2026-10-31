// Assemble the film: check every shot is on disk at its exact length, build the score from the
// cues, and join picture and sound into one 75-second file.
//   node showcase/assemble.mjs   → showcase/out/math-things-showcase.mp4
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OUT, FPS, ROOT } from './capture.mjs';
import { SCENES } from './scenes/index.mjs';
import { AT } from './cues.mjs';   // also writes out/cues.json

const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
const frames = file => +run('ffprobe', ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets,width,height', '-of', 'csv=p=0', file]).trim().split(',').pop();

// every shot present, the right size and length, and where the score expects it
let t = 0;
const starts = Object.values(AT);
for (const s of SCENES) {
  const file = join(OUT, `${s.name}.mp4`);
  if (!existsSync(file)) throw new Error(`missing ${s.name}: run node showcase/render.mjs ${s.name}`);
  const n = frames(file), want = Math.round(s.seconds * FPS);
  if (n !== want) throw new Error(`${s.name} has ${n} frames, wants ${want}`);
  if (!starts.some(a => Math.abs(a - t) < 1e-9)) throw new Error(`${s.name} starts at ${t} s, which the cues do not expect`);
  console.log(`  ${t.toFixed(1).padStart(5)} s  ${s.name} (${n} frames)`);
  t += s.seconds;
}
if (t !== AT.end) throw new Error(`the shots add up to ${t} s, not ${AT.end} s`);

run('python3', ['-I', join(ROOT, 'showcase', 'sound.py')]);

const list = join(OUT, 'shots.txt');
await writeFile(list, SCENES.map(s => `file '${join(OUT, s.name + '.mp4')}'`).join('\n') + '\n');
const film = join(OUT, 'math-things-showcase.mp4');
run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-i', join(OUT, 'score.wav'),
  '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(AT.end), '-movflags', '+faststart', film]);

const probe = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,duration,nb_frames', '-of', 'csv=p=0', film]).trim();
console.log(probe.split('\n').map(l => '  ' + l).join('\n'));
console.log('→', film);

# Math Things showcase film

An 84-second film made from real captures of the apps: a 9-second prologue that clears away the
usual edtech clutter, then the 75-second wordless film. Every carry, placement, stack,
pull, fold and cut on screen is the app itself responding to real pointer input or to its own
controls. The camera paths, the hidden chrome and the hooks in `scenes/*-hook`/`PATCH` blocks are
capture-only instrumentation. They are injected into the page at capture time and never touch
the apps in this repository.

This folder is production tooling. `.assetsignore` keeps it off the site, and `out/` is not
committed.

## Shots

| Film time | Shot | App | What really happens |
| - | - | - | - |
| 00:00–00:09 | `00-prologue` | Rekenrek, under parody clutter | The real rekenrek sits small under a title sign, points, a timer, a mascot with directions, a flashing GO button, levels, score and wallpaper (`scenes/slop.mjs`, an original parody of the genre). A finger flicks each piece away; the last one uncovers *No words. No directions.*; the rack grows to its film framing; the line untypes right to left. Its last frame is the film's first. |
| 00:09–00:14 | `01-rekenrek-open` | Rekenrek | Taps send 3, then 2, then 5 red-and-white beads home; row 2 waits at 9 + 1 |
| 00:14–00:29 | `02-place-value` | Place Value Blocks (original) | 1,234,567,890,390.12 + 10 → 400.12 by the tens' own + button; flight to trillions and back to tenths and hundredths |
| 00:29–00:41 | `03-pattern-blocks` | Pattern Blocks | Legal tilings fill five trays; the last trapezoid is refused at 30°, turned with the handle, and seated |
| 00:41–00:47 | `04-solids` | Solids | From overhead, a cube is dragged onto the box and stacked by the app; the camera comes down |
| 00:47–00:59 | `05-volume-space` | Volume Space | Faces pulled: 3×2×2 → tall (z 6) → wide (x 6) → low (z 3) → deep (y 4) = 6×4×3, ending on Nets' opening view |
| 00:59–01:06 | `06-nets` | Nets | The same 6×4×3 box unfolds flat under the app's own camera and folds back |
| 01:06–01:14 | `07-slicing-solids` | Slicing Solids | The plane sweeps down and back, then tilts; the section card holds |
| 01:14–01:19 | `08-rekenrek-return` | Rekenrek | The same frame as the opening; the last bead closes row 2's gap |
| 01:19–01:24 | `09-end-card` | (card) | "Math Things. / Math, in your hands." |

Each scene's `verify` checks the mathematics after a full take, for example 25 pieces seated or a
6 × 4 × 3 prism.

## Making it

Needs Playwright's Chromium (WebGL through SwiftShader works), `ffmpeg` with libx264, and
Python 3 with numpy.

```sh
# all shots (or name fragments: node showcase/render.mjs pattern nets)
THREE_DIR=/path/to/three@0.169.0/package node showcase/render.mjs
# cues → original score → the finished film (checks every shot's frame count first)
node showcase/assemble.mjs        # → showcase/out/math-things-showcase.mp4
```

`THREE_DIR` is only needed where the jsDelivr CDN is unreachable. It serves a local copy of the
same three.js version the apps import.

How capture works (`capture.mjs`): each page runs on Playwright's fake clock, and CSS and Web
Animations are paused and seeked to it. Every one of the 5,040 frames is stepped, acted on and
photographed in turn, so timing is exact however slowly a frame renders. Frames stream into
ffmpeg at 60 fps.

## Sound

`sound.py` synthesizes everything from numpy. There are no samples and no licensed music. The
prologue gets a deliberately cheesy jingle that tape-stops when the wallpaper is swiped away, a
flick for each piece, and a soft key for each character untyped. After that, tactile sounds land on cues computed from the same timings the scenes act on (`cues.mjs`). A quiet
I–vi–IV–V bed at 100 bpm starts with the rekenrek's ten and becomes rounder and lower for the
solids. It drops away for the return, which gets one click, and a single chord decays under the
end card.

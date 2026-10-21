# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try these on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- Algebra Tiles: x tiles stand upright only (no turning), which is enough for expressions and equations but not for area models of products.

Notes:
- Files changed: apps/algebra-tiles/index.html, apps/double-number-line/index.html (new apps); apps/coordinate-grid/index.html; apps/line-plot/index.html; index.html (menu cards).
- Algebra Tiles (new, Grade 6 Lessons 4, 19, 21, 24):
  - x² (blue), x (green) and unit (yellow) tiles; x is 3.4 units long, so it can't be counted as ones.
  - Drag from a bin, or tap a bin to line one up by kind. Tap a tile to flip it negative (red, −).
  - Drop a tile on its opposite and the zero pair leaves the mat. Drag a tile to the cabinet to put it away.
  - The mat button splits the mat with an equals bar for equations.
  - The eye (off by default) reads the mat as it lies, nothing combined: "2x − x + 2 − 1", or "x − x = x + 1" on a split mat.
- Double Number Line (new, Lessons 13–18):
  - Two lines share their ticks: the top counts by a (+/−, 1–50), the bottom by b. Only 0 and the first pair (3 and 5) are printed; the eye prints the rest.
  - ‹ › set 2–12 spaces, and cut each space into 1–10 parts for unit rates.
  - A reader bar drags across both lines and snaps to ticks and cuts. With the eye on it shows both values, e.g. 1 and 1 2/3 at the first third.
- Coordinate Grid:
  - A four-quadrant button switches to −10 to 10 on both axes (numbers sit inside the grid on a light halo). Ordered pairs use true minus signs: (−4, 2).
  - It won't return to one quadrant while a point has a negative coordinate; the size button rests while in four quadrants.
- Line Plot:
  - A box plot button hangs a box plot under the numbers: whiskers, quartile box, median bar. Quartiles are the medians of the lower and upper halves.
  - A balance-point button puts a red fulcrum under the line at the mean.
  - With the eye on, a second record line adds median and IQR and/or mean and MAD. For 2, 3, 3, 5, 6, 6, 6, 9: median 5.5, IQR 3, mean 5, MAD 1.75 (checked by hand).
- All: no horizontal scroll and no console errors.

Acceptance Tests:
- Algebra Tiles: add, flip, zero pairs, equation mat, record. PASS
- Double Number Line: counts, cuts, reader, record off by default. PASS
- Coordinate Grid: four quadrants with refusals; first quadrant unchanged. PASS
- Line Plot: box plot, mean fulcrum, correct statistics; earlier tests still pass. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

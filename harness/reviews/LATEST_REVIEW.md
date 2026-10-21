# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try a roll on a real iPad or Chromebook, with Reduce Motion both on and off.

Notes:
- Files changed: apps/spinner-dice/index.html, apps/chance-lab/index.html.
- Teacher request: spinners and dice should animate.
- Cause found: both apps honored the system Reduce Motion setting by skipping all movement. School iPads and Chromebooks often have it on, so spinners jumped straight to their result and dice didn't move. Chance Lab's cube never animated, and its batch runs didn't move either.
- Spinners now always spin. Normally they make about four turns over 1.6 s (Chance Lab: 1.2 s). With Reduce Motion they make one gentler turn over about 0.9 s instead of none.
- Number cubes are now real 3D cubes (CSS 3D, no library).
  - Before each roll, the result is written on the front face and other values on the rest. The cube tumbles one or two whole turns with a little hop and lands showing the result, tipped slightly toward the viewer so it reads as a cube.
  - Rolls take 1.2 s normally and 0.65 s with Reduce Motion.
  - Works for dot cubes and numeral cubes (1–6, 4–9, 0–9).
- Chance Lab: every run now moves. A single trial gets the full spin or roll; a batch (10, 100, 1,000) gets a quicker 0.65 s turn landing on its last result. Drawn marbles rise out of the bag.
- Number cards keep their flip with Reduce Motion on (it's small).
- Checks: sampled the arrow and cube transforms every 220 ms during a roll, with and without Reduce Motion; both change and then settle. The landed front faces matched the record (e.g. dice 5 and 6 with record 5 + 6 + 3 = 14). Earlier Spinner & Dice tests still pass. No horizontal scroll and no console errors.

Acceptance Tests:
- Spinners spin with Reduce Motion on and off. PASS
- Dice tumble in 3D and land on the recorded value. PASS
- Chance Lab batches animate. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

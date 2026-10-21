# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try these on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- Bar Model: removing a cut merges two parts, and an unknown mark on the right-hand part is dropped. Re-mark it if needed.

Notes:
- Files changed: apps/bar-model/index.html (new app); apps/hundred-chart/index.html; apps/line-plot/index.html; index.html (menu card).
- Bar Model (new, Grade 2 Lessons 3, 5, 7–9, 19, 25–26, and later grades): tape diagrams.
  - Bars start at one left edge under a metal ruler, so they compare. ‹ › above the ruler set its length: 10, 20, 50, 100, 200, 500 or 1,000. Lengths snap to whole units up to 100, and to 2, 5 or 10 beyond.
  - Drag a bar's metal end knob to stretch it. Pulling a bar with no cuts back to zero lifts it off; one bar always stays.
  - Cut tool (default): tap a bar to cut it into parts; drag a cut to move it; tap a cut to take it out.
  - Unknown tool: tap a part to hatch it with a "?" (and tap again to clear).
  - The add bin adds a bar (up to 4). The eye (off by default) prints each part's length and each bar's total. ↺ starts over with two bars.
- Hundred Chart: ‹ › above its right corner turn to the next hundred (101–200 and on to 901–1,000). Each hundred keeps its own chips and covers; ↺ clears them all. Three- and four-digit numbers are drawn a little smaller.
- Line Plot: whole units added (cuts per whole now 1, 2, 4 or 8). Whole-unit lines run up to 20; halves up to 12; fourths and eighths up to 6. Whole-number labels thin to every 2 or 5 when crowded. Switching to a finer cut is refused while the line is too long for it.
- All three: no horizontal scroll and no console errors at the three sizes.
- Accessibility: Bar Model bars are focusable sliders. Left/Right change length (Shift ×10), Space cuts the longest part in half, Backspace removes the last cut, and ? marks the last part. The Hundred Chart page turners are buttons.

Acceptance Tests:
- Bar Model: stretch, cut, move and remove cuts, unknown marks, add and remove bars, scale change. PASS
- Bar Model record off by default; parts and totals correct when on. PASS
- Hundred Chart pages 1–1,000 with chips kept per page. PASS
- Line Plot whole units to 20 with readable labels. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

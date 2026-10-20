# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- On a phone, a 3-whole line cut in eighths has ticks about 11px apart: fine to look at, fiddly to tap. Fewer wholes or fourths are comfortable.

Notes:
- Files changed: apps/line-plot/index.html (new app); index.html (menu card).
- Behavior: a line plot for measurement data in fractions of a unit (Grade 5 Lesson 27).
  - A metal number line from 0 to 2 wholes, cut in fourths. Whole numbers are always printed; cuts are printed as room allows (every cut, every other cut, or halves only).
  - Tap above a tick to stamp an ✕ tile; tiles stack up to 12 high. Tap the top tile of a stack to take it off.
  - ‹ › steppers on the left change the cuts per whole (halves, fourths, eighths); on the right they change the length (1 to 6 wholes). The tool refuses (a short buzz) to drop a cut or a whole that has marks on it.
  - The eye button (off by default) shows the number of marks, their total, and the lowest and highest value, e.g. "✕ 6  total 3 3/4  1/4 to 1 1/4".
  - ↺ takes all the marks off.
- Doctrine principles applied: no words or directions; the data is a stack of objects you can count; totals are an optional shadow; no answer checking or datasets.
- Desktop (1024×768): add/remove by tap, steppers, refusals, record and keyboard all pass. No console errors. Fixed during testing: labels on a 3-whole eighths line ran together; now they thin out.
- Mobile (375×812): fits with no horizontal scroll. Fixed during testing: the line sat high with empty space below, and the record line overlapped the eye button.
- Projector (1920×1080): line is 960px; same tests pass.
- Accessibility: the plot is focusable; Left/Right move a cursor along the ticks, Space/Up adds, Backspace/Down removes. Steppers are buttons. A polite live region reports each stack, and the total and spread while the record is shown.
- Remaining risks:
  - Values stop at eighths and 6 wholes; stacks stop at 12.

Acceptance Tests:
- Tap adds a mark; tapping the top mark removes it. PASS
- Cuts and length steppers; refusals protect existing marks. PASS
- Record off by default; count, total and spread correct when on. PASS
- Keyboard adds and removes. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

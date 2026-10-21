# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/crossing-lines/index.html (new app); index.html (menu card).
- Crossing Lines (new, Grade 7 Lesson 28; Grade 8 parallel lines and transversals):
  - Two lines cross at a point. A round handle at the end of each line turns it, in whole degrees, and the lines can't close up within 5°.
  - The four angles at the crossing are painted in two colors: one size red, the other blue. Opposite (vertical) angles share a color, and neighbors make a straight line together.
  - The mode button switches to two parallel lines (with arrow marks) cut by a crossing line. Both crossings are painted the same way, so corresponding, alternate and same-side angles can be matched by color. The upper parallel's handle turns both parallels together.
  - The eye (off by default) prints every angle's measure, e.g. 130°, 50°, 130°, 50° at each crossing.
- Doctrine principles applied: no words, prompts or answer checking; equal angles are shown by color, and the numbers are the optional shadow.
- Checks: dragging the crossing line to 130° gave 130/50 at each crossing; Shift+Left on the parallels turned them 10° (to 120/60); a 2px drag of the offset handle moves the parallels by at most 1° (no jump). No horizontal scroll and no console errors.

Acceptance Tests:
- Two crossing lines; vertical and straight-line pairs by color. PASS
- Parallel lines and a crossing line; matching angles by color at both crossings. PASS
- Record off by default; measures correct when on. PASS
- Keyboard turns both handles. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

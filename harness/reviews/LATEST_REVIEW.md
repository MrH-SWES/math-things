# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- Walker Ellie (the menu's integer coordinate app) still has word tabs ("X-Axis", "Y-Axis", "Both") and a find-the-hidden-character game. It's a teacher decision whether to keep the game.

Notes:
- Files changed: apps/coordinate-grid/index.html (new app); index.html (menu card).
- Behavior: a first-quadrant coordinate grid for Grade 5 Lessons 31–33 (the coordinate plane, problems in the plane, and patterns graphed as ordered pairs).
  - A tiled grid 0–10, with the two axes as number lines meeting at 0. Every fifth line is darker.
  - Tap a crossing to put down a bead; tap a bead to take it off; drag a bead to move it (it snaps to crossings and won't land on another bead). The bead in hand drops dashed lines to both axes.
  - Hardware, top right:
    - The grid button switches between 0–10 and 0–20. It won't shrink back while a bead sits past 10.
    - The join button draws a line through the beads from left to right, so a pattern like (1, 2), (2, 4), (3, 6) shows as a path.
    - The eye (off by default) shows each bead's ordered pair.
    - ↺ clears.
- Doctrine principles applied: no words, targets or answer checking; the ordered pairs are the optional shadow of where the beads are.
- Desktop, mobile, projector: plotting y = 2x points, removing a stray, dragging (4, 8) to (5, 8), join, record and the 0–20 grid all pass. No horizontal scroll and no console errors (fixed during testing: the grid sat at the top of phones with empty space below).
- Accessibility: the grid is focusable; arrows move a ring between crossings (Up is +y); Space/Enter puts down or takes off a bead; a polite live region says the pair at the ring.

Acceptance Tests:
- Tap places and removes; drag moves and snaps. PASS
- Join line follows x order. PASS
- Record off by default; pairs correct when on. PASS
- 0–20 grid; shrink refused when beads are past 10. PASS
- Keyboard places points. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

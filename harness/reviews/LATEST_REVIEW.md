# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially stretching a band from its middle and double-tapping a corner. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- On phones, pegs are 30px apart; fine for a mouse, tight for a finger.

Notes:
- Files changed: apps/geoboard/index.html (new app). No existing app was modified.
- Behavior: A free geoboard for perimeter, area, right angles and shapes (Grade 4 Lessons 16, 30, 33, 34).
  - A brushed-metal plate holds an 11×11 grid of aluminum pegs (a 10×10 board of unit squares).
  - Tap the band bin to hook a band on two open pegs near the middle, or drag a band out of the bin to hook it where the finger is. Up to 6 bands, each its own color.
  - Drag a corner to move it to another peg. Drag the middle of a side to stretch the band around a new peg. Drag the inside of a shape to slide the whole band. Off the board, the band stretches toward the finger and snaps to the nearest peg on release.
  - Double-tap a corner to unhook it from that peg. A band dropped on the cabinet is put away. ↺ takes all bands off.
  - The eye button shows an optional record: square corners on right angles, a length on straight two-peg bands, and "P = 10  A = 6" above each shape. Perimeter shows only when every side runs along the grid; area shows half units ("A = 3½", "A = ½"). Off by default.
- Doctrine principles applied:
  - No words or directions on the surface.
  - Measures are optional and follow the band; there is no answer checking.
- Fixes made during testing:
  - Straight (horizontal or vertical) bands were invisible: the shadow filter's region was a percentage of a zero-height box. The filter now uses board coordinates.
  - A keyboard-focused band had no visible focus; it now glows blue.
  - Half a unit read "0½"; it now reads "½".
- Desktop behavior (1024×768): A band stretched into a 3×2 rectangle reads P = 10, A = 6. Unhooking one corner leaves a right triangle reading A = 3 with no perimeter (slanted side). Sliding, putting away, dragging from the bin and clearing all work. A seventh band is refused. No console errors.
- Mobile behavior (375×812): The board fits above the cabinet with no horizontal scroll; pegs 30px apart. Same tests pass.
- Projector behavior (1920×1080): Pegs 56px apart; same tests pass.
- Accessibility notes: The band bin is a button; Enter hooks a band and focuses it. A focused band: arrows move it a peg at a time, Enter picks a corner (arrows then move that corner), + hooks a new corner, Escape lets go, Delete unhooks the corner or takes the band off. A polite live region lists each band's corners, plus area and perimeter only while the record is shown.
- Remaining risks:
  - A band crossed over itself (a bow tie) reports the signed shoelace area, which is not what a student would count.
  - Perimeter is hidden for shapes with slanted sides, since those lengths are not whole units.

Acceptance Tests:
- Tapping the bin hooks a band; dragging from the bin hooks it under the finger. PASS
- Stretching a side adds a corner; a 3×2 rectangle reads P = 10, A = 6. PASS
- Double-tapping a corner unhooks it. PASS
- The inside of a shape slides the band. PASS
- A band dropped on the cabinet is put away; ↺ clears all bands. PASS
- Straight two-peg bands are visible. PASS
- Keyboard: Enter on the bin, arrows, +, Escape, Delete. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially turning a block by its bead and fitting blocks edge to edge. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/pattern-blocks/index.html (new app). No existing app was modified.
- Behavior: A free pattern-block mat for shapes, angles and composing figures (Grade 4 Lessons 9, 33, 34).
  - The six classic blocks in their usual colors, as enameled pieces: yellow hexagon, red trapezoid, blue rhombus, green triangle, orange square, tan rhombus. Every edge is one unit; the trapezoid's long side is two.
  - The cabinet has a bin for each block, drawn at one shared scale so sizes compare. Tap a bin to set a block in an open spot near the middle, or drag a block out.
  - Drag a block to move it. Let go near another block and it settles edge to edge: the move that lines up the most corners wins, including the middle of the trapezoid's long side.
  - Blocks cannot overlap. A block dropped on another slides back where it came from; a new block dropped on another goes back in its bin.
  - Tap a block to pick it up: an aluminum bead on an arm appears. Dragging the bead turns the block in 30° steps, the angle every pattern block is built from. A turn that would overlap another block is refused.
  - Press and hold a block (about half a second) and its whole design lifts: every block touching it, directly or through other blocks. Drag to move the design as one; it snaps and refuses overlaps as a unit. A quick drag still moves one block.
  - The outline bin (last in the row) engraves an outline into the middle of the mat, a shallow recess to fill: hexagon, large triangle, large rhombus, large square, large hexagon, six-point star, then none. Blocks snap to the outline's corners and to each unit along its sides. The outline never blocks a piece and nothing is checked. New blocks from a bin land beside the outline, with a small gap so they never join a design by accident.
  - Dropping a block or a lifted design on the cabinet puts it away. ↺ puts all blocks away.
  - The eye button shows an optional record: the picked-up block's angle at every corner (arcs inside, square marks on right angles, measures just outside each corner). Off by default.
- Doctrine principles applied:
  - No words or directions on the surface.
  - The structure lives in the constraints: blocks fit edge to edge, turn only in 30° steps, and refuse to overlap.
  - The record is optional and follows the block; there is no answer checking.
- Fixes made during testing:
  - The turning bead turned the block the wrong way.
  - Clicking a block selected it on focus and then deselected it on release.
  - Angle measures crowded inside thin blocks (tan rhombus, blue rhombus, triangle); they now sit outside the corners, and the bead was moved out so it does not cover them.
- Desktop behavior (1024×768): Edge 72px. A triangle dropped near a hexagon's top edge settles onto it, sharing both corners. A triangle dropped on the hexagon slides back. A square dragged from its bin onto the hexagon goes back in the bin; dragged to an open spot it stays. The bead turns a square to 30°. Records read 90° ×4, 120° ×6, and 30°/150° for the tan rhombus. No console errors.
- Mobile behavior (375×812): The bins wrap to two rows of three; no horizontal scroll. Edge 47px. Same tests pass.
- Projector behavior (1920×1080): Edge 72px; same tests pass.
- Outlines and designs (both sizes): One tap shows the hexagon outline; a trapezoid dropped a little off its top half settles in with 4 corners on the outline, and a turned second trapezoid completes it. A held design moves as one and leaves a separate square behind; a quick drag moves one block only; a held design dropped on the cabinet is put away. The outline bin cycles through all six outlines back to none.
- Accessibility notes: Each bin is a button; Enter sets a block and focuses it. The outline bin's label names the current and next outline, and a change is announced. A focused block: arrows slide it a quarter edge (Shift: a whole edge; Alt: its whole design an edge), R turns it 30° clockwise (Shift+R counterclockwise), Delete puts it away, Escape lets go. Each block's label names it and its turn, plus its angles while the record is shown. A polite live region counts the blocks on the mat.
- Remaining risks:
  - The outline is fixed in the middle of the mat; it cannot be moved or turned.
  - No mirror line yet; symmetry (Lesson 34) is planned for the separate Symmetry / Fold app.

Acceptance Tests:
- Tapping a bin sets a block; dragging from a bin places it under the finger. PASS
- A block let go near another settles edge to edge. PASS
- Overlapping placements and turns are refused. PASS
- The bead turns a block in 30° steps. PASS
- The record shows each corner's angle on the picked-up block. PASS
- A block dropped on the cabinet is put away; ↺ clears the mat. PASS
- Press and hold lifts the whole design; it moves, snaps and is put away as one. PASS
- The outline bin cycles outlines; blocks snap into an outline. PASS
- Keyboard: Enter on a bin, arrows, Shift+arrows, Alt+arrows, R, Delete. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

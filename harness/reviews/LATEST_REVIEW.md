# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially dragging a fold tab partway and tracing with a finger while folded. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- Drawing has no keyboard path; only the crease, the fold tabs and the shapes do.

Notes:
- Files changed: apps/symmetry-fold/index.html (new app); index.html (menu card).
- Behavior: A sheet of tracing paper with a fold, for symmetry and lines of symmetry (Grade 4 Lessons 30 and 34; it stands in for tracing paper and mirrors).
  - A square sheet of tracing paper lies on the mat with a crease through its middle. An aluminum bead at each end of the crease turns it in 15° steps (0°–165°), which covers the lines of symmetry of squares, rectangles, triangles and hexagons.
  - A metal tab on each half folds that half over the crease. Tap a tab to fold or unfold; drag it to fold by hand, and let go past the crease to stay folded. The half squashes toward the crease, stands edge-on, then lies over the other half; its back faces up, so its marks show through the translucent paper.
  - Pencil: draw anywhere on the sheet. While the sheet is folded, a mark made on the folded-over half is made on that half, as on real tracing paper, so unfolding brings the tracing back as a mirror image. The app never mirrors anything on its own.
  - Shape bins draw an ink outline across the middle of the crease: square, rectangle, equilateral triangle, right triangle, parallelogram, kite. Fold: if the crease is a line of symmetry the halves land on each other as one outline; if not, two outlines show. Nothing is checked.
  - Hand: move a shape; let go near the middle of the crease and it settles there. Shapes can't be added or moved while folded.
  - The eye button lays a faint dot grid on the paper. Off by default. ↺ is a new sheet: drawing and shapes are cleared and the sheet unfolds.
- Doctrine principles applied:
  - No words or directions on the surface.
  - The student does the folding and the tracing; symmetry shows as two outlines landing on each other or not.
  - No answer checking.
- Desktop behavior (1024×768): Sheet 506px. A mark traced on the folded-over half reappears exactly mirrored when unfolded (within 3px). A folded parallelogram shows two crossing outlines; a folded rectangle shows one. Dragging the top bead a quarter turn sets the crease to 45°. A shape moved with the hand and dropped near the middle settles there. No console errors.
- Mobile behavior (375×812): Sheet 265px; the cabinet wraps (tools in a column, shapes in two rows). Same tests pass.
- Projector behavior (1920×1080): Sheet 560px; same tests pass.
- Accessibility notes: The beads are sliders (arrow keys turn the crease 15°), the tabs are buttons (Enter or Space folds and unfolds), and shapes are focusable in hand mode (arrows move them, Shift moves farther, Delete removes). Ctrl+Z takes back the last pencil stroke. A polite live region announces the crease angle and folds.
- Remaining risks:
  - The crease always passes through the middle of the sheet; shapes move instead.
  - Shapes cannot be turned; turning the crease does that job.

Acceptance Tests:
- Tapping a tab folds and unfolds that half. PASS
- A tracing made while folded unfolds as a mirror image. PASS
- Shape outlines fold onto themselves only along a line of symmetry. PASS
- The beads turn the crease in 15° steps. PASS
- The hand moves shapes; near the middle they settle on the crease. PASS
- Shape bins refuse while folded. PASS
- ↺ clears the sheet. PASS
- Keyboard: arrows on a bead, Enter on a tab. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

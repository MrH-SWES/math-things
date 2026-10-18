# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen. Testing so far used mouse input, including at phone and tablet sizes.
- Decide whether decimal lessons (Grade 4 L25–27, flat = 1) need a way to make a different piece worth one. Not built.

Notes:
- Files changed: apps/place-value-blocks-v2/index.html (new build). apps/place-value-blocks/index.html (the legacy Place Value Visualizer) is unchanged.
- Behavior changed: v2 is a new free base-ten block mat, not a copy of the Visualizer.
  - A brushed-metal cabinet holds four bins: thousand cubes, hundred flats, ten rods, units. Drag from a bin, or tap it to drop a piece onto the mat.
  - Same-size pieces dropped together join: units into a column, rods side by side, flats stacking back into depth.
  - A run holds ten at most. At ten it settles hard, catches the light once, and stays a run; it does not fuse on its own. A piece dropped on a full run bounces off beside it. Overflow from a merge slides aside.
  - Double-tap (or Enter/Space) is the trade. A full run of ten becomes one piece of the next size up. A rod, flat or cube becomes ten pieces of the next size down. Anything else (a lone unit, a run of 2–9) shakes: there is no trade to make.
  - Regrouping is therefore the student's deliberate move, in both directions (rubric Q5).
  - Dragging the end piece of a run pulls just that piece off.
  - Dropping a piece on the cabinet puts it away. ↺ clears the mat.
  - The eye button shows an optional record, colored by place: "1,000 + 200 + 30 + 14 = 1,244". It is off by default, and unregrouped counts show as they really are.
- Doctrine principles applied:
  - No words or directions on the surface. Controls are wordless; labels are aria-only.
  - The object comes first, and the record follows it.
  - Correct structure snaps and fuses instead of being answer-checked.
  - Enameled cast-iron blocks (bevel, sheen, engraved unit grooves, heavy contact shadow) on a warm ceramic mat with brushed-metal infrastructure.
  - Place-value palette only (ones #DC143C, tens #4169E1, hundreds #FFD700, thousands #4CBB17).
  - Motion: pieces pop in, thud as they settle, and fuse with a heavier settle. Haptics are light, and prefers-reduced-motion is respected.
  - Ten flats stack into exactly the space of one cube.
- Desktop behavior (1024×768): No console errors.
  - Ten taps on the units bin build a full run of ten with no fuse; an eleventh tap lands beside it.
  - A unit dragged onto a full run bounces aside.
  - Double-tapping the full run trades it for a rod; double-tapping the rod trades it back for ten units.
  - A run of 6 refuses to trade.
  - 6 + 5 gives a full ten plus one aside, with the total preserved.
  - Ten rods trade up to a flat (via the keyboard's Enter); ten flats trade up to a cube.
  - Pull-off, put-back, and resist all work.
- Mobile behavior: At 375×812 the cabinet fits with no horizontal scroll and the record clears the brand badge. At 768×1024, 1,234 builds comfortably.
- Accessibility notes: Bins are buttons; Enter adds a piece. Pieces are focusable; arrow keys move them (Shift moves farther), Enter or Space breaks, Delete puts away. A polite live region announces piece counts, plus the total only while the record is shown. Touch targets: bins ≥60px, hardware 42px. Single units are about 14–28px depending on screen size.
- Remaining risks:
  - Not tested with real touch input.
  - Very large piece counts (hundreds of loose units) are not performance-tested.
  - v2 is reachable only by URL. It is not on the home page or in the Teaching Table.

Acceptance Tests:
- apps/place-value-blocks/index.html unchanged. PASS
- Drag from each bin places that piece. PASS
- A run of ten stops growing and does not fuse by itself. PASS
- A piece dropped on a full run bounces off. PASS
- Double-tap on a full run of ten units, rods or flats trades it up one size. PASS
- Double-tap on a rod, flat or cube trades it down into ten. PASS
- Double-tap on a lone unit or a partial run resists. PASS
- Overflow past ten leaves the remainder as a separate run. PASS
- Enter/Space on a focused piece performs the same trade. PASS
- Dropping on the cabinet removes the piece. PASS
- The record is hidden by default and matches the pieces when shown. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad and Chromebook. Testing used headless Chromium (mouse, touch and keyboard) at 1280×720, 1024×768, 768×1024, 900×560, 390×844, 844×390 and 667×375.
- A record (eye) showing the two candidate roundings at the ends of the frame (for 245: 200, 250, 300) would let the teacher connect the frame to a number line. Deliberately not added: the app was built with "no rounding decision, success state, or reveal".

Notes:
- Files changed: apps/rounding-blocks/index.html (audit and fixes); harness/reviews/LATEST_REVIEW.md.
- Rounding Blocks (audit of the new app; usability and family consistency):
  - Object: the number in base-ten blocks on one physical scale, under an empty frame shaped like the next place up (rod, flat, cube, larger rod, larger flat) with a permanent halfway line. Action: carry the blocks below the rounding place into the frame. Structure: whether they fill past halfway. Kept as built.
  - Carrying fixed: a dragged block used to vanish as soon as it left the mat (clipped by the scrolling mat), so a student could not see what they held over the frame. It now rides above everything and glides home if let go on the mat.
  - Moves undo: drag a block out of the frame, or double-tap it there, and it returns to its own slot. Keyboard: Enter on the frame takes the last block back out. Before, only Reset could bring anything back.
  - Blocks keep their slots: the rest no longer jump to fill the gap when one leaves.
  - A block glides into its share of the frame and settles; reduced motion makes every move instant.
  - Blocks above the rounding place resist with a small shake instead of ignoring the touch.
  - Scale: one unit scale for every block, the largest that fits the whole mat in view (up to 16 px per unit; it was capped at 7.3, so ones were 7 px on a projector). Thousand cubes and ten-thousand rods used to run off the bottom with no hint. When the whole number cannot fit (5 to 6 digits on a phone), the places that move fit and the mat opens scrolled to them. Touch targets are at least 44 px (were 30). The mat refits on resize or rotate and keeps what is in the frame.
  - Frame lines keep their weight at every size: the halfway line was nearly invisible on the 10,000 and 100,000 frames because its width was in frame units, not pixels.
  - Large blocks at small scales show the seams between their thousand cubes instead of a blur of unit lines.
  - Number: "12.5" now gives 12 (was 125); empty or non-numeric input keeps the current number (was 0); numbers show with commas.
  - The rounding place the teacher picks is remembered: typing a small number no longer drops it to 10 for good.
  - Consistency with the family (Place Value Blocks V2, Chance Lab, Circles, Slicing Solids): the white form header with "Number", "Round to nearest", "Reset" and "100 frame" is replaced by the brushed cabinet. It holds a milled number field, five wordless bins showing the rod, flat, cube, larger rod and larger flat with their numerals (places above the number are dimmed), and the round reset button. The frame caption is just the numeral. Standard footer.
  - Loads the shared math-things-home.js like every other app, so the Math Things. home link and the on-screen number pad work. Enter on a hardware keyboard also puts the number pad away so it stops covering the bins.
  - Short landscape screens put the frame beside the mat.
  - Screen readers: each place is a labelled group; moves announce how much of the target is in the frame; the frame says where its halfway line is.

Acceptance Tests:
- Drag in, drag out, double-tap both ways, a drop on the mat returns the block, static blocks resist, and the remaining blocks do not move. PASS
- Keyboard: Enter moves a block in and focus moves on; Enter on the frame takes the last block back out. PASS
- Touch drag (CDP touch events) on a 768×1024 touch page. PASS
- Resize keeps the frame's contents; reset returns every block. PASS
- Number input: 12.5 → 12, empty and "abc" keep 12, -245 → 245, 1234567 → 999,999, 1,234 → 1,234; the chosen place comes back after a smaller number. PASS
- Frames fill correctly: 245 → 45 of 100 (left of halfway), 350 → exactly halfway, 4,567 → 567 of 1,000, 45,678 → 5,678 of 10,000, 7 → 7 of 10. PASS
- On-screen number pad commits; the home link points to the menu. PASS
- No horizontal page scroll and no console errors at any tested size. PASS
- No frameworks, bundlers, or package managers added. PASS

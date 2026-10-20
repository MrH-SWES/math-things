# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook, especially dragging the beads with a finger. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- On phones a whole is about 100px, so twelfths cut it into 8px strips; readable on a projector, tight on a phone.

Notes:
- Files changed: apps/area-model/index.html (new app); index.html (menu card).
- Behavior: a fraction and decimal area model for Grade 5 Lessons 15–16, 20 and 22 (multiply decimals; multiply fractions; fractions to find area).
  - A unit square in a metal frame, with three ghost squares beside and below it so either side can run to 2 wholes (mixed numbers, Lesson 20).
  - Each factor is an aluminum bead on a notched track: across the top for the first factor, down the left side for the second. Beads snap to the cuts of a whole. ‹ › steppers at each end of a track change how many cuts make a whole (2, 3, 4, 5, 6, 8, 10, 12), keeping the factor as near as it can.
  - The first factor shades columns and the second shades rows, each in the shared denominator color (math-things-fractions.js). Their cut lines run across the whole mat, so the square is cut into equal small pieces. Where the two shadings cross is the product, outlined in bold.
  - Tenths by tenths gives the hundredths grid, so decimals work the same way (0.4 × 0.3).
  - The eye button (off by default) shows each factor beside its bead as a stacked fraction, and the product under the square: "2/3 × 3/4 = 6/12", or "0.4 × 0.3 = 0.12" when both sides are in tenths. Products are left unsimplified so they match the pieces counted.
  - ↺ returns to 2/3 by 3/4.
- Doctrine principles applied: no words or directions; the product is a region you can count; the equation is the optional shadow of the square; no answer checking.
- Desktop (1024×768): whole = 255px. Starts at 2/3 × 3/4 = 6/12. Dragging the top bead past one whole reads 4/3 × 3/4 = 12/12. Steppers reach tenths; arrow keys set 0.4 × 0.3 = 0.12. The record hides when toggled off. No console errors.
- Mobile (375×812): whole ≈ 105px; everything fits on screen with no horizontal scroll (fixed during testing: the right stepper overhung the edge by 7px). Same tests pass.
- Projector (1920×1080): whole = 260px; same tests pass.
- Accessibility: beads are sliders (arrows move one cut; Shift+arrows change the number of cuts) and steppers are buttons. A polite live region describes both factors and the overlap in pieces, plus the multiplication while the record is shown.
- Remaining risks:
  - Factors stop at 2 wholes.
  - Hundredths (0.25 × 0.4) are not offered; the cuts stop at twelfths and tenths.

Acceptance Tests:
- Beads snap to cuts; the overlap is outlined. PASS
- Mixed numbers past one whole. PASS
- Steppers change cuts; tenths × tenths gives hundredths. PASS
- Record off by default; shows fractions or decimals when on. PASS
- Keyboard sets both factors. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

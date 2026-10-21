# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- On phones the opened square's ten strips are about 10px wide each. Tapping them works, but it's tight; dragging across them is easier.

Notes:
- Files changed: apps/decimal-grid/index.html.
- Behavior: Decimal Grid now reaches thousandths (Grade 5 Lessons 9, 11 and 14–17).
  - A new lens bin sits beside the grid bin. Drag the lens onto any small square (a hundredth) and that square opens up big beside itself, cut into ten strips: thousandths. A violet ring marks the square it came from.
  - Tap a strip to shade up to it; tap the last shaded strip to take it back; drag across to sweep. Shading fills from the left, so the small square in the grid shows the same amount as a violet sliver.
  - Ten thousandths make a full hundredth, which turns orange like any other shaded square; full columns and full grids still turn tenths-blue and ones-red.
  - Touching anything else closes the lens. Tapping the lens bin without dragging opens the first grid's cursor square.
  - Thousandths are violet (#7B00FF), matching Place Value Cards and Line Up the Ones.
  - The eye record now shows three places when needed: "0.114" with 114/1000. Tenths and hundredths read as before (0.3, 3/10; 0.25, 25/100).
- Doctrine principles applied: no words or directions; a thousandth is a piece you can see inside a hundredth; the number is the optional shadow; no answer checking.
- Desktop (1024×768), mobile (375×812), projector (1920×1080): a column plus one hundredth plus four thousandths reads 0.114. Tapping the fourth strip again gives 0.113. Tapping the mat closes the lens. No horizontal scroll and no console errors.
- Accessibility: on a focused grid, Shift+Right/Left opens the cursor square under the lens and adds or removes a thousandth; Escape closes it. The lens bin opens with Enter or Space. Grid labels say "116 of 1000 shaded" when thousandths are present, and "25 of 100" otherwise.
- Remaining risks:
  - Only one square can be open at a time.
  - Thousandths in a square always fill from the left; they can't be scattered.

Acceptance Tests:
- Lens opens a square into ten thousandths. PASS
- Strips shade and unshade; the grid square shows the sliver. PASS
- Record reads thousandths as a decimal and as a fraction over 1000. PASS
- Ten thousandths make a hundredth; columns and wholes still complete. PASS
- Keyboard reaches thousandths. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

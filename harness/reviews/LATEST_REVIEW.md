# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used headless Chromium at 1280×720.

Notes:
- Files changed: apps/place-value-blocks/index.html (the original Place Value Blocks); harness/reviews/LATEST_REVIEW.md.
- Place Value Blocks (original): decimals now restart the shape pattern at the one.
  - Whole numbers are unchanged: ones cubes, tens sticks, hundreds flats, thousands cubes, and so on.
  - A one breaks the way a hundred flat does: into ten sticks. So tenths are sticks, each as tall as a one cube. Hundredths are cubes, ten to a tenth stick. Thousandths are flats, ten to a hundredth cube.
  - This is the only place the pattern breaks. When a one breaks into tenths, it first turns into a flat of ten tenth sticks:
    - Borrowing: the flat carries over to the tenths and stands up as ten sticks.
    - ÷10: the flat shrinks to a single stick.
  - Going the other way, ten tenths close up into that flat and it settles into the one cube:
    - Carrying: the ten sticks close into a flat, carry over, and become one cube.
    - ×10: each tenth stick grows into a flat, then becomes a one cube.
  - The one is now always drawn as a plain cube. It used to be drawn as ten tenth flats, which no longer exist.
  - A hundredth cube is drawn as its ten thousandth slices once they are big enough to see, the way a thousand cube shows its hundred flats.
  - Fixed along the way: a cube landing from a carry of flats chose its inner grid only for whole places. The thousandths → hundredths carry would have drawn a cube ten times too big.
- Checks:
  - ÷10: 3.4 → 0.34; 4.56 → 0.456.
  - ×10: 0.34 → 3.4; 0.456 → 4.56.
  - + a tenth: 2.9 → 3. − a tenth: 3 → 2.9.
  - + a hundredth: 0.09 → 0.1. − a hundredth: 0.1 → 0.09.
  - + a thousandth: 0.009 → 0.01. − a thousandth: 0.01 → 0.009.
  - Mid-animation frames show each one passing through its flat of tenth sticks.
  - 1,234 and 4,567,890 render pixel-identical to before.
  - No console errors.

Acceptance Tests:
- Tenths are sticks, hundredths cubes, thousandths flats, each a tenth of the place above. PASS
- A one breaks like a hundred flat (borrow and ÷10), and ten tenths make a one through that flat (carry and ×10). PASS
- Tens, hundreds, thousands and up behave exactly as before. PASS
- No frameworks, bundlers, or package managers added. PASS

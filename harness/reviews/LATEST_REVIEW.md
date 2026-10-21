# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted clicks at 1024×768, 375×812 and 1920×1080.
- On phones the cabinet is about 50px taller (three buttons stacked); wider screens put them in two columns, so the cabinet keeps its old height.

Notes:
- Files changed: apps/place-value-blocks-v2/index.html.
- Behavior: base-ten blocks now model decimals (Grade 5 Lessons 8–9, 11, 14–17).
  - A new button in the cabinet (two boxes with a decimal point between them) chooses which block is one: the small cube (as before), the flat, or the big cube. A small "1" tag sits on that block's bin.
  - Every block wears the enamel of its place, so the colors move with the choice. With the flat as one: flats are ones-red, rods tenths-sky, small cubes hundredths-orange, and the big cube tens-blue. With the big cube as one, small cubes are thousandths-violet. These are the same colors used in Decimal Grid, Place Value Cards and Line Up the Ones.
  - Joining ten and trading work exactly as before: ten hundredths make a tenth.
  - The eye record (off by default) reads in the chosen ones: one flat, two rods and three small cubes show "1 + 0.2 + 0.03 = 1.23", or "0.1 + 0.02 + 0.003 = 0.123" with the big cube as one. Back on the small cube, it reads "100 + 20 + 3 = 123".
- Doctrine principles applied: no words or directions; the unit is the student's choice; the number is the optional shadow; no answer checking.
- Fraction & Decimal Number Line was left at hundredths: on its 0–1 line a thousandth is narrower than a pixel. Zooming Number Line and Decimal Grid now cover thousandths.
- Desktop, mobile and projector: all three choices give correct records; no horizontal scroll; no console errors.
- Accessibility: the button announces the current choice ("Now: the flat"). Spoken totals use the chosen ones while the record is shown.
- Remaining risks:
  - The rod can't be chosen as one; that's rare in Grade 5 materials.
  - Spoken block names (unit, ten rod, hundred flat) stay the same when a different block is one.

Acceptance Tests:
- Which-is-one cycles small cube → flat → big cube → small cube. PASS
- Block colors follow place value. PASS
- Record reads decimals to thousandths. PASS
- Whole-number behavior unchanged on the small cube. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

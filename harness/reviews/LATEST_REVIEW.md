# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially drag-laying chips along a row with a finger. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- On phones, tiles are 30px; fine with a mouse, small for a finger.

Notes:
- Files changed: apps/hundred-chart/index.html (new app). No existing app was modified.
- Behavior: A free hundred chart for multiples, factors, primes and number patterns (Grade 4 Lesson 9).
  - Ceramic tiles numbered 1–100 in rows of ten, set in a brushed-metal frame. A slightly wider gap after the fifth row and column makes fives and tens easy to see. The numbers are part of the object.
  - The cabinet has three chip bins (teal, plum, gold) and a cover-tile bin. Tapping a bin chooses it; the chosen bin sits pressed into the cabinet.
  - Tap a number to lay the chosen chip, or drag across numbers. The first number decides: a stroke that starts on an empty number lays chips, one that starts on a chip lifts them.
  - Chips are translucent enamel discs; the number shows through. Two or three colors on one number share the disc as wedges, so common multiples stand out (multiples of 3 in teal and of 4 in plum meet on 12, 24, 36…).
  - Cover tiles are brushed-metal caps that hide a number, for "what's under here?" puzzles. A covered number takes no chips; tapping it with the cover bin chosen lifts the cover.
  - ↺ takes all chips and covers off.
  - The eye button shows an optional record above the chart: how many numbers each color is on, and how many carry two or more colors. Off by default.
- Doctrine principles applied:
  - No words or directions on the surface.
  - The student does the counting; the chart never highlights multiples on its own and never checks.
  - The record is optional and follows the chips.
- Chip colors are kept clear of the place-value palette, since chips here mark sets, not places.
- Desktop behavior (1024×768): Tiles 47px. Chips on every third number give 33; plum on every fourth gives 25; 8 numbers share both and show split chips; the record reads 33, 25, 8. A drag along 11–20 with plum lays 7 new chips (12, 16, 20 already had one); a drag from 11 lifts all 10. A cover hides 50, refuses a teal chip, and lifts on a second tap. No console errors.
- Mobile behavior (375×812): Tiles 30px; the chart fits above the cabinet with no horizontal scroll. Same tests pass.
- Projector behavior (1920×1080): Tiles 64px; same tests pass.
- Accessibility notes: The chart is one focusable control. Arrow keys move a cursor (it stops at row ends), Space or Enter lays or lifts the chosen chip or cover, and the number under the cursor is announced with its chips. The bins are toggle buttons. A polite live region reports chip counts per color and covers.
- Remaining risks:
  - Only 1–100; no 0–99 or 101–200 chart.
  - Chips can't be dragged from one number to another; lift and lay instead.

Acceptance Tests:
- Tapping a number lays or lifts the chosen chip. PASS
- Dragging lays or lifts along the stroke, decided by the first number. PASS
- Two colors on one number show as a split chip. PASS
- Cover tiles hide numbers, refuse chips, and lift on a second tap. PASS
- The record counts each color and shared numbers. PASS
- ↺ clears chips and covers. PASS
- Keyboard: arrows, Space; the cursor stops at row ends. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- On phones the cells are about 24px, which is fine for tapping but tight for three-digit numbers (100 is drawn smaller).

Notes:
- Files changed: apps/facts-table/index.html (new app, built from Hundred Chart); index.html (menu card).
- Behavior: the addition and multiplication tables as a tool for Grade 3 Lessons 12–13 (facts and patterns).
  - An 11 × 11 table from 0 to 10, with a slightly wider gap after 5. The metal edge row and column carry the numbers being added or multiplied; the corner shows the sign.
  - The same chips and covers as Hundred Chart: teal, plum and gold translucent chips, and metal covers. Tap or drag across cells to lay or lift them.
  - Tap an edge number to lay or lift the chosen chip or cover along its whole row or column. This shows a row of 3s, or a column and row meeting at the same square.
  - The + / × button switches the table between addition and multiplication. The chips stay where they are, so a pattern can be compared in both tables.
  - The eye (off by default) counts how many cells each color is on, as in Hundred Chart. ↺ clears.
- Doctrine principles applied: no words, prompts or answer checking. The table's numbers are its own printing, and covers let a teacher hide any part of it.
- Desktop, mobile, projector: 121 cells and 23 edge tiles. Edge taps chip a full row and column, the × table reads 0–100 in row 10, and keyboard Space works. No horizontal scroll and no console errors. The cabinet keeps its height on wide screens; phones stack the three buttons.
- Accessibility: arrows move a ring through the table; Space/Enter lays or lifts the chosen tool. The live region reads "3 times 4, 12" plus any chips.
- Remaining risks:
  - The edge row and column aren't reachable by keyboard; whole-row chips need a pointer.

Acceptance Tests:
- Addition and multiplication tables 0–10. PASS
- Chips and covers by tap, drag and whole row/column. PASS
- Chips persist across + / ×. PASS
- Record off by default; counts when on. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

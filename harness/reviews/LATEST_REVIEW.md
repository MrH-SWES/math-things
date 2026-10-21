# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/graph-builder/index.html (new app); index.html (menu card).
- Behavior: scaled bar graphs and picture graphs for Grade 3 Lesson 19.
  - Columns are categories, told apart by color and shape (circle, square, triangle, star, diamond, heart). Each category's stamp sits on a small metal plate under the axis.
  - Drag a column up or down to set it. It snaps to whole steps, or to half steps when half a step is a whole number (scale 2 or 10). So 9 on a scale of 2 sits halfway between 8 and 10.
  - The key under the graph sets what one step, or one picture, is worth: 1, 2, 5 or 10. The scale can't change to one that couldn't show what's already graphed (a buzz instead).
  - The view button switches between a bar graph and a picture graph of the same data: one picture per step, and half a picture for a half step.
  - ‹ › at the right set 2 to 6 columns. The eye (off by default) prints each column's amount above it. ↺ empties the graph.
- Doctrine principles applied: no words, prompts or answer checking. The axis numbers and the key are the tool's own printing, like a ruler's; the amounts are the optional shadow.
- Desktop, mobile, projector: dragging a column to 14, refused scale changes, a fifth column and keyboard changes all pass. No horizontal scroll and no console errors (fixed during testing: the keyboard focus ring was catching taps meant for the columns).
- Accessibility: the graph is focusable; Left/Right choose a column, Up/Down change it by one snap. Steppers are buttons. A polite live region describes the column in steps or pictures, plus the amount while the record is shown.
- Remaining risks:
  - Columns can't be named. Categories are told apart by color and shape only, which keeps the tool wordless; a teacher names them aloud or on the board.

Acceptance Tests:
- Drag sets a column; snaps to steps or half steps. PASS
- Scale 1, 2, 5, 10; refusals protect the data. PASS
- Bar and picture views show the same data, including half pictures. PASS
- Record off by default; amounts correct when on. PASS
- Keyboard sets columns. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

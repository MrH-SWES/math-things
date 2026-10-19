# Latest Review

This round makes the remaining apps tool-only: Geo Lab, Array Builder, Prime Altar, Snap Bricks, Line Up the Ones, Missing Side Rectangle, Long Division Buddy and Decimal Order (kept alongside Line Up the Ones at the teacher's request). Six more apps lost leftover headings, legends, directions or wrong tab titles: Number Line, Place Value Cards, Zooming Number Line, Frog Number Line, Area Excavator and Equivalent Fractions.

---

## Geo Lab: tool-only

Status: PASS

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer events at 1024×768, 375×812 and 1920×1080.
- With the in-canvas directions gone, the protractor and triangle benches rely on their glowing vertices to show where to start. Watch whether students find the first tap.

Notes:
- Files changed: apps/geo-lab/index.html only (2478 → about 1190 lines).
- Removed:
  - The DEV SKIP button.
  - The progress bar, the "Discovery/Mastery" mode label and the "0 mastered" count.
  - The tier locks: all four workbenches are open.
  - The Collection sidebar with its sprites and "captured" badges.
  - The discovery pop-ups with definitions and read-aloud buttons.
  - The mastery missions, multiple-choice quizzes with Correct/Not quite feedback, and the "Got it!" checks.
  - The confetti and the tier-unlock trophy celebration.
  - All hint and direction text, both above the boards and inside the canvases ("tap vertex", "now tap the arc", "tap a vertex to start" and similar).
  - The "Connect to close the shape" message.
- Kept:
  - The four workbenches, unchanged in look and behavior: points, segments, rays and lines on a dot grid; a protractor that builds an angle from two rays; a triangle builder that sets the angles at A and B; and quadrilaterals on the rhombille grid.
  - The protractor's degree reading and the degree labels drawn on angles. Those are the instrument's own readings.
- Added:
  - A row of four icon tabs, one per workbench, with aria-labels and aria-pressed.
  - An eye button (record, off by default) that shows angle names, the triangle's name and its angle sum, the quadrilateral's most specific name, and its right-angle and parallel marks.
  - A ↺ icon in place of the word "Clear".
  - A polite live region.
  - Tab title "Math Things. | Geo Lab".
- Doctrine: no words or directions on the surface; names and properties are the optional record; no answer checking.
- Desktop, phone and projector: no game or direction text; four tabs; the grid makes a segment; two rays read 90° with "Right Angle" only when the record is on; 45° and 45° make a triangle reading "45° + 45° + 90° = 180°"; four corners and four sides on the quad grid read "Parallelogram" with the record on and nothing with it off; no horizontal scroll; no console errors.
- Fix made during testing: the floating Math Things home button covered the first tabs. The tabs are now centered beside it, and wrap below it on phones.
- Remaining risks:
  - Teachers who used the discovery definitions or the quizzes will find them gone; that content now belongs in the teacher materials around the app.
  - The protractor bench overlaps apps/protractor.

Acceptance Tests:
- No DEV SKIP, lock, mastery, collection or direction text. PASS
- Every workbench is reachable. PASS
- Core interactions work on all four benches. PASS
- The record toggles names and marks; off by default. PASS
- No console errors; no horizontal scroll. PASS

---

## Array Builder: tool-only

Status: PASS

Should Fix Soon:
- Try it on a real touchscreen. On a phone the grid is 26px and the beads about 14px, small for a finger.

Notes:
- Files changed: apps/array-builder/index.html.
- Removed: the four fixed levels (4×3, 6×2, 5×4, 7×3) with their dashed target outlines, the auto-playing tutorial on level 1, the pagination dots, the "next" button, the localStorage unlock of free mode, and the "ARRAY BUILDER" heading in the header.
- Kept, unchanged in feel: pull the aluminum bead right to make a row of red ones (each numbered); let go and the count gathers to the middle as the row fuses into one blue bar; pull the bead down to repeat the bar into rows, up to unfuse back to ones. The mat is a faint 12×12 field. ↺ starts a new array.
- Record (new eye button, off by default): the skip-count tags beside the rows (4, 8, 12) and the equation below ("4 + 4 + 4" while dragging, "3 × 4 = 12" when let go). Before, these always showed.
- Fixes: the grid now also fits the height, so a 12×12 array no longer runs under the footer at 1024×768; resizing the window keeps the array instead of resetting it.
- Doctrine: no words or directions; no target to hit, no checking; the equation is an optional shadow of the array.
- Desktop (1024×768): grid 45px; 4 columns fuse, 3 rows, record reads 3 × 4 = 12 with tags 4, 8, 12; pulling back to one row unfuses into 4 ones; ↺ resets. No console errors.
- Mobile (375×812): grid 26px; same tests pass; no horizontal scroll.
- Projector (1920×1080): grid 60px; same tests pass.
- Accessibility: the mat is focusable. Right/Left change the row of ones; Down fuses it and then adds rows; Up removes rows and, from one row, unfuses. A polite live region says "3 rows of 4", plus "3 times 4 is 12" while the record is on.
- Remaining risks: arrays stop at 12×12; no way to rotate an array or split it (that is Array Architect's job).

Acceptance Tests:
- Opens straight into free building; no levels, tutorial, unlock or next button. PASS
- Row pulls, fuses, repeats into rows, unfuses. PASS
- Record hidden by default; shows 3 × 4 = 12 and 4, 8, 12 when on. PASS
- 12×12 mat fits above the footer at all three sizes; no horizontal scroll. PASS
- Keyboard builds 4 rows of 3. PASS
- No console errors. PASS

---

## Prime Altar: tool-only

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially tapping a hinge and pulling a folded row back up. Testing used scripted pointer events at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/prime-altar/index.html only.
- Behavior (factors, multiples and primes; Grade 4 Lesson 9):
  - It opens straight onto the factor altar with 12, as before. The logo leads to the number grid; the grid's two-way switch picks the factor altar or the build altar.
  - Factor altar (kept): a number grows from glass units into a tower. Hinges sit only at its factors; tapping one folds the tower into equal pieces, and grabbing the free end rolls it back up. Each size you fold into joins the tray on the altar table. Prime pieces glow; composites are stamped metal.
  - Build altar (kept): drag prime mirrors from the dex onto the altar. Each one multiplies the tower; a product that would pass the number's ceiling shatters and falls back. The ledger shows the product as it grows ("2 × 2 × 3 = 12").
- Removed:
  - Levels: the grid opened 12 numbers at a time and greyed out the rest. All 144 numbers (12 × 12) are now open in both modes, and the build altar no longer requires building the previous number first.
  - Saved progress: nothing is read from or written to localStorage. The "reset progress" button and its confirm dialog are gone.
  - Collection: the prime dex used to fill one prime at a time through a "twin ceremony" (the prime ignites, cools into a mirror and drops into its socket). Every prime to 144 now sits in the dex from the start, ready to build with, and the ceremony is gone.
  - Celebrations: the screen flash, the numeral's celebrate burst and its green "solved" glow, and the green dots and factor chips on finished grid cells.
- Kept on purpose:
  - The altar metaphor and materials (glowing primes, mirror primes, glass ones, shatter at the ceiling): the doctrine's whimsy rule, since each carries the math.
  - The idle nudges (a hinge or the free end pulses after 3 s untouched): wordless affordances, not directions. They stop once every factor of the number has been folded.
  - The tray remembers what each number has shown for the rest of the visit (not saved).
- Fixes made during testing:
  - The number at the top was 13% white until "solved"; it is now readable all the time.
  - On phones the number ran into the logo; it now sits below it, and the build altar's ceiling and tower start lower to keep clear.
  - Opening animation tried to vibrate before any touch (a console error in Chrome); vibration now waits for the first touch.
- Desktop (1024×768), phone (375×812), projector (1920×1080): opens on 12; hinges at 2, 3, 4, 6; folding at 3 makes four 3s and the tray reads 1, 3, 12; grid shows 144 open numbers; 7 glows as a prime with no ceremony; the dex holds 1 and all 34 primes to 144; building 12 from 2 × 2 × 3 reads "2 × 2 × 3 = 12"; no localStorage writes; no celebrate, ceremony or flash; no console errors; no horizontal scroll.
- Remaining risks:
  - A teacher who used the levels to pace students through 1–12 first will now see all 144 at once.
  - Folding has no keyboard path (unchanged from before).

Acceptance Tests:
- Opens straight into the free tool. PASS
- No levels, locked numbers or progress UI. PASS
- No saved progress (no localStorage writes). PASS
- No celebrations or collection ceremony. PASS
- Folding and building still work. PASS
- No visible instruction text. PASS
- No console errors; no horizontal scroll at 3 sizes. PASS

---

## Snap Bricks (tool-only rebuild)

Status: PASS

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially drag-laying bricks on sixteenths (studs are about 6px wide when a lane holds 3 plates on a phone).

Notes:
- Files changed: apps/lego-fractions/index.html (rewritten in place; the menu link and tab title "Snap Bricks" are unchanged).
- What went: the three lesson tabs (add, mixed numbers, simplify), the typed fraction boxes, the divisor slider, the green "success" colour, the alignment laser and the printed answer equations.
- Behavior: one free mat for fraction equivalence, addition and mixed numbers (Grade 4 Lessons 18, 20–22).
  - Two lanes of studded grey baseplates. Each plate is one whole, the same length in both lanes; its studs are its parts. Both lanes share one plate column, so wholes line up.
  - Tap a stud to snap bricks on up to it; drag along to lay or lift; tap the last brick to lift it. Bricks wear the shared denominator colour from math-things-fractions.js.
  - ‹ › re-cut the plates (2, 3, 4, 5, 6, 8, 9, 10, 12, 16 parts). With bricks on, only cuts the bricks still fit exactly are allowed: 1/4 becomes 2/8 or 3/12, never thirds or halves; the bricks split or join with the studs. A refused cut shakes.
  - Dashed + and − ghosts add or take off whole plates (up to 3). A plate holding bricks can't be taken off. Bricks run on across plates, so 5 fourths fill one whole and a quarter of the next.
  - The pour button drops the top lane's bricks onto the bottom lane after its bricks. They only snap onto studs their own size; fourths poured onto thirds dip and bounce back.
  - The eye button shows each lane's fraction stacked (7/12), and a mixed number past one whole (5/4 = 1 1/4). Off by default.
- Doctrine principles applied: the mathematics is in the constraints (a fraction can't combine until the wholes are cut compatibly; re-cutting keeps the amount); no words or directions; no answer checking; the record follows the bricks.
- Desktop (1024×768), phone (375×812), projector (1920×1080): 3 bricks by tap, lift by tap, drag lays; 1/4 → 2/8 → 3/12 → 1/4, refuses halves; fourths bounce off thirds; 1/3 → 4/12; 3/12 + 4/12 pours to 7/12 and the record reads 7/12; 5 fourths read 5/4 = 1 1/4; a plate holding bricks can't be removed; no horizontal scroll; no console errors.
- Accessibility notes: each lane is focusable; Left/Right add or take off a brick, Up/Down re-cut; buttons for re-cut, plates, pour, record and clear have labels. A polite live region reports bricks and parts (and the fraction while the record is shown).
- Remaining risks:
  - Teachers who used the old "add" tab's typed setup (type 1/4 + 1/3, press + until the laser lines up) lose that guided path; the same work is now done by re-cutting both lanes to twelfths and pouring.
  - Sixteenths on three plates on a phone are fiddly.

Acceptance Tests:
- No typed boxes, lesson tabs, sliders or check UI. PASS
- Tap/drag lay and lift bricks. PASS
- Re-cutting keeps the amount and refuses cuts the bricks don't fit. PASS
- Pour succeeds only between matching cuts. PASS
- Record reads fractions and mixed numbers. PASS
- No horizontal scroll at 375px; no console errors. PASS

---

## Line Up the Ones: tool-only

Status: PASS

Should Fix Soon:
- On phones the "Math Things." home button covers the start of the "Line Up the Ones" title. This was already true before this change.

Notes:
- Files changed: apps/line-up-the-ones/index.html.
- Removed: the round check button ("Check alignment") under the board; the red wobble on misaligned strips; the success flash on the anchor rail; the lock and the automatic jump to a new set after a correct check.
- Kept: everything else: dragging and arrow-key moving of strips, the magnet, the new-set button, and the teacher panel (custom numbers, support presets, anchor rail, place colors, column guides, ones marks). The panel's own green/red message for typed custom numbers stays; it is teacher-facing input validation, not answer checking.
- Doctrine: lining up the ones is now its own reveal (the rail, the marks and the magnet); nothing is judged.
- Desktop (1024×768) and phone (375×812): a strip dragged onto the anchor lines its ones up to 0px; arrow keys still move strips; nothing advances on its own; the new-set button works; no horizontal scroll (none before either); no console errors.

Acceptance Tests:
- No check button or right/wrong feedback. PASS
- Drag, keyboard, magnet and new set still work. PASS
- No console errors. PASS

## Missing Side Rectangle: tool-only

Status: PASS

Should Fix Soon:
- On phones the "ARRAY SLICER" header title runs into the "Math Things" logo. This was already true before this change.

Notes:
- Files changed: apps/missing-side-rectangle/index.html.
- Removed: the "New Problem" button and its random problem generator; the "solved" pulse and the lock that froze the rectangle once every row was pulled apart.
- Now a free rectangle tool. The squares (the area) lie in rows of the known side; the number of rows is the missing side.
  - Width bead (right end of the first row): drag left or right to set the known side, 1–10. The squares re-flow into rows of that length.
  - Area bead (sits where the next square would go): drag it through the grid to pull squares in or out, up to 10 rows. A partial last row is the remainder.
  - Slice bead (below the rectangle, unchanged): pull the rows apart one at a time to count the missing side. The label on the left reads "?" until the student starts pulling.
  - Changing the side or the area closes the rows back up and the "?" returns.
  - With every row pulled apart, the record appears beneath, e.g. "24 ÷ 6 = 4 / 4 × 6 = 24", or with a remainder "25 ÷ 6 = 4 R 1 / 4 × 6 + 1 = 25". Nothing locks; the student can keep changing it.
  - The known side is now labelled along the top and the missing side down the left.
- Doctrine: the area and the side are set by pulling, not typing; the missing side is found by pulling rows apart; the equation is the shadow of the object; no checking.
- Desktop (1024×768): width bead → 6, area bead → 24, all rows apart reads 24 ÷ 6 = 4; area +1 by keyboard gives 25 and the "?" returns; pulling all 5 rows apart reads 25 ÷ 6 = 4 R 1; no console errors.
- Phone (375×812): same results. No horizontal scroll (the old version was 390px wide).
- Accessibility: all three beads are focusable sliders. Width: Left/Right. Area: Left/Right ±1 square, Up/Down ±1 row. Slice: Up/Down. The equations line is a polite live region.
- Remaining risks:
  - With a remainder, the left label counts all rows pulled apart, including the partial one (5 for 25 ÷ 6), while the equation says 4 R 1.

Acceptance Tests:
- No New Problem button or generator. PASS
- Width and area beads reshape the rectangle; slicing still counts the missing side. PASS
- Record with and without remainder. PASS
- Keyboard on all beads. PASS
- No console errors. PASS

## Long Division Buddy: tool-only

Status: PASS

Should Fix Soon:
- The shared on-screen keypad (math-things-home.js) stays open over the finished equation until it is closed; this comes from the site-wide script, not this app.

Notes:
- Files changed: apps/long-division-buddy/index.html.
- Removed: the right/wrong check on every step (a wrong entry used to shake red and clear until the right number was typed). The remainder is no longer red.
- Kept: the house set-up, the step prompts (÷, ×, −), the bring-down bead, the work rows, and the finished equation.
- Now the scaffold records what the student writes and carries it forward, as on paper. A slip stays visible in the work: e.g. 93 ÷ 4 with a first digit of 3 gives 12 under the 9 and −3 below it, and finishes as 93 ÷ 4 = 30. A correct run still finishes 93 ÷ 4 = 23 R1.
- Tab title fixed: "Math Things. | Long Division Buddy" (was "Division Scaffold").
- Doctrine: no answer checking; the work itself shows a mistake.
- Desktop (1024×768) and phone (375×812): both runs above behave as described; no horizontal scroll (the old version was 383px wide on a phone); no console errors.

Acceptance Tests:
- No shake or right/wrong feedback; entries are recorded. PASS
- Student values carry forward to the finished equation. PASS
- A correct run still works. PASS
- Tab title. PASS
- No console errors. PASS

---

## Decimal Order: tool-only

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially dragging a card into a row and typing a card with the Math Things number pad. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- Cards can only be moved by dragging; there is no keyboard way to place a card in a row yet.

Notes:
- Files changed: apps/decimal-order/index.html only.
- Behavior: decimal number cards to order and line up by place value (cards snap to digit columns in five rows).
  - Removed: the green Check Answer button, its right/wrong row colors (green/red, red decimal point, yellow pulsing empty rows) and the neon "CORRECT" banner; the "Align & Stack" header title.
  - The ↺ that used to deal new numbers is now a deal button (two fanned cards) that deals five random decimals, thousandths to hundreds, as before. ↺ now clears the table, matching other Math Things.
  - New: a blank number card in the header. Type a decimal (up to three whole digits and three decimal places; ".5" becomes 0.5) and press Enter, or use the Math Things number pad and its ✓ key, and it becomes a card. Anything else shakes the entry. At most 8 cards on the table.
  - Kept: drag cards into the rows (they snap to columns and shuffle rows like before), the ghost-zero toggle and the place-value color toggle, which are now real buttons with pressed states.
  - Tab title: "Math Things. | Decimal Order".
- Doctrine principles applied: no directions or verdicts on the surface; the columns are the structure (decimal points line up when cards are placed in the same column); numbers come from the teacher or a deal, not generated questions.
- Fixed: at 375px the page was 473px wide (rows were 570px). Phones now use narrower columns (22px) so the rows and cards fit; the header wraps into two lines.
- Desktop (1024×768): five cards dealt; clear empties; 3.07, .5 and 12.345 typed become 3.07, 0.5, 12.345; 1.2345 and "abc" refused; dropping the three into rows 1–3 at the same column lines up all decimal points (same x); no row turns red or green; toggles report pressed; deal replaces the table; 8-card cap; the number pad's ✓ makes a 2.5 card. No console errors.
- Mobile (375×812): same results; no horizontal scroll.
- Projector (1920×1080): same results.
- Accessibility: toggles and buttons are buttons with labels (and aria-pressed for toggles); the entry has a label; a polite live region announces dealt cards, typed cards and "0.5 in row 3." on a drop.
- Remaining risks:
  - While the number pad is open it covers the lower table; tapping ✓ or elsewhere closes it (shared Math Things behavior).
  - Cards can't be removed one at a time except by clearing the table.

Acceptance Tests:
- No Check Answer, CORRECT banner, verdict colors or title text. PASS
- Deal button deals five cards; ↺ clears. PASS
- Typed decimals (keyboard and number pad) become cards; bad entries refused. PASS
- Cards snap to columns; decimal points line up in one column. PASS
- No verdict on drop. PASS
- No horizontal scroll at 375px (was 473px before). PASS
- No console errors. PASS

---

## Text cleanups (six apps)

- Files changed: apps/number-line, apps/place-value-cards, apps/zooming-number-line, apps/frog-number-line, apps/area-excavator, apps/equivalent-fractions (index.html each).
- Number Line tab title read "Dimensional Builder"; Place Value Cards read "Arrow Cards"; Area Excavator read "Division Bridge". All now match their menu names.
- Removed headings: "Composition Cards", "Place Value Visualizer", Frog Number Line's title row and legend, "Division Bridge" and the Conceptual/Procedural pane titles. Equivalent Fractions lost its directions, its duplicate back link and its page heading; its step narration stays for screen readers.
- Line endings (CRLF) preserved in the three files that use them.
- Each page loads at 1024×768 with no console errors; screenshots checked.

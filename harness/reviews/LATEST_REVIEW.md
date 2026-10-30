# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- The order inside each column follows the Common Core progression and the i-Ready Classroom Mathematics lesson order as best known, without the books at hand. Move any card that sits in the wrong place, by grade or by lesson. Each is one line in index.html.
- Try the menu on a real iPad and phone. Testing used headless Chromium at 1440×900, 1280×800, 768×1024 and 390×844.

Notes:
- Files changed: index.html (the menu); more.html (new); harness/reviews/LATEST_REVIEW.md.
- The menu is now a grid. Domains run across the top in Common Core order: Counting & Cardinality, Operations & Algebraic Thinking, Number & Operations in Base Ten, Fractions, Measurement & Data, Geometry. Grades K–7 run down the side.
  - Each app sits under its domain at the grade where it is first needed, in lesson order within that grade.
  - Grades 6–7 continue each K–5 strand, and the headings say where it goes: Expressions & Equations, The Number System, Ratios & Proportional Relationships, Statistics & Probability.
  - There are 61 apps on the grid.
  - The domain headings and grade labels stay in view while scrolling. On narrow screens the grid scrolls inside its own window.
- Off the main menu, on a new More page (link at the bottom):
  - Walker & Ellie, Rounding Waves and Sentences, as asked.
  - Puzzle Cube (a toy) and Euclid's Playground (a compass-and-straightedge sandbox, high-school level), as the "goofy" ones.
  - Trig Explorer and Curriculum Hub. Neither was on the menu before; now they are reachable.
- Teaching Table is a button in the header. The three model-audition experiments stay unlisted, as before.
- Teaching Table still reads this page, and is unchanged:
  - v3's shelf now groups apps by domain in the same order as the menu.
  - The original table still groups by each card's family label, now hidden. Its own built-in list keeps the apps that moved to More.
- Kept on the grid although whimsical, because the math is real and in the standards: Prime Altar (factors, 4.OA.B.4) and Color Sorter (sorting, K.MD.B.3).

Acceptance Tests:
- Domains across the top, apps down each column in the order they are introduced. PASS
- Walker & Ellie, Rounding Waves, Sentences and the other non-curricular apps are off the main menu but reachable on More. PASS
- Every link on both pages resolves (63 on the menu). PASS
- Both Teaching Tables parse the new menu: v3 by domain; the original by its old families. PASS
- No horizontal page scroll and no console errors at any tested size. PASS
- No frameworks, bundlers, or package managers added. PASS

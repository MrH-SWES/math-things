# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try these on a real iPad or Chromebook. Testing used scripted events at 1024×768, 375×812 and 1920×1080.
- Circles: halfway through laying out the wedges, they swing through each other on their way to the row. It's fine at both ends but busy in the middle on phones.

Notes:
- Files changed: apps/chance-lab/index.html, apps/circles/index.html (new apps); index.html (menu cards).
- Chance Lab (new, Grade 7 Lessons 30–33; also useful for 22–23):
  - Three number makers:
    - A spinner with 2–8 equal sections.
    - A number cube.
    - A cloth bag of marbles in four colors (+ / − for each color, up to 24 marbles).
  - Run 1, 10, 100 or 1,000 trials. A single trial spins or rolls on screen; a batch lands on its last result.
  - One device: a bar for each result, scaled as a share of all trials. Two at once (the pair button): a grid of every pair of results, shaded by how often it came up (the sample space for compound events).
  - The eye (off by default) adds each count, the number of trials, and a dashed line where each bar "should" land by its chance.
  - Changing the device clears the results, since they belong to the old device.
  - Checked: 1,000 spins on 4 sections gave 243, 254, 225, 279; 500 draws from a 3-red, 1-blue bag gave 381 to 119; 1,000 pairs of cubes filled all 36 cells, summing to 1,000.
- Circles (new, Lesson 6):
  - Roll: the circle rolls one turn along a line, laying its red edge down, while its blue diameter turns with it. The line is marked off in diameters (1, 2, 3, and a faint fourth), so the edge visibly comes out a little more than 3 diameters.
  - Wedges: the circle is cut into 4, 8, 16 or 32 wedges that slide into a row, tips alternating, close to a rectangle. Brackets show its length (half the way around) and height (the radius).
  - + / − set the radius (1–5). The eye shows C = π × d ≈ … or A ≈ π × r × r ≈ … to two decimals.
- Both: no horizontal scroll and no console errors.

Acceptance Tests:
- Chance Lab: three devices, batches, pairs grid, record off by default; frequencies near the chances. PASS
- Circles: roll and wedges at all slider positions; radius and wedge steppers; correct records. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

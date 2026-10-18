# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially drag-painting with a finger. Testing used scripted pointer and keyboard events at 1024×768 and 375×812.
- Consider whether Balance Scale's decimal pieces should point here once the decimal tools are on the home page.

Notes:
- Files changed: apps/decimal-grid/index.html (new app). No existing app was modified.
- Behavior: A tenths-and-hundredths grid for Grade 4 Lessons 18 and 25–27.
  - A glazed 10×10 tile in a brushed-metal frame is one whole. Bold vertical lines mark tenths and fine lines mark hundredths.
  - Tap a cell to shade or clear it, or drag across cells to paint. The first cell decides whether the stroke shades or clears.
  - Each column has a metal tab on top. Tap or drag across the tabs to shade or clear whole columns; full columns' tabs sit pressed in.
  - Shading takes the color of what it makes, from the place-value palette: hundredths orange #FF9F0A, a full column tenths blue #64D2FF, a full grid ones crimson #DC143C. A column or grid that just became complete flashes once.
  - The grid bin adds wholes up to 3, for comparing (0.4 vs 0.38) or for values past 1. Drag a grid by its frame to move it, or onto the cabinet to put it away (at least one stays). ↺ clears the shading.
  - The eye button shows each grid's value underneath as a decimal and a stacked fraction: 0.37 with 37⁄100, 0.4 with 4⁄10, 1 when full. Off by default.
- Doctrine principles applied:
  - No words or directions on the surface.
  - Color reinforces structure (place-value palette) and is paired with position (columns), so it is not color alone.
  - The record is optional and follows the shading.
  - No answer checking.
- Desktop behavior (1024×768): One grid shows centered and large, two side by side, three in a row, all above the cabinet. 3 tenths + 7 hundredths reads 0.37 (37⁄100). Clearing 3 cells from 0.4 gives 0.37 and un-presses that tab. Filling every tab turns the grid crimson and reads 1. No console errors.
- Mobile behavior (375×812): Grids stack (two in a column, three as 2 over 1). No horizontal scroll.
- Accessibility notes: The grid bin is a button. Each grid is focusable with a cursor cell: arrow keys move it, Space shades or clears the cell, Enter shades or clears its whole column. A polite live region reports how many of 100 are shaded per grid, plus the decimal only while the record is shown.
- Remaining risks:
  - Grids moved by hand are re-arranged into the row when a grid is added or removed.
  - Cells are 14–20px on a phone with three grids; fine for a mouse, small for a finger.

Acceptance Tests:
- Tapping and drag-painting cells shades them; a stroke that starts on a shaded cell clears. PASS
- Tabs shade and clear whole columns. PASS
- Colors: hundredths orange, full column tenths blue, full grid crimson. PASS
- The record reads 0.37 (37⁄100), 0.4 (4⁄10), 0.38 (38⁄100), 0.05 (5⁄100), and 1 when full. PASS
- The grid bin adds up to 3 grids; a fourth is refused. PASS
- A grid dropped on the cabinet is put away. PASS
- ↺ clears all shading and keeps the grids. PASS
- Keyboard: Space shades a cell; Enter fills its column (0.06 to 0.15). PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

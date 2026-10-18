# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen. Testing used mouse input and scripted pointer events at desktop, tablet and phone sizes.
- Add it to the home page and the Teaching Table when the user is ready. For now it is reachable only by URL.

Notes:
- Files changed: apps/counters-and-cups/index.html (new app). No existing app was modified.
- Behavior: A free equal-groups mat for multiplication and division (Grade 4 Lessons 7, 8, 10, 11, 12 and 14 list counters with cups, bowls or plates).
  - A brushed-metal cabinet holds two bins: cups and counters. Tap the cups bin to set out a cup (cups fill rows below the record). Tap the counters bin for one counter, or press and hold to pour; counters gather in a pile above the bin.
  - Drag counters into or out of cups, or straight from the bin into a cup. A cup holds up to 19, in patterns readable at a glance: a pair, a triangle, a diamond, 2 over 3, a pyramid of 6, a flower of 7, then an outer ring that fills evenly. A full cup turns extra counters away to open mat.
  - Tapping a cup (or its counters) deals it one counter from the loose pile, so fair sharing is just tapping cups in turn. With nothing loose, the cup shakes.
  - Drag a cup by its rim to move it; its counters ride along. Drop a cup or counter on the cabinet to put it away. ↺ clears the mat.
  - The eye button shows an optional record that follows the cups: "6 × 4 + 3 = 27" when cups are equal (loose counters in steel gray), "5 + 5 + 5 + 4 + 4 + 4 = 27" when not. Each cup gets a small count badge.
- Doctrine principles applied:
  - No words or directions on the surface; labels are aria-only.
  - The object comes first; the record follows it and is off by default.
  - No answer checking: unequal groups are simply shown as they are.
  - Counters are the neutral brushed-aluminum bead material, since counters are not place value. Cups are glazed ceramic seen from above.
  - Motion: pop on arrival, glide into the cup's pattern, shake when refused.
- Desktop behavior (1024×768): 12 cups fit in two rows of six with the pile below. No console errors.
- Tablet (768×1024) and phone (375×812): Cups are 156px and 104px across. The cabinet fits with no horizontal scroll, and new cups avoid the brand badge, the record and the pile.
- Accessibility notes: Bins are buttons; Enter adds a cup or a counter. Cups are focusable: Enter or Space deals one, arrow keys move (Shift moves farther), Delete puts it away. A polite live region announces cup contents and loose counters, plus the total only while the record is shown. Counters are about 16–30px depending on screen size; cups are much larger targets.
- Remaining risks:
  - Counters are not individually keyboard-focusable; keyboard users deal counters through the cups.
  - The pour rate and the 240-counter cap are untested on a slow device.

Acceptance Tests:
- Tapping the cups bin sets out cups in rows below the record. PASS
- Tapping the counters bin adds one counter; press-and-hold pours (13 in 1.5 seconds). PASS
- Tapping cups in turn deals one counter each from the pile. PASS
- Taps on a cup's counters also deal into that cup. PASS
- Dragging a counter out of a cup makes it loose, and the cup re-packs. PASS
- Dragging a counter into a cup, or from the bin into a cup, adds it. PASS
- A full cup (19) refuses deals and bounces dragged counters to open mat. PASS
- A cup moved by its rim carries its counters. PASS
- A cup dropped on the cabinet is removed with its counters. PASS
- The record reads "4 × 3 + 2 = 14" for equal cups with 2 loose, and a sum for unequal cups. PASS
- Enter on a focused cup deals one. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

# Latest Review

This round covers four changes: The Dial (elapsed-time start pin, then a phone layout fix), Liquid Volume (new) and Pan Balance (new). The legacy Balance Scale is unchanged.

---

## The Dial: phone layout

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real phone, especially dragging the hand and the target handle with a thumb. Testing used scripted mouse events at 375×812, 1024×768 and 1920×1080.

Notes:
- Files changed: apps/the-dial/index.html only.
- Behavior:
  - Under 600px the six wedge buttons wrap to 3 across, 2 rows. The page no longer scrolls sideways at 375px (it was 392px wide, on main too).
  - Under 600px the bezel is thinner (10px) and the white rim narrower (18px), so the face grows from 235px to 271px.
  - Everything drawn on the face follows one scale, --k = face width ÷ 468, capped at 1: hour numerals, ticks, the 5-minute bubbles and fine minute numerals, the hour, minute and second hands, the center bead, and the elapsed rings. 468px is the smallest face a desktop ever draws, so desktop and projector stay at exactly 1 and look the same as before.
  - The numerals' radial offsets from the rim scale too, so they sit at the rim on a small face instead of bunching at the centre.
  - The face is rebuilt when its size changes (turning a tablet, resizing a window). Before, numerals kept the size they were built at.
  - The target handle and the start pin keep their size on phones; they are touch targets.
- Doctrine principles applied: no new words or controls; the tool keeps the same parts at every size.
- Desktop (1024×768): face 512px, numeral radius 180px and 61.6px numerals, the same as before. No horizontal scroll.
- Mobile (375×812): no horizontal scroll. Face 271px, numerals 35.7px at radius 92px (0.68 of the face radius; desktop is 0.70). The 5-minute bubbles stay inside the bezel (151.7 against 153.5px).
- Projector (1920×1080): face 588px, numeral radius 218px, the same as before. No horizontal scroll.
- Accessibility: unchanged.
- Remaining risks:
  - On phones the 44px target handle can cover part of a numeral while it sits over one.

Acceptance tests (each at 375×812, 1024×768 and 1920×1080):
- No horizontal scroll. PASS
- Hour numerals at the rim, not bunched. PASS
- Dragging the minute hand from 12 to 3 sets about :15. PASS
- The 1/4 wedge shades and its button stays pressed. PASS
- The target handle sits on the shade ring (0.88 of the face radius); dragged to 6 it reads 30 min. PASS
- Start pin: 9:45 → 11:20 reads 1 h 35 min, 1 ring + 1 arc; the pin sits in the rim. PASS
- Spin turns the hands and pulls the pin. PASS
- Live mode shows the real time. PASS
- Resizing 1024 → 375 rebuilds the face (60 ticks, numerals at the rim, no scroll). PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

---

## The Dial: elapsed-time start pin

- Files changed: apps/the-dial/index.html only.
- Behavior (Grade 4 Lesson 28, elapsed time across hours):
  - A new pin button sits in the row beside the random-time and live buttons. It drops a brushed-aluminium pin into the rim at the minute hand's current position, with a short drop animation.
  - The pin records the hand's total rotation, so hours count. As the hand is turned forward (by dragging, or by typing a later time), the sweep since the pin is shaded inside the hour numerals. Each full hour is its own complete ring, stacked inward; the hour in progress is an arc that starts at the pin. A thin thread runs from the pin down to the rings so the start stays visible. If many hours pile up, the bands get thinner so every ring stays countable.
  - Turning back past the pin unwinds the shading to nothing. Elapsed time never goes negative.
  - The record is a small chip under the buttons ("35 min", "1 h 35 min", "3 h"), shown only while the pin is in. Hiding the digital time (the existing eye-slash button) hides it too. Elapsed minutes are floored the same way as the digital time, so the two always agree.
  - Pressing the pin button again pulls the pin and clears the shading.
  - Random spin pulls the pin, since a random time has no start. Live mode keeps the pin, so real elapsed time can be watched from a pinned start.
  - The target countdown chip no longer shows ✓ at zero; it reads "0 min".
- Doctrine principles applied: aluminium for the pin (infrastructure), no words on the dial, rings count hours physically, and the record is optional and follows the hands.
- Desktop (1024×768): 9:45 pinned, hand dragged to 11:20, reads 1 h 35 min with 1 ring + 1 arc. Typing 12:45 reads 3 h with 3 rings. Typing 9:30 reads 0 min with no shading. No console errors.
- Mobile (375×812): same results. The page is 392px wide at this size, the same as before this change; the six-across wedge row and the phone clock face (numerals bunched at the centre) were already broken on main.
- Projector (1920×1080): same results.
- Accessibility: the pin button has aria-pressed and a label that changes. A new polite live region announces "Elapsed since the pin: 1 hour 35 minutes." about 0.7s after changes, or only "Start pin set." while the digital time is hidden.
- Remaining risks:
  - The 12-hour face has no AM/PM, so spans past 12 hours wrap.
  - The phone layout of The Dial was already broken before this change and still needs its own fix.

Acceptance tests:
- Pin drops at the current time and is pressed. PASS
- 9:45 → 11:20 reads 1 h 35 min, 1 ring + 1 partial arc. PASS
- Typing a later time extends elapsed (3 h, 3 rings). PASS
- Before the pin reads 0 min and unshades. PASS
- Hiding the digital time hides elapsed. PASS
- Countdown chip never shows ✓. PASS
- Pin off clears; spin pulls the pin. PASS
- Keyboard: Enter sets the pin; elapsed is announced. PASS
- No console errors. PASS
- No horizontal scroll at 375px. FAIL (already failing on main: wedge row is 392px wide)

- Known, not from this change: at 375px the page is 392px wide; main's version of The Dial overflows identically (the wedge row).

---

## Liquid Volume (new)


Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially lifting a container over another and holding it there to pour. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- On phones the counter holds about three containers side by side; more stand in front of each other and can be harder to grab.

Notes:
- Files changed: apps/liquid-volume/index.html (new app).
- Behavior: A counter with a faucet and measuring containers, for liquid volume in liters and milliliters (Grade 4 Lessons 24 and 29; family activities in 17, 20, 23).
  - A stone counter runs across the mat. A steel sink is cut into it at the left, with a chrome gooseneck faucet behind it. A liter beaker and a cup wait on the counter at the start.
  - Containers (bins in the cabinet, up to 6 on the counter): a 2-liter jug (ticks every 100 mL, longer ticks at each half liter, "1 L" and "2 L" printed), a 1-liter beaker (ticks and numerals every 100 mL, "1000 mL" at the top), a 250 mL cup (every 50 mL), a tablespoon stamped "15 mL" and a teaspoon stamped "5 mL". The printed scales are part of the objects, as on real glassware.
  - Faucet: set a container in the sink, then tap the lever to fill it to the brim, or press and hold to run water while held. The water stops at the brim. With nothing in the sink, the water runs down the drain.
  - Pouring: lift a container over another one's mouth and hold it there. It tilts toward the other, and water runs from its lip in a stream until it is empty or the other is full. A full container takes no more, so the pouring container keeps what's left. Held over the empty sink, a container pours out down the drain.
  - Water is translucent blue, darker toward the bottom, with a bright line at its surface. It stays level when a container tilts: its outline is recomputed every frame to keep its amount.
  - A container dropped on the cabinet is put away. ↺ empties everything and puts it all away.
  - The eye button shows each container's amount under it: "250 mL", "1 L", "1 L 750 mL". Off by default.
- Doctrine principles applied:
  - No words or directions on the surface; the only print is on the glassware and spoons.
  - The brim is the boundary: water stops there, and a full container refuses more.
  - The record is optional and follows the water; nothing is checked.
- Fixes made during testing:
  - All containers were invisible: the shadow filter's region was set in board coordinates, but each container draws in its own frame starting at its base, so everything above the base was clipped. The region now reaches past the origin in every direction.
  - Water over half full drew as completely full: the target area for the water was twice the container's real area. Amounts were always right; the picture now matches them exactly (1750 mL draws at −179.37 against the expected −179.375).
  - A crowded phone counter refused new containers; they now stand in front of their neighbours instead.
- Desktop behavior (1024×768): u = 100. A cup filled at the faucet and poured into the beaker 4 times makes 1000 mL. A fifth pour stops at the brim, and the cup keeps its 250 mL. A cup pours 250 mL into the jug. Spoons pour 15 mL and 5 mL. The record reads "1 L", "20 mL", "1 L 750 mL", "2 L". No console errors.
- Mobile behavior (375×812): u = 52; the cabinet fits (14–361) with no horizontal scroll. Same tests pass (beaker put away first to make room for the spoons).
- Projector behavior (1920×1080): u = 100; same tests pass.
- Accessibility notes: The faucet lever is a button (Enter or Space fills what's in the sink). Containers are focusable, and each one's label names it, says where it is, and gives its amount. F fills a container to the brim. P pours into the next container along the counter, as far as the target has room. Delete empties, Shift+Delete puts away. Left/Right slide along the counter, Down sets it in the sink, Up lifts it out. Bins: Enter places a container and focuses it. A polite live region reads every container's amount after each change.
- Remaining risks:
  - Water cannot be poured part-way by tilting less; a pour runs until one side runs out or fills. To measure out less, pour into a smaller container first.
  - Spoons' water is drawn in a rectangle-approximated bowl, so the drawn level in a part-filled spoon is approximate.
  - The tilt and stream are drawn in 2D; the stream's landing point is clamped into the target's mouth.

Acceptance Tests:
- Four 250 mL cups fill the liter beaker to 1000 mL. PASS
- A fifth pour stops at the brim; the cup keeps its water. PASS
- Tablespoon and teaspoon transfer 15 mL and 5 mL. PASS
- Faucet tap fills to the brim; water stops at the brim. PASS
- Record shows "1 L 750 mL"-style amounts at 1000 mL and up. PASS
- A container dropped on the cabinet is put away; ↺ clears the counter. PASS
- Keyboard: Enter on a bin, F, P, Delete. PASS
- No visible instruction text on the student surface. PASS
- No console errors; no horizontal scroll; cabinet fits on phone. PASS
- No frameworks, bundlers, or package managers added. PASS

---

## Pan Balance (new)


Status: PASS

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen, especially dragging small sheet weights (1–5 g) off a crowded pan. Testing used scripted pointer and keyboard events at 1024×768, 375×812 and 1920×1080.
- Drawer icons for 1, 2 and 5 g are small; their stamps are hard to read in the drawer (they read fine on the pans).

Notes:
- Files changed: apps/pan-balance/index.html (new app). apps/balance-scale is untouched; this is its tool-only replacement for mass.
- Behavior: A plain pan balance for mass in grams and kilograms (Grade 4 Lessons 24 and 29).
  - A brushed-steel balance: a beam on an aluminum pivot, two pans hanging level from its ends, and a pointer over a small scale at the top. The beam leans toward the heavier pan with a heavy, damped swing and settles; it is level only when both pans hold exactly the same mass. Any difference shows (a 1 g difference on a 1 kg load leans about 3°).
  - Brass masses in a drawer: 1, 2, 5 g sheet weights and 10, 20, 50, 100, 200, 500 g and 1 kg knobbed cylinders, sized by the cube root of their mass, values stamped on them.
  - Things to weigh, with no labels: paper clip (1 g), pencil (6 g), apple (180 g), book (750 g), 1 L water bottle (1 kg 30 g). Each can be matched exactly by the brass set.
  - Tap a drawer: things land on the left pan, masses on the right. Or drag from a drawer onto either pan. Drag an item between pans, or onto the cabinet to put it away; dropped elsewhere it returns to its pan. Up to 14 items per pan, stacked in rows. ↺ empties both pans.
  - The eye button shows an optional record under each pan: the total of the brass on it, as "180 g" or "1 kg 30 g" with "1030 g" beneath once it reaches a kilogram. Things to weigh are never counted, so an object's mass is read off the brass that balances it.
- Doctrine principles applied:
  - No words or directions on the surface; values stamped on masses are part of the object.
  - Level is the reveal; there is no answer checking.
  - Heavy objects move heavily: the beam swings and settles rather than snapping.
- Fixed during testing: the beam's left half and the items on the pans were invisible because shadow filter regions were measured from each element's own origin (the Geoboard bug again); regions now extend into negative coordinates. Drawer mass icons were enlarged on a softened scale. Pans now keep a 12px margin on phones.
- Desktop behavior (1024×768): Apple vs 100+50+20+10 g is level and the record reads 180 g; dragging the 10 g to the cabinet tips it left and reads 170 g. 1 kg (moved left by keyboard) vs 500+200+200+100 g is level, reading 1 kg / 1000 g on both sides. Bottle vs 1 kg+20+5+2+2 g leans left; adding 1 g levels it, reading 1 kg 30 g / 1030 g. A 50 g mass dragged from its drawer onto the left pan lands there. No console errors.
- Mobile behavior (375×812): The cabinet stacks objects over a 5×2 mass drawer; no horizontal scroll; the balance sits above the cabinet. Same tests pass.
- Projector behavior (1920×1080): Same tests pass.
- Accessibility notes: Drawer compartments are buttons (Enter sets the item on its pan and focuses it). Items on pans are focusable: Left/Right arrows move an item to that pan, Delete puts it away. A polite live region says which pan is heavier or that it is level, lists each pan, and adds brass totals while the record is shown.
- Remaining risks:
  - Object masses are fixed and plausible rather than exact real-world values.
  - No liquid containers; liquid volume is a separate tool.

Acceptance Tests:
- Apple vs 100+50+20+10 g is level. PASS
- Removing 10 g tips it toward the apple. PASS
- 1 kg vs 500+200+200+100 g is level; record shows 1 kg and 1000 g. PASS
- A 1 g difference still tips visibly. PASS
- Record counts only brass. PASS
- Drag from a drawer to a pan; drag to the cabinet puts away. PASS
- Keyboard: Enter on a drawer, arrows between pans. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No horizontal scroll; cabinet fits on phone. PASS
- No frameworks, bundlers, or package managers added. PASS

- Follow-up from review: on a crowded pan, a mass placed in a second row floated above short neighbours; items now rest on whatever is directly under them (or the pan).

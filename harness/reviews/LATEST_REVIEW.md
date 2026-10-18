# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook touchscreen. Testing used scripted pointer events and keyboard events at 1024×768 and 375×812.
- Decide whether Geo Lab keeps its built-in protractor once this one is on the home page.

Notes:
- Files changed: apps/protractor/index.html (new app). No existing app was modified.
- Behavior: A free angle and a free protractor, for measuring, building, adding and subtracting angles (Grade 4 Lessons 31–33).
  - The angle: an aluminum vertex bead with machined arms ending in knurled knobs. Each arm continues as a thin ray line to the edge of the screen. Knobs turn arms in whole degrees. Dragging the vertex moves the angle.
  - The protractor: smoked acrylic with a standard double scale (outer 0–180 from the left, inner 0–180 from the right), a tick for every degree, and a center hole on the baseline.
    - Drag it by its body. Dropped near the vertex, the center hole snaps onto it.
    - Turn it by the knob on its top edge. When seated, the 0 line snaps onto a ray within a few degrees.
    - Dragging the vertex carries a seated protractor with it.
    - The student reads the scale; nothing reads it for them.
  - The ray bin adds a ray that splits the biggest angle (up to 4 rays) for adding angles. Dragging a knob onto the cabinet removes that ray; with only two rays left it swings back instead.
  - The protractor bin: drag the protractor onto the cabinet to put it away (for estimating first), and tap the bin to bring it back.
  - Arcs mark each angle; an exact 90° gets the square corner; a dashed arc marks the whole when the angle is split.
  - The eye button shows an optional record: "40°", or "30° + 10° = 40°" when split. Off by default.
- Doctrine principles applied:
  - No words or directions on the surface (Geo Lab's version prints "tap vertex" / "now tap the arc").
  - Two separate physical objects that the student brings together; snapping replaces checking.
  - The bead and the arms are brushed aluminum; the protractor is a measuring instrument in clear acrylic so the rays show through it.
  - The record is optional and follows the object.
- Desktop behavior (1024×768): The angle and the protractor start apart. The protractor seats exactly on the vertex. A turn to 37° snaps to the 40° ray. With the 0 line on the 0° ray, the top ray crosses the inner scale at 40 and the middle ray at 20. Split, turn, remove, refused remove, put-away and return all work. No console errors.
- Mobile behavior (375×812): The angle sits above the protractor; the cabinet fits with no horizontal scroll.
- Accessibility notes: Bins are buttons; Enter adds a ray or returns the protractor.
  - The vertex is focusable: arrow keys move it.
  - Knobs are sliders: arrow keys turn them 1° (Shift for 10°), and Delete removes a ray.
  - The protractor is focusable: arrow keys move it, [ and ] turn it, and Enter sets it on the vertex lined up with the nearest ray (keyboard fallback).
  - A polite live region describes the angle, plus measures only while the record is shown.
- Remaining risks:
  - Two-finger rotation of the protractor is not supported; rotation is by the knob only.
  - Reflex angles (over 180°) are not specially handled. With two rays the smaller angle is marked.

Acceptance Tests:
- The protractor dropped within reach of the vertex seats exactly on it. PASS
- A turn within 5° of a ray snaps the baseline onto the ray (37° to 40°). PASS
- The scale reads correctly against the rays (40 and 20 on the inner scale). PASS
- The ray bin splits the angle; the record reads "20° + 20° = 40°". PASS
- Turning the middle ray updates the parts ("30° + 10° = 40°"). PASS
- A ray dropped on the cabinet is removed; with two rays it swings back. PASS
- The protractor can be put away and brought back. PASS
- Dragging the vertex carries a seated protractor. PASS
- Keyboard: Enter seats the protractor; arrow keys turn a ray. PASS
- No visible instruction text on the student surface. PASS
- No console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

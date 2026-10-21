# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try both on a real iPad or Chromebook, especially Solids, which uses 3D graphics. Testing used scripted pointer events with software WebGL at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/solids/index.html (new app); apps/ten-frame/index.html; index.html (menu card).
- Solids (new, Kindergarten Lessons 6, 13 and 24; Grade 1 Lesson 22): a cube, a box, a sphere, a cylinder, a cone and a square pyramid in enamel colors.
  - A bin adds a shape at the first open spot along the front of the mat (up to 10).
  - Drag to slide a shape.
  - Drop it on a flat top (cube, box, standing cylinder) and it stacks. Drop it on a round or pointed top (sphere, cone, pyramid, lying cylinder) and it slides off beside it.
  - Tap a shape to tip it onto its side or stand it back up.
  - The sphere rolls as it moves; a cylinder on its side rolls across its length and slides along it; flat shapes slide.
  - Dragging a shape onto the cabinet puts it away; ↺ puts them all away.
  - The shadow-only floor shows the page's ceramic mat.
  - Tested: a cone dropped on the cube stacked at height 1. A cylinder dropped on the cone slid off to the floor. A tap tipped the cone over.
- Ten Frame (tool-only pass):
  - The "Ten-Frame Sandbox" title and the "Clear Desk" word button are gone (↺ icon now).
  - The number sentence is behind the eye, off by default.
  - A new frames button switches between two ten-frames, one five-frame and one ten-frame. It skips a size that couldn't hold the counters already down, so none are lost.
  - Spots are keyboard buttons now.
- Doctrine principles applied: no words or prompts; the shapes behave like real solids; the numbers are the optional shadow.
- All: no horizontal scroll and no console errors (fixed during testing: Solids' six bins overflowed phones; they now sit in two rows).

Acceptance Tests:
- Solids: add, slide, stack on flat, slide off round or pointed, tip, roll, put away. PASS
- Ten Frame: record off by default; 5-frame, 10-frame, two 10-frames; counters kept. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added (Three.js from the same CDN as the other 3D apps). PASS

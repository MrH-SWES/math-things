# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook; it uses 3D graphics. Testing used software WebGL at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/slicing-solids/index.html (new app); index.html (menu card).
- Slicing Solids (new, Grade 7 Lesson 27: plane sections of 3D figures):
  - Six solids: rectangular prism, triangular prism (lying along its length, a corner up), square pyramid, cylinder, cone and sphere.
  - A translucent cutting sheet passes through the solid. One slider moves it from one side of the solid to the other, always passing through it. A second slider tilts it from level (0°) to upright (90°).
  - The part above the sheet fades to a ghost; the part below stays solid, and the cut face is painted red.
  - The cut's true shape, seen straight on, is drawn in a panel in the corner.
  - Drag the mat (or use Left/Right) to walk around the solid.
  - The cut is found by intersecting the sheet with every triangle of the solid and taking the outline of those points. All six solids are convex, so the outline is the true cut. Points are snapped to a fine grid first; without that, rounding left a false corner on the triangular prism's level cut, which this round fixed.
- No record (eye) here: the cut's shape is the point, and an area in the model's own units would mean nothing to a student.
- Checks (number of corners in the cut): box level, tilted 35° and upright → 4. Pyramid level → 4; upright through the tip → 3. Triangular prism upright → 3; level → 4; tilted 45° → 3. Cylinder level → round; upright → 4. Cone tilted 60° → a curved arch. Sphere → a circle. No horizontal scroll and no console errors.

Acceptance Tests:
- Six solids; move and tilt the cut; ghost above, red face, true shape in the corner. PASS
- Cut shapes correct for the cases above. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added (Three.js from the same CDN as the other 3D apps). PASS

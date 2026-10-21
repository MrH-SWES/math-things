# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try both on a real iPad or Chromebook, especially Nets, which uses 3D graphics. Testing used scripted events (software WebGL for Nets) at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/nets/index.html, apps/inequalities/index.html (new apps); index.html (menu cards).
- Nets (new, Grade 6 Lesson 3, surface area):
  - A rectangular prism or a square pyramid built from hinged faces. Rectangles are ruled into unit squares.
  - The slider in the cabinet turns every hinge together, from the closed solid to its flat net. The camera rises to look straight down, and the net settles square to the screen.
  - Prism: + / − for length, width and height (1–6). Pyramid: base side (2–6) and slant height. The slant must be longer than half the base, or the triangles couldn't meet.
  - Drag the mat (or use Left/Right) to turn the solid.
  - The eye (off by default) lists every face's area and the total: "8 + 8 + 12 + 12 + 6 + 6 = 52" for 4 × 2 × 3, and "16 + 6 + 6 + 6 + 6 = 40" for base 4 and slant 3. Both checked by hand.
- Inequalities (new, Lesson 26):
  - A number line from −10 to 10 (or 0 to 20).
  - Drag the boundary bead along the line. Tap it to fill it (included) or empty it (not included). Tap the shaded ray to point it the other way.
  - The eye shows the inequality with true symbols: x > 3, x ≥ −2, x ≤ −2.
- Doctrine principles applied: no words or prompts; the numbers are the optional shadow.
- Both: no horizontal scroll and no console errors.
- Remaining risks:
  - Nets has no triangular prism yet.
  - Inequalities shows one boundary at a time (no compound inequalities).

Acceptance Tests:
- Nets: fold and unfold, dimensions, pyramid slant guard, correct surface areas. PASS
- Inequalities: drag, fill/empty, flip direction, range, keyboard, correct symbols. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added (Three.js from the same CDN as the other 3D apps). PASS

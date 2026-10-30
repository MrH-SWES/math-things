# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad and Chromebook; it uses 3D graphics. Testing used software WebGL in headless Chromium at 1280×720, 1024×768, 768×1024 (touch) and 390×844.

Notes:
- Files changed: apps/puzzle-cube/index.html (new app); index.html (menu card); harness/reviews/LATEST_REVIEW.md.
- Puzzle Cube (new): a 3 × 3 × 3 twisting puzzle cube that works like the one in your hand, and does nothing else.
  - Object: twenty-six satin graphite pieces on a hidden core, with glossy enamel tiles in the traditional layout: white opposite yellow, green opposite blue, red opposite orange.
  - Drag any tile and the layer it belongs to turns with the finger. The direction of the drag picks the layer, so dragging a centre tile turns a middle layer. Let go and it clicks onto the nearest quarter turn; a quick flick carries it on to the next.
  - Drag the empty mat to turn the whole cube in your hands, as in Slicing Solids.
  - The mat is endless, like Place Value Blocks V2: the same zoom buttons, pinch, Ctrl/⌘ + scroll and + / − / 0 keys. Two fingers, trackpad scroll or a right-drag slide the view; the cube never leaves the screen.
  - No scramble, solve, timer or move count. Reloading the page gives a solved cube.
  - Keyboard (and screen readers) use standard cube notation, named from where you are looking: F B U D L R faces, M E S middle layers, X Y Z or the arrow keys for the whole cube, Shift for the other way. Each turn is announced, for example "The right face turned clockwise."
  - Named "Puzzle Cube" rather than the trademarked name.
  - Three.js from the same CDN and version as the other 3D apps.
- Checks:
  - R U R′ U′ six times, and a 25-move scramble followed by its inverse, return a solved cube identical to the start, pixel for pixel. So do whole-cube turns and their inverses.
  - Keyed R moves the front's right column up to the top, with yellow coming up from the bottom.
  - Pushing up on the right face's front column turns the front face counterclockwise. Pulling the top centre toward you (one finger, touch) turns the middle column.

Acceptance Tests:
- Every layer turns by dragging; quarter turns snap; a flick completes a turn. PASS
- The whole cube turns by dragging the mat. PASS
- Zoom (buttons, Ctrl + wheel, pinch), pan and reset. PASS
- Turns are exact: the sequences above return to solved. PASS
- Fits phone, tablet, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

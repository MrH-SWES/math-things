# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted pointer events at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/measure-bench/index.html.
- Behavior (Grade 5 Lessons 25–27 and a tool-only audit):
  - Millimeters added to both unit dials (in, ft, cm, mm, m, 📎). The mm ruler has a tick for every millimeter, longer ticks at 5 and 10, and labels every 50 mm. On narrow screens it keeps only the 5 and 10 ticks and labels every 100, so it doesn't turn into a black band.
  - The length readouts ("284 mm", "10 in") now sit behind an eye button in the header, off by default, like every other Math Things record. The ruler's own printing is always there to read.
  - The "Measure Bench" title text is gone from the header.
  - Rulers are only rebuilt when their unit changes, not on every drag step. The mm ruler has 610 ticks.
- Not added: yards and kilometers. The bench is 24 inches long, so a yard (36 in) doesn't fit and a kilometer can't be shown. Conversions to yards and km stay a teacher-led table for now.
- Desktop, mobile, projector: the readout is hidden by default and shows with the eye. The dial reaches mm. Dragging an edge snaps to whole millimeters. No horizontal scroll and no console errors.

Acceptance Tests:
- Record off by default; eye shows both readouts. PASS
- mm on both dials; ruler readable at every size. PASS
- Edges snap to 1 mm in mm mode. PASS
- No words or titles on the mat. PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS

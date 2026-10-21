# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Try it on a real iPad or Chromebook. Testing used scripted clicks at 1024×768, 375×812 and 1920×1080.

Notes:
- Files changed: apps/spinner-dice/index.html (new app); index.html (menu card).
- Behavior: number makers for Grade 1 games and practice (spinners, number cubes and number cards appear in 20 of 27 lessons, and in Grades 2–5 too).
  - Three bins: spinner, number cube, number cards. Each tap adds one to the mat (up to 4); × on a device puts it away. It starts with two dot cubes.
  - Tap a device to use it:
    - A spinner's arrow turns a few times and stops inside a section, never on a line.
    - A cube tumbles through faces and lands.
    - A card is drawn from the deck. The deck runs out without repeats, thins as it goes, and the next tap after it's empty reshuffles.
  - ‹ › under each device step through its settings:
    - Spinners: 2, 3, 4, 5, 6, 8 or 10 sections (10 is numbered 0–9; new spinners start at 4).
    - Cubes: dots 1–6, numerals 1–6, 4–9, 0–9.
    - Cards: 0–10, 0–20, 1–100, 1–120.
  - The dice button rolls and spins everything at once. The eye (off by default) shows the numbers added together, e.g. 6 + 1 + 4 + 6 = 17.
- Doctrine principles applied: no words, prompts or answer checking. Each device is a fair random tool; the sum is the optional shadow.
- Checks:
  - The spinner's resting angle matched its number at every size (e.g. 101.9° on 2 sections → 1).
  - Ten draws from 0–10 gave ten different cards, then a reshuffle.
  - Removing a device and the 4-device limit work.
  - No horizontal scroll and no console errors.
- Accessibility: each device is a button (Roll, Spin, Draw a card); ‹ › and × are buttons. The live region reads each result. With reduced motion, results appear without spinning or tumbling.

Acceptance Tests:
- Spinner, cube and cards each make a number fairly. PASS
- Settings change sections, faces and decks. PASS
- Deck draws without repeats, then reshuffles. PASS
- Roll-all and record (off by default). PASS
- Fits phone, desktop and projector; no console errors. PASS
- No frameworks, bundlers, or package managers added. PASS
